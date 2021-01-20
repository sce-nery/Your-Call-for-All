import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GLTFLoader} from "../../vendor/three-js/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "../../vendor/three-js/examples/jsm/loaders/OBJLoader.js";
import {SkeletonUtils} from "../../vendor/three-js/examples/jsm/utils/SkeletonUtils.js";

const loadingManager = new THREE.LoadingManager();

const root = "/Your-Call-for-All/public_html";

export const Assets = {
    URL: {
        glTF: {
            Jackie: `${root}/assets/models/characters/jackie/jackie.glb`,
            PinkTree: `${root}/assets/models/objects/trees/pink-tree/scene.gltf`,
            LowPolyTree: `${root}/assets/models/objects/trees/low-poly-tree/scene.gltf`,
            SimpleTree: `${root}/assets/models/objects/trees/simple-tree/scene.gltf`,
            PineTree: `${root}/assets/models/objects/trees/pine-tree/scene.gltf`,
            DriedPine: `${root}/assets/models/objects/trees/dried-pine/scene.gltf`,
            DeadTree: `${root}/assets/models/objects/trees/dead-tree/scene.gltf`,
            Butterfly: `${root}/assets/models/objects/trees/butterfly/scene.gltf`,
            FrogOnLeaf: `${root}/assets/models/objects/trees/frog-on-leaf/frog.glb`,
            Shark: `${root}/assets/models/objects/trees/shark/scene.gltf`,
            LowPolyGrass: `${root}/assets/models/objects/foliage/low-poly-grass/scene.gltf`,
            BrokenBottle: `${root}/assets/models/objects/decision-points/broken-bottle/scene.gltf`,
            BiomedicalWaste: `${root}/assets/models/objects/decision-points/biomedical-waste/scene.gltf`,
            RadioactiveMetalBarrel: `${root}/assets/models/objects/decision-points/radioactive-metal-barrel/radioactive-metal-barrel.glb`,
            PlasticBag: `${root}/assets/models/objects/decision-points/plastic-bag/scene.gltf`,
            Flashlight: `${root}/assets/models/objects/flashlight/scene.gltf`
        },
        OBJ: {},
        Texture: {
            Grass_Color: `${root}/assets/textures/ground/Grass_Color.png`,
            Grass_Normal: `${root}/assets/textures/ground/Grass_Normal.png`,
            ShallowGrass_Color: `${root}/assets/textures/ground/ShallowGrass_Color.jpg`,
            ShallowGrass_Normal: `${root}/assets/textures/ground/ShallowGrass_Normal.jpg`,
            Sand_Color: `${root}/assets/textures/ground/Sand_Color.jpg`,
            Snow_Color: `${root}/assets/textures/ground/Snow_Color.jpg`,
            Rocks_Color: `${root}/assets/textures/ground/Rocks_Color.jpg`,
            Water_Normal: `${root}/assets/textures/water/Water_Normal.jpg`,
        }
    },

    glTF: {
        LowPolyTree: null,
        PineTree: null,
        DriedPine: null,
        TwoTrees: null,
        Butterfly: null,
        FrogOnLeaf: null,
        Shark: null,
        YardGrass: null,
        PlantShrub: null,
        Grass: null,
        LowPolyGrass: null,
        Lavender: null,
        WoodenBlock: null,
        TropicalPlant: null,
        Rock: null,
        BrokenBottle: null,
        BiomedicalWaste: null,
        RadioactiveMetalBarrel: null,
        PlasticBag: null,
        DeadTree: null,
        PinkTree: null,
        WillowTree: null,
        PalmTree: null,
        RealTree: null,
        Jackie: null,
        FlashLight: null,
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
        const objLoader = new OBJLoader(loadingManager);
        const textureLoader = new THREE.TextureLoader(loadingManager);

        gltfLoader.setWithCredentials(true);
        objLoader.setWithCredentials(true);
        textureLoader.setWithCredentials(true);

        for (const key of Object.keys(this.URL.glTF)) {
            gltfLoader.load(this.URL.glTF[key], (gltf) => {
                this.glTF[key] = gltf;
            }, null, function (e) {
                console.error(`Failed to load: ${key}`);
                console.error(e);
            });
        }

        for (const key of Object.keys(this.URL.OBJ)) {
            objLoader.load(this.URL.OBJ[key], (obj) => {
                this.OBJ[key] = obj;
            }, null, function (e) {
                console.error(`Failed to load: ${key}`);
                console.error(e);
            });
        }

        for (const key of Object.keys(this.URL.Texture)) {
            textureLoader.load(this.URL.Texture[key], (texture) => {
                this.Texture[key] = texture;
            }, null, function (e) {
                console.error(`Failed to load: ${key}`);
                console.error(e);
            });
        }


        loadingManager.onLoad = onLoad;
        loadingManager.onError = function (url) {

            console.error('There was an error loading ' + url);

        };
        loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
            $('#progress-bar')
                .progress({
                    percent: ((itemsLoaded) / itemsTotal) * 100,
                    text: {
                        active: 'If you see butterflies you are on the right way.',
                        success: 'Assets are loaded! Generating the world...'
                    }
                });
        };

    },

    cloneGLTF: function (gltf) {
        const clonedScene = SkeletonUtils.clone(gltf.scene);
        const root = new THREE.Object3D();
        root.add(clonedScene);
        return root;
    }
};




