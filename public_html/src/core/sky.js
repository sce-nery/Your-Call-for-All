import * as THREE from '../../vendor/three-js/build/three.module.js';
import {lerpColor} from "../util/color.js";


class SkyController {
    constructor(sky) {
        this.sky = sky;
        this.sky.scale.setScalar(450000);

        this.sunLight = new THREE.DirectionalLight(0xffffff);
        this.sunLight.castShadow = true;

        this.props = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            inclination: 0.15,  // 0.0: sunrise, 0.25: midday, 0.5: sunset, 0.75: midnight, 1.0: sunrise
            azimuth: 0.25,     // Facing front,
            exposure: 0.5,
        }
    }

    update() {
        const uniforms = this.sky.material.uniforms;

        uniforms["turbidity"].value = this.props.turbidity;
        uniforms["rayleigh"].value = this.props.rayleigh;
        uniforms["mieCoefficient"].value = this.props.mieCoefficient;
        uniforms["mieDirectionalG"].value = this.props.mieDirectionalG;

        const theta = (Math.PI * 2) * (1.0 - this.props.inclination);
        const phi = 2 * Math.PI * (this.props.azimuth - 0.5);

        this.sunLight.position.set(
            Math.cos(phi),
            Math.sin(phi) * Math.sin(theta),
            Math.sin(phi) * Math.cos(theta)
        );

        uniforms["sunPosition"].value.copy(this.sunLight.position);

        const inclination = this.props.inclination;
        let amount = (Math.cos(inclination * 4 * Math.PI) + 1.0) / 2.0;
        this.sunLight.color.set(lerpColor(0xffffff,  0xfedb13, amount));
    }
}

export {SkyController};
