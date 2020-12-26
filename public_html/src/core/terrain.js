import * as THREE from "../../vendor/three-js/build/three.module.js";

class Terrain {
    constructor(props={
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

        this.setupTerrainMesh();
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


}


class TerrainController {
    constructor(terrain, heightMap) {
        this.terrain = terrain;
        this.heightMap = heightMap;
    }

    adjustTerrainForPosition(position) {
        this.terrain.mesh.geometry.vertices = this.heightMap.get(position);

        // Move terrain in world-space, centered around position.
        this.terrain.mesh.position.set(
            position.x * this.heightMap.props.xZoom,
            0.0,
            -position.z * this.heightMap.props.yZoom
        );

        // Update
        this.terrain.mesh.geometry.verticesNeedUpdate = true;
        this.terrain.mesh.geometry.computeVertexNormals();

        this.terrain.mesh.material.map.offset.set(this.terrain.mesh.position.x, -this.terrain.mesh.position.z);
        this.terrain.mesh.material.map.needsUpdate = true;

        this.terrain.mesh.material.bumpMap.offset.set(this.terrain.mesh.position.x, -this.terrain.mesh.position.z);
        this.terrain.mesh.material.bumpMap.needsUpdate = true;
    }
}


export {Terrain};
export {TerrainController};
