import * as THREE from "../../vendor/three-js/build/three.module.js";
import {GLTFLoader} from "../../vendor/three-js/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "../../vendor/three-js/examples/jsm/loaders/OBJLoader.js";
import {SkeletonUtils} from "../../vendor/three-js/examples/jsm/utils/SkeletonUtils.js";

const loadingManager = new THREE.LoadingManager();

export const Assets = {

    URL: {
        glTF: {
            Jackie: "/Your-Call-for-All/public_html/assets/models/characters/jackie/jackie.glb",
            PinkTree: "/Your-Call-for-All/public_html/assets/models/objects/trees/pink-tree/scene.gltf",
            WillowTree: "/Your-Call-for-All/public_html/assets/models/objects/trees/willow-tree/scene.gltf",
            PalmTree: "/Your-Call-for-All/public_html/assets/models/objects/trees/palm-tree/scene.gltf",
            LowPolyTree: "/Your-Call-for-All/public_html/assets/models/objects/trees/low-poly-tree/scene.gltf",
            SimpleTree: "/Your-Call-for-All/public_html/assets/models/objects/trees/simple-tree/scene.gltf",
            PineTree: "/Your-Call-for-All/public_html/assets/models/objects/trees/pine-tree/scene.gltf",
            DriedPine: "/Your-Call-for-All/public_html/assets/models/objects/trees/dried-pine/scene.gltf",
            DeadTree: "/Your-Call-for-All/public_html/assets/models/objects/trees/dead-tree/scene.gltf",
            TwoTrees: "/Your-Call-for-All/public_html/assets/models/objects/trees/two-trees/scene.gltf",
            Butterfly: "/Your-Call-for-All/public_html/assets/models/objects/trees/butterfly/scene.gltf",
            FrogOnLeaf: "/Your-Call-for-All/public_html/assets/models/objects/trees/frog-on-leaf/scene.gltf",
            Shark: "/Your-Call-for-All/public_html/assets/models/objects/trees/shark/scene.gltf",
            YardGrass: "/Your-Call-for-All/public_html/assets/models/objects/foliage/yard-grass/scene.gltf",
            PlantShrub: "/Your-Call-for-All/public_html/assets/models/objects/foliage/plant-shrub/scene.gltf",
            Grass: "/Your-Call-for-All/public_html/assets/models/objects/foliage/grass/scene.gltf",
            LowPolyGrass: "/Your-Call-for-All/public_html/assets/models/objects/foliage/low-poly-grass/scene.gltf",
            Lavender: "/Your-Call-for-All/public_html/assets/models/objects/foliage/lavender/scene.gltf",
            WoodenBlock: "/Your-Call-for-All/public_html/assets/models/objects/trees/wooden-block/scene.gltf",
            TropicalPlant: "/Your-Call-for-All/public_html/assets/models/objects/foliage/tropical-plant/scene.gltf",
            Rock: "/Your-Call-for-All/public_html/assets/models/objects/foliage/rock/scene.gltf",
            BrokenBottle: "/Your-Call-for-All/public_html/assets/models/objects/decision-points/broken-bottle/scene.gltf",
            LowPolyTreeWind: "/Your-Call-for-All/public_html/assets/models/objects/trees/low-poly-tree-wind/scene.gltf",
        },
        OBJ: {},
        Texture: {
            Grass_Color: '/Your-Call-for-All/public_html/assets/textures/ground/Grass_Color.png',
            Grass_Normal: '/Your-Call-for-All/public_html/assets/textures/ground/Grass_Normal.png',
            ShallowGrass_Color: '/Your-Call-for-All/public_html/assets/textures/ground/ShallowGrass_Color.jpg',
            ShallowGrass_Normal: '/Your-Call-for-All/public_html/assets/textures/ground/ShallowGrass_Normal.jpg',
            Sand_Color: '/Your-Call-for-All/public_html/assets/textures/ground/Sand_Color.jpg',
            Snow_Color: '/Your-Call-for-All/public_html/assets/textures/ground/Snow_Color.jpg',
            Rocks_Color: '/Your-Call-for-All/public_html/assets/textures/ground/Rocks_Color.jpg',
            Water_Normal: '/Your-Call-for-All/public_html/assets/textures/water/Water_Normal.jpg',
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
        DeadTree: null,
        PinkTree: null,
        WillowTree: null,
        PalmTree: null,
        RealTree: null,
        Jackie: null,
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

                $('#progress-bar')
                    .progress('increment')
                ;

                this.glTF[key] = gltf;
            }, null, function (e) {
                console.error(`Failed to load: ${key}`);
                console.error(e);
            });
        }

        for (const key of Object.keys(this.URL.OBJ)) {
            objLoader.load(this.URL.OBJ[key], (obj) => {
                $('#progress-bar')
                    .progress('increment')
                ;
                this.OBJ[key] = obj;
            }, null, function (e) {
                console.error(`Failed to load: ${key}`);
                console.error(e);
            });
        }

        for (const key of Object.keys(this.URL.Texture)) {
            textureLoader.load(this.URL.Texture[key], (texture) => {
                $('#progress-bar')
                    .progress('increment')
                ;
                this.Texture[key] = texture;
            }, null, function (e) {
                console.error(`Failed to load: ${key}`);
                console.error(e);
            });
        }


        loadingManager.onLoad = onLoad;






        /*
        const progressbarElem = document.querySelector('#progressbar');

        loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
            progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
            //console.log(progressbarElem.style.width);
            let percentage = document.getElementById("percentage");
            if (percentage) {
                percentage.innerHTML = progressbarElem.style.width;
                if (parseInt(progressbarElem.style.width) > 65) {
                    document.getElementById("l-message").innerHTML = "Look at the color of the ocean. It's your call!";
                    //document.getElementById("loading").style.backgroundImage = "url('./assets/images/start-screen-img2.png')";
                }
            }
        }


         */
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




