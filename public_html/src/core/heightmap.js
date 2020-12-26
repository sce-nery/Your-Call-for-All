

class HeightMapGenerator {
    constructor(vertices, noiseFn, props={
        xZoom: 10,
        yZoom: 10,
        noiseStrength: 2.0
    }) {
        this.vertices = vertices;
        this.noiseFn = noiseFn;
        this.props = props;
    }

    map(offset) {
        for (let i = 0; i < this.vertices.length; i++) {
            let vertex = this.vertices[i];
            let x = vertex.x / this.props.xZoom;
            let y = vertex.y / this.props.yZoom;
            let noise = this.noiseFn(x + offset.x, y + offset.z) * this.props.noiseStrength;
            vertex.z = noise;
        }

        return this.vertices;
    }
}

export {HeightMapGenerator};
