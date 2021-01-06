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

class FractalHeightMap {
    constructor(noiseProvider, props = {
        octaves: 8,
        lacunarity: 200,
        persistence: 2.5
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

        let freq = this.props.lacunarity;
        let amp = this.props.persistence;

        for (let i = 0; i <= width; i++) {
            heightData.push([]);

            for (let j = 0; j <= height; j++) {

                let gX = (i - (width / 2));
                let gY = (j - (height / 2));
                let x = gX + xOffset;
                let y = gY + yOffset;

                let gain = 1.0;
                let noise = 0.0;

                for (let k = 0; k < this.props.octaves; k++) {
                    let sampleX = x * (gain / freq);
                    let sampleY = y * (gain / freq);

                    noise += this.probe(sampleX, sampleY) * ( amp / gain );
                    gain *= 2.0;
                }

                heightData[i].push({x: x, y: y, height: noise});
            }
        }

        return heightData;
    }

    probe(x, y) {
        let height = this.noiseProvider.noise(x, y);
        return height;
    }
}


export {HeightMap};
export {FractalHeightMap};
