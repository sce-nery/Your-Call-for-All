import {YourCallForAll} from "./core/your-call-for-all.js";
import * as THREE from "../vendor/three-js/build/three.module.js";
import {EffectComposer} from "../vendor/three-js/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../vendor/three-js/examples/jsm/postprocessing/RenderPass.js";
import {Assets} from "./core/assets.js";
import {createPerformanceMonitor} from "./util/debug.js";
import {UnrealBloomPass} from "../vendor/three-js/examples/jsm/postprocessing/UnrealBloomPass.js";
import {GameAudio} from "./core/audio.js";
import {GameUiController} from "./core/game-ui.js";
import {CSS2DRenderer} from "../vendor/three-js/examples/jsm/renderers/CSS2DRenderer.js";


let settings = {
    useGridHelper: false,
    useBloom: false,
    usePerformanceMonitor: false,
    ambientSound: './assets/sounds/song3.mp3',
}


let yourCallForAll;
let clock;
let camera, scene, renderer, labelRenderer, composer;
let stats, gameUiController;
let audio;


let music  = document.getElementById("start-screen-menu-id");
music.addEventListener("click", addAudio );


function init() {
    Assets.load(() => {

        clock = new THREE.Clock();
        initCamera();
        initListeners();
        initScene();
        initRenderer();
        yourCallForAll = new YourCallForAll(scene, camera, renderer);
        gameUiController = new GameUiController(yourCallForAll, renderer);
        gameUiController.hideLoadingBar();
        clock.start();
        applySettings();
        render();
    });
}


function render() {
    let deltaTime = clock.getDelta();
    if (stats) {
        stats.update();
    }
    //yourCallForAll.update(deltaTime);
    gameUiController.update(deltaTime);

    renderer.toneMappingExposure = yourCallForAll.environment.sky.props.exposure;
    composer.render();
    labelRenderer.render(yourCallForAll.scene, yourCallForAll.camera);

    requestAnimationFrame(render);
}

function applySettings() {
    if (settings.useBloom) {
        composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.3, 0.95));
    }
    if (settings.useGridHelper) {
        const helper = new THREE.GridHelper(1000, 1000, 0xffffff, 0xffffff);
        helper.position.y = 1;
        scene.add(helper);
    }
    if (settings.usePerformanceMonitor) {
        stats = createPerformanceMonitor(document.body);
    }
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
    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 0.5;
    //renderer.outputEncoding = THREE.sRGBEncoding;
    //renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    document.querySelector("#render-target").appendChild(renderer.domElement);


    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.querySelector("#render-target").appendChild(labelRenderer.domElement);
}

function initScene() {
    scene = new THREE.Scene();

}

function addAudio(){
    audio = new GameAudio(scene, camera, settings.ambientSound);
    gameUiController.hideStartScreenMenu();
    gameUiController.ycfa.registerPlayerControlListeners();

}



function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}


window.onload = function () {
    init();
}
