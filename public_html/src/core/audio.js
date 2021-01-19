
import * as THREE from "../../vendor/three-js/build/three.module.js";


class GameAudio {
    constructor(scene, camera, ambientAudioSoundName, gameUiController) {
        this.scene = scene;
        this.camera = camera;
        this.ambientAudioSoundName = ambientAudioSoundName;
        this.gameUiController = gameUiController;
        this.audioLoader = new THREE.AudioLoader();

        this.setupAudioListener();
        this.ambientAudio();
    }

    stopMusic() {
        this.ambientSound.stop();
    }

    playMusic(){
        this.ambientSound.play();
    }

    setupAudioListener(){
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);
    }

    ambientAudio(){

        let sound = new THREE.Audio( this.listener );

        this.audioLoader.load( this.ambientAudioSoundName, function( buffer ) {
            sound.setBuffer( buffer );
            sound.setLoop( true );
            sound.setVolume( 0.1 );
            //sound.play();
        });

        this.ambientSound = sound;

    }


    positionalAudio( ){

        let material1;

        const sphere = new THREE.SphereBufferGeometry( 1, 10, 10 );

        material1 = new THREE.MeshPhongMaterial( { color: 0xffaa00, flatShading: true, shininess: 0 } );

        const audioLoader = new THREE.AudioLoader();

        const mesh1 = new THREE.Mesh( sphere, material1 );
        mesh1.position.set( -20, 2, 0 );
        this.scene.add( mesh1 );

        const sound1 = new THREE.PositionalAudio( this.listener );
        audioLoader.load( './assets/sounds/song1.ogg', function ( buffer ) {
            sound1.setBuffer( buffer );
            sound1.setRefDistance( 10 );
            sound1.setLoop(true);
            sound1.play();
        } );
        mesh1.add( sound1 );

    }


}

export {GameAudio}
