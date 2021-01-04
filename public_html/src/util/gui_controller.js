class GuiController {
    constructor(gui) {
        this.gui = gui;
        this.obj = {};
    }

    add_slider(label, min, max){
        this.obj[label] =  (min + max) / 2;
        this.gui.add(this.obj, label, min, max);
    }

    add_color(label){
        this.obj[label] = [255, 0, 0];
        this.gui.addColor(this.obj, label);
    }

    /*
    let palette = {
    color1: '#ff0000', // CSS string
    color2: [ 0, 128, 255 ], // RGB array
    color3: [ 0, 128, 255, 0.3 ], // RGB with alpha
    color4: { h: 350, s: 0.9, v: 0.3 } // Hue, saturation, value
};
gui.addColor(palette, 'color1');
gui.addColor(palette, 'color2');
gui.addColor(palette, 'color3');
gui.addColor(palette, 'color4');
     */
}

class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}


export {GuiController,ColorGUIHelper}