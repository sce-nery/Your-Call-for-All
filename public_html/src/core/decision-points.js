import {Assets} from "./assets.js";

class DecisionPoint {

    constructor() {
    }
}

class BrokenBottle extends DecisionPoint {
    constructor() {
        super();
        this.model = Assets.cloneGLTF(Assets.glTF.BrokenBottle);
        this.model.scale.set(0.01,0.01,0.01)
    }


}


export {DecisionPoint};
export {BrokenBottle};
