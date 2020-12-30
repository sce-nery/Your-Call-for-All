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
        if (width % 2 !== 0 || height % 2 !== 0) {
            Logger.warn("Width and height values must be divisible by 2");
            width += width % 2;
            height += height % 2;
        }

        let heightData = [];

        for (let i = 0; i <= width; i++) {
            heightData.push([]);
            for (let j = 0; j <= height; j++) {
                let gX = (i - (width / 2));
                let gY = (j - (height / 2));
                let x = gX + xOffset;
                let y = gY + yOffset;
                let z = this.probe(x, y);
                heightData[i].push({x: x, y: y, height: z});
            }
        }

        return heightData;
    }

    probe(x, y) {
        let sampleX = x / this.props.xZoom;
        let sampleY = y / this.props.yZoom;
        let height = this.noiseProvider.noise(sampleX, sampleY) * this.props.noiseStrength;
        return height;
    }
}

export {HeightMap};
