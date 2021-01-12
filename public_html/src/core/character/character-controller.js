import * as THREE from "../../../vendor/three-js/build/three.module.js";
import {FBXLoader} from "../../../vendor/three-js/examples/jsm/loaders/FBXLoader.js";
import {CharacterControllerKeyboardInput} from "./character-controller-input.js";
import {CharacterFSM} from "./finite-state-machines.js";
import {Assets} from "../assets.js";


class BasicCharacterController {
    constructor(params) {
        this._params = params;
        this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
        this._velocity = new THREE.Vector3(0, 0, 0);
        this._position = new THREE.Vector3();


        this._LoadModels();
        this._input = new CharacterControllerKeyboardInput();
        this._stateMachine = new CharacterFSM(new BasicCharacterControllerProxy(this._animations));
        this._stateMachine.SetState('Idle');

    }


    setupActions() {
        Logger.debug("Setting up actions for this tree model.")
        const animations = this.animations;
        let actions = [];

        for (let i = 0; i < animations.length; i++) {
            actions.push(this._mixer.clipAction(animations[i]));
        }

        this.actionList = actions;

        this.actionMap = actions.reduce(function (map, obj) {
            obj.paused = false;
            map[obj._clip.name] = obj;
            return map;
        }, {});
    }


    _LoadModels() {

        this.gltf =  Assets.glTF.Jackie;
        this.model = this.gltf.scene;
        this.animations = this.gltf.animations;

        this._target = this.model;
        this._params.scene.add(this._target);

        this._mixer = new THREE.AnimationMixer(this._target);

       this.setupActions();

       this._animations= this.actionMap;

        this.model.position.x = -28;
       // this.model.scale.setScalar(1);
        this.model.traverse(c => {
            c.castShadow = true;
        });

    }

    get Position() {
        return this._position;
    }

    get Rotation() {
        if (!this._target) {
            return new THREE.Quaternion();
        }
        return this._target.quaternion;
    }


    Update(timeInSeconds, ycfa) {
        if (!this._target) {
            return;
        }

        this._stateMachine.Update(timeInSeconds, this._input);

        const velocity = this._velocity;
        const frameDecceleration = new THREE.Vector3(
            velocity.x * this._decceleration.x,
            velocity.y * this._decceleration.y,
            velocity.z * this._decceleration.z
        );
        frameDecceleration.multiplyScalar(timeInSeconds);
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));

        velocity.add(frameDecceleration);


        /*
        let raycaster = new THREE.Raycaster(this.model.position, new THREE.Vector3(0, -1, 0));
        let intersects = raycaster.intersectObject(ycfa.environment.terrain.centerChunk.mesh); //use intersectObjects() to check the intersection on multiple

        if (intersects[0] !== undefined) {
            let distance = 1.75;
            //new position is higher so you need to move you object upwards
            if (distance > intersects[0].distance) {
                this.model.position.y += (distance - intersects[0].distance) - 1; // the -1 is a fix for a shake effect I had
            }

            //gravity and prevent falling through floor
            if (distance >= intersects[0].distance && this._velocity.y <= 0) {
                this._velocity.y = 0;
            } else if (distance <= intersects[0].distance &&  this._velocity.y=== 0) {
                this._velocity.y-= 0.1;
            }

            this.model.translateY( this._velocity.y);
        }
        */


        const controlObject = this._target;
        const _Q = new THREE.Quaternion();
        const _A = new THREE.Vector3();
        const _R = controlObject.quaternion.clone();

        const acc = this._acceleration.clone();
        if (this._input.keys.shift) {
            acc.multiplyScalar(2.0);
        }

        if (this._input.keys.forward) {
            velocity.z += acc.z * timeInSeconds;
        }
        if (this._input.keys.backward) {
            velocity.z -= acc.z * timeInSeconds;
        }
        if (this._input.keys.left) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }
        if (this._input.keys.right) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }

        controlObject.quaternion.copy(_R);

        const oldPosition = new THREE.Vector3();
        oldPosition.copy(controlObject.position);

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(controlObject.quaternion);
        forward.normalize();

        const sideways = new THREE.Vector3(1, 0, 0);
        sideways.applyQuaternion(controlObject.quaternion);
        sideways.normalize();

        sideways.multiplyScalar(velocity.x * timeInSeconds);
        forward.multiplyScalar(velocity.z * timeInSeconds);

        controlObject.position.add(forward);
        controlObject.position.add(sideways);

        this._position.copy(controlObject.position);

        if (this._mixer) {
            this._mixer.update(timeInSeconds);
        }
    }
}

class BasicCharacterControllerProxy {
    constructor(animations) {
        this._animations = animations;
    }
    get animations() {
        return this._animations;
    }
}


export {BasicCharacterController, BasicCharacterControllerProxy}