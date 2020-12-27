import * as THREE from "../../vendor/three-js/build/three.module.js";
import * as CANNON from "../../vendor/cannon-es.js";
import {BufferGeometry} from "../../vendor/three-js/build/three.module.js";
import PhysicsUtils from "../util/physics-utils.js";
import TextureUtils from "../util/texture-utils.js";

class Terrain {
    constructor(heightMap, props = {
        map: null,
        normalMap: null,
        displacementMap: null,
        occlusionMap: null,
        roughnessMap: null
    }) {
        this.heightMap = heightMap;
        this.props = props;

        this.physicsBody = null;
        this.physicsHeightFieldShape = null;

        this.setupTextures();
        this.setupTerrainMesh();
        this.setupPhysicsBody();
    }

    setupTextures() {
        if (this.props.map !== null) {
            TextureUtils.makeRepeating(this.props.map, this.heightMap.props.width, this.heightMap.props.height);
        }

        if (this.props.normalMap !== null) {
            TextureUtils.makeRepeating(this.props.normalMap, this.heightMap.props.width, this.heightMap.props.height);
        }

        if (this.props.displacementMap !== null) {
            TextureUtils.makeRepeating(this.props.displacementMap, this.heightMap.props.width, this.heightMap.props.height);
        }

        if (this.props.occlusionMap !== null) {
            TextureUtils.makeRepeating(this.props.occlusionMap, this.heightMap.props.width, this.heightMap.props.height);
        }

        if (this.props.roughnessMap !== null) {
            TextureUtils.makeRepeating(this.props.roughnessMap, this.heightMap.props.width, this.heightMap.props.height);
        }
    }

    setupTerrainMesh() {
        let material = new THREE.MeshStandardMaterial({
            map: this.props.map,
            bumpMap: this.props.normalMap,
            bumpScale: 0.25,
            //displacementMap: this.props.displacementMap,
            //aoMap: this.props.occlusionMap,
            //roughnessMap: this.props.roughnessMap,
        });

        this.mesh = new THREE.Mesh(this.heightMap.geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.rotation.x = -Math.PI / 2;
    }

    setupPhysicsBody() {
        // Create the height field
        let heightField = new CANNON.Heightfield(this.heightMap.matrix, {
            elementSize: 1
        });

        this.physicsBody = new CANNON.Body({ mass: 0});

        this.physicsBody.addShape(heightField);
        this.physicsHeightFieldShape = heightField;

        this.physicsBody.position.set(
            -this.heightMap.props.width * heightField.elementSize / 2,
            0,
            -this.heightMap.props.height * heightField.elementSize / 2,
        );

        let angle = -Math.PI / 2;
        this.physicsBody.quaternion.setFromEuler(angle,0, angle);
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
     * @TODO Instead of moving the whole terrain, generate chunks, load & unload them.
     * @param position The position we want to move to, usually the character's position.
     */
    moveTo(position) {
        this.heightMap.adjust(position);

        // Move terrain in world-space, centered around position.
        this.mesh.position.set(
            position.x * this.heightMap.props.xZoom,
            0.0,
            -position.z * this.heightMap.props.yZoom
        );

        this.physicsBody.position.set(
            position.x * this.heightMap.props.xZoom - this.heightMap.props.width * this.physicsHeightFieldShape.elementSize / 2,
            0,
            -position.z * this.heightMap.props.yZoom - this.heightMap.props.height * this.physicsHeightFieldShape.elementSize / 2,
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
