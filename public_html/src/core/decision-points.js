import {Assets} from "./assets.js";
import {CSS2DObject} from "../../vendor/three-js/examples/jsm/renderers/CSS2DRenderer.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GameObject} from "./objects.js";

class DecisionPoint extends GameObject {

    constructor(name) {
        super();
        this.name = name;

        this.badInfluence = 0.0;

        this.setupLabel(name);
    }

    setupLabel() {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'ui pointing below yellow label';

        const text = document.createTextNode(this.name);

        const iconDiv = document.createElement("i");
        iconDiv.className = "exclamation icon";

        labelDiv.appendChild(iconDiv);
        labelDiv.appendChild(text);

        labelDiv.style.opacity = "0.75";

        this.label = new CSS2DObject(labelDiv);

        this.labelVisibilityMinDistance = 20;
    }

    update(deltaTime, playerPosition) {
        this.label.visible = this.model.position.distanceTo(playerPosition) <= this.labelVisibilityMinDistance;
    }
}

class BrokenBottle extends DecisionPoint {
    constructor() {
        super("Broken Bottle");
        let gltf = Assets.cloneGLTF(Assets.glTF.BrokenBottle);
        gltf.scale.set(0.01, 0.01, 0.01);

        this.model = new THREE.Object3D();
        this.model.add(gltf);

        this.label.position.set(0, 0.75, 0);
        this.model.add(this.label);

        this.badInfluence = 0.1;
    }


    update(deltaTime, playerPosition) {
        super.update(deltaTime, playerPosition);
    }


}


export {DecisionPoint};
export {BrokenBottle};
