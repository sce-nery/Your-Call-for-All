import {Environment} from "./environment.js";
import {MersenneTwisterPRNG} from "../math/random.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";
import * as ASSETS from "./assets.js";



class YourCallForAll {

    constructor(scene) {
        this.scene = scene;

        this.prng = new MersenneTwisterPRNG(111); // prng: pseudo-random number generator

        this.environment = new Environment(this.scene, this.prng); // environment includes: terrain, sky, and other game objects

        //this.character = new Character();
    }

    update(deltaTime){
        this.environment.update(deltaTime);
    }
}


export {YourCallForAll}
