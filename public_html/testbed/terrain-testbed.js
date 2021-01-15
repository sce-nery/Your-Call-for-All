import * as THREE from '../vendor/three-js/build/three.module.js';
import {GUI} from '../vendor/three-js/examples/jsm/libs/dat.gui.module.js';
import {createPerformanceMonitor} from "../src/util/debug.js";
import {MersenneTwisterPRNG} from "../src/math/random.js";
import {SimplexNoise} from "../vendor/three-js/examples/jsm/math/SimplexNoise.js";
import {FirstPersonControls} from "../vendor/three-js/examples/jsm/controls/FirstPersonControls.js";
import {OrbitControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";
import {Terrain} from "../src/core/terrain.js";
import {FractalBrownianMotionHeightMap, HeightMap, HybridMultifractalHeightMap} from "../src/core/heightmap.js";
import * as CANNON from "../vendor/cannon-es.js";
import {EffectComposer} from "../vendor/three-js/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../vendor/three-js/examples/jsm/postprocessing/RenderPass.js";
import {BloomPass} from "../vendor/three-js/examples/jsm/postprocessing/BloomPass.js";
import {UnrealBloomPass} from "../vendor/three-js/examples/jsm/postprocessing/UnrealBloomPass.js";
import {threeToCannon} from "../vendor/three-to-cannon.module.js";
import CannonDebugRenderer from "../vendor/cannon-debug-renderer.js";
import PhysicsUtils from "../src/util/physics-utils.js";
import {BokehPass} from "../vendor/three-js/examples/jsm/postprocessing/BokehPass.js";
import {YourCallForAll} from "../src/core/your-call-for-all.js";
import {Assets} from "../src/core/assets.js";
import {PointerLockControls} from "../vendor/three-js/examples/jsm/controls/PointerLockControls.js";
import {MapControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";

let clock;

let camera, scene, renderer, controls;

let ycfa;

let stats;

let composer;
let bloomPass;
let bokehPass;

function setupCamera() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 2000000);
    camera.position.set(0, 30, 10);
}

let pmremGenerator;

function setupRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // These somehow break the water colour
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // default THREE.PCFShadowMap

    pmremGenerator = new THREE.PMREMGenerator(renderer);

    document.body.appendChild(renderer.domElement);
}

function setupScene() {

    scene = new THREE.Scene();

    scene.background = new THREE.Color( 0xa0a0a0 );

    //const helper = new THREE.GridHelper(1000, 1000, 0xffffff, 0xffffff);
    //helper.position.y = 1;
    //scene.add(helper);
}

function setupControls() {

    controls = new MapControls(camera, renderer.domElement);
}

function init() {

    stats = createPerformanceMonitor(document.body);

    Assets.load(function () {
        const loadingElem = document.querySelector('#loading');
        loadingElem.style.display = 'none';


        window.addEventListener('resize', onWindowResize, false);


        clock = new THREE.Clock();

        setupCamera();

        setupRenderer();

        setupScene();

        setupControls();

        composer = new EffectComposer(renderer);
        let renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 1.0, 0.2);
        bloomPass.enabled = false;
        composer.addPass(bloomPass);

        let playerCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 20000);
        playerCamera.position.set(10, 10, 100);

        ycfa = new YourCallForAll(scene, camera, renderer);
        ycfa.pmremGenerator = pmremGenerator;
        ycfa.environment.props.healthFactor = 1.0;
        initGUI();
        clock.start();
        render();
    });
}

function initGUI() {

    const gui = new GUI({width: 310});

    let seedChanged = function () {
        ycfa.environment.terrain.makeAllChunksInactive();
        ycfa.environment.terrain.removeInactiveChunksFromScene();
        ycfa.environment.setupPRNG();
        ycfa.environment.terrain.heightMap.noiseProvider = new SimplexNoise(ycfa.environment.prng);
        ycfa.environment.terrain.loadChunks(physicsDemoMesh.position, true);
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
            ycfa.environment.terrain.makeAllChunksInactive();
            ycfa.environment.terrain.removeInactiveChunksFromScene();
            ycfa.environment.terrain.loadChunks(physicsDemoMesh.position, true);
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

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}


function render() {
    let deltaTime = clock.getDelta();

    ycfa.update(deltaTime);



    composer.render();


    stats.update();

    requestAnimationFrame(render);
}

window.onload = function () {
    init();
}
