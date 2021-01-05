import {GLTFLoader} from "../../vendor/three-js/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";

class Character {
    constructor(gltf) {
        this.model = gltf.scene;
        this.animations = gltf.animations;
        this.mixer = new THREE.AnimationMixer(this.model);
        this.actionMap = {};

        this.setupShadows();
        this.setupActions();
    }

    setupShadows() {
        Logger.debug("Setting up shadows for this character model.")
        this.model.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }

    setupActions() {
        Logger.debug("Setting up actions for this character model.")
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

class CharacterController {
    constructor(character, input) {
        this.character = character;
        this.input = input;
    }

    update(deltaTime) {
        // TODO.
        if (this.input.keys.moveLeft) {
            this.character.actionMap["Turn Left"].play();
        }
        if (this.input.keys.moveRight) {
            this.character.actionMap["Turn Right"].play();
        }
        if (this.input.keys.moveForward) {
           this.character.actionMap["Walking"].play();
        }
        if (this.input.keys.moveBackward) {
            //this.character.actionMap["Walking"].play();
        }

        this.character.mixer.update(deltaTime);
    }
}

class CharacterControllerKeyboardInput {
    constructor() {
        this.keys = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false
        };

        document.addEventListener("keydown", (event) => this.onInputReceived(event, true));
        document.addEventListener("keyup", (event) => this.onInputReceived(event, false));
    }

    onInputReceived(event, state) {
        Logger.debug("Character controller keyboard input: " + event.key);
        if (event.key === "w" || event.key === "ArrowUp")
        {
            this.keys.moveForward = state;
        }
        if (event.key === "a" || event.key === "ArrowLeft")
        {
            this.keys.moveLeft = state;
        }
        if (event.key === "s" || event.key === "ArrowDown")
        {
            this.keys.moveBackward = state;
        }
        if (event.key === "d" || event.key === "ArrowRight")
        {
            this.keys.moveRight = state;
        }
    }
}

export {Character};
export {CharacterLoader};
export {CharacterController};
export {CharacterControllerKeyboardInput};
