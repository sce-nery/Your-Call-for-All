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
      this.raf();
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

    raf() {
        requestAnimationFrame((t) => {
            if (this.previousRAF === null) {
                this.previousRAF = t;
            }

            this.raf();

            this.renderer.render(this.scene, this.camera);
            this.update(t - this.previousRAF);
            this.previousRAF = t;
        });
    }

    update(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;
        if (this.mixers) {
            this.mixers.map(m => m.update(timeElapsedS));
        }
        if (this.controls) {
            this.controls.Update(timeElapsedS);
        }
        this.thirdPersonCamera.Update(timeElapsedS);
    }

}


export {Character};