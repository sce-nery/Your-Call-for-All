import * as THREE from "../../vendor/three-js/build/three.module.js";
import TextureUtils from "../util/texture-utils.js";
import {Assets} from "./assets.js";
import {BrokenBottle} from "./decision-points.js";
import {GameObject, AnimatedObject, StaticObject} from "./objects.js";
import {LinearInterpolator} from "../math/math.js";

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
            this.environment.regenerateOctree(this.centerChunk.mesh);
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

        TextureUtils.makeRepeating(t1, this.chunkSize / 2, this.chunkSize / 2);
        TextureUtils.makeRepeating(t2, this.chunkSize / 2, this.chunkSize / 2);
        TextureUtils.makeRepeating(t3, this.chunkSize / 2, this.chunkSize / 2);
        TextureUtils.makeRepeating(t4, this.chunkSize / 2, this.chunkSize / 2);

        this.material = TextureUtils.generateBlendedMaterial([
            // The first texture is the base; other textures are blended in on top.
            {texture: t1},
            // Start blending in at height -80; opaque between -35 and 20; blend out by 50
            {texture: t2, levels: [0, 3, 10, 20]},
            {texture: t3, levels: [10, 20, 22, 25]},
            {texture: t4, levels: [22, 25, 2000, 3000]},
            // How quickly this texture is blended in depends on its x-position.
            {
                texture: t4,
                glsl: '1.0 - smoothstep(65.0 + smoothstep(-256.0, 256.0, vPosition.x) * 10.0, 80.0, vPosition.z)'
            },
            // Use this texture if the slope is between 27 and 45 degrees
            {
                texture: t3,
                glsl: 'slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2'
            },
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
                this.geometry.attributes.position.array[index + 1] = data.y;

                // Set height
                // This is normally the Y component but we are going to rotate the terrain along z-axis by -90 degrees
                this.geometry.attributes.position.array[index + 2] = data.height;

                let candidatePosition = new THREE.Vector3();
                candidatePosition.x = data.x;
                candidatePosition.y = data.height;
                candidatePosition.z = -data.y; // Because we are rotating z-axis of the terrain by -90 deg.
                // TODO: Maybe calculate the slope of the vertex too?

                this.scatterTrees(candidatePosition);
                this.scatterRocks(candidatePosition);
                this.scatterBushes(candidatePosition);
                this.scatterAnimals(candidatePosition);

                // Decision points:
                this.scatterDecisionPoints(candidatePosition);
            }
        }

        console.debug(`Created ${this.environment.objects.length} objects.`);

        this.geometry.verticesNeedUpdate = true;
        this.geometry.computeVertexNormals();
    }

    scatterAnimals(candidatePosition) {
        let percent = this.environment.prng.random() * 100;

        if (candidatePosition.y > -1 && candidatePosition.y < 0) { // Height check
            if (percent < 0.1) {

                let frog = new AnimatedObject(Assets.glTF.FrogOnLeaf);
                frog.model.position.set(candidatePosition.x, 0, candidatePosition.z);
                let scale = LinearInterpolator.real(0.1, 0.3, this.environment.prng.random());
                frog.model.scale.set(scale, scale, scale);
                frog.setHealthRange(0.5, 1.0);

                // Sets the wind animation for play.
                frog.playActionByIndex(0);

                this.environment.objects.push(frog);

            }
        }

        if (candidatePosition.y < -2) {
            if (percent < 0.1) {

                let shark = new AnimatedObject(Assets.glTF.Shark);
                shark.model.position.set(candidatePosition.x, -0.75, candidatePosition.z);
                let scale = LinearInterpolator.real(0.7, 0.9, this.environment.prng.random());
                shark.model.scale.set(scale, scale, scale);
                shark.setHealthRange(0.5, 1.0);

                // Sets the wind animation for play.
                shark.playActionByIndex(0);
                shark.mixer.timeScale = 0.8 + this.environment.prng.random() * 0.4;

                this.environment.objects.push(shark);

            }
        }

        if (candidatePosition.y > 0 && candidatePosition.y < 20) {
            if (percent < 0.15) {

                let butterfly = new AnimatedObject(Assets.glTF.Butterfly);
                butterfly.model.position.set(candidatePosition.x, candidatePosition.y + 1.0, candidatePosition.z);
                let scale = LinearInterpolator.real(0.004, 0.012, this.environment.prng.random());
                butterfly.model.scale.set(scale, scale, scale);

                butterfly.setHealthRange(0.5, 1.0);
                butterfly.mixer.timeScale = 0.8 + this.environment.prng.random() * 0.4;

                // Sets the wind animation for play.
                butterfly.playActionByIndex(0);

                this.environment.objects.push(butterfly);


            }
        }

    }

    scatterTrees(candidatePosition) {

        if (candidatePosition.y > 1 && candidatePosition.y < 10) { // Height check
            let percent = this.environment.prng.random() * 100;

            let treeType = Math.ceil(this.environment.prng.random() * 2);

            if (percent < 0.3) { // %0.3 of the time.

                if (treeType === 1) {
                    let simpleTree = new StaticObject(Assets.glTF.SimpleTree);
                    simpleTree.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);
                    let scale = LinearInterpolator.real(1.8, 2.2, this.environment.prng.random());
                    simpleTree.model.scale.set(scale, scale, scale);
                    simpleTree.setHealthRange(0.5, 1.0);
                    this.environment.objects.push(simpleTree);

                    let deadTree = new StaticObject(Assets.glTF.DeadTree);
                    deadTree.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);
                    scale = scale / 500.0;
                    deadTree.model.scale.set(scale, scale, scale);
                    deadTree.setHealthRange(0.0, 0.5);
                    this.environment.objects.push(deadTree);
                } else if (treeType === 2) {

                    let pineTree = new StaticObject(Assets.glTF.PineTree);
                    pineTree.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);
                    let scale = LinearInterpolator.real(0.008, 0.013, this.environment.prng.random());
                    pineTree.model.scale.set(scale, scale, scale);
                    pineTree.setHealthRange(0.5, 1.0);
                    this.environment.objects.push(pineTree);


                    let driedPine = new AnimatedObject(Assets.glTF.DriedPine);
                    driedPine.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);
                    scale = scale / 2.5;
                    driedPine.model.scale.set(scale, scale, scale);
                    driedPine.setHealthRange(0.0, 0.5);
                    // Sets the wind animation for play.
                    driedPine.playActionByIndex(0);

                    this.environment.objects.push(driedPine);
                }

            }


        }


    }

    scatterRocks(candidatePosition) {
        // Todo
    }

    scatterBushes(candidatePosition) {
        if (candidatePosition.y > 1 && candidatePosition.y < 10) {
            let percent = this.environment.prng.random() * 100;

            if (percent < 1) {
                let grass = new StaticObject(Assets.glTF.LowPolyGrass);
                grass.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);
                let scale = LinearInterpolator.real(0.015, 0.022, this.environment.prng.random());
                grass.model.scale.set(scale, scale, scale);

                grass.setHealthRange(0.5, 1.0);

                this.environment.objects.push(grass);
            }

        }
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
        this.mesh = new THREE.Mesh(this.geometry, this.material);
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
