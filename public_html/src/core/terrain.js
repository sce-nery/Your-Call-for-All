import * as THREE from "../../vendor/three-js/build/three.module.js";
import TextureUtils from "../util/texture-utils.js";
import {Assets} from "./assets.js";
import {Tree} from "./tree.js";


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

        if (this.centerChunk) {
            this.centerChunk.removeObjectsFrom(this.scene);
        }

        this.makeAllChunksInactive();

        this.centerChunk = this.createChunk(chunkOffsets[0]);
        for (let i = 1; i < chunkOffsets.length; i++) {
            this.createChunk(chunkOffsets[i]);
        }

        this.removeInactiveChunksFromScene();
        this.addActiveChunksToScene();
    }

    makeAllChunksInactive() {
        for (let key in this.chunks) {
            this.chunks[key].isActive = false;
        }
    }

    /**
     * Removes active chunks from the scene in order to improve FPS.
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
        this.centerChunk.addObjectsTo(this.scene);
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

    update(deltaTime) {
        this.centerChunk.trees.forEach((tree) => {
            tree.mixer.update(deltaTime);
        })
    }
}

class TerrainChunk {
    constructor(environment, chunkSize, chunkPosition, heightData) {
        this.environment = environment;
        this.chunkSize = chunkSize;
        this.chunkPosition = chunkPosition;
        this.heightData = heightData;

        this.isActive = false;
        this.isInScene = false;

        this.trees = [];

        this.setupChunkGeometry();
        this.setupChunkMaterial();
        this.setupChunkMesh();
    }

    setupChunkMaterial() {
        // Retrieve textures.
        // TODO: This material should change based on the health of the environment.
        let colorMap = Assets.Texture.Ground1_Color;
        let normalMap = Assets.Texture.Ground1_Normal;

        TextureUtils.makeRepeating(colorMap, this.chunkSize, this.chunkSize);
        TextureUtils.makeRepeating(normalMap, this.chunkSize, this.chunkSize);

        this.material = new THREE.MeshPhongMaterial({
            map: colorMap,
            bumpMap: normalMap,
            bumpScale: 0.85
        });
    }

    setupChunkGeometry() {
        this.geometry = new THREE.PlaneGeometry(
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
                const vertex = this.geometry.vertices[i * (this.chunkSize + 1) + j];
                // Because we are directly setting vertices, transformations will be based
                // on the global origin instead of the mesh itself, so be careful.
                vertex.x = data.x;
                vertex.y = data.y;

                // Set height
                // This is normally the Y component but we are going to rotate the terrain along z-axis by -90 degrees
                vertex.z = data.height;

                let position = new THREE.Vector3();
                position.x = data.x;
                position.y = data.height;
                position.z = -data.y; // Because we are rotating z-axis of the terrain by -90 deg.

                this.scatterTrees(position);
                this.scatterRocks(position);
                this.scatterBushes(position);
            }
        }

        console.debug(`Created ${this.trees.length} trees.`);

        this.geometry.verticesNeedUpdate = true;
        this.geometry.computeVertexNormals();
    }

    scatterTrees(candidatePosition) {

        let random = this.environment.prng.random();

        if (random * 100 < 0.1) { // %0.1 of the time.

            if (candidatePosition.y > 1 && candidatePosition.y < 10) { // Height check

                let tree = new Tree(Assets.glTF.PinkTree);
                tree.model.position.set(candidatePosition.x, candidatePosition.y, candidatePosition.z);

                tree.model.scale.set(0.3, 0.3, 0.3);

                // Sets the wind animation for play.
                tree.playActionByIndex(0);

                this.trees.push(tree);
            }
        }


    }

    scatterRocks(candidatePosition) {
        // Todo
    }

    scatterBushes(candidatePosition) {
        // Todo
    }

    setupChunkMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.rotation.x = -Math.PI / 2;
    }

    addObjectsTo(scene) {
        console.debug("Adding chunk objects to scene...");
        // For trees:
        console.debug(`Adding: ${this.trees.length} trees`);
        for (let i = 0; i < this.trees.length; i++) {
            scene.add(this.trees[i].model);
        }
    }

    removeObjectsFrom(scene) {
        console.debug("Removing chunk objects from scene...");
        // For trees:
        console.debug(`Removing: ${this.trees.length} trees`);
        for (let i = 0; i < this.trees.length; i++) {
            scene.remove(this.trees[i].model);
        }
    }
}

export {Terrain};
