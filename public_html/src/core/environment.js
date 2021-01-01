import {Terrain} from "./terrain.js";
import {FractalHeightMap} from "./heightmap.js";
import {SimplexNoise} from "../../vendor/three-js/examples/jsm/math/SimplexNoise.js";
import {Sky} from "./sky.js";
import {Water} from "../../vendor/three-js/examples/jsm/objects/Water.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";

class Environment {
    constructor(scene, prng) {
        this.prng = prng;
        this.scene = scene;
        this.terrain = this.createTerrain();
        this.sky = this.createSky();
        this.water = this.createWater();
    }

    createTerrain() {
        let noise = new SimplexNoise(this.prng);
        let heightMap = new FractalHeightMap(noise, {octaves: 8, lacunarity: 200, persistence: 9.5});
        return new Terrain(this.scene, heightMap, {chunkSize: 200});
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

    createWater(){
        const waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );

        let water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load( './assets/textures/water/waternormals.jpg', function ( texture ) {

                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                } ),
                alpha: 1.0,
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: this.scene.fog !== undefined
            }
        );

        water.rotation.x = - Math.PI / 2;
        this.scene.add(water);
        return water;

    }

    update(){
        this.water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
    }

}


export {Environment}