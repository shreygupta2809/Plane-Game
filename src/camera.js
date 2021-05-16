import * as THREE from 'three';

export default class Camera {
    constructor(sizes) {
        this.camera = new THREE.PerspectiveCamera(
            50,
            sizes.width / sizes.height,
            0.1,
            10000
        );
        // let cam = gui.addFolder('Camera');
        // cam.add(this.camera.position, 'x', -10, 10).step(0.01).listen();
        // cam.add(this.camera.position, 'y', -10, 10).step(0.01).listen();
        // cam.add(this.camera.position, 'z', -10, 10).step(0.01).listen();
        // cam.add(this.camera.rotation, 'x', -45, 45).step(0.01).listen();
        // cam.add(this.camera.rotation, 'y', -45, 45).step(0.01).listen();
        // cam.add(this.camera.rotation, 'z', -45, 45).step(0.01).listen();
        this.camera.position.set(0, 1, 2);
        this.camera.lookAt(0, -1, -8);
        this.zSpeed = 0.01;
    }

    reconfigure(sizes) {
        this.camera.aspect = sizes.width / sizes.height;
        this.camera.updateProjectionMatrix();
    }

    // automatic camera movement
    move() {
        this.camera.position.z -= this.zSpeed;
    }
}
