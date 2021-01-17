import {Environment} from "./environment.js";
import {Character} from "./character/character.js";
import {Octree} from "../../vendor/three-js/examples/jsm/math/Octree.js";
import {GameUiController} from "./game-ui.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";

class YourCallForAll {

    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.clock = new THREE.Clock(false);

        this.initializeEnvironment();
        this.initializeCharacter();
        this.initializeUiController();
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
         let initialPosition = new THREE.Vector3(36,3,-54);
        initialPosition.y = this.environment.terrain.heightMap.probe(initialPosition.x, initialPosition.z);
        this.character.move(initialPosition);

        this.scene.add(this.character.model);

        const self = this;

        this.playerControl = {
            readyForDecisionPointAction: false,
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

                            self.character.cameraController.focusPoint = point;

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
                        self.character.cameraController.focusPoint = null;
                        self.uiController.hideDecisionPointActionInfoContainer();
                        self.playerControl.readyForDecisionPointAction = false;
                        console.debug("Focus end")
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
                        console.debug("Enter inspection mode")
                    } else if (e.code === "KeyF") {
                        console.debug("Put it into pocket")
                    }
                }
            },
        };
    }

    update(deltaTime) {
        this.environment.update(deltaTime, this.character.model.position);
        this.character.update(deltaTime, this);
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
