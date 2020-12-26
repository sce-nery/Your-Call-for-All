import * as THREE from '../../vendor/three-js/build/three.module.js';


class SkyController {
    constructor(sky) {
        this.sky = sky;
        this.sky.scale.setScalar(450000);

        this.sunLight = new THREE.DirectionalLight(0xffffff);
        this.sunLight.castShadow = true;

        this.properties = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            inclination: 0.5,  // 0.0: -Z, 0.25: midday, 0.5: +Z, 0.75: midnight, 1.0: -Z
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

        const theta = (Math.PI * 2) * (1.0 - this.properties.inclination);
        const phi = 2 * Math.PI * (this.properties.azimuth - 0.5);

        this.sunLight.position.set(
            Math.cos(phi),
            Math.sin(phi) * Math.sin(theta),
            Math.sin(phi) * Math.cos(theta)
        );

        uniforms["sunPosition"].value.copy(this.sunLight.position);
    }
}

export {SkyController};
