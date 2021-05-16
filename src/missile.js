import * as THREE from 'three';
import Star from './star';

export default class Missile {
    constructor(loader, scene, position, speed, type) {
        this.missile_box = new THREE.Box3();
        loader.load('/models/bullet.gltf', gltf => {
            this.missile_mesh = gltf.scene;
            this.missile_mesh.rotation.x = -Math.PI / 2;
            this.missile_mesh.scale.set(0.02, 0.02, 0.02);
            scene.add(this.missile_mesh);
            this.missile_mesh.position.x = position.x;
            this.missile_mesh.position.y = position.y;
            this.missile_mesh.position.z = position.z;
            this.missile_box.setFromObject(this.missile_mesh);
        });
        this.missile_speed = speed;
        this.type = type;
    }

    // movement of missile
    move() {
        this.missile_mesh.position.z -= this.missile_speed;
        this.updateBoundingBox();
    }

    collisionDetect(target, player, loader, scene) {
        // collision detection with enemy
        if (this.type == 'player') {
            if (target.length <= 0) return;
            for (let enemy of target) {
                if (
                    enemy.enemy_mesh &&
                    enemy.enemy_mesh.visible &&
                    enemy.enemy_box.intersectsBox(this.missile_box)
                ) {
                    enemy.hit(player);
                    player.score += 1;
                    this.missile_mesh.visible = false;
                    if (enemy.health <= 0) {
                        let star = new Star(
                            loader,
                            scene,
                            enemy.enemy_mesh.position
                        );
                        return star;
                    }
                }
            }
        } else {
            // collision detection with player
            if (
                target.player_mesh &&
                target.player_mesh.visible &&
                target.player_box.intersectsBox(this.missile_box)
            ) {
                player.score = Math.max(0, player.score - 2);
                player.health = Math.max(0, player.health - 1);
                this.missile_mesh.visible = false;
            }
        }
        return null;
    }

    // updation of missile bounding box
    updateBoundingBox() {
        this.missile_box.setFromObject(this.missile_mesh);
    }
}
