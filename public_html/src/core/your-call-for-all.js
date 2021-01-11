import {Environment} from "./environment.js";
import {Character} from "./character/character.js";

import * as THREE from "../../vendor/three-js/build/three.module.js";

class YourCallForAll {

    constructor(scene, camera, renderer) {
        this.scene = scene;

        this.environment = new Environment(this, 2527); // environment includes: terrain, sky, and other game objects
        this.character = new Character(scene, camera, renderer);
    }


    update(deltaTime){
        this.environment.update(deltaTime,new THREE.Vector3(0));
        this.character.update(deltaTime);
    }
}


export {YourCallForAll}
