import {CharacterController} from "./character-controller.js";
import {ThirdPersonCameraController} from "./third-person-camera-controller.js";
import {Assets} from "../assets.js";
import * as THREE from "../../../vendor/three-js/build/three.module.js";
import {Capsule} from "../../../vendor/three-js/examples/jsm/math/Capsule.js";



class Character {

    constructor(ycfa) {
        this.owner = ycfa;
        this.scene = ycfa.scene;
        this.camera = ycfa.camera;

        this.gltf = Assets.glTF.Jackie;
        this.model = this.gltf.scene;
        this.animations = this.gltf.animations;

        this.collider = new Capsule(new THREE.Vector3(0, 0.0, 0), new THREE.Vector3(0, 1.60, 0), 0.35);

        this.mixer = new THREE.AnimationMixer(this.model);

        this.setupActions();
        this.setupShadows();
        this.setupControllers();
    }

    removeBadObjectFromTheEnvironment(decisionPoint) {
        this.owner.environment.removeBadObject(decisionPoint);
    }

    setupControllers() {
        this.controller = new CharacterController(this);
        this.cameraController = new ThirdPersonCameraController(this);
    }

    setupActions() {
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

    setupShadows() {
        this.model.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }

    update(deltaTime, ycfa) {
        this.controller.update(deltaTime, ycfa);
        this.cameraController.update(deltaTime);

        this.mixer.update(deltaTime);
    }

    move(offset) {
        this.model.position.add(offset);
        this.collider.translate(offset);
        this.controller.locomotion.position.add(offset);
    }
}


export {Character};
