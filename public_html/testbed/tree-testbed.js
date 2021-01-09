import {YourCallForAll} from "../src/core/your-call-for-all.js";
import * as THREE from "../vendor/three-js/build/three.module.js";
import {OrbitControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";
import {EffectComposer} from "../vendor/three-js/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../vendor/three-js/examples/jsm/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "../vendor/three-js/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as ASSETS from "../src/core/assets.js";
import {Tree} from "../src/core/tree.js";
import {AssetMap} from "../src/core/assets.js";
import {SkeletonUtils} from "../vendor/three-js/examples/jsm/utils/SkeletonUtils.js";
var mixer;
let mixerList=[];

window.onload = function () {
    init();
}
let controls;

let yourCallForAll;
let clock;
let camera, scene, renderer, composer;


function init() {
    clock = new THREE.Clock();




    initCamera();
    initListeners();
    initScene();
    initRenderer();

    composer = new EffectComposer(renderer);
    let renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.3, 0.95));

    // let helper = new THREE.GridHelper(1000,1000, 0xffffff,0xffffff);
    // helper.position.y = 1.0;
    // scene.add(helper);

    ASSETS.load().then(function () {
        yourCallForAll = new YourCallForAll(scene);
        /*let tree1 = new Tree(AssetMap["Tree_Pink_GLTFModel"]);
        scene.add(tree1.root);


        let tree3 = new Tree(AssetMap["Tree_Willow_GLTFModel"]);
        tree3.root.position.x=-10;
        tree3.root.position.y=2;
        tree3.root.scale.set(0.02,0.02,0.02);
        scene.add(tree3.root);

        let tree10 = new Tree(AssetMap["Tree_Willow_GLTFModel"]);
        tree10.root.position.x=10;
        tree10.root.position.y=2;
        tree10.root.scale.set(0.02,0.02,0.02);
        scene.add(tree10.root);*/
        /*let chunkDictionary = yourCallForAll.environment.terrain.chunks;
        for (let key in chunkDictionary) {
            console.log(chunkDictionary[key].heightData.x);
        }
        */
/*
        for (let i=0;i<5;i++){
            let tree = new Tree(AssetMap["Tree_Pink_GLTFModel"]);
            tree.root.position.x=i*10;
            let treeMixer = new THREE.AnimationMixer(tree.root);
            tree.animations.forEach((clip) => {treeMixer.clipAction(clip).play(); });
            scene.add(tree.root);
            mixerList.push(treeMixer);

        }

        let tree1 = new Tree(AssetMap["Tree_Pink_GLTFModel"]);


        mixer= new THREE.AnimationMixer(tree1.root);
        tree1.animations.forEach((clip) => {mixer.clipAction(clip).play(); });


        scene.add(tree1.root);



        let tree3 = new Tree(AssetMap["Tree_Willow_GLTFModel"]);
        tree3.model.position.x=-10;
        tree3.model.position.y=2;
        tree3.model.scale.set(0.02,0.02,0.02);
        tree3.setupActions();
        tree3.activateAllActions();
        scene.add(tree3.model);


        let tree4 = new Tree(AssetMap["Tree_Palm_GLTFModel"]);
        tree4.model.position.x=-10;
        tree4.model.position.y=4;
        tree4.model.position.z=35;
        tree4.model.scale.set(0.01,0.01,0.01);
        tree4.setupActions();
        tree4.activateAllActions();
        scene.add(tree4.model);

        let tree5 = new Tree(AssetMap["Tree_Real_GLTFModel"]);
        tree5.model.position.x=-10;
        tree5.model.position.y=4;
        tree5.model.position.z=45;
        tree5.model.scale.set(0.01,0.01,0.01);
        scene.add(tree5.model);

        */
        clock.start();
        render();
    })

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
}


function render() {
    let deltaTime = clock.getDelta();
    /*if ( mixer ) mixer.update( deltaTime );
    for (let i=0;i<5;i++){
        let thisMixer = mixerList[i];
        if(thisMixer) thisMixer.update(deltaTime);
        mixerList[i] = thisMixer;

    }*/
    controls.update();
    yourCallForAll.update(deltaTime);
    //renderer.toneMappingExposure = yourCallForAll.environment.sky.props.exposure;

    composer.render();


    requestAnimationFrame(render);
}



function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 200000);
    camera.position.set(10,10, 100);

}

function initListeners() {
    window.addEventListener('resize', onWindowResize, false);
}


function initRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // For some reason, these break the water color
    //renderer.outputEncoding = THREE.sRGBEncoding;
    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 0.5;
    document.body.appendChild(renderer.domElement);
}

function initScene() {
    scene = new THREE.Scene();

}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}
