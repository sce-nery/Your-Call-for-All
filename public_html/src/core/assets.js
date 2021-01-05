import {CharacterLoader} from "./character.js";
import * as THREE from "../../vendor/three-js/build/three.module.js";

export const Assets = {};

export function load() {
    Assets["Ground1_Color"] = new THREE.TextureLoader().load('/Your-Call-for-All/public_html/assets/textures/ground/Ground1_1K_Color.jpg');
    Assets["Ground1_Normal"] = new THREE.TextureLoader().load('/Your-Call-for-All/public_html/assets/textures/ground/Ground1_1K_Normal.jpg');
    Assets["WaterNormals"] = new THREE.TextureLoader().load('/Your-Call-for-All/public_html/assets/textures/water/waternormals.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });

    new CharacterLoader("/Your-Call-for-All/public_html/assets/models/characters/mocapman_dummy/mocapman.glb")
        .load(function (character) {
            Assets["MocapmanModel"] = character;
        });
}
