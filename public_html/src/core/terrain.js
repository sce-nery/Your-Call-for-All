import * as THREE from "../../vendor/three-js/build/three.module.js";
import TextureUtils from "../util/texture-utils.js";
import {Assets} from "./assets.js";
import {AnimatedObject} from "./animatedObject.js";
import {BrokenBottle} from "./decision-points.js";
import {GameObject} from "./objects.js";

import {StaticObject} from "./bushes-rocks.js";

class Terrain {

    /**
     * A Terrain object that will control terrain chunks.
     * Terrain chunks are generated according to the supplied heightmap object.
     *
     * @param environment The Environment instance that this terrain belongs to.
     * @param heightMap Heightmap supplier of this terrain.
     * @param props Properties such as chunk size.
     */
    constructor(environment, heightMap, props = {
        chunkSize: 256
    }) {
        this.environment = environment;
        this.scene = environment.scene;
        this.props = props;
        this.heightMap = heightMap;

        // The cache that will contain generated terrain chunks. So after removing a chunk from the scene,
        // we can load it faster.
        // TODO: Note that, currently, these chunks won't get deleted, so after playing a while, the memory usage can reach
        //  gigabytes. Intelligently remove far away chunks so that the memory won't suffer.
        this.chunks = {};

        // TerrainChunk object that currently at the center of the whole terrain.
        // Typically, this mesh would be the one that character is on top. So, any raycasting or
        // physics operations regarding the character should be made on this chunk's mesh object.
        this.centerChunk = undefined;

        this.loadChunks(new THREE.Vector3());
    }

    /**
     * Loads 9 chunks centered around the given position.
     *
     * @param position Generally, the character's position.
     * @param purgeCache Whether to remove cache before loading.
     */
    loadChunks(position, purgeCache = false) {
        if (purgeCache) {
            this.makeAllChunksInactive();
            this.removeInactiveChunksFromScene();
            this.chunks = {};
        }

        const chunkSize = this.props.chunkSize;

        let k = (position.x) / chunkSize;
        let l = ((-position.z)) / chunkSize;

        k = Math.round(k);
        l = Math.round(l);

        let chunkPosition = new THREE.Vector3(
            chunkSize * k,
            0,
            chunkSize * l
        );

        let chunkOffsets = [
            new THREE.Vector2(chunkPosition.x, chunkPosition.z),
            new THREE.Vector2(chunkPosition.x, chunkPosition.z - chunkSize),
            new THREE.Vector2(chunkPosition.x, chunkPosition.z + chunkSize),
            new THREE.Vector2(chunkPosition.x - chunkSize, chunkPosition.z),
            new THREE.Vector2(chunkPosition.x + chunkSize, chunkPosition.z),
            new THREE.Vector2(chunkPosition.x - chunkSize, chunkPosition.z - chunkSize),
            new THREE.Vector2(chunkPosition.x + chunkSize, chunkPosition.z + chunkSize),
            new THREE.Vector2(chunkPosition.x - chunkSize, chunkPosition.z + chunkSize),
            new THREE.Vector2(chunkPosition.x + chunkSize, chunkPosition.z - chunkSize),
        ];

        this.makeAllChunksInactive();

        let previousCenterChunk = this.centerChunk;
        this.centerChunk = this.createChunk(chunkOffsets[0]);
        for (let i = 1; i < chunkOffsets.length; i++) {
            this.createChunk(chunkOffsets[i]);
        }

        this.removeInactiveChunksFromScene();
        this.addActiveChunksToScene();

        if ((!previousCenterChunk) || previousCenterChunk.mesh.uuid !== this.centerChunk.mesh.uuid) {
            this.environment.owner.worldOctree.fromGraphNode(this.centerChunk.mesh);
        }
    }

    makeAllChunksInactive() {
        for (let key in this.chunks) {
            this.chunks[key].isActive = false;
        }
    }

    /**
     * Removes inactive chunks from the scene in order to improve FPS.
     */
    removeInactiveChunksFromScene() {
        for (let key in this.chunks) {
            let chunk = this.chunks[key];
            if (!chunk.isActive && chunk.isInScene) {
                this.scene.remove(chunk.mesh);
                chunk.isInScene = false;
            }
        }
    }

    addActiveChunksToScene() {
        for (let key in this.chunks) {
            let chunk = this.chunks[key];
            if (chunk.isActive && !chunk.isInScene) {
                this.scene.add(chunk.mesh);
                chunk.isInScene = true;
            }
        }
    }

