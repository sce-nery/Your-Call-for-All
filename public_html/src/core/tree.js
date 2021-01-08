import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GLTFLoader} from "../../vendor/three-js/examples/jsm/loaders/GLTFLoader.js";


class Tree {
    constructor(gltf) {
        this.model = gltf.scene;
        this.animations = gltf.animations;
        this.mixer = new THREE.AnimationMixer(this.model);
        this.actionMap = {};

        this.setupShadows();
        this.setupActions();
    }

    setupShadows() {
        Logger.debug("Setting up shadows for this tree model.")
        this.model.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }

    setupActions() {
        Logger.debug("Setting up actions for this tree model.")
        const animations = this.animations;
        let actions = [];

        for (let i = 0; i < animations.length; i++) {
            actions.push(this.mixer.clipAction(animations[i]));
        }

        this.actionMap = actions.reduce(function (map, obj) {
            obj.paused = false;
            map[obj._clip.name] = obj;
            return map;
        }, {});
    }

    activateAllActions() {
        // TODO.
        for (const key in this.actionMap) {
            let action = this.actionMap[key];
            action.enabled = true;
            action.setEffectiveTimeScale(1);
            action.setEffectiveWeight(0.0);
            //action.play();
        }

    }

}

export{Tree};
