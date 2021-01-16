import {Assets} from "./assets.js";
import {CSS2DObject} from "../../vendor/three-js/examples/jsm/renderers/CSS2DRenderer.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GameObject} from "./objects.js";

class DecisionPoint extends GameObject {

    constructor() {
        super();
    }

    update(deltaTime, playerPosition) {
    }
}

class BrokenBottle extends DecisionPoint {
    constructor() {
        super();
        let gltf = Assets.cloneGLTF(Assets.glTF.BrokenBottle);
        gltf.scale.set(0.01, 0.01, 0.01);

        this.model = new THREE.Object3D();
        this.model.add(gltf);

        this.setupLabel();
    }

    setupLabel() {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'ui pointing below yellow label';

        const text = document.createTextNode("Broken Bottle");

        const iconDiv = document.createElement("i");
        iconDiv.className = "exclamation icon";

        labelDiv.appendChild(iconDiv);
        labelDiv.appendChild(text);

        labelDiv.style.opacity = "0.75";


        this.label = new CSS2DObject(labelDiv);
        this.label.position.set(0, 0.75, 0);
        this.model.add(this.label);
    }

    update(deltaTime, playerPosition) {
        this.label.visible = this.model.position.distanceTo(playerPosition) <= 20;
    }


}


export {DecisionPoint};
export {BrokenBottle};