    /**
     * Creates a chunk if not exists, or makes it active, at the given position.
     *
     * @param offset The position of the chunk (Vector2).
     * For a point (x,y,z) in world space, this offset is (x,z), because y is the height component,
     * and we are using Y-up coordinate system.
     *
     * @returns {TerrainChunk} The chunk object.
     */
    createChunk(offset) {
        let chunk;
        let key = `(${offset.x},${offset.y})`;

        if (key in this.chunks) {
            // If the chunk is already found on the cache
            chunk = this.chunks[key];
            chunk.isActive = true;
            console.debug(`Found chunk in cache: ${key}`);
        } else {
            // If the chunk is not found on the cache, create a new one.
            // Sample height data from the heightmap. This is a matrix of vertex positions in 3D.
            let heightData = this.heightMap.sample(this.props.chunkSize, this.props.chunkSize, offset.x, offset.y);
            chunk = new TerrainChunk(this.environment, this.props.chunkSize, new THREE.Vector3(offset.x, 0, offset.y), heightData);
            chunk.isActive = true;
            console.debug(`Creating new chunk: ${key}`);
            // Store this chunk in the cache.
            this.chunks[key] = chunk;
        }

        return chunk;
    }

    update(deltaTime, playerPosition) {
        for (let key in this.chunks) {
            let chunk = this.chunks[key];
            if (chunk.isActive) {
                chunk.update(deltaTime, playerPosition);
            }
        }
    }
}

class TerrainChunk extends GameObject {
    constructor(environment, chunkSize, chunkPosition, heightData) {
        super();

        this.environment = environment;
        this.chunkSize = chunkSize;
        this.chunkPosition = chunkPosition;
        this.heightData = heightData;

        this.isActive = false;

        this.setupChunkGeometry();
        this.setupChunkMaterial();
        this.setupChunkMesh();
    }

    setupChunkMaterial() {
        // Retrieve textures.
        // TODO: This material should change based on the health of the environment.
        //let healthyGrassColorMap = Assets.Texture.Ground1_Color;
        //let healthyGrassNormalMap = Assets.Texture.Ground1_Normal;

        //TextureUtils.makeRepeating(healthyGrassColorMap, this.chunkSize, this.chunkSize);
        //TextureUtils.makeRepeating(healthyGrassNormalMap, this.chunkSize, this.chunkSize);

        //let mediumHealthGroundColorMap = Assets.Texture.Ground2_Color;
        //let mediumHealthGroundNormalMap = Assets.Texture.Ground2_Normal;

        //TextureUtils.makeRepeating(mediumHealthGroundColorMap, this.chunkSize, this.chunkSize);
        //TextureUtils.makeRepeating(mediumHealthGroundNormalMap, this.chunkSize, this.chunkSize);

        let t1 = Assets.Texture.Sand_Color;
        let t2 = Assets.Texture.Grass_Color;
        let t3 = Assets.Texture.Rocks_Color;
        let t4 = Assets.Texture.Snow_Color;

        TextureUtils.makeRepeating(t1, this.chunkSize/2, this.chunkSize/2);
        TextureUtils.makeRepeating(t2, this.chunkSize/2, this.chunkSize/2);
        TextureUtils.makeRepeating(t3, this.chunkSize/2, this.chunkSize/2);
        TextureUtils.makeRepeating(t4, this.chunkSize/2, this.chunkSize/2);

        this.material = TextureUtils.generateBlendedMaterial([
            // The first texture is the base; other textures are blended in on top.
            {texture: t1},
            // Start blending in at height -80; opaque between -35 and 20; blend out by 50
            {texture: t2, levels: [0, 3, 10, 20]},
            {texture: t3, levels: [10, 20, 22, 25]},
            {texture: t4, levels: [22, 25, 2000, 3000]},
            // How quickly this texture is blended in depends on its x-position.
            {texture: t4, glsl: '1.0 - smoothstep(65.0 + smoothstep(-256.0, 256.0, vPosition.x) * 10.0, 80.0, vPosition.z)'},
            // Use this texture if the slope is between 27 and 45 degrees
            {texture: t3, glsl: 'slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2'},
        ]);

    }

