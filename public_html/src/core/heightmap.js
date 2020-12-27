import * as THREE from "../../vendor/three-js/build/three.module.js";

class HeightMap {
    constructor(noiseProvider, props = {
        width: 100,
        height: 100,
        widthSegments: 100,
        heightSegments: 100,
        xZoom: 10,
        yZoom: 10,
        noiseStrength: 2.0
    }) {
        this.noiseProvider = noiseProvider;
        this.props = props;
        this.matrix = [];

        // Setup geometry
        this.geometry = new THREE.PlaneGeometry(
            this.props.width,
            this.props.height,
            this.props.widthSegments,
            this.props.heightSegments
        );

        // Setup heights, initial position of the terrain: (0,0,0)
        this.adjust(new THREE.Vector3(0, 0, 0));
    }

    /**
     * Adjusts its vertices with respect to the noise function.
     * @param offset The offset to be added to the noise function,
     *          typically would be the position of the character.
     * @returns {*} Adjusted vertex array.
     */
    adjust(offset) {
        let matrix = [];

        let width = this.props.width;
        for (let i = 0; i <= width; i++) {
            matrix.push([]);
        }

        for (let i = 0; i < this.geometry.vertices.length; i++) {

            let vertex = this.geometry.vertices[i];
            let x = vertex.x / this.props.xZoom;
            let y = vertex.y / this.props.yZoom;

            vertex.z = this.noiseProvider.noise(x + offset.x, y + offset.z) * this.props.noiseStrength;

            matrix[Math.floor(i / (width + 1))].push(vertex.z);


        }

        this.matrix = matrix;
    }

}

export {HeightMap};
