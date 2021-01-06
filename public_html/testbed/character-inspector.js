import * as THREE from '../vendor/three-js/build/three.module.js';

import {
    Character,
    CharacterController,
    CharacterControllerKeyboardInput
} from '../src/core/character.js';
import {GUI} from '../vendor/three-js/examples/jsm/libs/dat.gui.module.js';

import {OrbitControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";
import Stats from "../vendor/stats.module.js";
import * as ASSETS from "../src/core/assets.js";

let scene, renderer, camera, stats;
let model, skeleton, clock;

const crossFadeControls = [];

let settings;

let character;
let characterController;

function init() {

    const container = document.getElementById('container');

    clock = new THREE.Clock();

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

    // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 100, 0);
    controls.update();

    stats = new Stats();
    container.appendChild(stats.domElement);

    window.addEventListener('resize', onWindowResize, false);

    ASSETS.load().then(function () {
        character = new Character(ASSETS.AssetMap["MoCapManGLTFModel"]);
        characterController = new CharacterController(character, new CharacterControllerKeyboardInput());

        model = character.model;

        model.scale.setScalar(100);
        scene.add(model);

        skeleton = new THREE.SkeletonHelper(model);
        skeleton.visible = false;
        scene.add(skeleton);

        createPanel();

        character.activateAllActions();

        animate();
    });

}

function createPanel() {

    const panel = new GUI({width: 310});

    const folder1 = panel.addFolder('Visibility');

    settings = {
        'show model': true,
        'show skeleton': false
    };

    folder1.add(settings, 'show model').onChange(showModel);
    folder1.add(settings, 'show skeleton').onChange(showSkeleton);

}


function showModel(visibility) {

    model.visible = visibility;

}


function showSkeleton(visibility) {

    skeleton.visible = visibility;

}


function modifyTimeScale(speed) {

    mixer.timeScale = speed;

}


function deactivateAllActions() {

    actions.forEach(function (action) {

        action.stop();

    });

}

function activateAllActions() {

    setWeight(idleAction, settings['modify idle weight']);
    setWeight(walkAction, settings['modify walk weight']);
    setWeight(runAction, settings['modify run weight']);

    actions.forEach(function (action) {

        action.play();

    });

}

function pauseContinue() {

    if (idleAction.paused) {

        unPauseAllActions();

    } else {

        pauseAllActions();

    }

}

function pauseAllActions() {

    actions.forEach(function (action) {

        action.paused = true;

    });

}

function unPauseAllActions() {

    actions.forEach(function (action) {

        action.paused = false;

    });

}

function prepareCrossFade(startAction, endAction, defaultDuration) {

    // Switch default / custom crossfade duration (according to the user's choice)

    const duration = setCrossFadeDuration(defaultDuration);

    // Make sure that we don't go on in singleStepMode, and that all actions are unpaused

    unPauseAllActions();

    // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
    // else wait until the current action has finished its current loop

    if (startAction === idleAction) {

        executeCrossFade(startAction, endAction, duration);

    } else {

        synchronizeCrossFade(startAction, endAction, duration);

    }

}

function setCrossFadeDuration(defaultDuration) {

    // Switch default crossfade duration <-> custom crossfade duration

    if (settings['use default duration']) {

        return defaultDuration;

    } else {

        return settings['set custom duration'];

    }

}

function synchronizeCrossFade(startAction, endAction, duration) {

    mixer.addEventListener('loop', onLoopFinished);

    function onLoopFinished(event) {

        if (event.action === startAction) {

            mixer.removeEventListener('loop', onLoopFinished);

            executeCrossFade(startAction, endAction, duration);

        }

    }

}

function executeCrossFade(startAction, endAction, duration) {

    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)

    setWeight(endAction, 1);
    endAction.time = 0;

    // Crossfade with warping - you can also try without warping by setting the third parameter to false

    startAction.crossFadeTo(endAction, duration, true);

}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))
function setWeight(action, weight) {

    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    // Render loop

    stats.begin();

    // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)
    let mixerUpdateDelta = clock.getDelta();

    characterController.update(mixerUpdateDelta);

    renderer.render(scene, camera);

    stats.end();


    requestAnimationFrame(animate);
}

window.onload = function () {
    Logger.useDefaults();
    Logger.debug("Initializing");
    init();
}
