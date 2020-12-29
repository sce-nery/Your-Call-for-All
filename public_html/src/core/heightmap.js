import * as THREE from "../../vendor/three-js/build/three.module.js";

class HeightMap {
    constructor(noiseProvider, props = {
        xZoom: 10,
        yZoom: 10,
        noiseStrength: 2.0
    }) {
        this.noiseProvider = noiseProvider;
        this.props = props;
    }

    sample(width, height, xOffset, yOffset) {
        if (width  % 2 !== 0 || height % 2 !== 0) {
            Logger.warn("Width and height values must be divisible by 2");
            width += width % 2;
            height += height % 2;
        }

        let heightMatrix = [];

        for (let i = 0; i <= width; i++) {
            heightMatrix.push([]);
            for (let j = 0; j <= height; j++) {
                let x = (i - (width  / 2)) + xOffset;
                let y = (j - (height / 2)) + yOffset;
                let z = this.probe(x, y);
                heightMatrix[i].push(z);
            }
        }

        return heightMatrix;
    }

    probe(x, y) {
        let sampleX = x / this.props.xZoom;
        let sampleY = y / this.props.yZoom;
        return this.noiseProvider.noise(sampleX, sampleY) * this.props.noiseStrength;
    }
}

export {HeightMap};
