import * as THREE from '../vendor/three-js/build/three.module.js';
import {GUI} from '../vendor/three-js/examples/jsm/libs/dat.gui.module.js';
import {OrbitControls} from '../vendor/three-js/examples/jsm/controls/OrbitControls.js';
import {Sky} from '../vendor/three-js/examples/jsm/objects/Sky.js';
import {createPerformanceMonitor} from "../src/util/debug.js";
import {SkyController} from "../src/core/sky.js";

let camera, scene, renderer;

let skyController;

let stats;

function initSky() {

    // Add Sky
    skyController = new SkyController(new Sky());

    scene.add(skyController.sky);


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

function init() {

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 2000000);
    camera.position.set(0, 1, 2);

    scene = new THREE.Scene();

    const helper = new THREE.GridHelper(10, 10, 0xffffff, 0xffffff);
    scene.add(helper);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = true;

    initSky();

    stats = createPerformanceMonitor(document.body);

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    renderer.render(scene, camera);

    stats.update();

    requestAnimationFrame(render);
}

window.onload = function () {
    init();
    render();
}
