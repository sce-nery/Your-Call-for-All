import * as THREE from '../../vendor/three-js/build/three.module.js';


class SkyController {
    constructor(sky) {
        this.sky = sky;
        this.sky.scale.setScalar(450000);

        this.sunPosition = new THREE.Vector3();

        this.properties = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            inclination: 0.49, // elevation / inclination
            azimuth: 0.25,     // Facing front,
            exposure: 0.5,
        }
    }

    update() {
        const uniforms = this.sky.material.uniforms;

        uniforms["turbidity"].value = this.properties.turbidity;
        uniforms["rayleigh"].value = this.properties.rayleigh;
        uniforms["mieCoefficient"].value = this.properties.mieCoefficient;
        uniforms["mieDirectionalG"].value = this.properties.mieDirectionalG;

        const theta = Math.PI * (this.properties.inclination - 0.5);
        const phi = 2 * Math.PI * (this.properties.azimuth - 0.5);

        this.sunPosition.x = Math.cos(phi);
        this.sunPosition.y = Math.sin(phi) * Math.sin(theta);
        this.sunPosition.z = Math.sin(phi) * Math.cos(theta);

        uniforms["sunPosition"].value.copy(this.sunPosition);
    }
}

export {SkyController};
