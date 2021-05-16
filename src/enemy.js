import * as THREE from 'three';
import Missile from './missile';

export default class Enemy {
    constructor(loader, scene) {
        this.enemy_box = new THREE.Box3();
        loader.load('/models/enemy2.gltf', gltf => {
            this.enemy_mesh = gltf.scene;
            this.mixer = new THREE.AnimationMixer(gltf.scene);
            gltf.animations.forEach(clip => {
                this.mixer.clipAction(clip).play();
            });
            this.enemy_mesh.scale.set(0.07, 0.07, 0.07);
            scene.add(this.enemy_mesh);
            this.initial_x = Math.random() * 3 - 1.5;
            this.enemy_mesh.position.x = this.initial_x;
            this.enemy_mesh.position.y = 0;
            this.enemy_mesh.position.z = -Math.random() * 50 - 5;
            this.enemy_box.setFromObject(this.enemy_mesh);
            this.enemy_mesh.visible = false;
        });
        this.dead = false;
        this.enemy_speed = 0.5;
        this.health = 3;
        this.x_speed = 0.05;
        this.z_speed = 0.05;
        this.enemy_missiles = [];
        this.timer = 0;
    }

    // move enemy in the direction of player
    move(player) {
        let x_dir =
            player.player_mesh.position.x > this.enemy_mesh.position.x ? 1 : -1;
        let z_diff = Math.abs(
            this.enemy_mesh.position.z - player.player_mesh.position.z + 0.001
        );
        let temp = this.enemy_mesh.position.x;
        if (z_diff > 1)
            temp +=
                (x_dir *
                    this.x_speed *
                    Math.abs(
                        this.enemy_mesh.position.x -
                            player.player_mesh.position.x
                    )) /
                z_diff;

        if (x_dir == -1)
            this.enemy_mesh.position.x = Math.max(this.initial_x - 0.3, temp);
        else this.enemy_mesh.position.x = Math.min(this.initial_x + 0.3, temp);

        this.enemy_mesh.position.z += this.z_speed;
        if (
            this.enemy_mesh.visible &&
            this.enemy_mesh.position.z > player.player_mesh.position.z + 5
        ) {
            this.enemy_mesh.position.z =
                -60 * Math.random() + (player.player_mesh.position.z - 30);
        }

        if (
            this.enemy_mesh.position.z >= player.player_mesh.position.z - 50 &&
            !this.dead
        )
            this.enemy_mesh.visible = true;
        else {
            this.enemy_mesh.visible = false;
        }
    }

    // reduce health of enemy on missile collision
    hit(player) {
        this.health -= 1;
        if (this.health <= 0) {
            this.dead = true;
            this.enemy_mesh.visible = false;
            player.score += 10;
        }
    }

    // shoot missile
    shoot(loader, scene) {
        if (this.timer > 200) {
            let missile = new Missile(
                loader,
                scene,
                this.enemy_mesh.position,
                -0.2,
                'enemy'
            );
            this.enemy_missiles.push(missile);
            this.timer = 0;
        }
    }

    // update bounding box of enemy
    updateBoundingBox() {
        this.enemy_box.setFromObject(this.enemy_mesh);
        this.timer += 1;
    }

    // missile movement
    moveMissiles(player) {
        if (this.enemy_missiles.length <= 0) return;
        for (let missile of this.enemy_missiles) {
            if (
                missile &&
                missile.missile_mesh &&
                missile.missile_mesh.visible
            ) {
                missile.move();
                if (
                    missile.missile_mesh.position.z >=
                    player.player_mesh.position.z + 2
                )
                    missile.missile_mesh.visible = false;
            }
        }
    }
}
