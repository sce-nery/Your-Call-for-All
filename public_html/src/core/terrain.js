import * as THREE from "../../vendor/three-js/build/three.module.js";
import * as CANNON from "../../vendor/cannon-es.js";
import {BufferGeometry} from "../../vendor/three-js/build/three.module.js";
import PhysicsUtils from "../util/physics-utils.js";
import TextureUtils from "../util/texture-utils.js";
import {randomUUID} from "../util/uuid.js";

class Terrain {
    constructor(scene, heightMap, props={
        chunkSize: 256
    }) {
        this.scene = scene;
        this.props = props;
        this.heightMap = heightMap;
        this.chunks = {};

        this.loadChunks(new THREE.Vector3());
    }

    loadChunks(position) {

        const chunkSize = this.props.chunkSize;
        const chunkSizeHalf = chunkSize / 2;

        let k = (position.x )/ chunkSize;
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

        this.removeChunks();

        for (let i = 0; i < chunkOffsets.length; i++) {

            this.addChunk(chunkOffsets[i]);
        }

    }

    removeChunks() {
        for (let key in this.chunks) {
            let chunk = this.chunks[key];
            if (chunk.isActive) {
                this.scene.remove(chunk.mesh);
                chunk.isActive = false;
            }
        }
    }

    addChunk(offset) {
        let chunk;
        let key = `(${offset.x},${offset.y})`;
        if (key in this.chunks) {
            chunk = this.chunks[key];
            chunk.isActive = true;
            console.debug(`Found chunk in cache: ${key}`);
        } else {
            let heightData = this.heightMap.sample(this.props.chunkSize, this.props.chunkSize, offset.x, offset.y);
            chunk = new TerrainChunk(this.props.chunkSize, new THREE.Vector3(offset.x, 0, offset.y), heightData);
            chunk.isActive = true;
            console.debug(`Creating new chunk: ${key}`);
            this.chunks[key] = chunk;
        }

        this.scene.add(chunk.mesh);
    }
}

class TerrainChunk {
    constructor(chunkSize, chunkPosition, heightData) {
        this.chunkSize = chunkSize;
        this.chunkPosition = chunkPosition;
        this.heightData = heightData;

        this.setupChunkGeometry();
        this.setupChunkMaterial();
        this.setupChunkMesh();
    }

    setupChunkMaterial() {
        const colorMap = new THREE.TextureLoader().load('../assets/textures/ground/Ground1_1K_Color.jpg')
        const normalMap = new THREE.TextureLoader().load('../assets/textures/ground/Ground1_1K_Normal.jpg')
        const displacementMap = new THREE.TextureLoader().load('../assets/textures/ground/Ground1_1K_Displacement.jpg')
        const occlusionMap = new THREE.TextureLoader().load('../assets/textures/ground/Ground1_1K_AmbientOcclusion.jpg')
        const roughnessMap = new THREE.TextureLoader().load('../assets/textures/ground/Ground1_1K_Roughness.jpg')

        TextureUtils.makeRepeating(colorMap, this.chunkSize, this.chunkSize);
        TextureUtils.makeRepeating(normalMap, this.chunkSize, this.chunkSize);
        TextureUtils.makeRepeating(displacementMap, this.chunkSize, this.chunkSize);
        TextureUtils.makeRepeating(occlusionMap, this.chunkSize, this.chunkSize);
        TextureUtils.makeRepeating(roughnessMap, this.chunkSize, this.chunkSize);

        this.material = new THREE.MeshStandardMaterial({
            map: colorMap,
            bumpMap:  normalMap,
            bumpScale: 0.25,
            //displacementMap: this.props.displacementMap,
            //aoMap: this.props.occlusionMap,
            //roughnessMap: this.props.roughnessMap,
        });
    }

    setupChunkGeometry() {
        this.geometry = new THREE.PlaneGeometry(
            this.chunkSize,
            this.chunkSize,
            this.chunkSize,
            this.chunkSize,
        );

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
                vertex.z = data.height;
            }
        }

        this.geometry.verticesNeedUpdate = true;
        this.geometry.computeVertexNormals();
    }

    setupChunkMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.rotation.x = -Math.PI / 2;
    }
}

export {Terrain};
