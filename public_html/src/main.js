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
import {GUI} from "../vendor/three-js/examples/jsm/libs/dat.gui.module.js";


let hyperParameters = {
    showGridHelper: false,
    showPerformanceMonitor: true,
    showParameters: true,
    ambientSound: './assets/sounds/song3.mp3',
}

let yourCallForAll;
let clock;
let camera, scene, renderer, labelRenderer, composer, bloomPass;
let stats, gameUiController;
let audio;

function init() {
    Assets.load(() => {

        initCamera();
        initListeners();
        initScene();
        initRenderer();
        yourCallForAll = new YourCallForAll(scene, camera, renderer);
        clock = yourCallForAll.clock;
        gameUiController = yourCallForAll.uiController;
        audio = new GameAudio(scene, camera, hyperParameters.ambientSound, gameUiController);
        applyHyperParams();
        render();
    });
}


function render() {
    let deltaTime = clock.getDelta();
    if (stats) {
        stats.update();
    }

    yourCallForAll.update(deltaTime);

    renderer.toneMappingExposure = yourCallForAll.environment.sky.props.exposure;
    composer.render();

    labelRenderer.render(yourCallForAll.scene, yourCallForAll.camera);

    requestAnimationFrame(render);
}

function applyHyperParams() {
    if (hyperParameters.showGridHelper) {
        const helper = new THREE.GridHelper(1000, 1000, 0xffffff, 0xffffff);
        helper.position.y = 1;
        scene.add(helper);
    }
    if (hyperParameters.showPerformanceMonitor) {
        stats = createPerformanceMonitor(document.body, 80 * 18.5);
    }
    if (hyperParameters.showParameters) {
        initDebugGUIForGameParams();
    }
}


function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 10000);
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
    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.3, 0.95);
    composer.addPass(bloomPass);

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


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}


window.onload = function () {
    init();
}


function initDebugGUIForGameParams() {
    let ycfa = yourCallForAll;

    const gui = new GUI({width: 310});

    let seedChanged = function () {
        ycfa.environment.setupPRNG();
        ycfa.environment.regenerate();
    }
    gui.add(ycfa.environment, "seed", 1, 10000, 1).onFinishChange(seedChanged);

    const terrainFolder = gui.addFolder("terrain")

    terrainFolder.add(ycfa.environment.terrain.props, "chunkSize", 10, 400, 1);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "zoom", 1, 1000, 1);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "octaves", 2, 256, 1);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "lacunarity", 0, 100, 0.1);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "noiseStrength", 1.0, 100.0, 0.1);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "heightOffset", -20.0, 20.0, 0.1);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "exaggeration", 1.0, 3.0, 0.001);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "hurstExponent", 0.01, 1.0, 0.001);
    let button = {
        regenerate: function () {
            console.log("Regenerating...")
            ycfa.environment.regenerate();
        }
    };
    terrainFolder.add(button, 'regenerate');


    const skyFolder = gui.addFolder("sky")

    let skyUpdate = function () {
        ycfa.environment.sky.update();
    }

    skyFolder.add(ycfa.environment.sky.props, "inclination", 0.0, 1.0, 0.01).onChange(skyUpdate);
    skyFolder.add(ycfa.environment.sky.props, "turbidity", 0.0, 100.0, 0.01).onChange(skyUpdate);
    skyFolder.add(ycfa.environment.sky.props, "mieCoefficient", -0.01, 0.01, 0.00001).onChange(skyUpdate);
    skyFolder.add(ycfa.environment.sky.props, "mieDirectionalG", -1.4, 1.4, 0.00001).onChange(skyUpdate);
    skyFolder.add(ycfa.environment.sky.props, "azimuth", 0, 1, 0.001).onChange(skyUpdate);

    const envFolder = gui.addFolder("environment")

    envFolder.add(ycfa.environment.props, "healthFactor", 0, 1, 0.001);


    const bloomFolder = gui.addFolder("bloom");
    bloomFolder.add(bloomPass, "strength", 0.0, 3, 0.001);
    bloomFolder.add(bloomPass, "radius", 0.1, 1, 0.001);
    bloomFolder.add(bloomPass, "threshold", 0, 1, 0.0001);
    bloomFolder.add(bloomPass, "enabled", false, true);
}
