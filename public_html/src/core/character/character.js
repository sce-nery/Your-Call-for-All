import {BasicCharacterController} from "./character-controller.js";
import {ThirdPersonCameraController} from "./third-person-camera-controller.js";


class Character  {

    constructor(scene, camera) {
      this.scene = scene;
      this.camera = camera;

      this.mixers = [];

      this.loadAnimatedModel();
    }

    loadAnimatedModel() {
        this.controls = new BasicCharacterController(this.camera, this.scene);
        this.thirdPersonCamera = new ThirdPersonCameraController(this.camera, this.controls);
    }

    update(deltaTime, ycfa) {
        if (this.mixers) {
            this.mixers.map(m => m.update(deltaTime));
        }
        if (this.controls) {
            this.controls.Update(deltaTime, ycfa);
        }
        this.thirdPersonCamera.update(deltaTime);
    }

}


export {Character};
