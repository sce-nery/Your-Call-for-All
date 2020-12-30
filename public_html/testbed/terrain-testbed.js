import * as THREE from '../vendor/three-js/build/three.module.js';
import {GUI} from '../vendor/three-js/examples/jsm/libs/dat.gui.module.js';
import {Sky} from '../vendor/three-js/examples/jsm/objects/Sky.js';
import {createPerformanceMonitor} from "../src/util/debug.js";
import {SkyController} from "../src/core/sky.js";
import {MersenneTwisterPRNG} from "../src/math/random.js";
import {SimplexNoise} from "../vendor/three-js/examples/jsm/math/SimplexNoise.js";
import {FirstPersonControls} from "../vendor/three-js/examples/jsm/controls/FirstPersonControls.js";
import {OrbitControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";
import {Terrain} from "../src/core/terrain.js";
import {HeightMap} from "../src/core/heightmap.js";
import * as CANNON from "../vendor/cannon-es.js";
import {EffectComposer} from "../vendor/three-js/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../vendor/three-js/examples/jsm/postprocessing/RenderPass.js";
import {BloomPass} from "../vendor/three-js/examples/jsm/postprocessing/BloomPass.js";
import {UnrealBloomPass} from "../vendor/three-js/examples/jsm/postprocessing/UnrealBloomPass.js";
import {threeToCannon} from "../vendor/three-to-cannon.module.js";
import CannonDebugRenderer from "../vendor/cannon-debug-renderer.js";
import PhysicsUtils from "../src/util/physics-utils.js";

let clock;

let camera, scene, renderer, controls;

let terrain;
let skyController;

let stats;

let world;

let prng = new MersenneTwisterPRNG(11881);

let noiseProvider = new SimplexNoise(prng);

let composer;

let cannonDebugRenderer;


function setupSky() {

    // Add Sky
    skyController = new SkyController(new Sky());
    skyController.props.inclination = 0.35;

    scene.add(skyController.sky);
    scene.add(skyController.sunLight);


    /// GUI

    function guiChanged() {

        skyController.update();

        renderer.toneMappingExposure = skyController.props.exposure;
    }

    const gui = new GUI();

    gui.add(skyController.props, "turbidity", 0.0, 100.0, 0.1).onChange(guiChanged);
    gui.add(skyController.props, "rayleigh", 0.0, 100.0, 0.001).onChange(guiChanged);
    gui.add(skyController.props, "mieCoefficient", 0.0, 0.1, 0.001).onChange(guiChanged);
    gui.add(skyController.props, "mieDirectionalG", 0.0, 1, 0.001).onChange(guiChanged);
    gui.add(skyController.props, "inclination", 0, 1, 0.0001).onChange(guiChanged);
    gui.add(skyController.props, "azimuth", 0, 1, 0.0001).onChange(guiChanged);
    gui.add(skyController.props, "exposure", 0, 1, 0.0001).onChange(guiChanged);

    skyController.update();

}

function setupCamera() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 2000000);
    camera.position.set(0, 3, 10);
}

function setupRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    document.body.appendChild(renderer.domElement);
}

function setupScene() {

    scene = new THREE.Scene();

    const helper = new THREE.GridHelper(400, 400, 0xffffff, 0xffffff);
    scene.add(helper);

    // Sky
    setupSky();

    // Terrain
    setupTerrain();

    const geometry = new THREE.CylinderGeometry(0.375, 0.375, 1.75, 32, 1);
    const material = new THREE.MeshStandardMaterial({color: 0xffff00});
    physicsDemoMesh = new THREE.Mesh(geometry, material);
    physicsDemoMesh.receiveShadow = true;
    physicsDemoMesh.castShadow = true;
    // scene.add(physicsDemoMesh);

    // Physics
    setupPhysics();

    cannonDebugRenderer = new CannonDebugRenderer(scene, world);
}

let physicsDemoMesh;
let physicsDemoBody;

function setupPhysics() {
    world = new CANNON.World();
    world.gravity.set(0, -9.807, 0); // m/s²
    world.broadphase = new CANNON.NaiveBroadphase();
    world.defaultContactMaterial.contactEquationStiffness = 1e5;
    world.defaultContactMaterial.contactEquationRegularizationTime = 3;
    world.allowSleep = true;
    world.solver.iterations = 10;

    let physicsDemoBodyShape = PhysicsUtils.convertThreeGeometryToCannonConvexPolyhedron(physicsDemoMesh.geometry);
    physicsDemoBody = new CANNON.Body({
        mass: 5, // kg
        position: new CANNON.Vec3(0, 5, 0), // m
        shape: physicsDemoBodyShape
    });
    physicsDemoBody.allowSleep = true;

    // Something wrong with this body, it practically freezes the browser
    // world.addBody(physicsDemoBody);

    // world.addBody(terrain.physicsBody);

}


function setupTerrain() {
    let heightMap = new HeightMap(noiseProvider, {
        xZoom: 20,
        yZoom: 20,
        noiseStrength: 2.0
    });

    terrain = new Terrain(scene, heightMap, {chunkSize: 50})
}


function setupControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.movementSpeed = 50;
    controls.lookSpeed = 0.25;
    controls.freeze = true;
}

function init() {

    clock = new THREE.Clock();
    clock.start();

    setupCamera();

    setupRenderer();

    setupScene();

    setupControls();

    composer = new EffectComposer(renderer);
    let renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    stats = createPerformanceMonitor(document.body);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

let position = new THREE.Vector3();
let updateTerrain = false;

function render() {
    // position.x += 1 / 60 * 0.15;
    // position.z += 1 / 60 * 0.15;
    // updateTerrain = true;

    // if (updateTerrain) {
    //     // TODO: Instead of moving the whole terrain, generate chunks, load & unload them.
    //     terrain.moveTo(position);
    //     updateTerrain = false;
    // }

    // var fixedTimeStep = 1.0 / 60.0; // seconds
    // var maxSubSteps = 3;
    // world.step(fixedTimeStep, clock.getDelta(), maxSubSteps);

    // physicsDemoMesh.position.copy(physicsDemoBody.position);
    // physicsDemoMesh.quaternion.copy(physicsDemoBody.quaternion);

    // cannonDebugRenderer.update();

    controls.update(clock.getDelta());
    composer.render();


    stats.update();

    requestAnimationFrame(render);
}

window.onload = function () {
    init();

    document.getElementById("loading-label").remove();

    render();
}
