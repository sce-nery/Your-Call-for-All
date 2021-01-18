import {Assets} from "./assets.js";
import {CSS2DObject} from "../../vendor/three-js/examples/jsm/renderers/CSS2DRenderer.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GameObject} from "./objects.js";

class DecisionPoint extends GameObject {

    constructor(name) {
        super();
        this.name = name;

        this.healthInfluence = 0.0;

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
    static prevalence = 0.1;

    constructor() {
        super("Broken Bottle");
        let gltf = Assets.cloneGLTF(Assets.glTF.BrokenBottle);
        gltf.scale.set(0.01, 0.01, 0.01);

        this.model = new THREE.Object3D();
        this.model.add(gltf);

        this.label.position.set(0, 0.75, 0);
        this.model.add(this.label);

        this.healthInfluence = -0.02;
    }


    update(deltaTime, playerPosition) {
        super.update(deltaTime, playerPosition);
    }

    static scatter(environment, candidatePosition) {

        if (candidatePosition.y > 1 && candidatePosition.y < 10) {

            const percent = environment.prng.random() * 100;

            if (percent < BrokenBottle.prevalence) {
                let brokenBottle = new BrokenBottle();

                brokenBottle.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                environment.objects.push(brokenBottle);
                environment.insertDecisionPointToKdTree(brokenBottle);
            }

        }
    }

}


class BiomedicalWaste extends DecisionPoint {
    static prevalence = 0.01;

    constructor() {
        super("Biomedical Waste");
        let gltf = Assets.cloneGLTF(Assets.glTF.BiomedicalWaste);
        gltf.scale.set(0.3, 0.3, 0.3);

        this.model = new THREE.Object3D();
        this.model.add(gltf);

        this.label.position.set(0, 1.5, 0);
        this.model.add(this.label);

        this.healthInfluence = -0.2;
    }


    update(deltaTime, playerPosition) {
        super.update(deltaTime, playerPosition);
    }

    static scatter(environment, candidatePosition) {

        if (candidatePosition.y > 1) {

            const percent = environment.prng.random() * 100;

            if (percent < BiomedicalWaste.prevalence) {
                let biomedicalWaste = new BiomedicalWaste();

                biomedicalWaste.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                environment.objects.push(biomedicalWaste);
                environment.insertDecisionPointToKdTree(biomedicalWaste);
            }

        }
    }

}


export {DecisionPoint};
export {BrokenBottle};
export {BiomedicalWaste};
