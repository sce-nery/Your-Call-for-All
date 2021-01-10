import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GUI} from "../../vendor/three-js/examples/jsm/libs/dat.gui.module.js";

class Character {
    constructor(scene, gltf) {
        this.scene = scene;
        this.model = gltf.scene;
        this.animations = gltf.animations;
        this.mixer = new THREE.AnimationMixer(this.model);
        this.actions = this.setupActions();


        this.crossFadeControls = [];

        this.idleAction = null;
        this.walkAction = null;
        this.runAction = null;

        this.idleWeight = null;
        this.walkWeight = null;
        this.runWeight = null;


        this.setupShadows();
        this.scene.add(this.model);
        this.model.position.x = -10;
        this.model.position.y = 20;


        this.createPanel();

    }

    update(deltaTime) {
        this.mixer.update( deltaTime );
    }


    showModel( visibility ) {

        this.model.visible = visibility;

    }


    showSkeleton( visibility ) {

        //this.skeleton.visible = visibility;

    }


    modifyTimeScale( speed ) {

        this.mixer.timeScale = speed;

    }

    activateAllActions() {

        this.setWeight( this.idleAction, this.settings[ 'modify idle weight' ] );
        this.setWeight( this.walkAction, this.settings[ 'modify walk weight' ] );
        this.setWeight( this.runAction, this.settings[ 'modify run weight' ] );

        this.actions.forEach( function ( action ) {
            action.play();
        } );
    }


    deactivateAllActions() {
        this.actions.forEach( function ( action ) {
            action.stop();
        } );
    }

    setWeight( action, weight ) {
        action.enabled = true;
        action.setEffectiveTimeScale( 1 );
        action.setEffectiveWeight( weight );
    }

    pauseAllActions() {

        this.actions.forEach( function ( action ) {

            action.paused = true;

        } );

    }

    unPauseAllActions() {
        this.actions.forEach( function ( action ) {
            action.paused = false;
        } );
    }

    pauseContinue() {

        if ( this.singleStepMode ) {

            this.singleStepMode = false;
            this.unPauseAllActions();

        } else {

            if ( this.idleAction.paused ) {

                this.unPauseAllActions();

            } else {

                this.pauseAllActions();

            }

        }
    }

    toSingleStepMode() {

        this.unPauseAllActions();

        this.singleStepMode = true;
        this.sizeOfNextStep = this.settings[ 'modify step size' ];

    }

    prepareCrossFade( startAction, endAction, defaultDuration ) {

        // Switch default / custom crossfade duration (according to the user's choice)

        const duration = this.setCrossFadeDuration( defaultDuration );

        // Make sure that we don't go on in singleStepMode, and that all actions are unpaused

        this.singleStepMode = false;
        this.unPauseAllActions();

        // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
        // else wait until the current action has finished its current loop

        if ( startAction === this.idleAction ) {

            this.executeCrossFade( startAction, endAction, duration );

        } else {

            this.synchronizeCrossFade( startAction, endAction, duration );

        }

    }

     setCrossFadeDuration( defaultDuration ) {

        // Switch default crossfade duration <-> custom crossfade duration

        if ( this.settings[ 'use default duration' ] ) {

            return defaultDuration;

        } else {

            return this.settings[ 'set custom duration' ];

        }

    }

    synchronizeCrossFade( startAction, endAction, duration ) {

        this.mixer.addEventListener( 'loop', onLoopFinished );

        function onLoopFinished( event ) {

            if ( event.action === startAction ) {

                this.mixer.removeEventListener( 'loop', onLoopFinished );

                this.executeCrossFade( startAction, endAction, duration );

            }

        }

    }

    executeCrossFade( startAction, endAction, duration ) {

        // Not only the start action, but also the end action must get a weight of 1 before fading
        // (concerning the start action this is already guaranteed in this place)

        this.setWeight( endAction, 1 );
        endAction.time = 0;

        // Crossfade with warping - you can also try without warping by setting the third parameter to false

        startAction.crossFadeTo( endAction, duration, true );

    }


    // Called by the render loop

