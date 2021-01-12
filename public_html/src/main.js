import {YourCallForAll} from "./core/your-call-for-all.js";
import * as THREE from "../vendor/three-js/build/three.module.js";
import {EffectComposer} from "../vendor/three-js/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../vendor/three-js/examples/jsm/postprocessing/RenderPass.js";
import {Assets} from "./core/assets.js";
import {createPerformanceMonitor} from "./util/debug.js";
import {UnrealBloomPass} from "../vendor/three-js/examples/jsm/postprocessing/UnrealBloomPass.js";
import {GameAudio} from "./core/audio.js";
import {Character} from "./core/character/character.js";


let settings = {
    useGridHelper: false,
    useBloom: false,
    usePerformanceMonitor: false,
}


let yourCallForAll;
let clock;
let camera, scene, renderer, composer;
let stats;
let audio;


const startButton = document.getElementById( 'overlay' );
startButton.addEventListener( 'click', addAudio );


function addAudio(){
    audio = new GameAudio(scene, camera);
}

let spotLight, lightHelper;

function init() {
    Assets.load(() => {
        removeLoadingBar();
        clock = new THREE.Clock();
        initCamera();
        initListeners();
        initScene();
        initRenderer();
        yourCallForAll = new YourCallForAll(scene, camera);
        clock.start();
        applySettings();


        spotLight = new THREE.SpotLight( 0xffffff, 1 );

        spotLight.position.set( -20, 5, 0 );
        spotLight.angle = Math.PI / 8;
        spotLight.penumbra = 0.1;
        spotLight.decay = 1;
        spotLight.distance = 200;

        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 512;
        spotLight.shadow.mapSize.height = 512;
        spotLight.shadow.camera.near = 0.5;
        spotLight.shadow.camera.far = 200000;
        spotLight.shadow.focus = 1;
        scene.add( spotLight );

        lightHelper = new THREE.SpotLightHelper( spotLight );
        scene.add( lightHelper );

        render();

    });
}


function render() {
    let deltaTime = clock.getDelta();
    if (stats) {stats.update();}

    yourCallForAll.update(deltaTime);
    renderer.toneMappingExposure = yourCallForAll.environment.sky.props.exposure;

    let a = yourCallForAll.character.model.position;
    spotLight.position.set(a.x,a.y + 2,a.z);
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
    const loadingElem = document.querySelector('#loading');
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


window.onload = function () {
    init();
}