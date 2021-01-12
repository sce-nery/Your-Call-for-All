import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GLTFLoader} from "../../vendor/three-js/examples/jsm/loaders/GLTFLoader.js";
import {SkeletonUtils} from "../../vendor/three-js/examples/jsm/utils/SkeletonUtils.js";
import {GameObject} from "./objects.js";
import {Assets} from "./assets.js";

class StaticObject extends GameObject{
    constructor(gltf) {
        super();
        const clonedScene = SkeletonUtils.clone(gltf.scene);
        const root = new THREE.Object3D();
        root.add(clonedScene);
        this.model = Assets.cloneGLTF(gltf);;
        this.healthFactor =0.0;
        this.setupShadows();

    }


    setupShadows() {
        Logger.debug("Setting up shadows for this Bushes model.")
        this.model.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }


}

export {StaticObject};