    setupChunkGeometry() {
        this.geometry = new THREE.PlaneBufferGeometry(
            this.chunkSize,
            this.chunkSize,
            this.chunkSize,
            this.chunkSize,
        );

        // Fills vertex data of this mesh based on the received height data.
        let heightMatrix = this.heightData;
        for (let i = 0; i <= this.chunkSize; i++) {
            for (let j = 0; j <= this.chunkSize; j++) {
                let data = heightMatrix[i][j];

                let index = (i * (this.chunkSize + 1) + j) * 3;

                // Because we are directly setting vertices, transformations will be based
                // on the global origin instead of the mesh itself, so be careful.
                this.geometry.attributes.position.array[index] = data.x;
                this.geometry.attributes.position.array[index+1] = data.y;

                // Set height
                // This is normally the Y component but we are going to rotate the terrain along z-axis by -90 degrees
                this.geometry.attributes.position.array[index+2] = data.height;

                let candidatePosition = new THREE.Vector3();
                candidatePosition.x = data.x;
                candidatePosition.y = data.height;
                candidatePosition.z = -data.y; // Because we are rotating z-axis of the terrain by -90 deg.
                // TODO: Maybe calculate the slope of the vertex too?

                this.scatterTrees(candidatePosition);
                this.scatterRocks(candidatePosition);
                this.scatterBushes(candidatePosition);

                // Decision points:
                this.scatterDecisionPoints(candidatePosition);
            }
        }

        console.debug(`Created ${this.environment.objects.length} objects.`);

        this.geometry.verticesNeedUpdate = true;
        this.geometry.computeVertexNormals();
    }

    scatterTrees(candidatePosition) {
        function getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
        }

