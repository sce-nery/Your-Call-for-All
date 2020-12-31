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
        let sky = new Sky();
        this.scene.add(sky.skyDome);
        this.scene.add(sky.sunLight);
        sky.update();
        return sky;

    }

}


export {Environment}