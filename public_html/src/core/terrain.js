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
        let offset = new THREE.Vector2(position.x, position.z);

        let heightData = this.heightMap.sample(this.props.chunkSize, this.props.chunkSize, offset.x, offset.y);
        let heightData2 = this.heightMap.sample(this.props.chunkSize, this.props.chunkSize, offset.x, offset.y);
        let chunk = new TerrainChunk(this.props.chunkSize,  new THREE.Vector3(offset.x, 0, offset.y), heightData);

        this.scene.add(chunk.mesh);

        offset =  new THREE.Vector2(0, -100)
        heightData = this.heightMap.sample(this.props.chunkSize, this.props.chunkSize, offset.x, offset.y);
        chunk = new TerrainChunk(this.props.chunkSize, new THREE.Vector3(offset.x, 0, offset.y), heightData);

        this.scene.add(chunk.mesh);

        offset =  new THREE.Vector2(0, +100)
        heightData = this.heightMap.sample(this.props.chunkSize, this.props.chunkSize, offset.x, offset.y);
        chunk = new TerrainChunk(this.props.chunkSize, new THREE.Vector3(offset.x, 0, offset.y), heightData);

        this.scene.add(chunk.mesh);

        offset =  new THREE.Vector2(-100, 0)
        heightData = this.heightMap.sample(this.props.chunkSize, this.props.chunkSize, offset.x, offset.y);
        chunk = new TerrainChunk(this.props.chunkSize, new THREE.Vector3(offset.x, 0, offset.y), heightData);

        this.scene.add(chunk.mesh);

        offset =  new THREE.Vector2(100, 0)
        heightData = this.heightMap.sample(this.props.chunkSize, this.props.chunkSize, offset.x, offset.y);
        chunk = new TerrainChunk(this.props.chunkSize, new THREE.Vector3(offset.x, 0, offset.y), heightData);

        this.scene.add(chunk.mesh);

        offset =  new THREE.Vector2(-100, -100)
        heightData = this.heightMap.sample(this.props.chunkSize, this.props.chunkSize, offset.x, offset.y);
        chunk = new TerrainChunk(this.props.chunkSize, new THREE.Vector3(offset.x, 0, offset.y), heightData);

        this.scene.add(chunk.mesh);

        offset =  new THREE.Vector2(100, 100)
        heightData = this.heightMap.sample(this.props.chunkSize, this.props.chunkSize, offset.x, offset.y);
        chunk = new TerrainChunk(this.props.chunkSize, new THREE.Vector3(offset.x, 0, offset.y), heightData);

        this.scene.add(chunk.mesh);

        offset =  new THREE.Vector2(-100, 100)
        heightData = this.heightMap.sample(this.props.chunkSize, this.props.chunkSize, offset.x, offset.y);
        chunk = new TerrainChunk(this.props.chunkSize, new THREE.Vector3(offset.x, 0, offset.y), heightData);

        this.scene.add(chunk.mesh);

        offset =  new THREE.Vector2(100, -100)
        heightData = this.heightMap.sample(this.props.chunkSize, this.props.chunkSize, offset.x, offset.y);
        chunk = new TerrainChunk(this.props.chunkSize, new THREE.Vector3(offset.x, 0, offset.y), heightData);

        this.scene.add(chunk.mesh);

        // offset =  new THREE.Vector2(0, 0)
        // heightData = this.heightMap.sample(300, 300, offset.x, offset.y);
        // chunk = new TerrainChunk(300, new THREE.Vector3(offset.x, 10, offset.y), heightData);
        // this.scene.add(chunk.mesh);
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
                let height = heightMatrix[i][j];
                this.geometry.vertices[i * (this.chunkSize + 1) + j].z = height;
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
        this.mesh.position.set(this.chunkPosition.x, this.chunkPosition.y,this.chunkPosition.z);
    }
}

export {Terrain};
