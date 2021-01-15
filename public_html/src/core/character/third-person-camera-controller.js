import * as THREE from "../../../vendor/three-js/build/three.module.js";


class ThirdPersonCameraController {
    constructor(character) {
        this.character = character;
        this.camera = this.character.camera;

        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();

        this.mouseMovement = new THREE.Vector2();

        this.initializeListeners();
    }

    initializeListeners() {
        const self = this;
        this.mouseMoved = function (event) {
            const sensitivity = 0.1;
            self.mouseMovement.x += sensitivity * event.movementX;
            self.mouseMovement.y -= sensitivity * event.movementY;
        }

        document.addEventListener("pointerlockchange", function (event) {
            if (document.pointerLockElement === self.character.owner.renderer.domElement ) {
                console.log('The pointer lock status is now locked');
                document.addEventListener("mousemove", self.mouseMoved, false);
            } else {
                console.log('The pointer lock status is now unlocked');
                document.removeEventListener("mousemove", self.mouseMoved, false);
            }
        });

        document.addEventListener("click", function (e) {
           self.enterPointerLock();
        });
    }

    calculateIdealOffset() {
        const idealOffset = new THREE.Vector3(-1, 1.5, -5);
        idealOffset.applyQuaternion(this.character.controller.locomotion.rotation);
        idealOffset.add(this.character.controller.locomotion.position);
        return idealOffset;
    }

    calculateIdealLookAt() {
        const idealLookAt = new THREE.Vector3(0, 8, 70);
        idealLookAt.x += this.mouseMovement.x;
        idealLookAt.y += this.mouseMovement.y;
        idealLookAt.applyQuaternion(this.character.controller.locomotion.rotation);
        idealLookAt.add(this.character.controller.locomotion.position);
        return idealLookAt;
    }

    enterPointerLock() {
        this.character.owner.renderer.domElement.requestPointerLock();
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
