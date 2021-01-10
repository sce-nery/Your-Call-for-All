import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GUI} from "../../vendor/three-js/examples/jsm/libs/dat.gui.module.js";

class Character {
    constructor(scene, gltf) {
        this.scene = scene;
        this.model = gltf.scene;
        this.animations = gltf.animations;
        this.mixer = new THREE.AnimationMixer(this.model);

        this.mixer.timeScale = 0.5;


        this.actions = this.setupActions();

        this.characterController = new CharacterController(this, new CharacterControllerKeyboardInput());

        this.addCharacterToTheScene();
        this.setupShadows();


    }

    update(deltaTime) {
        this.mixer.update(deltaTime);



        this.characterController.update(deltaTime);
    }

    pauseAllActions() {
        this.actions.forEach((action) => {
            action.paused = true;
        } );
    }

    addCharacterToTheScene(){
        this.scene.add(this.model);
        this.model.scale.setScalar(1.0);
        this.model.position.x = -10;
        this.model.position.y = 10;
    }

    setupActions() {
        Logger.debug("Setting up actions for this character model.")
        let idleAction = this.mixer.clipAction(this.animations[0]);
        let walkAction = this.mixer.clipAction(this.animations[3]);
        let runAction = this.mixer.clipAction(this.animations[1]);

        this.idleAction = idleAction;
        this.walkAction = walkAction;
        this.runAction = runAction;

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

        if (this.input.keys.moveLeft) {

        }
        if (this.input.keys.moveRight) {


            this.character.actions[0].paused = true;
            this.character.actions[1].paused = true;
            this.character.model.position.z -= deltaTime * 5;
            this.character.mixer.timeScale = 1.0;
            this.character.actions[2].play();
            this.character.actions[2].paused = false;
        }
        if (this.input.keys.moveForward) {


            this.character.actions[0].paused = true;
            this.character.actions[2].paused = true;


            this.character.model.position.z -= deltaTime;
            this.character.actions[1].paused = false;
            this.character.actions[1].play();
        }
        if (this.input.keys.moveBackward) {
            this.character.actions[2].paused = true;
            this.character.actions[1].paused = true;

            this.character.model.position.z += deltaTime;

            this.character.actions[0].paused = false;
            this.character.actions[0].play();
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
