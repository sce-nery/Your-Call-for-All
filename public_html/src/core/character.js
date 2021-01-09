import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GLTFLoader} from "../../vendor/three-js/examples/jsm/loaders/GLTFLoader.js";

class Character {
    constructor(scene, gltf) {
        this.scene = scene;
        this.model = gltf.scene;
        this.animations = gltf.animations;
        this.mixer = new THREE.AnimationMixer(this.model);
        this.actions = this.setupActions();

        this.setupShadows();
        this.scene.add(this.model);
    }

    setupActions() {
        Logger.debug("Setting up actions for this character model.")
        let idleAction = this.mixer.clipAction(this.animations[0]);
        let walkAction = this.mixer.clipAction(this.animations[3]);
        let runAction = this.mixer.clipAction(this.animations[1]);
        return [idleAction, walkAction, runAction];
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
        if (event.key === "w" || event.key === "ArrowUp") {
            this.keys.moveForward = state;
        }
        if (event.key === "a" || event.key === "ArrowLeft") {
            this.keys.moveLeft = state;
        }
        if (event.key === "s" || event.key === "ArrowDown") {
            this.keys.moveBackward = state;
        }
        if (event.key === "d" || event.key === "ArrowRight") {
            this.keys.moveRight = state;
        }
    }
}

export {Character};
export {CharacterController};
export {CharacterControllerKeyboardInput};
