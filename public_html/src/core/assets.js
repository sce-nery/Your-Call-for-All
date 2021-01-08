import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GLTFLoader} from "../../vendor/three-js/examples/jsm/loaders/GLTFLoader.js";

export const AssetMap = {};

const gltfLoader = new GLTFLoader();

export async function load() {
    AssetMap["Ground1_Color"] = new THREE.TextureLoader().load('/Your-Call-for-All/public_html/assets/textures/ground/Ground1_1K_Color.jpg');
    AssetMap["Ground1_Normal"] = new THREE.TextureLoader().load('/Your-Call-for-All/public_html/assets/textures/ground/Ground1_1K_Normal.jpg');

    AssetMap["WaterNormals"] = new THREE.TextureLoader().load('/Your-Call-for-All/public_html/assets/textures/water/waternormals.jpg');
    AssetMap["WaterNormals"].wrapS = AssetMap["WaterNormals"].wrapT = THREE.RepeatWrapping;

    AssetMap["MoCapManGLTFModel"] = await asyncLoadGLTF("/Your-Call-for-All/public_html/assets/models/characters/mocapman_dummy/mocapman.glb");


    AssetMap["TreeGLTFModel"] = await asyncLoadGLTF("/Your-Call-for-All/public_html/assets/models/trees/gltf_files/pink-tree/scene.gltf");
    AssetMap["TreeGLTFModel3"] = await asyncLoadGLTF("/Your-Call-for-All/public_html/assets/models/trees/gltf_files/willow-tree/scene.gltf");
    AssetMap["TreeGLTFModel4"] = await asyncLoadGLTF("/Your-Call-for-All/public_html/assets/models/trees/gltf_files/palm-tree/scene.gltf");
    AssetMap["TreeGLTFModel5"] = await asyncLoadGLTF("/Your-Call-for-All/public_html/assets/models/trees/gltf_files/real-tree/scene.gltf");
}

function asyncLoadGLTF(url) {
    return new Promise((resolve, reject) => {
        gltfLoader.load(url, data => resolve(data), null, reject);
    });
}
