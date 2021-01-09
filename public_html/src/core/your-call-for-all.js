import {Environment} from "./environment.js";
import {Character} from "./character.js";
import {AssetMap} from "./assets.js";

class YourCallForAll {

    constructor(scene) {
        this.scene = scene;

        this.environment = new Environment(this.scene, 2527); // environment includes: terrain, sky, and other game objects

        this.character = new Character(this.scene, AssetMap["Soldier"]);
    }

    update(deltaTime){
        this.environment.update(deltaTime);
    }
}


export {YourCallForAll}
