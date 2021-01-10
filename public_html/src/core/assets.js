import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GLTFLoader} from "../../vendor/three-js/examples/jsm/loaders/GLTFLoader.js";

const loadingManager = new THREE.LoadingManager();

export const Assets = {
    glTF: {
        MoCapMan: {url: "/Your-Call-for-All/public_html/assets/models/characters/mocapman_dummy/mocapman.glb"},
        PinkTree: {url: "/Your-Call-for-All/public_html/assets/models/trees/pink-tree/scene.gltf"},
        WillowTree: {url: "/Your-Call-for-All/public_html/assets/models/trees/willow-tree/scene.gltf"},
        PalmTree: {url: "/Your-Call-for-All/public_html/assets/models/trees/palm-tree/scene.gltf"},
        RealTree: {url: "/Your-Call-for-All/public_html/assets/models/trees/real-tree/scene.gltf"},
    },

    Texture: {
        Ground1_Color: {url: '/Your-Call-for-All/public_html/assets/textures/ground/Ground1_512_Color.png'},
        Ground1_Normal: {url: '/Your-Call-for-All/public_html/assets/textures/ground/Ground1_512_Normal.png'},
        WaterNormals: {url: '/Your-Call-for-All/public_html/assets/textures/water/waternormals.jpg'},
    },

    load: function (onLoad) {
        const gltfLoader = new GLTFLoader(loadingManager);
        const textureLoader = new THREE.TextureLoader(loadingManager);

        gltfLoader.setWithCredentials(true);
        textureLoader.setWithCredentials(true);

        for (const key of Object.keys(this.glTF)) {
            gltfLoader.load(this.glTF[key].url, (gltf) => {
                this.glTF[key] = gltf;
            });
        }

        for (const key of Object.keys(this.Texture)) {
            textureLoader.load(this.Texture[key].url, (texture) => {
                this.Texture[key] = texture;
            });
        }

        loadingManager.onLoad = onLoad;
    }
};




