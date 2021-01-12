import * as THREE from "../../../vendor/three-js/build/three.module.js";


class ThirdPersonCameraController {
    constructor(camera, characterController) {
        this.characterController = characterController;
        this.camera = camera;

        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
    }

    calculateIdealOffset() {
        const idealOffset = new THREE.Vector3(-1, 2, -13);
        idealOffset.applyQuaternion(this.characterController.model.quaternion);
        idealOffset.add(this.characterController.model.position);
        return idealOffset;
    }

    calculateIdealLookAt() {
        const idealLookAt = new THREE.Vector3(0, 10, 50);
        idealLookAt.applyQuaternion(this.characterController.model.quaternion);
        idealLookAt.add(this.characterController.model.position);
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
