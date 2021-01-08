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
        return this.noise(x, y);
    }

    noise(x, y) {
        let sampleX = x / this.props.xZoom;
        let sampleY = y / this.props.yZoom;
        let height = this.noiseProvider.noise(sampleX, sampleY) * this.props.noiseStrength;
        return height;
    }
}

class FractalBrownianMotionHeightMap {
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
        return this.fbm(x, y);
    }

    /**
     * Fractal Brownian Motion
     *
     * @param x
     * @param y
     * @returns {number}
     */
    fbm(x, y) {
        let freq = this.props.lacunarity;
        let amp = this.props.persistence;

        let gain = 1.0;
        let noise = 0.0;

        for (let k = 0; k < this.props.octaves; k++) {
            let sampleX = x * (gain / freq);
            let sampleY = y * (gain / freq);

            noise += this.noise(sampleX, sampleY) * (amp / gain);
            gain *= 2.0;
        }

        return noise;
    }

    noise(x, y) {
        let height = this.noiseProvider.noise(x, y);
        return height;
    }
}

class HybridMultifractalHeightMap {
    constructor(noiseProvider, props = {
        zoom: 400,
        octaves: 16,
        lacunarity: 2,
        noiseStrength: 5.0,
        heightOffset: 0.0,
        exaggeration: 1.0,
        hurstExponent: 0.25,
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

      // let normalizedX = (x / width);
      // let normalizedY = (y / height);

      // let zoom = 0.5;

        // let noise = this.fbm(normalizedX * zoom, normalizedY * zoom) * this.props.noiseStrength;
        let noise = this.fbm(x / this.props.zoom, y / this.props.zoom) * this.props.noiseStrength;

        if (noise < 0) noise = -Math.pow(-noise, this.props.exaggeration);
        else noise = Math.pow(noise, this.props.exaggeration);

        noise += this.props.heightOffset;

        return noise;
    }

    /**
     * "Hybrid Multifractal", a modification of Fractional Brownian Motion.
     *
     * See also: https://www.classes.cs.uchicago.edu/archive/2015/fall/23700-1/final-project/MusgraveTerrain00.pdf
     *
     * @param x
     * @param y
     * @returns {number} Height value
     */
    fbm(x, y) {
        // TODO: There seems to be discrepancy between the meaning of the parameter "lacunarity" versus
        //  what it does. Normally, higher the lacunarity smoother the terrain, but in this implementation,
        //  it seems that the opposite is happening.
        const lacunarity = this.props.lacunarity;
        const octaves = this.props.octaves;
        const offset = 0.7;
        const H = this.props.hurstExponent;

        let frequency;
        let result;
        let signal;
        let weight;
        let remainder;

        let exponents = [];
        frequency = 1.0;
        for (let i = 0; i < octaves; i++) {
            exponents.push(Math.pow(frequency, -H));
            frequency *= lacunarity;
        }

        // Get the first octave of function
        result = (this.noise(x, y) + offset) * exponents[0];
        weight = result;
        x *= lacunarity;
        y *= lacunarity;

        // Spectral construction inner loop, where the fractal is built
        for (let i = 1; i < octaves; i++) {
            // prevent divergence
            if (weight > 1.0) weight = 1.0;
            // get next higher frequency
            signal = (this.noise(x, y) + offset) * exponents[i];
            // add it in, weighted by previous freq's local value
            result += weight * signal;
            // update the (monotonically decreasing) weighting value
            // (this is why H must specify a high fractal dimension)
            weight *= signal;
            // increase frequency
            x *= lacunarity;
            y *= lacunarity;
        }

        // take care of remainder in “octaves”
        remainder = octaves - Math.floor(octaves);
        if (remainder)
            // “i” and spatial freq. are preset in loop above
            result += remainder * this.noise(x, y) * exponents[i];
        return result;
    }

    distortedFBM(x, y, distortion) {
        let tmpX, tmpY;
        let distortX, distortY, distortZ;

        tmpX = x;
        tmpY = y;
        tmpX += 10.5;
        distortX = this.fbm(tmpX, tmpY);
        tmpY += 10.5;
        distortY = this.fbm(tmpX, tmpY);

        // Add distortion to sample point
        let sampleX = x + distortion * distortX;
        let sampleY = y + distortion * distortY;

        return this.fbm(sampleX, sampleY);
    }

    noise(x, y) {
        let height = this.noiseProvider.noise(x, y);
        return height;
    }

}


export {HeightMap};
export {FractalBrownianMotionHeightMap};
export {HybridMultifractalHeightMap};
