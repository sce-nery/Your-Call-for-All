import {YourCallForAll} from "./core/your-call-for-all.js";
import * as THREE from "../vendor/three-js/build/three.module.js";
import {Environment} from "./core/environment.js";
import {OrbitControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";


window.onload = function () {
    init();
    render();
}
let controls;

let yourCallForAll;
let clock;
let camera, scene, renderer;


function init() {
    clock = new THREE.Clock();

    initCamera();
    initListeners();
    initScene();
    initRenderer();

    yourCallForAll = new YourCallForAll(scene);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    clock.start();
}


function render() {
    let deltaTime = clock.getDelta();
    controls.update();
    yourCallForAll.update(deltaTime);

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}



function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 2000);
    camera.position.set(10,10, 100);

}

function initListeners() {
    window.addEventListener('resize', onWindowResize, false);
}


function initRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
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



/*
* import * as THREE from '../vendor/three-js/build/three.module.js';
import Stats from "../vendor/stats.module.js";
import {createPerformanceMonitor} from './util/debug.js';
import {OrbitControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";
import {GUI} from '../vendor/dat.gui/build/dat.gui.module.js';
import {GuiController} from "./util/gui_controller.js";
import {ColorGUIHelper} from "./util/gui_controller.js";


const gui = new GUI();
let controller = new GuiController(gui);
controller.add_slider("a", -10, 10);
controller.add_slider("b", -300, 300);
controller.add_slider("c", -300, 300);


let camera, scene, renderer;

let debugModeEnabled = true;

let stats;


function init() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 2000);
    camera.position.set(100, 200, 300);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    dirLight.position.set(0, 200, 100);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.left = -120;
    dirLight.shadow.camera.right = 120;
    dirLight.target.position.set(0,100,0);
    scene.add(dirLight);
    scene.add(dirLight.target);

    // ground
    const mesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2000, 2000),
        new THREE.MeshPhongMaterial({color: 0x999999, depthWrite: false})
    );
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

    {
        const cubeSize = 20;
        const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.position.set(0, 100, 0);
        scene.add(mesh);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 100, 0);
    controls.update();

    initWindowEvents();

    if (debugModeEnabled) { stats = createPerformanceMonitor();}


    const gui = new GUI();
    gui.addColor(new ColorGUIHelper(dirLight, 'color'), 'value').name('color');
    gui.add(dirLight, 'intensity', 0, 2, 0.01);
    gui.add(dirLight.target.position, 'x', -10, 10);
    gui.add(dirLight.target.position, 'z', -10, 10);
    gui.add(dirLight.target.position, 'y', 0, 10);

    function render() {
        renderer.render(scene, camera);

        if (debugModeEnabled) {stats.update();}
        requestAnimationFrame(render);
    }


    render();
}



function initWindowEvents() {
    window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}


window.onload = function () {
    Logger.useDefaults();
    Logger.setLevel(debugModeEnabled ? Logger.DEBUG : Logger.WARN);
    init();
}
*/