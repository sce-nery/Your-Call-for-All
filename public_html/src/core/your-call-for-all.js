import {Environment} from "./environment.js";
import {Character} from "./character.js";
import {Assets} from "./assets.js";

class YourCallForAll {

    constructor(scene) {
        this.scene = scene;

        this.environment = new Environment(this, 2527); // environment includes: terrain, sky, and other game objects

        this.character = new Character(this.scene, Assets.glTF.Soldier);
    }

    update(deltaTime){
        this.environment.update(deltaTime, this.character.model.position);
        this.character.update(deltaTime);
    }
}


export {YourCallForAll}
