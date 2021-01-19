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
        this.model.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }


}

class FrogOnLeaf extends AnimatedObject {
    static prevalence = 0.1;

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

        this.model.rotation.z += Math.sin(this.mixer.time * 1.25) * 0.001;
        this.model.rotation.x += Math.cos(this.mixer.time * 1.25) * 0.001;
    }

    static scatter(environment, candidatePosition) {

        if (candidatePosition.y > -1 && candidatePosition.y < 0) { // Height check

            let percent = environment.prng.random() * 100;

            if (percent < FrogOnLeaf.prevalence) {

                let frog = new FrogOnLeaf(environment, new THREE.Vector3(candidatePosition.x, 0, candidatePosition.z));

                environment.objects.push(frog);

            }
        }
    }
}

class Shark extends AnimatedObject {
    static prevalence = 0.08;

    constructor(environment, position) {
        super(Assets.glTF.Shark);
        this.environment = environment;

        this.model.name = "Shark";

        this.model.position.set(position.x, position.y, position.z);

        let scale = this.environment.prng.randomBetween(0.3, 0.6);
        this.model.scale.setScalar(scale);

        let min = this.environment.prng.randomBetween(0.4, 0.7);
        this.setHealthRange(min, 1.0);

        // Sets the wind animation for play.
        this.playActionByIndex(0);
        this.mixer.timeScale = 0.8 + this.environment.prng.random() * 0.4;

        this.circularMotionRadius = this.environment.prng.randomBetween(0.05, 0.10);
        this.circularMotionSpeed = this.environment.prng.randomBetween(0.2, 0.4);
    }

    update(deltaTime) {
        this.mixer.update(deltaTime);

        let xOffset = Math.sin(this.mixer.time * this.circularMotionSpeed) * this.circularMotionRadius;
        let zOffset = Math.cos(this.mixer.time * this.circularMotionSpeed) * this.circularMotionRadius;

        this.model.position.y += Math.sin(this.mixer.time) * this.circularMotionRadius * 0.05;
        this.model.position.x += xOffset;
        this.model.position.z -= zOffset;
        this.model.rotation.y = Math.PI / 2 + Math.atan2(zOffset, xOffset);
    }

    static scatter(environment, candidatePosition) {
        if (candidatePosition.y < -5) {

            let percent = environment.prng.random() * 100;

            if (percent < Shark.prevalence) {

                let shark = new Shark(environment, new THREE.Vector3(candidatePosition.x, -0.75, candidatePosition.z));

                environment.objects.push(shark);

            }
        }

    }
}

class Butterfly extends AnimatedObject {
    static prevalence = 0.15;

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

        this.circularMotionRadius = this.environment.prng.randomBetween(0.025, 0.05);
        this.circularMotionSpeed = this.environment.prng.randomBetween(0.4, 0.8);
    }


    update(deltaTime) {
        this.mixer.update(deltaTime);

        let xOffset = Math.sin(this.mixer.time * this.circularMotionSpeed) * this.circularMotionRadius;
        let zOffset = Math.cos(this.mixer.time * this.circularMotionSpeed) * this.circularMotionRadius;

        this.model.position.y += Math.sin(this.mixer.time) * this.circularMotionRadius * 0.1;
        this.model.position.x -= xOffset;
        this.model.position.z += zOffset;
        this.model.rotation.y = Math.atan2(zOffset, xOffset);
    }

    static scatter(environment, candidatePosition) {
        if (candidatePosition.y > 0 && candidatePosition.y < 20) {

            let percent = environment.prng.random() * 100;

            if (percent < Butterfly.prevalence) {
                const position = new THREE.Vector3(candidatePosition.x, candidatePosition.y + 1.0, candidatePosition.z);
                let butterfly = new Butterfly(environment, position);

                environment.objects.push(butterfly);
            }
        }
    }
}

class SimpleTree extends StaticObject {
    static prevalence = 0.15;

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

    // TODO: This function also scatters this tree's bad health counterpart,
    //  which I guess is not a good program design. Preferably, there should be another
    //  abstraction that handles pairs of good and bad trees.
    static scatter(environment, candidatePosition) {
        if (candidatePosition.y > 1 && candidatePosition.y < 10) { // Height check

            let percent = environment.prng.random() * 100;

            if (percent < SimpleTree.prevalence) { // %0.3 of the time.

                let simpleTree = new SimpleTree(environment, candidatePosition);
                environment.objects.push(simpleTree);

                let deadTree = new DeadTree(environment, candidatePosition);
                deadTree.healthRange.max = simpleTree.healthRange.min;
                deadTree.model.scale.copy(simpleTree.model.scale.clone().multiplyScalar(1 / 500));
                environment.objects.push(deadTree);

            }

        }
    }
}

