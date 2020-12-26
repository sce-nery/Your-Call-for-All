

class HeightMap {
    constructor(vertices, noiseProvider, props={
        xZoom: 10,
        yZoom: 10,
        noiseStrength: 2.0
    }) {
        this.vertices = vertices;
        this.noiseProvider = noiseProvider;
        this.props = props;
    }

    /**
     * Adjusts its vertices with respect to the noise function.
     * @param offset The offset to be added to the noise function,
     *          typically would be the position of the character.
     * @returns {*} Adjusted vertex array.
     */
    get(offset) {
        for (let i = 0; i < this.vertices.length; i++) {
            let vertex = this.vertices[i];
            let x = vertex.x / this.props.xZoom;
            let y = vertex.y / this.props.yZoom;
            let noise = this.noiseProvider.noise(x + offset.x, y + offset.z) * this.props.noiseStrength;
            vertex.z = noise;
        }

        return this.vertices;
    }
}

export {HeightMap};
