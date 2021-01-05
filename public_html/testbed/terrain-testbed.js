import * as THREE from '../vendor/three-js/build/three.module.js';
import {GUI} from '../vendor/three-js/examples/jsm/libs/dat.gui.module.js';
import {createPerformanceMonitor} from "../src/util/debug.js";
import {MersenneTwisterPRNG} from "../src/math/random.js";
import {SimplexNoise} from "../vendor/three-js/examples/jsm/math/SimplexNoise.js";
import {FirstPersonControls} from "../vendor/three-js/examples/jsm/controls/FirstPersonControls.js";
import {OrbitControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";
import {Terrain} from "../src/core/terrain.js";
import {FractalHeightMap, HeightMap} from "../src/core/heightmap.js";
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

let clock;

let camera, scene, renderer, controls;

let yourCallForAll;

let stats;

let world;

let prng = new MersenneTwisterPRNG(111);

let noiseProvider = new SimplexNoise(prng);

let composer;

let cannonDebugRenderer;

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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // default THREE.PCFShadowMap
    document.body.appendChild(renderer.domElement);
}

function setupScene() {

    scene = new THREE.Scene();

    //const helper = new THREE.GridHelper(1000, 1000, 0xffffff, 0xffffff);
   // scene.add(helper);

    yourCallForAll = new YourCallForAll(scene);


    const geometry = new THREE.CylinderGeometry(0.375, 0.375, 1.75, 32, 1);
    const material = new THREE.MeshStandardMaterial({color: 0xffff00});
    physicsDemoMesh = new THREE.Mesh(geometry, material);
    physicsDemoMesh.receiveShadow = true;
    physicsDemoMesh.castShadow = true;
    physicsDemoMesh.position.set(0, 5, 0);
    scene.add(physicsDemoMesh);

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

let basicControls = {
    horizontalMove: 0,
    verticalMove: 0

}

function setupControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.movementSpeed = 50;
    controls.lookSpeed = 0.25;
    controls.freeze = true;

    document.addEventListener("keydown", function (event) {
        if (event.key === "w") {
            basicControls.verticalMove = -1.0;
        }
        if (event.key === "a") {
            basicControls.horizontalMove = -1.0;
        }
        if (event.key === "s") {
            basicControls.verticalMove = 1.0;
        }
        if (event.key === "d") {
            basicControls.horizontalMove = 1.0;
        }
    });

    document.addEventListener("keyup", function (event) {
        if (event.key === "w") {
            basicControls.verticalMove = 0.0;
        }
        if (event.key === "a") {
            basicControls.horizontalMove = 0.0;
        }
        if (event.key === "s") {
            basicControls.verticalMove = 0.0;
        }
        if (event.key === "d") {
            basicControls.horizontalMove = 0.0;
        }
    });
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
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 1.0, 0.2));

    stats = createPerformanceMonitor(document.body);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

let velocity = new THREE.Vector3();

function render() {
    let deltaTime = clock.getDelta();

    yourCallForAll.update(deltaTime);

    let lastPos = physicsDemoMesh.position.clone();

    physicsDemoMesh.position.x += basicControls.horizontalMove;
    physicsDemoMesh.position.z += basicControls.verticalMove;

    if (lastPos.x !== physicsDemoMesh.position.x || lastPos.z !== physicsDemoMesh.position.z) {
        yourCallForAll.environment.terrain.loadChunks(physicsDemoMesh.position);
    }

     let raycaster = new THREE.Raycaster(physicsDemoMesh.position, new THREE.Vector3(0, -1, 0));
     let intersects = raycaster.intersectObject(yourCallForAll.environment.terrain.centerMesh); //use intersectObjects() to check the intersection on multiple

    if (intersects[0] !== undefined) {
        let distance = 1.75 ;
        //new position is higher so you need to move you object upwards
        if (distance > intersects[0].distance) {
            physicsDemoMesh.position.y += (distance - intersects[0].distance) - 1; // the -1 is a fix for a shake effect I had
        }

        //gravity and prevent falling through floor
        if (distance >= intersects[0].distance && velocity.y <= 0) {
            velocity.y = 0;
        } else if (distance <= intersects[0].distance && velocity.y === 0) {
            velocity.y -= 0.1;
        }

        physicsDemoMesh.translateY(velocity.y);
    }

    controls.update(deltaTime);
    composer.render();


    stats.update();

    requestAnimationFrame(render);
}

window.onload = function () {
    init();

    document.getElementById("loading-label").remove();

    render();
}
