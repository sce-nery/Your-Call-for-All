import * as THREE from "../../vendor/three-js/build/three.module.js";

class Terrain {
    constructor(props={
        width: 100,
        height: 100,
        widthSegments: 150,
        heightSegments: 150
    }) {
        this.props = props;

        this.setupTerrainMesh();
    }

    setupTerrainMesh() {
        let geometry = new THREE.PlaneGeometry(this.props.width, this.props.height, this.props.widthSegments, this.props.heightSegments);
        let material = new THREE.MeshLambertMaterial({
            color: new THREE.Color(0x555555),
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
    }
}


export {Terrain};
export {TerrainController};
