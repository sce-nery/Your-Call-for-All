import {CharacterController} from "./character-controller.js";
import {ThirdPersonCameraController} from "./third-person-camera-controller.js";
import {Assets} from "../assets.js";
import * as THREE from "../../../vendor/three-js/build/three.module.js";
import {CSS2DObject} from "../../../vendor/three-js/examples/jsm/renderers/CSS2DRenderer.js";
import {CSS2DRenderer} from "../../../vendor/three-js/examples/jsm/renderers/CSS2DRenderer.js";


class Character {

    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.gltf = Assets.glTF.Jackie;
        this.model = this.gltf.scene;
        this.animations = this.gltf.animations;

        this.scene.add(this.model);

        this.mixer = new THREE.AnimationMixer(this.model);

        this.setupActions();
        this.setupShadows();

        this.setupControllers();


        //const moonDiv = document.createElement( 'div' );
        //moonDiv.className = 'label';
        ////moonDiv.style.marginTop = '-1em';
        //const moonLabel = new CSS2DObject( moonDiv );
        //moonLabel.position.set( 0, this.model.position.y + 1.5, 0 );
        //this.model.add( moonLabel );

        //this.labelRenderer = new CSS2DRenderer();
        //this.labelRenderer.setSize( window.innerWidth, window.innerHeight );
        //this.labelRenderer.domElement.style.position = 'absolute';
        //this.labelRenderer.domElement.style.top = '0px';
        //document.body.appendChild( this.labelRenderer.domElement );
        //this.labelRenderer.setSize( window.innerWidth, window.innerHeight );
    }

    setupControllers() {
        this.controller = new CharacterController(this);
        this.cameraController = new ThirdPersonCameraController(this);
    }

    update(deltaTime, ycfa) {
        //this.labelRenderer.render( this.scene, this.camera );
        this.controller.update(deltaTime, ycfa);
        this.cameraController.update(deltaTime);

        this.mixer.update(deltaTime);
    }


    setupActions() {
        const animations = this.animations;
        let actionList = [];

        for (let i = 0; i < animations.length; i++) {
            actionList.push(this.mixer.clipAction(animations[i]));
        }

        this.actionList = actionList;

        this.actionMap = actionList.reduce(function (map, obj) {
            obj.paused = false;
            map[obj._clip.name] = obj;
            return map;
        }, {});
    }

    setupShadows() {
        this.model.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }

}


export {Character};
