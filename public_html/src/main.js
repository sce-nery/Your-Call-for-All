import {YourCallForAll} from "./core/your-call-for-all.js";
import * as THREE from "../vendor/three-js/build/three.module.js";
import {EffectComposer} from "../vendor/three-js/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../vendor/three-js/examples/jsm/postprocessing/RenderPass.js";
import {Assets} from "./core/assets.js";
import {createPerformanceMonitor} from "./util/debug.js";
import {UnrealBloomPass} from "../vendor/three-js/examples/jsm/postprocessing/UnrealBloomPass.js";


let settings = {
    useGridHelper: false,
    useBloom: false,
    usePerformanceMonitor: false,
}


let yourCallForAll;
let clock;
let camera, scene, renderer, composer;
let stats;

let flag = -1;

function init() {
    const loadingElem = document.querySelector('#button');
    loadingElem.addEventListener("click", () => {
        flag *= -1;

        const menuEl = document.querySelector('#menu');

        if (flag === -1){
            menuEl.style.visibility = 'hidden';
            //abc.style.visibility = 'hidden';
        }
        else {
            menuEl.style.visibility = 'visible';
            //abc.style.visibility = 'visible';
        }

    });

    const resume = document.querySelector('#abc');
    resume.addEventListener("click",()=>{
        const menuEl = document.querySelector('#menu');
        flag *= -1;
        if (flag === -1){
            menuEl.style.visibility = 'hidden';
            //abc.style.visibility = 'hidden';
        }
        else {
            menuEl.style.visibility = 'visible';
            //abc.style.visibility = 'visible';
        }
    })

    Assets.load(() => {
        removeLoadingBar();
        clock = new THREE.Clock();
        initCamera();
        initListeners();
        initScene();
        initRenderer();
        yourCallForAll = new YourCallForAll(scene, camera, renderer);
        clock.start();
        applySettings();
        render();
    });
}


function render() {
    let deltaTime = clock.getDelta();
    if (stats) {stats.update();}

    if(flag === -1)  {
        yourCallForAll.update(deltaTime);
    }

    renderer.toneMappingExposure = yourCallForAll.environment.sky.props.exposure;
    composer.render();
    requestAnimationFrame(render);
}

function applySettings(){
    if (settings.useBloom){
        composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.3, 0.95));
    }
    if (settings.useGridHelper){
        const helper = new THREE.GridHelper(1000, 1000, 0xffffff, 0xffffff);
        helper.position.y = 1;
        scene.add(helper);
    }
    if (settings.usePerformanceMonitor){
        stats = createPerformanceMonitor(document.body);
    }
}

function removeLoadingBar(){
    const loadingElem = document.querySelector('#example4');
    loadingElem.style.display = 'none';
    //document.querySelector('#main-menu').style.visibility = 'visible';
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
    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 0.5;
    //renderer.outputEncoding = THREE.sRGBEncoding;
    //renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    document.querySelector("#render-target").appendChild(renderer.domElement);
}

function initScene() {
    scene = new THREE.Scene();

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


window.onload = function () {
    init();
}
