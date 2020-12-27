import * as THREE from '../vendor/three-js/build/three.module.js';
import {PerspectiveCamera} from "../vendor/three-js/build/three.module.js";

let scene, renderer, camera;
let ambientLight,directionalLight;

function init() {
    scene = new THREE.Scene();

    camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 1;
    camera.rotation.x = 1.16;
    camera.rotation.y = -0.12;
    camera.rotation.z = 0.27;

    ambientLight = new THREE.AmbientLight(0x555555);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffeed);
    directionalLight.position.set(0,0,1);
    scene.add(directionalLight);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let loader = new THREE.TextureLoader();
    loader.load("../assets/textures/smoke-1.png", function (texture) {
       let cloudGeo = new THREE.PlaneBufferGeometry(500,500);
       let cloudMaterial = new THREE.MeshLambertMaterial({
               map: texture,
               transparent : true
           });

       for (let p=0; p < 25; p++){
           let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
           cloud.position.set(
               Math.random()*800-400,
               500,
               Math.random()*500-450
           );
           cloud.rotation.x = 1.16;
           cloud.rotation.y = -0.12;
           cloud.rotation.z = Math.random()*360;
           cloud.material.opacity = 0.6;
           scene.add(cloud);
       }
    });


}

init();
renderer.render(scene, camera);