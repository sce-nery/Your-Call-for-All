import {Environment} from "./environment.js";
import {MersenneTwisterPRNG} from "../math/random.js";



class YourCallForAll {

    constructor(scene) {
        this.prng = new MersenneTwisterPRNG(111); // prng: pseudo-random number generator
        this.environment =  new Environment(scene, this.prng); // environment includes: terrain, sky, and other game objects
        //this.character = new Character();

    }

    update(deltaTime){
        this.environment.update(deltaTime);
    }
}


export {YourCallForAll}