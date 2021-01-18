import {CharacterController} from "./character-controller.js";
import {ThirdPersonCameraController} from "./third-person-camera-controller.js";
import {Assets} from "../assets.js";
import * as THREE from "../../../vendor/three-js/build/three.module.js";
import {Capsule} from "../../../vendor/three-js/examples/jsm/math/Capsule.js";
import {FlashLight, StaticObject} from "../objects.js";


class Character {

    constructor(ycfa) {

        this.owner = ycfa;
        this.scene = ycfa.scene;
        this.camera = ycfa.camera;
        this.spotLight=  new THREE.SpotLight( 0xffffff );

        this.gltf = Assets.glTF.Jackie;
        this.model = this.gltf.scene;
        this.animations = this.gltf.animations;

        this.collider = new Capsule(new THREE.Vector3(0, 0.0, 0), new THREE.Vector3(0, 1.60, 0), 0.35);

        this.mixer = new THREE.AnimationMixer(this.model);
        this.flashlight = new StaticObject(Assets.glTF.FlashLight);

        this.setupActions();
        this.setupShadows();

        this.setupControllers();
        this.getSpotlight();
    }

    setupControllers() {
        this.controller = new CharacterController(this);
        this.cameraController = new ThirdPersonCameraController(this);

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

    update(deltaTime, ycfa) {
        this.controller.update(deltaTime, ycfa);
        this.cameraController.update(deltaTime);
        this.mixer.update(deltaTime);
        if(true){
        this.spotLight.position.set(this.model.position.x,this.model.position.y, this.model.position.z);
        //this.spotLight.target.position.set(this.cameraController.currentLookAt.x,this.cameraController.currentLookAt.y-1.0,this.cameraController.currentLookAt.z);
        let target = this.cameraController.calculateIdealCameraTarget();
        //console.log("target:"+target.y);
          //  console.log("model:"+this.model.position.y);
        this.spotLight.target.position.set(target.x,target.y-1.0,target.z);
        //this.spotLight.target.rotateY(90);
        //console.log("lookat:"+this.cameraController.currentLookAt.y);
        this.scene.add( this.spotLight.target);
        this.scene.add(this.spotLight);
            this.flashlight.model.position.set(this.model.position.x+0.2,this.model.position.y+0.64,this.model.position.z+0.1);
            this.flashlight.model.scale.set(0.03,0.03,0.03);
            //this.flashlight.model.position.set(0.2,0.64,0.1);
            //this.flashlight.model.rotateX(1);
            //this.flashlight.model.rotateY(1);
            //this.flashlight.model.position.set(this.flashlight.model.position.x+this.model.position.x,this.flashlight.model.position.y+this.model.position.y,this.flashlight.model.position.z+this.model.position.z)
            this.flashlight.model.rotation.y=this.model.quaternion.w;
           // console.log(this.model.quaternion);
            this.owner.environment.objects.push(this.flashlight);
        }
    }
    getSpotlight(){
        //const spotLight = new THREE.SpotLight( 0xffffff );
        this.spotLight.position.set( this.model.position.x,this.model.position.y-1, this.model.position.z);
        this.spotLight.castShadow = true;
        this.spotLight.shadow.mapSize.width = 1024;
        this.spotLight.shadow.mapSize.height = 1024;
        this.spotLight.distance=150.0;
        this.spotLight.decay = 2.0;
        this.spotLight.shadow.camera.near = 500;
        this.spotLight.shadow.camera.far = 4000;
        this.spotLight.shadow.camera.fov = 30;
        this.spotLight.angle=Math.PI/7;
        this.spotLight.target.position.set(this.cameraController.currentLookAt.x,this.cameraController.currentLookAt.y,this.cameraController.currentLookAt.z);
        this.scene.add( this.spotLight.target );

    }

}


export {Character};
