import {Environment} from "./environment.js";
import {Character} from "./character/character.js";
import {Octree} from "../../vendor/three-js/examples/jsm/math/Octree.js";

class YourCallForAll {

    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.initializeEnvironment();
        this.initializeCharacter();

        // Call when the game starts
        this.registerPlayerControlListeners();
    }

    initializeEnvironment() {

        this.worldOctree = new Octree();

        this.environment = new Environment(this, 2527); // environment includes: terrain, sky, and other game objects
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

                        let nearestDecisionPoint = self.environment.getNearestDecisionPoint(self.character.model.position, 100);

                        self.character.cameraController.focusPoint = nearestDecisionPoint;

                        console.debug(`Focus to: ${nearestDecisionPoint}`)
                        console.debug(`K-d Tree Balance: ${self.environment.decisionPointsKdTree.balanceFactor()}`);


                        break;
                }
            },
            onMouseUp: function (e) {
                switch (e.button) {
                    case 2:
                        self.character.cameraController.focusPoint = null;
                        console.debug("Focus end")
                        break;
                }
            },
            onMouseClick: function (e) {
                self.character.cameraController.enterPointerLock();
            }
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
    }

    // Call when game is paused
    unregisterPlayerControlListeners() {
        document.removeEventListener("mousedown", this.playerControl.onMouseDown);
        document.removeEventListener("mouseup", this.playerControl.onMouseUp);
        document.removeEventListener("click", this.playerControl.onMouseClick);
    }
}


export {YourCallForAll}
