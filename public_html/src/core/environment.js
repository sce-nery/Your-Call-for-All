import {Terrain} from "./terrain.js";
import {HybridMultifractalHeightMap} from "./heightmap.js";
import {SimplexNoise} from "../../vendor/three-js/examples/jsm/math/SimplexNoise.js";
import {Sky} from "./sky.js";
import {Water} from "./water.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";
import {MersenneTwisterPRNG} from "../math/random.js";
import {Octree} from "../../vendor/three-js/examples/jsm/math/Octree.js";
import {KdTree} from "../datastructures/k-d-tree.js";
import {DecisionPoint} from "./decision-points.js";

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
        this.props = {
            healthFactor: 0.1,
            drawDistance: 100,
        }

        this.owner = yourCallForAll;

        this.seed = seed;
        this.setupPRNG();

        this.scene = this.owner.scene;

        this.scene.fog = new THREE.Fog(0xa0afa0, 0, this.props.drawDistance * 2);

        const light = new THREE.AmbientLight(0x404040); // soft white light
        this.scene.add(light);

        // All game objects
        this.objects = [];

        this.setupDecisionPointsKdTree();

        this.setupTerrain();
        this.setupSky();
        this.setupWater();

        this.lastPlayerPos = null;
    }

    getHealth() {
        return this.props.healthFactor;
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
        this.terrain = new Terrain(this, heightMap, {chunkSize: 100});
    }

    setupSky() {
        let sky = new Sky(this, {
            turbidity: 10,
            rayleigh: 1,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            inclination: 0.42,  // 0.0: sunrise, 0.25: midday, 0.5: sunset, 0.75: midnight, 1.0: sunrise
            azimuth: 0.25,     // Facing front,
            exposure: 0.5,
        });
        this.scene.add(sky.skyDome);
        this.scene.add(sky.sunLight);

        this.sky = sky;
    }

    setupWater() {
        let water = new Water(this);

        this.scene.add(water.mesh);

        this.water = water;
    }

    setupDecisionPointsKdTree() {
        const distance = function (a, b) {
            return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.z - b.z) * (a.z - b.z));
        };

        this.decisionPointsKdTree = new KdTree([], distance, ["x", "z"]);
    }

    rebuildDecisionPointsKdTree() {
        const distance = function (a, b) {
            return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.z - b.z) * (a.z - b.z));
        };

        let kdTreeDecisionPointElements = []
        for (let i = 0; i < this.objects.length; i++) {
            let object = this.objects[i];
            if (object instanceof DecisionPoint) {
                let element = object.model.position;
                element.decisionPoint = object;
                kdTreeDecisionPointElements.push(element);
            }
        }

        this.decisionPointsKdTree = new KdTree(kdTreeDecisionPointElements, distance, ["x", "z"]);
    }


    getNearestDecisionPoint(position, diameter) {
        let queryResults = this.decisionPointsKdTree.nearest(position, 1, diameter * diameter);
        if (queryResults.length > 0) return queryResults[0];
        else return null;
    }

    update(deltaTime, playerPosition) {
        this.water.update(deltaTime);
        this.sky.update(deltaTime);
        this.terrain.update(deltaTime, playerPosition);

        if (this.lastPlayerPos === null || this.lastPlayerPos.distanceTo(playerPosition) > 0.5) {
            console.debug(`Player moved to: (${playerPosition.x},${playerPosition.y},${playerPosition.z})`)
            this.terrain.loadChunks(playerPosition);
            this.lastPlayerPos = playerPosition.clone();
        }

        this.updateObjects(deltaTime, playerPosition);
    }

    updateObjects(deltaTime, playerPosition) {

        for (let i = 0; i < this.objects.length; i++) {
            const object = this.objects[i];

            if (object.isInScene) {
                if (!this.isObjectWithinDrawDistance(object, playerPosition) || !this.isEnvironmentHealthWithinObjectRange(object)) {
                    this.removeObjectFromScene(object);
                }
            } else {
                if (this.isObjectWithinDrawDistance(object, playerPosition) && this.isEnvironmentHealthWithinObjectRange(object)) {
                    this.addObjectToScene(object);
                }
            }


            if (object.isInScene) {
                if (object instanceof DecisionPoint) {
                    object.update(deltaTime, playerPosition);
                } else if (object.update !== undefined) {
                    object.update(deltaTime);
                }
            }

        }

    }

    isObjectWithinDrawDistance(object, playerPosition) {
        return object.model.position.distanceTo(playerPosition) <= this.props.drawDistance;
    }

    isEnvironmentHealthWithinObjectRange(object) {
        if (!object.healthRange) return true;
        const environmentHealth = this.getHealth()
        return environmentHealth >= object.healthRange.min && environmentHealth <= object.healthRange.max;
    }

    removeObjectFromScene(object) {
        this.scene.remove(object.model);
        object.isInScene = false;
    }

    removeBadObject(decisionPoint) {
        this.removeObjectFromScene(decisionPoint);

        decisionPoint.model.remove(decisionPoint.label);

        this.objects = this.objects.filter(item => item.model.uuid !== decisionPoint.model.uuid);

        this.rebuildDecisionPointsKdTree();

        this.props.healthFactor -= decisionPoint.healthInfluence;

        // Boundary check
        this.props.healthFactor = Math.min(1.0, Math.max(0.0, this.props.healthFactor));
    }

    addObjectToScene(object) {
        this.scene.add(object.model);
        object.isInScene = true;
    }

    insertDecisionPointToKdTree(decisionPoint) {
        decisionPoint.model.position.decisionPoint = decisionPoint;
        this.decisionPointsKdTree.insert(decisionPoint.model.position);
    }

    regenerateOctree(groundMesh) {
        this.owner.worldOctree = new Octree();
        this.owner.worldOctree.fromGraphNode(groundMesh);
    }

    regenerate() {
        for (let i = 0; i < this.objects.length; i++) {
            this.scene.remove(this.objects[i].model);
        }
        this.objects = [];

        this.terrain.makeAllChunksInactive();
        this.terrain.removeInactiveChunksFromScene();
        this.setupTerrain();
    }
}


export {Environment}
