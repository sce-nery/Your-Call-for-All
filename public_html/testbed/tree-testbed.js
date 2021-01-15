import {YourCallForAll} from "../src/core/your-call-for-all.js";
import * as THREE from "../vendor/three-js/build/three.module.js";
import {OrbitControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";
import {EffectComposer} from "../vendor/three-js/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../vendor/three-js/examples/jsm/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "../vendor/three-js/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as ASSETS from "../src/core/assets.js";
import {AnimatedObject} from "../src/core/animatedObject.js";
import {Assets} from "../src/core/assets.js";
import {SkeletonUtils} from "../vendor/three-js/examples/jsm/utils/SkeletonUtils.js";
import {createPerformanceMonitor} from "../src/util/debug.js";

window.onload = function () {
    init();
}
let controls;

let yourCallForAll;
let clock;
let camera, scene, renderer, composer;

let stats;


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

    Assets.load(function () {
        yourCallForAll = new YourCallForAll(scene, camera, renderer);
        yourCallForAll.environment.props.healthFactor = 1.0;
        // let tree1 = new Tree(Assets.glTF.PinkTree);
        // scene.add(tree1.model);


        // const clonedScene = SkeletonUtils.clone(Assets.glTF.PinkTree.scene);
        // const root = new THREE.Object3D();
        // root.add(clonedScene);

        // root.position.z = 10;
        // root.position.x = 50;
        // scene.add(root);

        // let tree3 = new Tree(Assets.glTF.WillowTree);
        // tree3.model.position.x = -10;
        // tree3.model.position.y = 2;
        // tree3.model.scale.set(0.02, 0.02, 0.02);
        // scene.add(tree3.model);

        // let tree4 = new Tree(Assets.glTF.PalmTree);
        // tree4.model.position.x = -10;
        // tree4.model.position.y = 4;
        // tree4.model.position.z = 35;
        // tree4.model.scale.set(0.01, 0.01, 0.01);
        // scene.add(tree4.model);

        // let tree5 = new Tree(Assets.glTF.RealTree);
        // tree5.model.position.x = -10;
        // tree5.model.position.y = 4;
        // tree5.model.position.z = 45;
        // tree5.model.scale.set(0.01, 0.01, 0.01);
        // scene.add(tree5.model);
        clock.start();
        render();
    });

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    stats = createPerformanceMonitor(document.body);
}

let  position = new  THREE.Vector3();

function render() {
    let deltaTime = clock.getDelta();
    /*if ( mixer ) mixer.update( deltaTime );
    for (let i=0;i<5;i++){
        let thisMixer = mixerList[i];
        if(thisMixer) thisMixer.update(deltaTime);
        mixerList[i] = thisMixer;

    }*/
    controls.update();

    yourCallForAll.update(deltaTime, position);
    //renderer.toneMappingExposure = yourCallForAll.environment.sky.props.exposure;

    composer.render();

    stats.update();


    requestAnimationFrame(render);
}


function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 200000);
    camera.position.set(10, 10, 100);

}

function initListeners() {
    window.addEventListener('resize', onWindowResize, false);
}


function initRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // For some reason, these break the water color
    // renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 0.5;
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
