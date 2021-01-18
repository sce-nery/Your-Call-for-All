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

        let scale = this.environment.prng.randomBetween(0.1, 0.3);
        this.model.scale.setScalar(scale);

        let min = this.environment.prng.randomBetween(0.3, 0.6);
        this.setHealthRange(min, 1.0);

        // Sets the wind animation for play.
        this.playActionByIndex(0);
    }

    update(deltaTime) {
        this.mixer.update(deltaTime);
    }
}

class Shark extends AnimatedObject {
    constructor(environment, position) {
        super(Assets.glTF.Shark);
        this.environment = environment;

        this.model.name = "Shark";
        this.model.position.set(position.x, position.y, position.z);

        let scale = this.environment.prng.randomBetween(0.6, 0.9);
        this.model.scale.setScalar(scale);

        let min = this.environment.prng.randomBetween(0.4, 0.7);
        this.setHealthRange(min, 1.0);

        // Sets the wind animation for play.
        this.playActionByIndex(0);
        this.mixer.timeScale = 0.8 + this.environment.prng.random() * 0.4;

    }

    update(deltaTime) {
        this.mixer.update(deltaTime);
    }
}

class Butterfly extends AnimatedObject {
    constructor(environment, position) {
        super(Assets.glTF.Butterfly);
        this.environment = environment;

        this.model.name = "Butterfly";
        this.model.position.copy(position);

        let scale = this.environment.prng.randomBetween(0.004, 0.012);
        this.model.scale.setScalar(scale);

        let min = this.environment.prng.randomBetween(0.7, 0.9);
        this.setHealthRange(min, 1.0);

        this.mixer.timeScale = this.environment.prng.randomBetween(0.8, 1.2);

        // Sets the wind animation for play.
        this.playActionByIndex(0);

        this.origin = this.model.position.clone();
        this.timeElapsed = 0;

        this.circularMotionRadius = this.environment.prng.randomBetween(0.025, 0.05);
    }


    update(deltaTime) {
        this.mixer.update(deltaTime);
        this.timeElapsed += deltaTime;

        let xOffset = Math.sin(this.timeElapsed) * this.circularMotionRadius;
        let zOffset = Math.cos(this.timeElapsed) * this.circularMotionRadius;


        this.model.position.x -= xOffset;
        this.model.position.z += zOffset;
        this.model.rotation.y = Math.atan2(zOffset, xOffset);
    }
}

class SimpleTree extends StaticObject {
    constructor(environment, position) {
        super(Assets.glTF.SimpleTree);
        this.environment = environment;

        this.model.name = "SimpleTree";
        this.model.position.copy(position);

        let scale = this.environment.prng.randomBetween(1.8, 2.2);
        this.model.scale.setScalar(scale);

        let min = this.environment.prng.randomBetween(0.4, 0.8);
        this.setHealthRange(min, 1.0);
    }
}

class DeadTree extends StaticObject {
    constructor(environment, position) {
        super(Assets.glTF.DeadTree);
        this.environment = environment;

        this.model.name = "DeadTree";
        this.model.position.copy(position);

        let scale = this.environment.prng.randomBetween(0.0036, 0.0044);
        this.model.scale.setScalar(scale);

        let max = this.environment.prng.randomBetween(0.4, 0.8);
        this.setHealthRange(0.0, max);
    }
}

class PineTree extends StaticObject {
    constructor(environment, position) {
        super(Assets.glTF.PineTree);
        this.environment = environment;

        this.model.name = "PineTree";
        this.model.position.copy(position);

        let scale = this.environment.prng.randomBetween(0.008, 0.013);
        this.model.scale.set(scale, scale, scale);

        let min = this.environment.prng.randomBetween(0.4, 0.8);
        this.setHealthRange(min, 1.0);
    }

}

class DriedPine extends AnimatedObject {
    constructor(environment, position) {
        super(Assets.glTF.DriedPine);
        this.environment = environment;

        this.model.name = "DriedPine";
        this.model.position.copy(position);

        let scale = this.environment.prng.randomBetween(0.0032, 0.0052);
        this.model.scale.setScalar(scale);

        let max = this.environment.prng.randomBetween(0.4, 0.8);
        this.setHealthRange(0.0, max);

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

        let scale = this.environment.prng.randomBetween(0.01, 0.022);
        this.model.scale.setScalar(scale);

        let min = this.environment.prng.randomBetween(0.4, 0.8);
        this.setHealthRange(min, 1.0);
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
