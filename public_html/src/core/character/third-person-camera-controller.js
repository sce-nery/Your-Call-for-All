import * as THREE from "../../../vendor/three-js/build/three.module.js";


class ThirdPersonCameraController {
    constructor(character) {
        this.character = character;
        this.camera = this.character.camera;

        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
    }

    calculateIdealOffset() {
        const idealOffset = new THREE.Vector3(-1, 1.5, -5);
        idealOffset.applyQuaternion(this.character.controller.locomotion.rotation);
        idealOffset.add(this.character.controller.locomotion.position);
        return idealOffset;
    }

    calculateIdealLookAt() {
        const idealLookAt = new THREE.Vector3(0, 8, 50);
        idealLookAt.applyQuaternion(this.character.controller.locomotion.rotation);
        idealLookAt.add(this.character.controller.locomotion.position);
        return idealLookAt;
    }

    update(deltaTime) {
        const idealOffset = this.calculateIdealOffset();
        const idealLookAt = this.calculateIdealLookAt();

        const t = 1.0 - Math.pow(0.001, deltaTime);

        this.currentPosition.lerp(idealOffset, t);
        this.currentLookAt.lerp(idealLookAt, t);

        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
    }
}


export {ThirdPersonCameraController};
