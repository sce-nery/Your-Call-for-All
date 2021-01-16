import {Assets} from "./assets.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";
import {LinearInterpolator} from "../math/math.js";


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

class FrogOnLeaf extends AnimatedObject {
    constructor(environment, position) {
        super(Assets.glTF.FrogOnLeaf);
        this.environment = environment;

        this.model.name = "Frog";
        this.model.position.set(position.x, position.y, position.z);

        let scale = LinearInterpolator.real(0.1, 0.3, this.environment.prng.random());
        this.model.scale.setScalar(scale);

        this.setHealthRange(0.5, 1.0);

        // Sets the wind animation for play.
        this.playActionByIndex(0);
    }

    update(deltaTime) {

    }
}

class Shark extends AnimatedObject {
    constructor(environment, position) {
        super(Assets.glTF.Shark);
        this.environment = environment;

        this.model.name = "Shark";
        this.model.position.set(position.x, position.y, position.z);

        let scale = LinearInterpolator.real(0.7, 0.9, this.environment.prng.random());
        this.model.scale.setScalar(scale);

        this.setHealthRange(0.5, 1.0);

        // Sets the wind animation for play.
        this.playActionByIndex(0);
        this.mixer.timeScale = 0.8 + this.environment.prng.random() * 0.4;

    }

    update(deltaTime) {

    }
}

class Butterfly extends AnimatedObject {
    constructor(environment, position) {
        super(Assets.glTF.Butterfly);
        this.environment = environment;

        this.model.name = "Butterfly";
        this.model.position.copy(position);

        let scale = LinearInterpolator.real(0.004, 0.012, this.environment.prng.random());
        this.model.scale.setScalar(scale);

        this.setHealthRange(0.5, 1.0);

        this.mixer.timeScale = 0.8 + this.environment.prng.random() * 0.4;

        // Sets the wind animation for play.
        this.playActionByIndex(0);
    }


    update(deltaTime) {
        this.mixer.update(deltaTime);
    }
}

class SimpleTree extends StaticObject {
    constructor(environment, position) {
        super(Assets.glTF.SimpleTree);
        this.environment = environment;

        this.model.name = "SimpleTree";
        this.model.position.copy(position);

        let scale = LinearInterpolator.real(1.8, 2.2, this.environment.prng.random());
        this.model.scale.setScalar(scale);

        this.setHealthRange(0.5, 1.0);
    }
}

class DeadTree extends StaticObject {
    constructor(environment, position) {
        super(Assets.glTF.DeadTree);
        this.environment = environment;

        this.model.name = "DeadTree";
        this.model.position.copy(position);

        let scale = LinearInterpolator.real(0.0036, 0.0044);
        this.model.scale.setScalar(scale);

        this.setHealthRange(0.0, 0.5);
    }
}

class PineTree extends StaticObject {
    constructor(environment, position) {
        super(Assets.glTF.PineTree);
        this.environment = environment;

        this.model.name = "PineTree";
        this.model.position.copy(position);

        let scale = LinearInterpolator.real(0.008, 0.013, this.environment.prng.random());
        this.model.scale.set(scale, scale, scale);

        this.setHealthRange(0.5, 1.0);
    }

}

class DriedPine extends AnimatedObject {
    constructor(environment, position) {
        super(Assets.glTF.DriedPine);
        this.environment = environment;

        this.model.name = "DriedPine";
        this.model.position.copy(position);

        let scale = LinearInterpolator.real(0.0032, 0.0052, this.environment.prng.random());
        this.model.scale.setScalar(scale);

        this.setHealthRange(0.0, 0.5);

        // Sets the wind animation for play.
        this.playActionByIndex(0);
    }

    update(deltaTime) {
        this.mixer.update(deltaTime);
    }
}


class LowPolyGrass extends StaticObject {
    constructor(environment, position) {
        super(Assets.glTF.LowPolyGrass);
        this.environment = environment;

        this.model.name = "LowPolyGrass";
        this.model.position.copy(position);

        let scale = LinearInterpolator.real(0.01, 0.022, this.environment.prng.random());
        this.model.scale.set(scale, scale, scale);

        this.setHealthRange(0.5, 1.0);
    }
}

export {LowPolyGrass};

export {PineTree};
export {DriedPine};

export {SimpleTree};
export {DeadTree};

export {FrogOnLeaf};
export {Shark};
export {Butterfly};

export {StaticObject};
export {AnimatedObject};
export {GameObject};
