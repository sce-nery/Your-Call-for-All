import * as THREE from '../vendor/three-js/build/three.module.js';
import {GUI} from '../vendor/three-js/examples/jsm/libs/dat.gui.module.js';
import {createPerformanceMonitor} from "../src/util/debug.js";
import {MersenneTwisterPRNG} from "../src/math/random.js";
import {SimplexNoise} from "../vendor/three-js/examples/jsm/math/SimplexNoise.js";
import {FirstPersonControls} from "../vendor/three-js/examples/jsm/controls/FirstPersonControls.js";
import {OrbitControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";
import {Terrain} from "../src/core/terrain.js";
import {FractalBrownianMotionHeightMap, HeightMap, HybridMultifractalHeightMap} from "../src/core/heightmap.js";
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
import {Assets} from "../src/core/assets.js";
import {PointerLockControls} from "../vendor/three-js/examples/jsm/controls/PointerLockControls.js";
import {MapControls} from "../vendor/three-js/examples/jsm/controls/OrbitControls.js";

let clock;

let camera, scene, renderer, controls;

let ycfa;

let stats;

let world;

let prng = new MersenneTwisterPRNG(111);

let noiseProvider = new SimplexNoise(prng);

let composer;
let bloomPass;
let bokehPass;

let cannonDebugRenderer;

function setupCamera() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 2000000);
    camera.position.set(0, 30, 10);
}

function setupRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // These somehow break the water colour
    //renderer.outputEncoding = THREE.sRGBEncoding;
    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 0.5;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // default THREE.PCFShadowMap
    document.body.appendChild(renderer.domElement);
}

function setupScene() {

    scene = new THREE.Scene();

    //const helper = new THREE.GridHelper(1000, 1000, 0xffffff, 0xffffff);
    //helper.position.y = 1;
    //scene.add(helper);


    const geometry = new THREE.CylinderGeometry(0.375, 0.375, 1.75, 32, 1);
    const material = new THREE.MeshStandardMaterial({color: 0xffff00});
    physicsDemoMesh = new THREE.Mesh(geometry, material);
    physicsDemoMesh.receiveShadow = true;
    physicsDemoMesh.castShadow = true;
    physicsDemoMesh.position.set(0, 10, 0);
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

    controls = new MapControls(camera, renderer.domElement);

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

    setupCamera();

    setupRenderer();

    setupScene();

    setupControls();

    composer = new EffectComposer(renderer);
    let renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 1.0, 0.2);
    bloomPass.enabled = false;
    composer.addPass(bloomPass);

    stats = createPerformanceMonitor(document.body);

    window.addEventListener('resize', onWindowResize, false);

    Assets.load(function () {
        document.getElementById("loading-label").remove();
        ycfa = new YourCallForAll(scene);
        ycfa.environment.props.healthFactor = 1.0;
        initGUI();
        clock.start();
        render();
    });
}

function initGUI() {

    const gui = new GUI({width: 310});

    let seedChanged = function () {
        ycfa.environment.terrain.removeChunks();
        ycfa.environment.setupPRNG();
        ycfa.environment.terrain.heightMap.noiseProvider = new SimplexNoise(ycfa.environment.prng);
        ycfa.environment.terrain.loadChunks(physicsDemoMesh.position, true);
    }
    gui.add(ycfa.environment, "seed", 1, 10000, 1).onFinishChange(seedChanged);

    const terrainFolder = gui.addFolder("terrain")

    terrainFolder.add(ycfa.environment.terrain.props, "chunkSize", 10, 400, 1);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "zoom", 1, 1000, 1);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "octaves", 2, 256, 1);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "lacunarity", 0, 100, 0.1);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "noiseStrength", 1.0, 100.0, 0.1);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "heightOffset", -20.0, 20.0, 0.1);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "exaggeration", 1.0, 3.0, 0.001);
    terrainFolder.add(ycfa.environment.terrain.heightMap.props, "hurstExponent", 0.01, 1.0, 0.001);
    let button = {
        regenerate: function () {
            console.log("Regenerating...")
            ycfa.environment.terrain.makeAllChunksInactive();
            ycfa.environment.terrain.removeInactiveChunksFromScene();
            ycfa.environment.terrain.loadChunks(physicsDemoMesh.position, true);
        }
    };
    terrainFolder.add(button, 'regenerate');


    const skyFolder = gui.addFolder("sky")

    let skyUpdate = function () {
        ycfa.environment.sky.update();
    }

    skyFolder.add(ycfa.environment.sky.props, "inclination", 0.0, 1.0, 0.01).onChange(skyUpdate);
    skyFolder.add(ycfa.environment.sky.props, "turbidity", 0.0, 100.0, 0.01).onChange(skyUpdate);
    skyFolder.add(ycfa.environment.sky.props, "mieCoefficient", -0.01, 0.01, 0.00001).onChange(skyUpdate);
    skyFolder.add(ycfa.environment.sky.props, "mieDirectionalG", -1.4, 1.4, 0.00001).onChange(skyUpdate);
    skyFolder.add(ycfa.environment.sky.props, "azimuth", 0, 1, 0.001).onChange(skyUpdate);

    const envFolder = gui.addFolder("environment")

    envFolder.add(ycfa.environment.props, "healthFactor", 0, 1, 0.001);


    const bloomFolder = gui.addFolder("bloom");
    bloomFolder.add(bloomPass, "strength", 0.0, 3, 0.001);
    bloomFolder.add(bloomPass, "radius", 0.1, 1, 0.001);
    bloomFolder.add(bloomPass, "threshold", 0, 1, 0.0001);
    bloomFolder.add(bloomPass, "enabled", false, true);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

let velocity = new THREE.Vector3();

function render() {
    let deltaTime = clock.getDelta();

    let physicsDemoMeshVelocity = new THREE.Vector3();
    physicsDemoMeshVelocity.x = basicControls.horizontalMove * 0.5;
    physicsDemoMeshVelocity.z = basicControls.verticalMove * 0.5;

    physicsDemoMesh.position.x += physicsDemoMeshVelocity.x;
    physicsDemoMesh.position.z += physicsDemoMeshVelocity.z;

    let raycaster = new THREE.Raycaster(physicsDemoMesh.position, new THREE.Vector3(0, -1, 0));
    let intersects = raycaster.intersectObject(ycfa.environment.terrain.centerChunk.mesh); //use intersectObjects() to check the intersection on multiple

    if (intersects[0] !== undefined) {
        let distance = 1.75;
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

        physicsDemoMesh.translateY(physicsDemoMeshVelocity.y);
    }

    ycfa.update(deltaTime, physicsDemoMesh.position);

    composer.render();


    stats.update();

    requestAnimationFrame(render);
}

window.onload = function () {
    init();
}
