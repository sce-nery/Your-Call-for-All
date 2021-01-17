import * as THREE from "../../../vendor/three-js/build/three.module.js";


class ThirdPersonCameraController {
    constructor(character) {
        this.character = character;
        this.camera = this.character.camera;

        this.focusPoint = null;

        this.currentCameraPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();

        this.spherical = new THREE.Spherical(1,
            THREE.Math.degToRad(85),
            THREE.Math.degToRad(0),
        );

        this.boundaries = {
            maxPolarAngle: THREE.Math.degToRad(115),
            minPolarAngle: THREE.Math.degToRad(45),
            currentMaxPolarAngle: THREE.Math.degToRad(115),
        }

        this.initializeListeners();
    }

    initializeListeners() {
        const self = this;
        this.mouseMoved = function (event) {
            const sensitivity = 0.0025;
            self.spherical.theta -= sensitivity * event.movementX;
            self.spherical.phi -= sensitivity * event.movementY;

            const maxPolarAngle = self.boundaries.currentMaxPolarAngle;
            const minPolarAngle = self.boundaries.minPolarAngle;
            self.spherical.phi = Math.max(minPolarAngle, Math.min(maxPolarAngle, self.spherical.phi));

        }

        document.addEventListener("pointerlockchange", function (event) {
            if (document.pointerLockElement === self.character.owner.renderer.domElement) {
                console.log('The pointer is now locked');
                document.addEventListener("mousemove", self.mouseMoved, false);
            } else {
                console.log('The pointer is now unlocked');
                document.removeEventListener("mousemove", self.mouseMoved, false);
            }
        });
    }

    calculateIdealCameraPosition() {
        // Camera position relative to character.
        const cameraPosition = new THREE.Vector3(-0.5, 1.75, -4);

        // Apply rotation and position of the character to get world-space coords
        cameraPosition.applyQuaternion(this.character.controller.locomotion.rotation);
        cameraPosition.add(this.character.controller.locomotion.position);

        return cameraPosition;
    }

    calculateIdealCameraTarget() {
        // Look at point relative to character.
        if (this.isFocusingOnAnObject()) {
            return this.focusPoint;
        }

        const target = new THREE.Vector3(-0.5, 1.0, 0);

        // Apply character's rotation and position to get world-space coords
        target.applyQuaternion(this.character.controller.locomotion.rotation);
        target.add(this.character.controller.locomotion.position);

        return target;
    }

    isFocusingOnAnObject() {
        return this.focusPoint !== null;
    }

    enterPointerLock() {
        this.character.owner.renderer.domElement.requestPointerLock();
    }

    lookAround(cameraPos, target) {
        let targetToCamera = cameraPos.clone().sub(target);

        this.spherical.radius = targetToCamera.length();
        targetToCamera.setFromSpherical(this.spherical);

        cameraPos.copy(targetToCamera.clone().add(target));
    }

    update(deltaTime) {
        const cameraPosition = this.calculateIdealCameraPosition();
        const cameraTarget = this.calculateIdealCameraTarget();

        this.applyTerrainSurfaceBoundary(this.currentCameraPosition, this.currentLookAt);

        if (!this.isFocusingOnAnObject()) {
            this.lookAround(cameraPosition, cameraTarget);
        }

        const t = 1.0 - Math.pow(0.001, deltaTime);

        this.currentCameraPosition.lerp(cameraPosition, t);
        this.currentLookAt.lerp(cameraTarget, t);

        this.camera.position.copy(this.currentCameraPosition);
        this.camera.lookAt(this.currentLookAt);
    }

    applyTerrainSurfaceBoundary(cameraPos, target) {

        let height = this.character.owner.environment.terrain.getHeightAt(cameraPos);
        const offset = 0.5;

        if (cameraPos.y < height + offset) {

            let newCameraPos = cameraPos.clone();
            newCameraPos.y = height + offset;

            let targetToNewCameraPos = newCameraPos.clone().sub(target);

            let angleBetweenUpAndNewCameraPos = new THREE.Vector3(0,1,0).angleTo(targetToNewCameraPos);

            this.boundaries.currentMaxPolarAngle = angleBetweenUpAndNewCameraPos;

        } else {
            this.boundaries.currentMaxPolarAngle = this.boundaries.maxPolarAngle;
        }


    }


}


export {ThirdPersonCameraController};
