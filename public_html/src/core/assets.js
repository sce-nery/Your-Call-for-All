import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GLTFLoader} from "../../vendor/three-js/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "../../vendor/three-js/examples/jsm/loaders/OBJLoader.js";
import {SkeletonUtils} from "../../vendor/three-js/examples/jsm/utils/SkeletonUtils.js";

const loadingManager = new THREE.LoadingManager();

export const Assets = {

    URL: {
        glTF: {
            MoCapMan: "/Your-Call-for-All/public_html/assets/models/characters/mocapman_dummy/mocapman.glb",
            PinkTree: "/Your-Call-for-All/public_html/assets/models/trees/pink-tree/scene.gltf",
            WillowTree: "/Your-Call-for-All/public_html/assets/models/trees/willow-tree/scene.gltf",
            PalmTree: "/Your-Call-for-All/public_html/assets/models/trees/palm-tree/scene.gltf",
            RealTree: "/Your-Call-for-All/public_html/assets/models/trees/real-tree/scene.gltf",
            BrokenBottle: "/Your-Call-for-All/public_html/assets/models/objects/broken-bottle/scene.gltf",
        },
        OBJ: {},
        Texture: {
            Grass_Color: '/Your-Call-for-All/public_html/assets/textures/ground/Grass_Color.png',
            Grass_Normal: '/Your-Call-for-All/public_html/assets/textures/ground/Grass_Normal.png',
            ShallowGrass_Color: '/Your-Call-for-All/public_html/assets/textures/ground/ShallowGrass_Color.jpg',
            ShallowGrass_Normal: '/Your-Call-for-All/public_html/assets/textures/ground/ShallowGrass_Normal.jpg',
            Sand_Color: '/Your-Call-for-All/public_html/assets/textures/ground/Sand_1K_Color.jpg',
            Snow_Color: '/Your-Call-for-All/public_html/assets/textures/ground/Snow_1K_Color.jpg',
            Rocks_Color: '/Your-Call-for-All/public_html/assets/textures/ground/Rocks_1K_Color.jpg',
            Water_Normal: '/Your-Call-for-All/public_html/assets/textures/water/waternormals.jpg',
        }
    },

    glTF: {
        MoCapMan: null,
        PinkTree: null,
        WillowTree: null,
        PalmTree: null,
        RealTree: null,
        BrokenBottle: null,
    },

    OBJ: {},

    Texture: {
        ShallowGrass_Color: null,
        ShallowGrass_Normal: null,
        Sand_Color: null,
        Grass_Color: null,
        Grass_Normal: null,
        Snow_Color: null,
        Rocks_Color: null,
        Water_Normal: null,
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

        // Comment this if error is unrelated to asset loading,
        // and check preserve logs checkbox in browser console
        // loadingManager.onError = function (e) {
        //     console.error(e);
        //     console.warn("Attempting to load assets by refreshing site in 2 secs.");
        //     setTimeout(function () {
        //         location.reload();
        //     }, 2000);
        // };
    },

    cloneGLTF: function (gltf) {
        const clonedScene = SkeletonUtils.clone(gltf.scene);
        const root = new THREE.Object3D();
        root.add(clonedScene);
        return root;
    }
};




