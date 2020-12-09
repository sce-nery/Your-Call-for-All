import * as THREE from '../vendor/three-js/build/three.module.js';
import Stats from "../vendor/stats.module.js";
import { createPerformanceMonitors } from 'util/debug.js';

let camera, scene, renderer;
let geometry, material, mesh;

let debugModeEnabled = true;

let monitors;

function initWindowEvents() {
    window.addEventListener('resize', onWindowResize, false);
}

function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    camera.position.z = 1;

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    initWindowEvents();

    if (debugModeEnabled) monitors = createPerformanceMonitors();

    render();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

function render() {
    if (debugModeEnabled) {
        monitors.begin();
    }

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render(scene, camera);

    if (debugModeEnabled) {
        monitors.end();
    }

    requestAnimationFrame(render);
}

// Initialize everything
init();
