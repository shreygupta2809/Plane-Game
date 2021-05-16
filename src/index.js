import './styles.css';
import Player from './player';
import Enemy from './enemy';
import Camera from './camera';
import Renderer from './renderer';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import * as dat from 'dat.gui';

// const gui = new dat.GUI();
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};
const renderer = new Renderer(canvas, sizes);
const camera = new Camera(sizes);
const loader = new GLTFLoader();
const clock = new THREE.Clock();
const enemy_clock = new THREE.Clock();
const star_clock = new THREE.Clock();

// ocean background noise

const listener = new THREE.AudioListener();
camera.camera.add(listener);

// create a global audio source
const sound = new THREE.Audio(listener);

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load(
    '/models/ocean-waves-1.mp3',
    function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },

    function (err) {
        console.log('An error happened');
    }
);

// ocean skybox

let materialArray = [];
let texture_ft = new THREE.TextureLoader().load(
    '/models/environment/sb_ocean_front.jpg'
);
let texture_bk = new THREE.TextureLoader().load(
    '/models/environment/sb_ocean_back.jpg'
);
let texture_up = new THREE.TextureLoader().load(
    '/models/environment/sb_ocean_top.jpg'
);
let texture_dn = new THREE.TextureLoader().load(
    '/models/environment/sb_ocean_bottom.jpg'
);
let texture_rt = new THREE.TextureLoader().load(
    '/models/environment/sb_ocean_right.jpg'
);
let texture_lf = new THREE.TextureLoader().load(
    '/models/environment/sb_ocean_left.jpg'
);

materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
let skybox = new THREE.Mesh(skyboxGeo, materialArray);
scene.add(skybox);

let plane;
// let env_mesh;
let light;
let stars = [];
let enemies = [];

// const controls = new OrbitControls(camera.camera, renderer.renderer.domElement);
// controls.addEventListener('change', renderer);
// controls.minDistance = 500;
// controls.maxDistance = 1500;

// event_listeners

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.reconfigure(sizes);
    renderer.reconfigure(sizes, window);
});

document.addEventListener('keydown', onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    plane.move(keyCode, camera);
    if (keyCode == 76 && !plane.is_launch) plane.launchMissile(loader, scene);
}

document.addEventListener('keyup', onDocumentKeyUp, false);
function onDocumentKeyUp(event) {
    var keyCode = event.which;
    if (keyCode == 76 && plane.is_launch) plane.is_launch = false;
}

function init() {
    scene.background = new THREE.Color('black');
}

// Sort Function for enemies based on z
function compare(a, b) {
    if (
        a &&
        a.enemy_mesh &&
        b &&
        b.enemy_mesh &&
        a.enemy_mesh.position.z > b.enemy_mesh.position.z
    ) {
        return -1;
    }
    if (
        a &&
        a.enemy_mesh &&
        b &&
        b.enemy_mesh &&
        a.enemy_mesh.position.z < b.enemy_mesh.position.z
    ) {
        return 1;
    }
    return 0;
}

// create point light
function setLight() {
    light = new THREE.AmbientLight(0xffffff, 4);
    scene.add(light);
}

function loadGLTF() {
    plane = new Player(loader, scene);
    // for (let i = 0; i < 10; i++) {
    //     let position = new THREE.Vector3(
    //         Math.random() * 3 - 1.5,
    //         0,
    //         -Math.random() * 30 - 5
    //     );
    //     let star = new Star(loader, scene, position);
    //     stars.push(star);
    // }

    for (let i = 0; i < 10; i++) {
        let enemy = new Enemy(loader, scene);
        enemies.push(enemy);
    }
    // sort enemies based on the z distance
    enemies.sort(compare);

    // const env_geometry = new THREE.PlaneGeometry(10, 10000);
    // const env_material = new THREE.MeshBasicMaterial({ color: 0xbaefff });
    // env_mesh = new THREE.Mesh(env_geometry, env_material);
    // scene.add(env_mesh);
    // env_mesh.position.set(0, -2, 0);
    // env_mesh.rotation.x = (3 * Math.PI) / 2;
}

// Active elements of Game
function active_enemies(enemies, stars) {
    let active = 0;
    for (let enemy of enemies) {
        if (enemy && !enemy.dead) active++;
    }
    let active_stars = 0;
    for (let star of stars) {
        if (
            star.star_mesh &&
            star.star_mesh.visible &&
            star.star_mesh.position.z < plane.player_mesh.position.z + 1
        )
            active_stars++;
    }
    return active + active_stars;
}

function animate() {
    requestAnimationFrame(animate);
    camera.move();
    // Player
    if (plane && plane.player_mesh) {
        plane.move(-1);
        let delta = clock.getDelta();
        if (plane.mixer) plane.mixer.update(delta);
        plane.updateBoundingBox();
        plane.moveMissiles();
        if (plane.missiles.length > 0) {
            for (let missile of plane.missiles) {
                if (
                    missile &&
                    missile.missile_mesh &&
                    missile.missile_mesh.visible
                ) {
                    // create new stars
                    let value = missile.collisionDetect(
                        enemies,
                        plane,
                        loader,
                        scene
                    );
                    if (value) stars.push(value);
                }
            }
        }
    }
    // Enemy handling
    if (enemies.length > 0) {
        enemies.sort(compare);
        plane.collisionDetect(enemies, 'enemy');
        let delta = enemy_clock.getDelta();
        for (let enemy of enemies) {
            if (enemy && enemy.enemy_mesh && !enemy.dead) {
                enemy.move(plane);
                enemy.updateBoundingBox();
                if (enemy.mixer) enemy.mixer.update(delta);
            }
            if (enemy && enemy.enemy_missiles.length > 0) {
                enemy.moveMissiles(plane);
                for (let missile of enemy.enemy_missiles) {
                    if (
                        missile &&
                        missile.missile_mesh &&
                        missile.missile_mesh.visible
                    ) {
                        missile.collisionDetect(plane, plane);
                    }
                }
            }
        }
        // Enemy shooting
        for (let enemy of enemies) {
            if (
                enemy &&
                enemy.enemy_mesh &&
                enemy.enemy_mesh.visible &&
                !enemy.dead
            ) {
                enemy.shoot(loader, scene);
                break;
            }
        }
    }
    // STARS
    if (stars.length > 0) {
        plane.collisionDetect(stars, 'star');
        let delta = star_clock.getDelta();
        for (let star of stars) {
            if (star && star.star_mesh && star.star_mesh.visible) {
                if (star.mixer) star.mixer.update(delta);
            }
        }
    }
    // HUD
    document.getElementById('text__score').innerText = 'Score: ' + plane.score;
    document.getElementById('text__health').innerText =
        'Health: ' + plane.health;
    // End Game
    if (plane.health <= 0 || active_enemies(enemies, stars) == 0) {
        document.body.innerHTML = `
            <div class="game-over">
            <p>Game Over</p>
            <p>Score: ${plane.score}</p>
            </div>
            `;
    }
    renderer.renderer.render(scene, camera.camera);
}

init();
setLight();
loadGLTF();
animate();
