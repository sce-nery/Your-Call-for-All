import {Environment} from "./environment.js";
import {MersenneTwisterPRNG} from "../math/random.js";



class YourCallForAll {

    constructor(scene) {
        this.prng = new MersenneTwisterPRNG(111); // prng: pseudo-random number generator
        this.environment =  new Environment(scene, this.prng);
        //this.character = new Character();

    }

    update(deltaTime){

    }
}


export {YourCallForAll}