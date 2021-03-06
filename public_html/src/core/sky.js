import * as THREE from '../../vendor/three-js/build/three.module.js';
import {Sky as ThreeSky} from "../../vendor/three-js/examples/jsm/objects/Sky.js";
import {LinearInterpolator} from "../math/math.js";
import {GameObject} from "./objects.js";

class Sky extends GameObject {
    constructor(environment, props = {
        turbidity: 10,
        rayleigh: 3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.7,
        inclination: 0.75,  // 0.0: sunrise, 0.25: midday, 0.5: sunset, 0.75: midnight, 1.0: sunrise
        azimuth: 0.25,     // Facing front,
        exposure: 0.5,

    }) {
        super();
        this.environment = environment;

        this.skyDome = new ThreeSky();
        this.sunLight = new THREE.DirectionalLight(0xffffff);
        this.sunLight.castShadow = true;
        this.time = 0;
        this.tick = 0;
        this.props = props;
        this.skyDome.scale.setScalar(10000);
    }

    update(deltaTime) {
        this.time += deltaTime;
        this.tick += 1;
        const uniforms = this.skyDome.material.uniforms;

        this.updateInclination();

        if (this.tick % 120 === 0) {
            this.updateEnvironmentMap();
        }


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
        this.sunLight.color.set(LinearInterpolator.color(0xffffff, 0xfdb55e, amount));
        this.sunLight.visible = (!(this.props.inclination > 0.5 && this.props.inclination < 1.0));

        // Update fog:
        if (this.environment.scene.fog) {
            this.environment.scene.fog.color.set(LinearInterpolator.color(0xfdb55e, 0xa0afa0, this.environment.props.healthFactor));


            if (inclination > 0.5 && inclination < 1.0) {
                this.environment.scene.fog.color.set(0x000000);
            }
        }

    }

    updateInclination() {

        let dayCycle = 300; // 5min

        this.props.inclination = (this.time / dayCycle) % 1.0;

    }

    updateEnvironmentMap() {

        // Environment mapping:
        if (this.environment.owner.settings.environmentMappingEnabled) {

            this.environment.scene.environment = this.environment.owner.pmremGenerator.fromScene(this.skyDome).texture;

        } else {
            this.environment.scene.environment = null;
        }
    }
}

export {Sky};
