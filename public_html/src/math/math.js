class LinearInterpolator {
    /**
     * A linear interpolator for hex colors.
     *
     * Based on:
     * https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
     *
     * @param {Number} a  (hex color start val)
     * @param {Number} b  (hex color end val)
     * @param {Number} amount  (the amount to fade from a to b)
     *
     * @example
     * // returns 0x7f7f7f
     * LinearInterpolator.color(0x000000, 0xffffff, 0.5)
     *
     * @returns {Number}
     */
    static color(a, b, amount) {
        const ar = a >> 16;
        const ag = a >> 8 & 0xff;
        const ab = a & 0xff;

        const br = b >> 16;
        const bg = b >> 8 & 0xff;
        const bb = b & 0xff;

        const rr = ar + amount * (br - ar);
        const rg = ag + amount * (bg - ag);
        const rb = ab + amount * (bb - ab);

        return (rr << 16) + (rg << 8) + (rb | 0);
    }

    static real(a, b, amount) {
        return a + (b - a) * amount;
    }
}

export {LinearInterpolator}