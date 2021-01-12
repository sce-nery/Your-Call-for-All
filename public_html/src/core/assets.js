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
            WillowTree:   "/Your-Call-for-All/public_html/assets/models/trees/willow-tree/scene.gltf",
            PalmTree:   "/Your-Call-for-All/public_html/assets/models/trees/palm-tree/scene.gltf",
            LowPolyTree:   "/Your-Call-for-All/public_html/assets/models/trees/low-poly-tree/scene.gltf",
            SimpleTree:   "/Your-Call-for-All/public_html/assets/models/trees/simple-tree/scene.gltf",
            PineTree:   "/Your-Call-for-All/public_html/assets/models/trees/pine-tree/scene.gltf",
            DriedPine:   "/Your-Call-for-All/public_html/assets/models/trees/dried-pine/scene.gltf",
            DeadTree:   "/Your-Call-for-All/public_html/assets/models/trees/dead-tree/scene.gltf",
            TwoTrees:   "/Your-Call-for-All/public_html/assets/models/trees/two-trees/scene.gltf",
            Butterfly:   "/Your-Call-for-All/public_html/assets/models/trees/butterfly/scene.gltf",
            FrogOnLeaf:   "/Your-Call-for-All/public_html/assets/models/trees/frog-on-leaf/scene.gltf",
            Shark:   "/Your-Call-for-All/public_html/assets/models/trees/shark/scene.gltf",
            YardGrass:   "/Your-Call-for-All/public_html/assets/models/grass-bush/yard-grass/scene.gltf",
            PlantShrub:   "/Your-Call-for-All/public_html/assets/models/grass-bush/plant-shrub/scene.gltf",
            Grass:   "/Your-Call-for-All/public_html/assets/models/grass-bush/grass/scene.gltf",
            LowPolyGrass:   "/Your-Call-for-All/public_html/assets/models/grass-bush/low-poly-grass/scene.gltf",
            Lavender:   "/Your-Call-for-All/public_html/assets/models/grass-bush/lavender/scene.gltf",
            WoodenBlock:   "/Your-Call-for-All/public_html/assets/models/grass-bush/wooden-block/scene.gltf",
            TropicalPlant:   "/Your-Call-for-All/public_html/assets/models/grass-bush/tropical-plant/scene.gltf",
            Rock:   "/Your-Call-for-All/public_html/assets/models/grass-bush/rock/scene.gltf",
            BrokenBottle: "/Your-Call-for-All/public_html/assets/models/objects/broken-bottle/scene.gltf",

            //LowPolyTree: "/Your-Call-for-All/public_html/assets/models/trees/low_poly_tree_wind/scene.gltf",
        },
        OBJ: {},
        Texture: {
            Ground1_Color: '/Your-Call-for-All/public_html/assets/textures/ground/Ground1_512_Color.png',
            Ground1_Normal: '/Your-Call-for-All/public_html/assets/textures/ground/Ground1_512_Normal.png',
            WaterNormals: '/Your-Call-for-All/public_html/assets/textures/water/waternormals.jpg',
        }
    },

    glTF: {
        MoCapMan:   null,
        PinkTree:   null,
        WillowTree:   null,
        PalmTree:   null,
        LowPolyTree:  null,
        PineTree:   null,
        DriedPine:null,
        TwoTrees:  null,
        Butterfly: null,
        FrogOnLeaf: null,
        Shark:  null,
        YardGrass:   null,
        PlantShrub:  null,
        Grass:   null,
        LowPolyGrass: null,
        Lavender:  null,
        WoodenBlock:  null,
        TropicalPlant:  null,
        Rock:  null,
        BrokenBottle: null,
        DeadTree: null,
        //LowPolyTree: null,
    },


 OBJ: {},
    Texture: {
        Ground1_Color: null,
        Ground1_Normal: null,
        WaterNormals: null,
    },

    load: function (onLoad) {
        const gltfLoader = new GLTFLoader(loadingManager);
        const objLoader = new OBJLoader(loadingManager);
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


        const progressbarElem = document.querySelector('#progressbar');
        loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
            progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
        }


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