    updateCrossFadeControls() {

        this.crossFadeControls.forEach( function ( control ) {
            control.setDisabled();
        } );

        if ( this.idleWeight === 1 && this.walkWeight === 0 && this.runWeight === 0 ) {

            this.crossFadeControls[ 1 ].setEnabled();

        }

        if ( this.idleWeight === 0 && this.walkWeight === 1 && this.runWeight === 0 ) {

            this.crossFadeControls[ 0 ].setEnabled();
            this.crossFadeControls[ 2 ].setEnabled();

        }

        if ( this.idleWeight === 0 && this.walkWeight === 0 && this.runWeight === 1 ) {

            this.crossFadeControls[ 3 ].setEnabled();

        }

    }

    createPanel(){
        const panel = new GUI( { width: 310 } );


        const folder1 = panel.addFolder( 'Visibility' );
        const folder2 = panel.addFolder( 'Activation/Deactivation' );
        const folder3 = panel.addFolder( 'Pausing/Stepping' );
        const folder4 = panel.addFolder( 'Crossfading' );
        const folder5 = panel.addFolder( 'Blend Weights' );
        const folder6 = panel.addFolder( 'General Speed' );

        this.settings = {
            'show model': true,
            'show skeleton': false,
            'deactivate all': this.deactivateAllActions,
            'activate all': this.activateAllActions,
            'pause/continue': this.pauseContinue,
            'make single step': this.toSingleStepMode,
            'modify step size': 0.05,
            'from walk to idle': function () {

                this.prepareCrossFade( this.walkAction, this.idleAction, 1.0 );

            },
            'from idle to walk': function () {

                this.prepareCrossFade( this.idleAction, this.walkAction, 0.5 );

            },
            'from walk to run': function () {

                this.prepareCrossFade( this.walkAction, this.runAction, 2.5 );

            },
            'from run to walk': function () {

                this.prepareCrossFade( this.runAction, this.walkAction, 5.0 );

            },
            'use default duration': true,
            'set custom duration': 3.5,
            'modify idle weight': 0.0,
            'modify walk weight': 1.0,
            'modify run weight': 0.0,
            'modify time scale': 1.0
        };

        folder1.add( this.settings, 'show model' ).onChange( this.showModel );
        folder1.add( this.settings, 'show skeleton' ).onChange( this.showSkeleton );
        folder2.add( this.settings, 'deactivate all' );
        folder2.add( this.settings, 'activate all' );
        folder3.add( this.settings, 'pause/continue' );
        folder3.add( this.settings, 'make single step' );
        folder3.add( this.settings, 'modify step size', 0.01, 0.1, 0.001 );

        this.crossFadeControls.push( folder4.add( this.settings, 'from walk to idle' ) );
        this.crossFadeControls.push( folder4.add( this.settings, 'from idle to walk' ) );
        this.crossFadeControls.push( folder4.add( this.settings, 'from walk to run' ) );
        this.crossFadeControls.push( folder4.add( this.settings, 'from run to walk' ) );

        folder4.add( this.settings, 'use default duration' );
        folder4.add( this.settings, 'set custom duration', 0, 10, 0.01 );

        folder5.add( this.settings, 'modify idle weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
            //this.setWeight( idleAction, weight );
        } );
        folder5.add( this.settings, 'modify walk weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
            //this.setWeight( walkAction, weight );
        } );
        folder5.add( this.settings, 'modify run weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {
            //this.setWeight( runAction, weight );
        } );
        folder6.add( this.settings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( this.modifyTimeScale );

        folder1.open();
        folder2.open();
        folder3.open();
        folder4.open();
        folder5.open();
        folder6.open();

        this.crossFadeControls.forEach( function ( control ) {

            control.classList1 = control.domElement.parentElement.parentElement.classList;
            control.classList2 = control.domElement.previousElementSibling.classList;

            control.setDisabled = function () {

                control.classList1.add( 'no-pointer-events' );
                control.classList2.add( 'control-disabled' );

            };

            control.setEnabled = function () {

                control.classList1.remove( 'no-pointer-events' );
                control.classList2.remove( 'control-disabled' );

            };

        } );

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
