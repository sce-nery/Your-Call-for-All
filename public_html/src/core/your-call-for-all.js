import {Environment} from "./environment.js";
import {Character} from "./character/character.js";
import {Octree} from "../../vendor/three-js/examples/jsm/math/Octree.js";

class YourCallForAll {

    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.worldOctree = new Octree();

        this.environment = new Environment(this, 2527); // environment includes: terrain, sky, and other game objects
        this.character = new Character(this);

        this.character.model.position.set(-26, 0, -4);
        this.character.collider.translate(this.character.model.position);

        this.scene.add(this.character.model);
    }


    update(deltaTime) {
        this.environment.update(deltaTime, this.character.model.position);
        this.character.update(deltaTime, this);
    }
}


export {YourCallForAll}
