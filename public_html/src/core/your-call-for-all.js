import {Environment} from "./environment.js";
import {Character} from "./character.js";
import {Assets} from "./assets.js";

import * as THREE from "../../vendor/three-js/build/three.module.js";

class YourCallForAll {

    constructor(scene) {
        this.scene = scene;

        this.environment = new Environment(this, 2527); // environment includes: terrain, sky, and other game objects

        //this.character = new Character(this.scene, Assets.glTF.Soldier);
    }




    update(deltaTime){
        this.environment.update(deltaTime, new THREE.Vector3());
        //this.character.update(deltaTime);
    }
}


export {YourCallForAll}
