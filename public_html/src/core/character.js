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

        this.characterControllerInput  = new CharacterControllerKeyboardInput();
        this.characterController = new CharacterController(this, this.characterControllerInput);

        this.addCharacterToTheScene();
        this.setupShadows();


        this.actions.forEach( function ( action ) {

            action.play();

        } );

    }

    update(deltaTime) {
        this.mixer.update(deltaTime);
        this.characterController.update(deltaTime);
    }

    pauseAllActions() {
        this.actions.forEach((action) => { action.paused = true; });
    }

    unPauseAllActions() {
        this.actions.forEach(( action )  => { action.paused = false; });
    }

    prepareCrossFade(startAction, endAction, crossFadeDuration) {
        // Switch default / custom crossfade duration (according to the user's choice)
        const duration = crossFadeDuration;

        // Make sure that we don't go on in singleStepMode, and that all actions are unpaused
        this.unPauseAllActions();

        // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
        // else wait until the current action has finished its current loop
        if ( startAction === this.actions[0] ) {
            this.executeCrossFade( startAction, endAction, duration );
        } else {
            this.synchronizeCrossFade( startAction, endAction, duration );
        }

    }

    synchronizeCrossFade(startAction, endAction, crossFadeDuration) {
        this.mixer.addEventListener( 'loop', (event) => {
            if (event.action === startAction ) {
                this.mixer.removeEventListener( 'loop', this );
                this.executeCrossFade(startAction, endAction, crossFadeDuration );
            }
        } );
    }

    setWeight(action, weight ) {
        action.enabled = true;
        action.setEffectiveTimeScale( 1 );
        action.setEffectiveWeight( weight );

    }

    executeCrossFade( startAction, endAction, duration ) {
        // Not only the start action, but also the end action must get a weight of 1 before fading
        // (concerning the start action this is already guaranteed in this place)
        this.setWeight( endAction, 1 );
        endAction.time = 0;

        // Crossfade with warping - you can also try without warping by setting the third parameter to false
        startAction.crossFadeTo( endAction, duration, true );
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

        if (this.input.keys.moveForward) {
            this.character.prepareCrossFade( this.character.actions[1], this.character.actions[2], 0.5 );
        }
        if (this.input.keys.moveLeft) {
            this.character.prepareCrossFade( this.character.actions[0], this.character.actions[2], 1.0 );
        }
        if (this.input.keys.moveRight) {
            this.character.prepareCrossFade( this.character.actions[2], this.character.actions[0], 2.5 );
        }
        if (this.input.keys.moveBackward) {
            this.character.prepareCrossFade( this.character.actions[0], this.character.actions[1], 5.0 );
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
