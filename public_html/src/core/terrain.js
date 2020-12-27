import * as THREE from "../../vendor/three-js/build/three.module.js";
import * as CANNON from "../../vendor/cannon-es.js";
import {BufferGeometry} from "../../vendor/three-js/build/three.module.js";
import PhysicsUtils from "../util/physics-utils.js";
import TextureUtils from "../util/texture-utils.js";

class Terrain {
    constructor(props = {
        width: 100,
        height: 100,
        widthSegments: 150,
        heightSegments: 150,
        map: null,
        normalMap: null,
        displacementMap: null,
        occlusionMap: null,
        roughnessMap: null
    }) {
        this.props = props;

        this.setupTextures();
        this.setupTerrainMesh();
        // this.setupPhysicsBody();z
    }

    setupTextures() {
        if (this.props.map !== null) {
            TextureUtils.makeRepeating(this.props.map, this.props.width, this.props.height);
        }

        if (this.props.normalMap !== null) {
            TextureUtils.makeRepeating(this.props.normalMap, this.props.width, this.props.height);
        }

        if (this.props.displacementMap !== null) {
            TextureUtils.makeRepeating(this.props.displacementMap, this.props.width, this.props.height);
        }

        if (this.props.occlusionMap !== null) {
            TextureUtils.makeRepeating(this.props.occlusionMap, this.props.width, this.props.height);
        }

        if (this.props.roughnessMap !== null) {
            TextureUtils.makeRepeating(this.props.roughnessMap, this.props.width, this.props.height);
        }
    }

    setupTerrainMesh() {
        let geometry = new THREE.PlaneGeometry(this.props.width, this.props.height, this.props.widthSegments, this.props.heightSegments);
        let material = new THREE.MeshStandardMaterial({
            map: this.props.map,
            bumpMap: this.props.normalMap,
            bumpScale: 0.15,
            //displacementMap: this.props.displacementMap,
            //aoMap: this.props.occlusionMap,
            roughnessMap: this.props.roughnessMap,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.rotation.x = -Math.PI / 2;
    }

    setupPhysicsBody() {
        let terrainShape = PhysicsUtils.convertThreeGeometryToCannonConvexPolyhedron(this.mesh.geometry);

        this.physicsBody = new CANNON.Body({
            mass: 0, // kg, 0: static
            position: new CANNON.Vec3(0, 0, 0), // m
            shape: terrainShape
        });
        let axis = new CANNON.Vec3(1, 0, 0);
        let angle = -Math.PI / 2;

        this.physicsBody.quaternion.setFromAxisAngle(axis, angle);
    }

    setHeightMap(heightMap) {
        this.heightMap = heightMap;
        this.moveTo(new THREE.Vector3(0, 0, 0));
    }

    /**
     * Moves the terrain to the specified position by getting vertices from the heightmap with specified offsets,
     * with also moving textures by that offset. The specified position usually would be the character's position.
     *
     * If the number of segments of the terrain geometry is low, it would be faster but noticeable
     * changes may appear in the terrain as it moves.
     *
     * Also note that this is computationally expensive, so avoid this as much as possible.
     *
     * @param position The position we want to move to, usually the character's position.
     */
    moveTo(position) {
        this.mesh.geometry.vertices = this.heightMap.get(position);

        // Move terrain in world-space, centered around position.
        this.mesh.position.set(
            position.x * this.heightMap.props.xZoom,
            0.0,
            -position.z * this.heightMap.props.yZoom
        );

        // Update vertices and textures.
        // Note that below are computationally expensive tasks.
        this.mesh.geometry.verticesNeedUpdate = true;
        this.mesh.geometry.computeVertexNormals();

        this.mesh.material.map.offset.set(this.mesh.position.x, -this.mesh.position.z);
        this.mesh.material.map.needsUpdate = true;

        this.mesh.material.bumpMap.offset.set(this.mesh.position.x, -this.mesh.position.z);
        this.mesh.material.bumpMap.needsUpdate = true;
    }
}

export {Terrain};
