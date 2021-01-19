import {Environment} from "./environment.js";
import {Character} from "./character/character.js";
import {Octree} from "../../vendor/three-js/examples/jsm/math/Octree.js";
import {GameUiController} from "./game-ui.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GameAudio} from "./audio.js";
import {TransformControls} from "../../vendor/three-js/examples/jsm/controls/TransformControls.js";

class YourCallForAll {

    constructor(scene, camera, renderer, labelRenderer, bloomPass) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.labelRenderer = renderer;
        this.bloomPass = bloomPass;

        this.clock = new THREE.Clock(false);

        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);

        this.initializeSettings();

        this.initializeEnvironment();
        this.initializeCharacter();
        this.initializeUiController();
        this.initializeAudio();

        this.initializeInspectionControls();
    }

    initializeSettings() {
        this.settings = {
            shading: "smooth",
            drawDistance: 100,
            environmentMappingEnabled: false,
            enableBloom: () => {
                this.bloomPass.enabled = true;
            },
            disableBloom: () => {
                this.bloomPass.enabled = false;
            }
        }
    }

    updateShading() {
        let shading = this.settings.shading;
        for (let i = 0; i < this.scene.children.length; i++) {
            this.scene.children[i].traverse(function (child) {
                if (child.isMesh) {
                    child.material.flatShading = shading === "flat";
                    child.material.needsUpdate = true;
                }
            });
        }
    }

    initializeAudio() {
        this.audio = new GameAudio(this.scene, this.camera, "./assets/sounds/fairy-ring.mp3");
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

                            const decisionPoint = point.decisionPoint;

                            self.character.cameraController.currentlyFocusedDecisionPoint = decisionPoint;

                            console.debug(`Focus to: ${point}`)
                            console.debug(`K-d Tree Balance: ${self.environment.decisionPointsKdTree.balanceFactor()}`);

                            if (distance <= point.decisionPoint.labelVisibilityMinDistance) {
                                self.uiController.showDecisionPointActionInfoContainer(decisionPoint.actionText);
                                self.playerControl.readyForDecisionPointAction = true;
                            }
                        }

                        break;
                }
            },
            onMouseUp: function (e) {
                switch (e.button) {
                    case 2:
                        if (!self.playerControl.inspectionModeEnabled) {
                            self.character.cameraController.currentlyFocusedDecisionPoint = null;
                            self.uiController.hideDecisionPointActionInfoContainer();
                            self.playerControl.readyForDecisionPointAction = false;
                            console.debug("Focus end")
                        }
                        break;
                }
            },
            onMouseClick: function (e) {
            },
            onKeyDown: function (e) {
                console.debug(`Keydown: ${e.code}`);
                self.character.controller.input.onKeyDown(e);

                if (self.playerControl.inspectionModeEnabled) {
                    if (e.code === "KeyR") {

                        self.transformControls.setMode("rotate");

                    } else if (e.code === "KeyT") {

                        self.transformControls.setMode("translate");

                    } else if (e.code === "KeyY") {
                        self.transformControls.setMode("scale");

                    }
                }
            },
            onKeyUp: function (e) {
                console.debug(`Keyup: ${e.code}`);
                self.character.controller.input.onKeyUp(e);

                if (self.playerControl.readyForDecisionPointAction) {
                    if (e.code === "KeyI") {

                        if (!self.playerControl.inspectionModeEnabled) {
                            console.debug("Enter inspection mode");

                            self.playerControl.inspectionModeEnabled = true;

                            self.uiController.hideDecisionPointActionInfoContainer();
                            self.uiController.enterInspectionModeUI();

                            document.exitPointerLock();

                            self.transformControls.attach(self.character.cameraController.currentlyFocusedDecisionPoint.model);
                            self.scene.add(self.transformControls);
                        } else {
                            console.debug("Leave inspection mode");

                            self.playerControl.inspectionModeEnabled = false;

                            self.uiController.exitInspectionModeUI();

                            self.transformControls.detach();
                            self.scene.remove(self.transformControls);

                            self.character.cameraController.enterPointerLock();

                            self.character.cameraController.currentlyFocusedDecisionPoint = null;
                            self.uiController.hideDecisionPointActionInfoContainer();
                            self.playerControl.readyForDecisionPointAction = false;
                            console.debug("Focus end")

                        }


                    } else if (e.code === "KeyF") {

                        let infoText = self.character.cameraController.currentlyFocusedDecisionPoint.infoText;
                        self.character.removeBadObjectFromTheEnvironment(self.character.cameraController.currentlyFocusedDecisionPoint);
                        self.character.cameraController.currentlyFocusedDecisionPoint = null;
                        self.uiController.hideDecisionPointActionInfoContainer();
                        self.playerControl.readyForDecisionPointAction = false;
                        self.uiController.showAndDestroyPositiveInfo(infoText);

                    }
                }

                if (e.code === "KeyP") {
                    self.character.flashlight.enabled = !self.character.flashlight.enabled;
                }

            },
        };
    }

    initializeInspectionControls() {
        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);

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
