import {Terrain} from "./terrain.js";
import {FractalHeightMap} from "./heightmap.js";
import {SimplexNoise} from "../../vendor/three-js/examples/jsm/math/SimplexNoise.js";
import {Sky} from "./sky.js";

class Environment {
    constructor(scene, prng) {
        this.prng = prng;
        this.scene = scene;
        this.terrain = this.createTerrain();
        this.sky = this.createSky();
    }

    createTerrain() {
        let noise = new SimplexNoise(this.prng);
        let heightMap = new FractalHeightMap(noise, {octaves: 8, lacunarity: 200, persistence: 9.5});
        return new Terrain(this.scene, heightMap, {chunkSize: 100});
    }

    createSky() {
        let skyProps = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            inclination: 0.49,  // 0.0: sunrise, 0.25: midday, 0.5: sunset, 0.75: midnight, 1.0: sunrise
            azimuth: 0.25,     // Facing front,
            exposure: 0.5,
        }
        let sky = new Sky(skyProps);
        this.scene.add(sky.skyDome);
        this.scene.add(sky.sunLight);
        sky.update();
        return sky;

    }

    update(){

    }

}


export {Environment}