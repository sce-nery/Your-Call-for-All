import {BasicCharacterController} from "./character-controller.js";
import {ThirdPersonCamera} from "./third-person-camera.js";


class Character  {

    constructor(scene, camera, renderer) {
      this.scene = scene;
      this.camera = camera;
      this.mixers = [];
      this.renderer = renderer;
      this.previousRAF = null;
      this.loadAnimatedModel();
    }

    loadAnimatedModel() {

        const params = {
            camera: this.camera,
            scene: this.scene,
        }

        this.controls = new BasicCharacterController(params);
        this.thirdPersonCamera = new ThirdPersonCamera({
            camera: this.camera,
            target: this.controls,
        });
    }

    update(timeElapsed) {
        if (this.mixers) {
            this.mixers.map(m => m.update(timeElapsed));
        }
        if (this.controls) {
            this.controls.Update(timeElapsed);
        }
        this.thirdPersonCamera.Update(timeElapsed);
    }

}


export {Character};