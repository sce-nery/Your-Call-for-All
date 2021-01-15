import * as THREE from "../../../vendor/three-js/build/three.module.js";


class ThirdPersonCameraController {
    constructor(character) {
        this.character = character;
        this.camera = this.character.camera;

        this.currentCameraPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();

        this.spherical = new THREE.Spherical(1,
            THREE.Math.degToRad(45),
            THREE.Math.degToRad(0),
            );


        this.initializeListeners();
    }

    initializeListeners() {
        const self = this;
        this.mouseMoved = function (event) {
            const sensitivity = 0.005;
            self.spherical.theta -= sensitivity * event.movementX;
            self.spherical.phi -= sensitivity * event.movementY;

            const maxPolarAngle = THREE.Math.degToRad(135);
            const minPolarAngle = THREE.Math.degToRad(45);
            self.spherical.phi = Math.max(minPolarAngle, Math.min(maxPolarAngle, self.spherical.phi));

        }

        document.addEventListener("pointerlockchange", function (event) {
            if (document.pointerLockElement === self.character.owner.renderer.domElement) {
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
        const idealOffset = new THREE.Vector3(0, 1.75, -4);
        idealOffset.applyQuaternion(this.character.controller.locomotion.rotation);
        idealOffset.add(this.character.controller.locomotion.position);
        return idealOffset;
    }

    calculateIdealLookAt() {
        const idealLookAt = new THREE.Vector3(0, 1.0, 0);
        idealLookAt.applyQuaternion(this.character.controller.locomotion.rotation);
        idealLookAt.add(this.character.controller.locomotion.position);
        return idealLookAt;
    }

    enterPointerLock() {
        this.character.owner.renderer.domElement.requestPointerLock();
    }

    lookAround(eyePos, target) {
        let targetToEye = eyePos.clone().sub(target);

        this.spherical.radius = targetToEye.length();
        targetToEye.setFromSpherical(this.spherical);

        eyePos.copy(targetToEye.clone().add(target));
    }

    update(deltaTime) {
        const idealOffset = this.calculateIdealOffset();
        const idealLookAt = this.calculateIdealLookAt();

        this.lookAround(idealOffset, idealLookAt);

        const t = 1.0 - Math.pow(0.001, deltaTime);

        this.currentCameraPosition.lerp(idealOffset, t);
        this.currentLookAt.lerp(idealLookAt, t);

        this.camera.position.copy(this.currentCameraPosition);
        this.camera.lookAt(this.currentLookAt);
    }
}


export {ThirdPersonCameraController};
