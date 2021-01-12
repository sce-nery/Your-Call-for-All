import {CharacterController} from "./character-controller.js";
import {ThirdPersonCameraController} from "./third-person-camera-controller.js";
import {Assets} from "../assets.js";
import * as THREE from "../../../vendor/three-js/build/three.module.js";


class Character {

    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.gltf = Assets.glTF.Jackie;
        this.model = this.gltf.scene;
        this.animations = this.gltf.animations;

        this.scene.add(this.model);

        this.mixer = new THREE.AnimationMixer(this.model);

        this.setupActions();
        this.setupShadows();

        this.setupControllers();
    }

    setupControllers() {
        this.controller = new CharacterController(this);
        this.cameraController = new ThirdPersonCameraController(this);
    }

    update(deltaTime, ycfa) {
        this.controller.update(deltaTime, ycfa);
        this.cameraController.update(deltaTime);

        this.mixer.update(deltaTime);
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

}


export {Character};
