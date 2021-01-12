import {YourCallForAll} from "./core/your-call-for-all.js";
import * as THREE from "../vendor/three-js/build/three.module.js";
import {EffectComposer} from "../vendor/three-js/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../vendor/three-js/examples/jsm/postprocessing/RenderPass.js";
import {Assets} from "./core/assets.js";
import {createPerformanceMonitor} from "./util/debug.js";


window.onload = function () {
    init();
}


let yourCallForAll;
let clock;
let camera, scene, renderer, composer;
let stats;


function init() {


    Assets.load(() => {
        removeLoadingBar();
        clock = new THREE.Clock();
        initCamera();
        initListeners();
        initScene();
        initRenderer();

        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        //composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.3, 0.95));


        yourCallForAll = new YourCallForAll(scene, camera);
        clock.start();
        render();

        //const helper = new THREE.GridHelper(1000, 1000, 0xffffff, 0xffffff);
        //helper.position.y = 1;
        //scene.add(helper);


    });

    stats = createPerformanceMonitor(document.body);

}


function render() {
    let deltaTime = clock.getDelta();
    stats.update();
    yourCallForAll.update(deltaTime);
    renderer.toneMappingExposure = yourCallForAll.environment.sky.props.exposure;

    composer.render();


    requestAnimationFrame(render);
}

function removeLoadingBar(){
    const loadingElem = document.querySelector('#loading');
    loadingElem.style.display = 'none';
    //document.querySelector('#main-menu').style.visibility = 'visible';
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

    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 0.5;

    //renderer.outputEncoding = THREE.sRGBEncoding;
    //renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
