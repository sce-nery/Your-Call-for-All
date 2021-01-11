import {YourCallForAll} from "./core/your-call-for-all.js";
import * as THREE from "../vendor/three-js/build/three.module.js";
import {OrbitControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";
import {EffectComposer} from "../vendor/three-js/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../vendor/three-js/examples/jsm/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "../vendor/three-js/examples/jsm/postprocessing/UnrealBloomPass.js";
import {GLTFLoader} from "../vendor/three-js/examples/jsm/loaders/GLTFLoader.js";
import {Character} from "./core/character/character.js";
import {Assets} from "./core/assets.js";
import {createPerformanceMonitor} from "./util/debug.js";


window.onload = function () {
    init();
}
let controls;

let yourCallForAll;
let clock;
let camera, scene, renderer, composer;
let stats;


function init() {


    Assets.load(() => {
        const loadingElem = document.querySelector('#loading');
        loadingElem.style.display = 'none';

        //document.querySelector('#main-menu').style.visibility = 'visible';

        clock = new THREE.Clock();

        initCamera();
        initListeners();
        initScene();
        initRenderer();

        composer = new EffectComposer(renderer);
        let renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);
        composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.3, 0.95));


        yourCallForAll = new YourCallForAll(scene, camera, renderer);
        clock.start();
        render();
    });

    //stats = createPerformanceMonitor(document.body);


    //controls = new OrbitControls(camera, renderer.domElement);
    //controls.update();
}


function render() {
    let deltaTime = clock.getDelta();
    //stats.update();
    //controls.update();
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
