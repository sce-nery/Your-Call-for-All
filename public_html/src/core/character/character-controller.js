import * as THREE from "../../../vendor/three-js/build/three.module.js";
import {FBXLoader} from "../../../vendor/three-js/examples/jsm/loaders/FBXLoader.js";
import {CharacterControllerKeyboardInput} from "./character-controller-input.js";
import {CharacterFSM} from "./finite-state-machines.js";
import {Assets} from "../assets.js";


class BasicCharacterController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this._deceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
        this._velocity = new THREE.Vector3(0, 0, 0);
        this._position = new THREE.Vector3();


        this.loadModels();

        this.input = new CharacterControllerKeyboardInput();
        this.fsm = new CharacterFSM(this.actionMap);
        this.fsm.setState('Idle');

    }


    setupActions() {
        Logger.debug("Setting up actions for this tree model.")
        const animations = this.animations;
        let actionList = [];

        for (let i = 0; i < animations.length; i++) {
            actionList.push(this.mixer.clipAction(animations[i]));
        }

        this.actionList = actionList;

        this.actionMap = actionList.reduce(function (map, obj) {
            obj.paused = false;
            map[obj._clip.name] = obj;
            return map;
        }, {});
    }


    loadModels() {

        this.gltf =  Assets.glTF.Jackie;
        this.model = this.gltf.scene;
        this.animations = this.gltf.animations;

        this.scene.add(this.model);

        this.mixer = new THREE.AnimationMixer(this.model);

       this.setupActions();
       this.setupShadows();

    }

    setupShadows() {
        this.model.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }

    Update(timeInSeconds, ycfa) {
        if (!this.model) {
            return;
        }

        this.fsm.update(timeInSeconds, this.input);

        const velocity = this._velocity;
        const frameDeceleration = new THREE.Vector3(
            velocity.x * this._deceleration.x,
            velocity.y * this._deceleration.y,
            velocity.z * this._deceleration.z
        );
        frameDeceleration.multiplyScalar(timeInSeconds);
        frameDeceleration.z = Math.sign(frameDeceleration.z) * Math.min(Math.abs(frameDeceleration.z), Math.abs(velocity.z));

        velocity.add(frameDeceleration);


        let raycaster = new THREE.Raycaster(this.model.position, new THREE.Vector3(0, -1, 0));
        let intersects = raycaster.intersectObject(ycfa.environment.terrain.centerChunk.mesh); //use intersectObjects() to check the intersection on multiple

        if (intersects[0] !== undefined) {
            let distance = 1.25;
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


        const controlObject = this.model;
        const _Q = new THREE.Quaternion();
        const _A = new THREE.Vector3();
        const _R = controlObject.quaternion.clone();

        const acc = this._acceleration.clone();
        if (this.input.keys.shift) {
            acc.multiplyScalar(2.0);
        }

        if (this.input.keys.forward) {
            velocity.z += acc.z * timeInSeconds;
        }
        if (this.input.keys.backward) {
            velocity.z -= acc.z * timeInSeconds;
        }
        if (this.input.keys.left) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }
        if (this.input.keys.right) {
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

        if (this.mixer) {
            this.mixer.update(timeInSeconds);
        }
    }
}

class BasicCharacterControllerProxy {
    constructor(actionMap) {
        this.actionMap = actionMap;
    }
    get animations() {
        return this.actionMap;
    }
}


export {BasicCharacterController, BasicCharacterControllerProxy}
