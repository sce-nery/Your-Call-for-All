import * as THREE from '../vendor/three-js/build/three.module.js';
import Stats from "../vendor/stats.module.js";
import {createPerformanceMonitor} from './util/debug.js';
import {OrbitControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";

let camera, scene, renderer;

let debugModeEnabled = true;

let stats;

function initWindowEvents() {
    window.addEventListener('resize', onWindowResize, false);
}

function init() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 2000);
    camera.position.set(100, 200, 300);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 200, 1500);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 200, 100);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.left = -120;
    dirLight.shadow.camera.right = 120;
    scene.add(dirLight);

    // ground
    const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({
        color: 0x999999,
        depthWrite: false
    }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 100, 0);
    controls.update();

    initWindowEvents();

    if (debugModeEnabled) {
        stats = createPerformanceMonitor();
    }

    render();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

function render() {
    renderer.render(scene, camera);

    if (debugModeEnabled) {
        stats.update();
    }

    requestAnimationFrame(render);
}

window.onload = function () {
    Logger.useDefaults();
    Logger.setLevel(debugModeEnabled ? Logger.DEBUG : Logger.WARN);
    init();
}
