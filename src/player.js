import * as THREE from 'three';
import Missile from './missile';

export default class Player {
    constructor(loader, scene) {
        this.player_box = new THREE.Box3();
        loader.load('/models/plane.gltf', gltf => {
            this.player_mesh = gltf.scene;
            this.mixer = new THREE.AnimationMixer(gltf.scene);
            gltf.animations.forEach(clip => {
                this.mixer.clipAction(clip).play();
            });
            this.player_mesh.scale.set(0.07, 0.07, 0.07);
            scene.add(this.player_mesh);
            this.player_mesh.rotation.y = Math.PI;
            this.player_mesh.position.x = 0;
            this.player_mesh.position.y = 0;
            this.player_mesh.position.z = 0;
            // let folder = gui.addFolder('cube');
            // folder.add(this.player_mesh.position, 'x', -10, 10).step(0.01);
            // folder.add(this.player_mesh.position, 'y', -10, 10).step(0.01);
            // folder.add(this.player_mesh.position, 'z', -10, 10).step(0.01);
            this.player_box.setFromObject(this.player_mesh);
        });
        this.xSpeed = 0.05;
        this.zSpeed = 0.08;
        this.score = 0;
        this.missiles = [];
        this.is_lauch = false;
        this.health = 10;
    }

    // move player
    move(keyCode, camera) {
        if (keyCode == 87) {
            this.player_mesh.position.z -= this.zSpeed;
            this.player_mesh.position.z = Math.max(
                camera.camera.position.z - 3,
                this.player_mesh.position.z
            );
        } else if (keyCode == 83) {
            this.player_mesh.position.z += this.zSpeed;
            this.player_mesh.position.z = Math.min(
                camera.camera.position.z - 1.5,
                this.player_mesh.position.z
            );
        } else if (keyCode == 65) {
            this.player_mesh.position.x -= this.xSpeed;
            this.player_mesh.position.x = Math.max(
                -1.5,
                this.player_mesh.position.x
            );
        } else if (keyCode == 68) {
            this.player_mesh.position.x += this.xSpeed;
            this.player_mesh.position.x = Math.min(
                1.5,
                this.player_mesh.position.x
            );
        } else if (keyCode == -1) {
            this.player_mesh.position.z -= 0.01;
        }
    }

    // move the missile launched by player
    moveMissiles() {
        if (this.missiles.length <= 0) return;
        for (let missile of this.missiles) {
            if (
                missile &&
                missile.missile_mesh &&
                missile.missile_mesh.visible
            ) {
                missile.move();
                if (
                    missile.missile_mesh.position.z <=
                    this.player_mesh.position.z - 10
                )
                    missile.missile_mesh.visible = false;
            }
        }
    }

    // lauch missile
    launchMissile(loader, scene) {
        let missile = new Missile(
            loader,
            scene,
            this.player_mesh.position,
            0.2,
            'player'
        );
        this.missiles.push(missile);
        this.is_launch = true;
        this.score--;
    }

    collisionDetect(targets, type) {
        if (targets.length <= 0) return;
        if (type === 'star') {
            // collsion detection with stars
            for (let star of targets) {
                if (
                    star.star_mesh &&
                    star.star_mesh.visible &&
                    star.star_box.intersectsBox(this.player_box)
                ) {
                    star.star_mesh.visible = false;
                    this.score += 5;
                }
            }
        } else if (type === 'enemy') {
            // collsion detection with enemy
            for (let enemy of targets) {
                if (
                    enemy.enemy_mesh &&
                    enemy.enemy_mesh.visible &&
                    !enemy.dead &&
                    enemy.enemy_box.intersectsBox(this.player_box)
                ) {
                    enemy.enemy_mesh.visible = false;
                    enemy.dead = true;
                    this.health -= 5;
                }
            }
        }
    }

    // update bounding box for player after player movement
    updateBoundingBox() {
        this.player_box.setFromObject(this.player_mesh);
    }
}
