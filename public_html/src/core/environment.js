import {Terrain} from "./terrain.js";
import {FractalBrownianMotionHeightMap, HybridMultifractalHeightMap} from "./heightmap.js";
import {SimplexNoise} from "../../vendor/three-js/examples/jsm/math/SimplexNoise.js";
import {Sky} from "./sky.js";
import {Water} from "./water.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";
import {Color} from "../../vendor/three-js/build/three.module.js";
import {Assets} from "./assets.js";
import {LinearInterpolator} from "../math/math.js";
import {MersenneTwisterPRNG} from "../math/random.js";

class Environment {
    /**
     * Game object dealing with the environment objects like terrains, waters, sky,
     * trees, bushes, rocks and decision point objects
     *
     * @param yourCallForAll The owner game state
     * @param seed The integer number that will be used to create random number generator.
     * This seed number ensures that the same random numbers are generated. You can supply a different
     * scene to create different random number that will be used for terrain generation and object scattering.
     */
    constructor(yourCallForAll, seed) {
        this.owner = yourCallForAll;

        this.seed = seed;
        this.setupPRNG();

        this.scene = this.owner.scene;

        this.setupTerrain();
        this.setupSky();
        this.setupWater();

        this.props = {
            healthFactor: 0.0,
        }
        // this.scene.fog = new THREE.Fog(0xa0afa0, 100, 200);
    }

    /**
     * Initializes the random number generator with the supplied seed number.
     */
    setupPRNG() {
        this.prng = new MersenneTwisterPRNG(this.seed);
    }

    setupTerrain() {
        // Creates a noise provider with the random number generator we created earlier.
        let noise = new SimplexNoise(this.prng);

        // Creates a heightmap that will be used to create terrain.
        // heightMap.probe(x, z) will give the height (y) of the point (x, y, z).
        let heightMap = new HybridMultifractalHeightMap(noise, {
            zoom: 400,
            octaves: 8,
            lacunarity: 2,  // Normally, higher the lacunarity, smoother the terrain, but in this implementation, its the opposite.
                            // See also: https://www.classes.cs.uchicago.edu/archive/2015/fall/23700-1/final-project/MusgraveTerrain00.pdf
            noiseStrength: 10.0,
            heightOffset: -5.0,
            exaggeration: 1.0,
            hurstExponent: 0.25
        });
        // Creates a terrain object that will control terrain chunks.
        // terrain.loadChunks(position) will load 9 chunks around that position.
        this.terrain = new Terrain(this, heightMap, {chunkSize: 200});
    }

    setupSky() {
        let sky = new Sky(this, {
            turbidity: 10,
            rayleigh: 1,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            inclination: 0.39,  // 0.0: sunrise, 0.25: midday, 0.5: sunset, 0.75: midnight, 1.0: sunrise
            azimuth: 0.25,     // Facing front,
            exposure: 0.5,
        });
        this.scene.add(sky.skyDome);
        this.scene.add(sky.sunLight);
        this.sky = sky;
        sky.update();
    }

    setupWater() {
        let water = new Water(this);

        this.scene.add(water.mesh);

        this.water = water;

    }

    update(deltaTime) {
        this.water.update(deltaTime);
        this.sky.update(deltaTime);
        this.terrain.update(deltaTime);
    }

}


export {Environment}
