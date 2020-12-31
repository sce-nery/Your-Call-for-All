import * as THREE from "../../vendor/three-js/build/three.module.js";


class TextureUtils {
    static makeRepeating(texture, repeatX, repeatY) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);
    }
}


export default TextureUtils;
