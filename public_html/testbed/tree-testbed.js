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
        let tree1 = new Tree(AssetMap["Tree_Pink_GLTFModel"]);
        scene.add(tree1.model);


        const clonedScene = SkeletonUtils.clone(AssetMap["Tree_Pink_GLTFModel"].scene);
        const root = new THREE.Object3D();
        root.add(clonedScene);

        root.position.z = 10;
        root.position.x = 50;
        scene.add(root);

        let tree3 = new Tree(AssetMap["Tree_Willow_GLTFModel"]);
        tree3.model.position.x=-10;
        tree3.model.position.y=2;
        tree3.model.scale.set(0.02,0.02,0.02);
        scene.add(tree3.model);

        let tree4 = new Tree(AssetMap["Tree_Palm_GLTFModel"]);
        tree4.model.position.x=-10;
        tree4.model.position.y=4;
        tree4.model.position.z=35;
        tree4.model.scale.set(0.01,0.01,0.01);
        scene.add(tree4.model);

        let tree5 = new Tree(AssetMap["Tree_Real_GLTFModel"]);
        tree5.model.position.x=-10;
        tree5.model.position.y=4;
        tree5.model.position.z=45;
        tree5.model.scale.set(0.01,0.01,0.01);
        scene.add(tree5.model);
        clock.start();
        render();
    })

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
}


function render() {
    let deltaTime = clock.getDelta();
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