class DeadTree extends StaticObject {
    static prevalence = 0.15;

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

    static scatter(environment, candidatePosition) {
        // Not implemented. See SimpleTree.scatter
    }
}

class PineTree extends StaticObject {
    static prevalence = 0.15;

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

    // TODO: This function also scatters this tree's bad health counterpart,
    //  which I guess is not a good program design. Preferably, there should be another
    //  abstraction that handles pairs of good and bad trees.
    static scatter(environment, candidatePosition) {
        if (candidatePosition.y > 1 && candidatePosition.y < 10) { // Height check

            let percent = environment.prng.random() * 100;

            if (percent < PineTree.prevalence) {

                let pineTree = new PineTree(environment, candidatePosition);
                environment.objects.push(pineTree);

                let driedPine = new DriedPine(environment, candidatePosition);
                driedPine.healthRange.max = pineTree.healthRange.min;
                driedPine.model.scale.copy(pineTree.model.scale.clone().multiplyScalar(1 / 2.5));

                environment.objects.push(driedPine);
            }

        }
    }

}

class DriedPine extends AnimatedObject {
    static prevalence = 0.15;

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

    static scatter(environment, candidatePosition) {
        // Not implemented. See PineTree.scatter
    }
}


class LowPolyGrass extends StaticObject {
    static prevalence = 0.1;

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

    static scatter(environment, candidatePosition) {

        if (candidatePosition.y > 1 && candidatePosition.y < 10) {
            let percent = environment.prng.random() * 100;

            if (percent < LowPolyGrass.prevalence) {
                const heightOffset = environment.prng.randomBetween(0.1, 0.2,);
                const position = new THREE.Vector3(candidatePosition.x, candidatePosition.y - heightOffset, candidatePosition.z);

                let grass = new LowPolyGrass(environment, position);

                environment.objects.push(grass);
            }

        }

    }
}

class Flashlight extends StaticObject {
    constructor(character) {
        super(Assets.glTF.FlashLight);

        this.character = character;

        this.model.name = "Flashlight";

        this.model.scale.setScalar(0.02);

        this.setupLight();
    }

    setupLight() {

        this.light = new THREE.SpotLight(0xffffff, 1);

        this.light.position.set(this.model.position.x, this.model.position.y - 1, this.model.position.z);

        this.light.position.set(15, 40, 35);
        this.light.angle = Math.PI / 4;
        this.light.penumbra = 0.1;
        this.light.decay = 2;
        this.light.distance = 200;

        this.light.castShadow = true;
        this.light.shadow.mapSize.width = 512;
        this.light.shadow.mapSize.height = 512;
        this.light.shadow.camera.near = 10;
        this.light.shadow.camera.far = 200;
        this.light.shadow.focus = 1;

    }

    update(deltaTime, ycfa) {
        let timeOfDay = ycfa.environment.sky.props.inclination;
        if (timeOfDay > 0.5 && timeOfDay <= 1.0) {
            if (!this.isInScene) {
                ycfa.scene.add(this.model);
                ycfa.scene.add(this.light);
                this.isInScene = true;
            }

            let cameraTarget = this.character.cameraController.currentLookAt.clone();
            let cameraPos = this.character.cameraController.currentCameraPosition.clone();

            let direction = cameraTarget.clone().sub(cameraPos).normalize();

            this.light.target.position.copy(
                cameraTarget.clone().add(direction.clone().multiplyScalar(10))
            );

            this.light.target.updateMatrixWorld();

            this.character.rightArm.rotation.z = THREE.Math.degToRad(-75);
            this.character.rightForeArm.lookAt(this.light.target.position);
            this.character.rightHand.lookAt(this.light.target.position);

            let flashlightPosition = new THREE.Vector3();
            this.character.rightHand.getWorldPosition(flashlightPosition);
            flashlightPosition.add(direction.clone().multiplyScalar(0.1))
            flashlightPosition.add(new THREE.Vector3(0,0.02,0))

            this.model.position.copy(flashlightPosition);
            this.light.position.copy(this.model.position);

            this.model.lookAt(this.light.target.position);

        } else {
            if (this.isInScene) {
                ycfa.scene.remove(this.model);
                ycfa.scene.remove(this.light);
                this.isInScene = false;
            }
        }
    }
}

export {LowPolyGrass};
export {Flashlight};
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