        let random = this.environment.prng.random();
        if (candidatePosition.y > -1 && candidatePosition.y < 0) { // Height check
            if (random * 100 < 0.1) { // %0.1 of the time.

                let tree = new AnimatedObject(Assets.glTF.FrogOnLeaf);
                tree.model.position.set(candidatePosition.x, 0, candidatePosition.z);
                let scale = getRandomArbitrary(0.3,0,6);
                tree.model.scale.set(scale, scale, scale);
                tree.healthFactor=1.0;

                // Sets the wind animation for play.
                tree.playActionByIndex(0);

                this.environment.objects.push(tree);

            } else if (random * 100 > 1.7 && random * 100 < 1.8) { // %0.1 of the time.

                let tree = new AnimatedObject(Assets.glTF.Shark);
                tree.model.position.set(candidatePosition.x, -0.5, candidatePosition.z);
                let scale = getRandomArbitrary(0.7,0,9);
                tree.model.scale.set(scale, scale, scale);
                tree.healthFactor=1.0;

                // Sets the wind animation for play.
                tree.playActionByIndex(0);

                this.environment.objects.push(tree);

            }


        }
        if (candidatePosition.y > 1 && candidatePosition.y < 10) { // Height check
            /*
                        if (random * 100 < 0.1) { // %0.1 of the time.

                                let tree = new Tree(Assets.glTF.PinkTree);
                                tree.model.position.set(position.x, position.y, position.z);

                                tree.model.scale.set(0.3, 0.3, 0.3);

                                // Sets the wind animation for play.
                                tree.playActionByIndex(0);

            if (candidatePosition.y > 1 && candidatePosition.y < 10) { // Height check
                                this.trees.push(tree);

                        }*/
            /*else*/
            /*if (random * 100 > 0.1 && random * 100 < 0.2) { // %0.1 of the time.

                let tree = new Tree(Assets.glTF.TwoTrees);
                tree.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                tree.model.scale.set(0.03, 0.03, 0.03);
                tree.healthFactor = 1.0;
                // Sets the wind animation for play.
                tree.playActionByIndex(0);

                this.environment.objects.push(tree);


            }*/
            if (random * 100 > 1.7 && random * 100 < 1.8) { // %0.1 of the time.

                let tree = new AnimatedObject(Assets.glTF.Butterfly);
                tree.model.position.set(candidatePosition.x, candidatePosition.y + 1.0, candidatePosition.z);
                let scale = getRandomArbitrary(0.01,0.02);
                tree.model.scale.set(scale, scale, scale);
                tree.healthFactor=1.0;
                // Sets the wind animation for play.
                tree.playActionByIndex(0);

                this.environment.objects.push(tree);


            }




               /* if (random * 100 > 0.3 && random * 100 < 0.6) { // %0.1 of the time.

                    let bush = new Bushes(Assets.glTF.Grass);
                    bush.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                    bush.model.scale.set(0.015, 0.015, 0.015);


                    this.environment.objects.push(bush);

                } /*else if (random * 100 > 0.6 && random * 100 < 0.7) { // %0.1 of the time.

                    let bush = new Bushes(Assets.glTF.PlantShrub);
                    bush.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                    bush.model.scale.set(0.005, 0.005, 0.005);


                    this.environment.objects.push(bush);

                } else if (random * 100 > 0.7 && random * 100 < 0.9) { // %0.1 of the time.

                    let bush = new Bushes(Assets.glTF.Lavender);
                    bush.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                    bush.model.scale.set(0.005, 0.005, 0.005);


                    this.environment.objects.push(bush);

                } else if (random * 100 > 0.9 && random * 100 < 1.0) { // %0.1 of the time.

                    let tree = new Tree(Assets.glTF.YardGrass);
                    tree.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                    tree.model.scale.set(0.08, 0.08, 0.08);

                    // Sets the wind animation for play.
                    tree.playActionByIndex(0);

                    this.environment.objects.push(tree);

                } else if (random * 100 > 1.0 && random * 100 < 1.2) { // %0.1 of the time.

                    let bush = new Bushes(Assets.glTF.WoodenBlock);
                    bush.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                    bush.model.scale.set(0.005, 0.005, 0.005);


                    this.environment.objects.push(bush);

                } */
                /*else*/
                /*if (random * 100 > 1.2 && random * 100 < 1.4) { // %0.1 of the time.

                    let bush = new Bushes(Assets.glTF.PineTree);
                    bush.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                    bush.model.scale.set(0.01, 0.01, 0.01);
                    bush.healtFactor=1.0;

                    this.environment.objects.push(bush);

                }/* else if (random * 100 > 1.4 && random * 100 < 1.6) { // %0.1 of the time.

                    let bush = new Bushes(Assets.glTF.TropicalPlant);
                    bush.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                    bush.model.scale.set(0.9, 0.9, 0.9);


                    this.environment.objects.push(bush);

                } else if (random * 100 > 1.6 && random * 100 < 1.7) { // %0.1 of the time.

                    let bush = new Bushes(Assets.glTF.Rock);
                    bush.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                    bush.model.scale.set(0.006, 0.006, 0.006);

                    this.environment.objects.push(bush);

                } *//*else*/
            if (random * 100 > 0.1 && random * 100 < 0.31) { // %0.1 of the time.

 /*                   let tree = new Tree(Assets.glTF.LowPolyTree);
                    tree.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                    tree.model.scale.set(2.0, 2.0, 2.0);
                    tree.healthFactor=1.0;


                    tree.playActionByIndex(0);


                    this.environment.objects.push(tree);


*/
                   let bush = new StaticObject(Assets.glTF.SimpleTree);
                    bush.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);
                    let scale = getRandomArbitrary(1.8,2.2);
                    bush.model.scale.set(scale, scale, scale);
                    bush.healthFactor=1.0;
                    this.environment.objects.push(bush);

                let deadBush = new StaticObject(Assets.glTF.DeadTree);
                deadBush.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);
                scale = scale/500.0;
                deadBush.model.scale.set(scale, scale, scale);
                deadBush.healthFactor=0.0;
                this.environment.objects.push(deadBush);




                }

            else if(random * 100 > 2.6 && random * 100 < 2.82){

                let bush = new StaticObject(Assets.glTF.PineTree);
                bush.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);
                let scale = getRandomArbitrary(0.008,0.013);
                bush.model.scale.set(scale, scale, scale);
                bush.healthFactor=1.0;
                this.environment.objects.push(bush);


                let bad_tree = new AnimatedObject(Assets.glTF.DriedPine);
                bad_tree.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);
                scale= scale/2.5;
                bad_tree.model.scale.set(scale, scale, scale);
                bad_tree.healthFactor=0.0;
                // Sets the wind animation for play.
                bad_tree.playActionByIndex(0);

                this.environment.objects.push(bad_tree);

            }
            else if(random * 100 > 5.9 && random * 100 < 6.2){

                let bush = new StaticObject(Assets.glTF.LowPolyGrass);
                bush.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);
                let scale = getRandomArbitrary(0.015,0.022);
                bush.model.scale.set(0.02, 0.02, 0.02);
                bush.healthFactor=1.0;
                this.environment.objects.push(bush);


            }










        }


    }

    scatterRocks(candidatePosition) {
        // Todo
    }

    scatterBushes(candidatePosition) {
        // Todo
    }

    scatterDecisionPoints(candidatePosition) {
        const percent = this.environment.prng.random() * 100;

        if (percent < 0.01) {
            if (candidatePosition.y > 1 && candidatePosition.y < 10) {
                let brokenBottle = new BrokenBottle();
                brokenBottle.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                this.environment.objects.push(brokenBottle);
            }
        }
    }

    setupChunkMesh() {
        this.mesh = new THREE.Mesh(  this.geometry , this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.rotation.x = -Math.PI / 2;
    }

    update(deltaTime, playerPosition) {
        // TODO: Update terrain chunk material based on health factor

        // this.mesh.material.uniforms["health"].value = this.environment.props.healthFactor;

        //this.materials[0].opacity = this.environment.props.healthFactor;
        //this.materials[1].opacity = 1.0 - this.environment.props.healthFactor;
        //this.materials[0].visible = true;
        //this.materials[1].visible = true;
    }
}

export {Terrain};
