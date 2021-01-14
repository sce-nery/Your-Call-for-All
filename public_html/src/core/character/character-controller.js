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
            acceleration: new THREE.Vector3(1, 0.25, 10.0),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Quaternion(),
            position: new THREE.Vector3(),
        }

        this.input = new CharacterControllerKeyboardInput();

        this.fsm = new CharacterStateMachine(this.character.actionMap);
        this.fsm.setState('Idle');
    }

    handleCollisions(ycfa) {

        const result = ycfa.worldOctree.capsuleIntersect(this.character.collider);

        this.playerOnFloor = false;

        if (result) {

            this.playerOnFloor = result.normal.y > 0;

            if (!this.playerOnFloor) {

                this.locomotion.velocity.addScaledVector(result.normal, -result.normal.dot(this.locomotion.velocity));

            }

            this.character.collider.translate(result.normal.multiplyScalar(result.depth));

        }

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

        const controlObject = this.character.model;
        const Q = new THREE.Quaternion();
        const A = new THREE.Vector3();
        const R = controlObject.quaternion.clone();

        const acceleration = this.locomotion.acceleration.clone();
        if (this.input.keys.shift) {
            acceleration.multiplyScalar(3.0);
        }

        if (this.input.keys.forward) {
            velocity.z += acceleration.z * deltaTime;
        }
        if (this.input.keys.backward) {
            velocity.z -= acceleration.z * deltaTime;
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

        // Gravity
        if (this.playerOnFloor) {

           const damping = Math.exp(-3 * deltaTime) - 1;
           this.locomotion.velocity.y += this.locomotion.velocity.y * damping;

        } else {
            let GRAVITY = -9.8;
            this.locomotion.velocity.y += GRAVITY * deltaTime;
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

        const up = new THREE.Vector3(0, 1, 0);

        sideways.multiplyScalar(velocity.x * deltaTime);
        forward.multiplyScalar(velocity.z * deltaTime);
        up.multiplyScalar(velocity.y * deltaTime);

        this.character.collider.translate(forward);
        this.character.collider.translate(sideways);
        this.character.collider.translate(up);

        this.handleCollisions(ycfa);

        controlObject.position.copy(this.character.collider.start);
        // Correction for ground touch;
        controlObject.position.y -= 0.35;

        this.locomotion.position.copy(controlObject.position);
        this.locomotion.rotation.copy(controlObject.quaternion);
    }
}

export {CharacterController};
