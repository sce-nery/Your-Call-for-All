import * as THREE from "../../../vendor/three-js/build/three.module.js";
import {CharacterControllerKeyboardInput} from "./character-controller-input.js";
import {CharacterStateMachine} from "./finite-state-machines.js";


class CharacterController {
    constructor(character) {
        this.character = character;
        this.camera = character.camera;
        this.scene = character.scene;

        this.locomotion = {
            deceleration: new THREE.Vector3(-0.0005, -0.0001, -5.0),
            acceleration: new THREE.Vector3(1, 0.25, 50.0),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Quaternion(),
            position: new THREE.Vector3(),
        }

        this.input = new CharacterControllerKeyboardInput();

        this.fsm = new CharacterStateMachine(this.character.actionMap);
        this.fsm.setState('Idle');
    }

    update(deltaTime, ycfa) {
        if (!this.character.model) {
            return;
        }

        this.fsm.update(deltaTime, this.input);

        const velocity = this.locomotion.velocity;
        const frameDeceleration = new THREE.Vector3(
            velocity.x * this.locomotion.deceleration.x,
            velocity.y * this.locomotion.deceleration.y,
            velocity.z * this.locomotion.deceleration.z
        );
        frameDeceleration.multiplyScalar(deltaTime);
        frameDeceleration.z = Math.sign(frameDeceleration.z) * Math.min(Math.abs(frameDeceleration.z), Math.abs(velocity.z));

        velocity.add(frameDeceleration);

        let raycaster = new THREE.Raycaster(this.character.model.position, new THREE.Vector3(0, -1, 0));
        let intersects = raycaster.intersectObject(ycfa.environment.terrain.centerChunk.mesh); //use intersectObjects() to check the intersection on multiple

        if (intersects[0] !== undefined) {
            let distance = 1.25;
            //new position is higher so you need to move you object upwards
            if (distance > intersects[0].distance) {
                this.character.model.position.y += (distance - intersects[0].distance) - 1; // the -1 is a fix for a shake effect I had
            }

            //gravity and prevent falling through floor
            if (distance >= intersects[0].distance && this.locomotion.velocity.y <= 0) {
                this.locomotion.velocity.y = 0;
            } else if (distance <= intersects[0].distance && this.locomotion.velocity.y === 0) {
                this.locomotion.velocity.y -= 0.1;
            }

            this.character.model.translateY(this.locomotion.velocity.y);
        }


        const controlObject = this.character.model;
        const Q = new THREE.Quaternion();
        const A = new THREE.Vector3();
        const R = controlObject.quaternion.clone();

        const acc = this.locomotion.acceleration.clone();
        if (this.input.keys.shift) {
            acc.multiplyScalar(2.0);
        }

        if (this.input.keys.forward) {
            velocity.z += acc.z * deltaTime;
        }
        if (this.input.keys.backward) {
            velocity.z -= acc.z * deltaTime;
        }
        if (this.input.keys.left) {
            A.set(0, 1, 0);
            Q.setFromAxisAngle(A, 4.0 * Math.PI * deltaTime * this.locomotion.acceleration.y);
            R.multiply(Q);
        }
        if (this.input.keys.right) {
            A.set(0, 1, 0);
            Q.setFromAxisAngle(A, 4.0 * -Math.PI * deltaTime * this.locomotion.acceleration.y);
            R.multiply(Q);
        }

        controlObject.quaternion.copy(R);

        const oldPosition = new THREE.Vector3();
        oldPosition.copy(controlObject.position);

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(controlObject.quaternion);
        forward.normalize();

        const sideways = new THREE.Vector3(1, 0, 0);
        sideways.applyQuaternion(controlObject.quaternion);
        sideways.normalize();

        sideways.multiplyScalar(velocity.x * deltaTime);
        forward.multiplyScalar(velocity.z * deltaTime);

        controlObject.position.add(forward);
        controlObject.position.add(sideways);

        this.locomotion.position.copy(controlObject.position);
        this.locomotion.rotation.copy(controlObject.quaternion);
    }
}

export {CharacterController};
