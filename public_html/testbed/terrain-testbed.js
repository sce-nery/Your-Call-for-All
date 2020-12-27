import * as THREE from '../vendor/three-js/build/three.module.js';
import {GUI} from '../vendor/three-js/examples/jsm/libs/dat.gui.module.js';
import {Sky} from '../vendor/three-js/examples/jsm/objects/Sky.js';
import {createPerformanceMonitor} from "../src/util/debug.js";
import {SkyController} from "../src/core/sky.js";
import {MersenneTwisterPRNG} from "../src/math/random.js";
import {SimplexNoise} from "../vendor/three-js/examples/jsm/math/SimplexNoise.js";
import {FirstPersonControls} from "../vendor/three-js/examples/jsm/controls/FirstPersonControls.js";
import {OrbitControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";
import {Terrain, TerrainController} from "../src/core/terrain.js";
import {HeightMap} from "../src/core/heightmap.js";
import * as CANNON from "../vendor/cannon-es.js";
import {EffectComposer} from "../vendor/three-js/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../vendor/three-js/examples/jsm/postprocessing/RenderPass.js";
import {BloomPass} from "../vendor/three-js/examples/jsm/postprocessing/BloomPass.js";
import {UnrealBloomPass} from "../vendor/three-js/examples/jsm/postprocessing/UnrealBloomPass.js";
import {threeToCannon} from "../vendor/three-to-cannon.module.js";
import CannonDebugRenderer from "../vendor/cannon-debug-renderer.js";

let clock;

let camera, scene, renderer, controls;

let terrainController;
let skyController;

let stats;

let world;

let prng = new MersenneTwisterPRNG(111211);

let simplex = new SimplexNoise(prng);

let composer;

let cannonDebugRenderer;


function setupSky() {

    // Add Sky
    skyController = new SkyController(new Sky());

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
    camera.position.set(0, 2, 3);
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

    const helper = new THREE.GridHelper(100, 100, 0xffffff, 0xffffff);
    scene.add(helper);

    // Sky
    setupSky();

    // Terrain
    setupTerrain();
    terrainController.adjustTerrainForPosition({x:0,y:0,z:0})

    const geometry = new THREE.SphereGeometry(0.75, 10, 10);
    const material = new THREE.MeshPhongMaterial({color: 0xffff00});
    sphere = new THREE.Mesh(geometry, material);
    sphere.receiveShadow= true;
    sphere.castShadow = true;
    scene.add(sphere);

    // Physics
    setupPhysics();
    cannonDebugRenderer = new CannonDebugRenderer( scene, world );
}

let sphere;
let sphereBody;

function setupPhysics() {

    world = new CANNON.World();
    world.gravity.set(0, -9.807, 0); // m/s²
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;


    // Mesh (not recommended).
    const terrainCannonShape = threeToCannon(terrainController.terrain.mesh, {type: threeToCannon.Type.MESH});


    const terrainBody = new CANNON.Body({
        mass: 0, // kg, 0: static
        position: new CANNON.Vec3(0, 0, 0), // m
        shape: terrainCannonShape
    });
    var axis = new CANNON.Vec3(1,0,0);
    var angle = -Math.PI / 2;
    terrainBody.quaternion.setFromAxisAngle(axis, angle);

    world.addBody(terrainBody);


    // Sphere

    var radius = 0.75; // m
    sphereBody = new CANNON.Body({
        mass: 50, // kg
        position: new CANNON.Vec3(0, 4, 0), // m
        shape: new CANNON.Sphere(radius)
    });
    world.addBody(sphereBody);

}


function setupTerrain() {
    const colorMap = new THREE.TextureLoader().load('../assets/textures/ground/Ground1_1K_Color.jpg')
    const normalMap = new THREE.TextureLoader().load('../assets/textures/ground/Ground1_1K_Normal.jpg')
    const displacementMap = new THREE.TextureLoader().load('../assets/textures/ground/Ground1_1K_Displacement.jpg')
    const occlusionMap = new THREE.TextureLoader().load('../assets/textures/ground/Ground1_1K_AmbientOcclusion.jpg')
    const roughnessMap = new THREE.TextureLoader().load('../assets/textures/ground/Ground1_1K_Roughness.jpg')

    colorMap.wrapS = THREE.RepeatWrapping;
    colorMap.wrapT = THREE.RepeatWrapping;

    colorMap.repeat.set(100, 100);

    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(100, 100);

    displacementMap.wrapS = THREE.RepeatWrapping;
    displacementMap.wrapT = THREE.RepeatWrapping;
    displacementMap.repeat.set(100, 100);

    occlusionMap.wrapS = THREE.RepeatWrapping;
    occlusionMap.wrapT = THREE.RepeatWrapping;
    occlusionMap.repeat.set(100, 100);

    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(100, 100);

    let terrain = new Terrain({
        width: 100,
        height: 100,
        widthSegments: 100,
        heightSegments: 100,
        map: colorMap,
        normalMap: normalMap,
        displacementMap: null,
        occlusionMap: null,
        roughnessMap: null
    });
    scene.add(terrain.mesh);

    let heightMap = new HeightMap(terrain.mesh.geometry.vertices, simplex, {
        xZoom: 20,
        yZoom: 20,
        noiseStrength: 1.5
    });
    terrainController = new TerrainController(terrain, heightMap);
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
let updateTerrain = true;

function render() {

    if (updateTerrain) {
        terrainController.adjustTerrainForPosition(position);
        updateTerrain = false;
    }

    var fixedTimeStep = 1.0 / 60.0; // seconds
    var maxSubSteps = 3;
    world.step(fixedTimeStep, clock.getDelta(), maxSubSteps);

    sphere.position.copy(sphereBody.position);
    sphere.quaternion.copy(sphereBody.quaternion);


    controls.update(clock.getDelta());
    composer.render();

    cannonDebugRenderer.update();


    stats.update();

    requestAnimationFrame(render);
}

window.onload = function () {
    init();
    render();
}
