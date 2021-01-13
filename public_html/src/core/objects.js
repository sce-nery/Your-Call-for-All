import {Assets} from "./assets.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";


class GameObject {
    constructor() {
        this.isInScene = false;

        this.healthRange = {min: 0, max: 1};
    }

    setHealthRange(min, max) {
        this.healthRange.min = min;
        this.healthRange.max = max;
    }
}


class AnimatedObject extends GameObject {
    constructor(gltf) {
        super();

        this.model = Assets.cloneGLTF(gltf);
        this.animations = gltf.animations;
        this.mixer = new THREE.AnimationMixer(this.model);
        this.actionMap = {};
        this.actionList = [];

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
        this.model.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }


    setupActions() {
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

class StaticObject extends GameObject {
    constructor(gltf) {
        super();
        this.model = Assets.cloneGLTF(gltf);

        this.setupShadows();
    }

    setupShadows() {
        Logger.debug("Setting up shadows for this Bushes model.")
        this.model.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }


}

export {StaticObject};
export {AnimatedObject};
export {GameObject};
