import {LinearInterpolator} from "../math/math.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";
import {Assets} from "./assets.js";
import {Water as ThreeWater} from "../../vendor/three-js/examples/jsm/objects/Water.js";
import {GameObject} from "./objects.js";


class Water extends  GameObject {
    constructor(environment) {
        super();

        this.environment = environment;

        const waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);

        Assets.Texture.Water_Normal.wrapS = Assets.Texture.Water_Normal.wrapT = THREE.RepeatWrapping;

        let waterMesh = new ThreeWater(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: Assets.Texture.Water_Normal,
                alpha: 0.95,
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 1.0,
                fog: this.environment.scene.fog !== undefined
            }
        );

        waterMesh.material.transparent = true;

        waterMesh.rotation.x = -Math.PI / 2;

        this.mesh = waterMesh;
    }

    update(deltaTime) {
        const health = this.environment.props.healthFactor;

        this.mesh.material.uniforms['time'].value += deltaTime / 2.0;
        this.mesh.material.uniforms['sunDirection'].value = this.environment.sky.sunLight.position.clone().negate();
        this.mesh.material.uniforms['sunColor'].value = this.environment.sky.sunLight.color;
        this.mesh.material.uniforms['waterColor'].value = new THREE.Color(LinearInterpolator.color(0xad7f00, 0x001e0f, health));
    }
}

export {Water};
