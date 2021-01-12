import * as THREE from "../../vendor/three-js/build/three.module.js";
import {Assets} from "./assets.js";
import {GameObject} from "./objects.js";


class AnimatedObject extends GameObject {
    constructor(gltf) {
        super();

        this.model = Assets.cloneGLTF(gltf);
        this.animations = gltf.animations;
        this.mixer = new THREE.AnimationMixer(this.model);
        this.actionMap = {};
        this.actionList = [];
        this.healthFactor=0.0;
        this.setupShadows();
        this.setupActions();
    }

    playActionByName(name) {
        this.actionMap[name].play();
    }

    playActionByIndex(idx) {
        this.actionList[idx].play();
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

        this.actionList = actions;

        this.actionMap = actions.reduce(function (map, obj) {
            obj.paused = false;
            map[obj._clip.name] = obj;
            return map;
        }, {});
    }

}

export {AnimatedObject};
