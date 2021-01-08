import {Environment} from "./environment.js";
import {MersenneTwisterPRNG} from "../math/random.js";


class YourCallForAll {

    constructor(scene) {
        this.scene = scene;

        this.environment = new Environment(this.scene, 2527); // environment includes: terrain, sky, and other game objects

        //this.character = new Character();
    }

    update(deltaTime){
        this.environment.update(deltaTime);
    }
}


export {YourCallForAll}
