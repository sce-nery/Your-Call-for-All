import {Environment} from "./environment.js";
import {Character} from "./character/character.js";
import {Octree} from "../../vendor/three-js/examples/jsm/math/Octree.js";
import {GameUiController} from "./game-ui.js";

class YourCallForAll {

    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.initializeEnvironment();
        this.initializeCharacter();
        this.initializeUiController();

    }

    initializeUiController() {
        this.uiController = new GameUiController(this);
    }

    initializeEnvironment() {

        this.worldOctree = new Octree();

        this.environment = new Environment(this, 2527); // environment includes: terrain, sky, and other game objects
        this.environment.props.drawDistance = 75;
    }

    initializeCharacter() {
        this.character = new Character(this);
        this.character.model.position.set(-26, 0, -4);
        this.character.collider.translate(this.character.model.position);

        this.scene.add(this.character.model);

        const self = this;

        this.playerControl = {
            onMouseDown: function (e) {
                switch (e.button) {
                    case 2:

                        let queryResult = self.environment.getNearestDecisionPoint(self.character.model.position, 100);

                        if (queryResult) {
                            let point = queryResult[0];
                            let distance = queryResult[1];

                            self.character.cameraController.focusPoint = point;

                            console.debug(`Focus to: ${point}`)
                            console.debug(`K-d Tree Balance: ${self.environment.decisionPointsKdTree.balanceFactor()}`);

                            if (distance <= point.decisionPoint.labelVisibilityMinDistance) {
                                self.uiController.showDecisionPointActionInfoContainer();
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
                        console.debug("Focus end")
                        break;
                }
            },
            onMouseClick: function (e) {
            },
            onKeyDown: function (e) {
                self.character.controller.input.onKeyDown(e);
            },
            onKeyUp: function (e) {
                self.character.controller.input.onKeyUp(e);
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
