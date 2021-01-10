import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GLTFLoader} from "../../vendor/three-js/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "../../vendor/three-js/examples/jsm/loaders/OBJLoader.js";

const loadingManager = new THREE.LoadingManager();

export const Assets = {
    URL: {
        glTF: {
            MoCapMan: "/Your-Call-for-All/public_html/assets/models/characters/mocapman_dummy/mocapman.glb",
            PinkTree: "/Your-Call-for-All/public_html/assets/models/trees/pink-tree/scene.gltf",
            WillowTree: "/Your-Call-for-All/public_html/assets/models/trees/willow-tree/scene.gltf",
            PalmTree: "/Your-Call-for-All/public_html/assets/models/trees/palm-tree/scene.gltf",
            RealTree: "/Your-Call-for-All/public_html/assets/models/trees/real-tree/scene.gltf",
        },
        OBJ: {

        },
        Texture: {
            Ground1_Color: '/Your-Call-for-All/public_html/assets/textures/ground/Ground1_512_Color.png',
            Ground1_Normal: '/Your-Call-for-All/public_html/assets/textures/ground/Ground1_512_Normal.png',
            WaterNormals: '/Your-Call-for-All/public_html/assets/textures/water/waternormals.jpg',
        }
    },

    glTF: {
        MoCapMan: null,
        PinkTree: null,
        WillowTree: null,
        PalmTree: null,
        RealTree: null,
    },

    OBJ: {

    },

    Texture: {
        Ground1_Color: null,
        Ground1_Normal: null,
        WaterNormals: null,
    },

    load: function (onLoad) {
        const gltfLoader = new GLTFLoader(loadingManager);
        const objLoader = new OBJLoader();
        const textureLoader = new THREE.TextureLoader(loadingManager);

        gltfLoader.setWithCredentials(true);
        objLoader.setWithCredentials(true);
        textureLoader.setWithCredentials(true);

        for (const key of Object.keys(this.URL.glTF)) {
            gltfLoader.load(this.URL.glTF[key], (gltf) => {
                this.glTF[key] = gltf;
            });
        }

        for (const key of Object.keys(this.URL.OBJ)) {
            objLoader.load(this.URL.OBJ[key], (obj) => {
                this.OBJ[key] = obj;
            });
        }

        for (const key of Object.keys(this.URL.Texture)) {
            textureLoader.load(this.URL.Texture[key], (texture) => {
                this.Texture[key] = texture;
            });
        }

        loadingManager.onLoad = onLoad;

        loadingManager.onError = function (e) {
            console.error(e);
            console.warn("Attempting to load assets by refreshing site in a second.");
            setTimeout(function () {
                location.reload();
            }, 1000);
        };
    }
};




