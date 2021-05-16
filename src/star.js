import * as THREE from 'three';

export default class Star {
    constructor(loader, scene, position) {
        this.star_box = new THREE.Box3();
        loader.load('/models/star1.gltf', gltf => {
            this.star_mesh = gltf.scene;
            this.mixer = new THREE.AnimationMixer(gltf.scene);
            gltf.animations.forEach(clip => {
                this.mixer.clipAction(clip).play();
            });
            this.star_mesh.scale.set(0.15, 0.15, 0.15);
            // this.star_mesh.rotation.x = Math.PI / 2;
            scene.add(this.star_mesh);
            this.star_mesh.position.set(position.x, position.y, position.z);
            // this.star_mesh.position.x = Math.random() * 2 + -1;
            // this.star_mesh.position.y = 0;
            // this.star_mesh.position.z = -Math.random() * 100 - 1;
            this.star_mesh.position.x = position.x;
            this.star_mesh.position.y = position.y;
            this.star_mesh.position.z = position.z;
            this.star_box.setFromObject(this.star_mesh);
        });
    }
}
