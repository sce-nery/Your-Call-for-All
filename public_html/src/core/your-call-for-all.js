import {Environment} from "./environment.js";
import {Character} from "./character/character.js";
import {Octree} from "../../vendor/three-js/examples/jsm/math/Octree.js";
import {GameUiController} from "./game-ui.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GameAudio} from "./audio.js";
import {TransformControls} from "../../vendor/three-js/examples/jsm/controls/TransformControls.js";

class YourCallForAll {

    constructor(scene, camera, renderer, hyperParameters) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.hyperParameters = hyperParameters;

        this.clock = new THREE.Clock(false);

        this.initializeEnvironment();
        this.initializeCharacter();
        this.initializeUiController();
        this.initializeAudio();

        this.initializeInspectionControls();
    }

    initializeAudio() {
        this.audio = new GameAudio(this.scene, this.camera, this.hyperParameters.ambientSound);
    }

    initializeUiController() {
        this.uiController = new GameUiController(this);
    }

    initializeEnvironment() {

        this.worldOctree = new Octree();

        this.environment = new Environment(this, 5408); // environment includes: terrain, sky, and other game objects
        this.environment.props.drawDistance = 75;
    }

    initializeCharacter() {
        this.character = new Character(this);
        let initialPosition = new THREE.Vector3(36, 3, -54);
        initialPosition.y = this.environment.terrain.getHeightAt(initialPosition);
        this.character.move(initialPosition);

        this.scene.add(this.character.model);

        const self = this;

        this.playerControl = {
            readyForDecisionPointAction: false,
            inspectionModeEnabled: false,

            onMouseDown: function (e) {
                switch (e.button) {
                    case 2:

                        let queryResult = self.environment.getNearestDecisionPoint(
                            self.character.model.position,
                            self.environment.props.drawDistance * 0.75
                        );




                        if (queryResult) {
                            let point = queryResult[0];
                            let distance = queryResult[1];

                            self.character.cameraController.currentlyFocusedDecisionPoint = point.decisionPoint;

                            console.debug(`Focus to: ${point.decisionPoint}`)
                            console.debug(`K-d Tree Balance: ${self.environment.decisionPointsKdTree.balanceFactor()}`);

                            if (distance <= point.decisionPoint.labelVisibilityMinDistance) {
                                self.uiController.showDecisionPointActionInfoContainer();
                                self.playerControl.readyForDecisionPointAction = true;
                            }
                        }

                        break;
                }
            },
            onMouseUp: function (e) {
                switch (e.button) {
                    case 2:
                        self.character.cameraController.currentlyFocusedDecisionPoint = null;
                        self.uiController.hideDecisionPointActionInfoContainer();
                        self.playerControl.readyForDecisionPointAction = false;
                        console.debug("Focus end");
                        self.uiController.posMessage.style.visibility =  "hidden";
                        break;
                }
            },
            onMouseClick: function (e) {
            },
            onKeyDown: function (e) {
                console.debug(`Keydown: ${e.code}`);
                self.character.controller.input.onKeyDown(e);
            },
            onKeyUp: function (e) {
                console.debug(`Keyup: ${e.code}`);
                self.character.controller.input.onKeyUp(e);

                if (self.playerControl.readyForDecisionPointAction) {
                    if (e.code === "KeyI") {

                        if (!self.playerControl.inspectionModeEnabled) {
                            console.debug("Enter inspection mode");
                            self.uiController.showInspectionModeCursor();
                            self.playerControl.inspectionModeEnabled = true;

                            self.inspectionControls.attach(self.character.cameraController.currentlyFocusedDecisionPoint.model);
                            self.scene.add(self.inspectionControls);
                        } else {
                            console.debug("Leave inspection mode");
                            self.uiController.hideInspectionModeCursor();
                            self.playerControl.inspectionModeEnabled = false;

                            self.inspectionControls.detach();
                            self.scene.remove(self.inspectionControls);
                        }


                    } else if (e.code === "KeyF") {

                        self.character.removeBadObjectFromTheEnvironment(self.character.cameraController.currentlyFocusedDecisionPoint);
                        self.character.cameraController.currentlyFocusedDecisionPoint = null;
                        self.uiController.hideDecisionPointActionInfoContainer();
                        self.playerControl.readyForDecisionPointAction = false;

                        $('.positive-info')
                            .transition('pulse')
                        ;

                        self.uiController.posMessage.style.visibility =  "visible";

                        console.warn("TODO: Show info about the environmental effects of the object");

                    }
                }
            },
        };
    }

    initializeInspectionControls() {
        this.inspectionControls =  new TransformControls( this.camera, this.renderer.domElement );


    }

    update(deltaTime) {
        this.environment.update(deltaTime, this.character.model.position);
        this.character.update(deltaTime, this);
        this.uiController.update(deltaTime);
    }

    // Must be called when the game starts.
    registerPlayerControlListeners() {
        document.addEventListener("mousedown", this.playerControl.onMouseDown);
        document.addEventListener("mouseup", this.playerControl.onMouseUp);
        document.addEventListener("click", this.playerControl.onMouseClick);
        document.addEventListener('keydown', this.playerControl.onKeyDown, false);
        document.addEventListener('keyup', this.playerControl.onKeyUp, false);

    }

    // Call when game is paused
    unregisterPlayerControlListeners() {
        document.removeEventListener("mousedown", this.playerControl.onMouseDown);
        document.removeEventListener("mouseup", this.playerControl.onMouseUp);
        document.removeEventListener("click", this.playerControl.onMouseClick);
        document.removeEventListener('keydown', this.playerControl.onKeyDown, false);
        document.removeEventListener('keyup', this.playerControl.onKeyUp, false);
        this.character.controller.input.resetKeys();
    }
}


export {YourCallForAll}
