import * as THREE from '../vendor/three-js/build/three.module.js';
import {GUI} from '../vendor/three-js/examples/jsm/libs/dat.gui.module.js';
import {Sky} from '../vendor/three-js/examples/jsm/objects/Sky.js';
import {createPerformanceMonitor} from "../src/util/debug.js";
import {SkyController} from "../src/core/sky.js";
import {MersenneTwisterPRNG} from "../src/math/random.js";
import {SimplexNoise} from "../vendor/three-js/examples/jsm/math/SimplexNoise.js";
import {FirstPersonControls} from "../vendor/three-js/examples/jsm/controls/FirstPersonControls.js";
import {OrbitControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";

let clock;

let camera, scene, renderer, controls;

let skyController;

let stats;

function setupSky() {

    // Add Sky
    skyController = new SkyController(new Sky());

    scene.add(skyController.sky);
    scene.add(skyController.sunLight);


    /// GUI

    function guiChanged() {

        skyController.update();

        renderer.toneMappingExposure = skyController.properties.exposure;
    }

    const gui = new GUI();

    gui.add(skyController.properties, "turbidity", 0.0, 100.0, 0.1).onChange(guiChanged);
    gui.add(skyController.properties, "rayleigh", 0.0, 100.0, 0.001).onChange(guiChanged);
    gui.add(skyController.properties, "mieCoefficient", 0.0, 0.1, 0.001).onChange(guiChanged);
    gui.add(skyController.properties, "mieDirectionalG", 0.0, 1, 0.001).onChange(guiChanged);
    gui.add(skyController.properties, "inclination", 0, 1, 0.0001).onChange(guiChanged);
    gui.add(skyController.properties, "azimuth", 0, 1, 0.0001).onChange(guiChanged);
    gui.add(skyController.properties, "exposure", 0, 1, 0.0001).onChange(guiChanged);

    skyController.update();

}

function setupCamera() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 2000000);
    camera.position.set(0, 50, 100);
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

    const helper = new THREE.GridHelper(100, 100    , 0xffffff, 0xffffff);
    scene.add(helper);


    // Sky
    setupSky();

    // Terrain
    setupTerrain();
}

let simplex;
let terrain;

function adjustTerrainVertices(position) {
    let xZoom = 10;
    let yZoom = 10;
    let noiseStrength = 2;

    for (let i = 0; i < terrain.geometry.vertices.length; i++) {
        let vertex = terrain.geometry.vertices[i];
        let x = vertex.x / xZoom;
        let y = vertex.y / yZoom;
        let noise = simplex.noise(x + position.x, y + position.z) * noiseStrength;
        vertex.z = noise;
    }
    terrain.geometry.verticesNeedUpdate = true;
    terrain.geometry.computeVertexNormals();
}

function setupTerrain() {
    let side = 120;
    let geometry = new THREE.PlaneGeometry(100, 100, side, side);
    let material = new THREE.MeshLambertMaterial({
        color: new THREE.Color(0x555555),

    });
    terrain = new THREE.Mesh(geometry, material);
    terrain.castShadow = true;
    terrain.receiveShadow = true;
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    let prng = new MersenneTwisterPRNG(111);

    simplex = new SimplexNoise(prng);

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

    stats = createPerformanceMonitor(document.body);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

let position = new THREE.Vector3();

function render() {
    //position.x += 1 / 60;
    //position.z += 1 / 60;

    terrain.position.set(position.x * 10, 0, -position.z * 10);

    adjustTerrainVertices(position);

    controls.update(clock.getDelta())

    renderer.render(scene, camera);

    stats.update();

    requestAnimationFrame(render);
}

window.onload = function () {
    init();
    render();
}
