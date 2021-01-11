import * as THREE from "../../../vendor/three-js/build/three.module.js";
import {FBXLoader} from "../../../vendor/three-js/examples/jsm/loaders/FBXLoader.js";
import {GLTFLoader} from "../../../vendor/three-js/examples/jsm/loaders/GLTFLoader.js";


class Character  {
    constructor(scene, camera, renderer) {
      this._scene = scene;
      this._camera = camera;
      this._mixers = [];
      this._threejs = renderer;

        this._previousRAF = null;

        this._LoadAnimatedModel();
        this._RAF();
    }

    _LoadAnimatedModel() {
        const params = {
            camera: this._camera,
            scene: this._scene,
        }
        this._controls = new BasicCharacterController(params);
        this._thirdPersonCamera = new ThirdPersonCamera({
            camera: this._camera,
            target: this._controls,
        });
    }

    _LoadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
        const loader = new FBXLoader();
        loader.setPath(path);
        loader.load(modelFile, (fbx) => {
            fbx.scale.setScalar(0.1);
            fbx.traverse(c => {
                c.castShadow = true;
            });
            fbx.position.copy(offset);

            const anim = new FBXLoader();
            anim.setPath(path);
            anim.load(animFile, (anim) => {
                const m = new THREE.AnimationMixer(fbx);
                this._mixers.push(m);
                const idle = m.clipAction(anim.animations[0]);
                idle.play();
            });
            this._scene.add(fbx);
        });
    }

    _LoadModel() {
        const loader = new GLTFLoader();
        loader.load('./resources/thing.glb', (gltf) => {
            gltf.scene.traverse(c => {
                c.castShadow = true;
            });
            this._scene.add(gltf.scene);
        });
    }

    _RAF() {
        requestAnimationFrame((t) => {
            if (this._previousRAF === null) {
                this._previousRAF = t;
            }

            this._RAF();

            this._threejs.render(this._scene, this._camera);
            this._Step(t - this._previousRAF);
            this._previousRAF = t;
        });
    }

    _Step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;
        if (this._mixers) {
            this._mixers.map(m => m.update(timeElapsedS));
        }

        if (this._controls) {
            this._controls.Update(timeElapsedS);
        }

        this._thirdPersonCamera.Update(timeElapsedS);
    }


}



class BasicCharacterControllerProxy {
    constructor(animations) {
        this._animations = animations;
    }
    get animations() {
        return this._animations;
    }
}

class BasicCharacterController {
    constructor(params) {
        this._Init(params);
    }

    _Init(params) {
        this._params = params;
        this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
        this._velocity = new THREE.Vector3(0, 0, 0);
        this._position = new THREE.Vector3();

        this._animations = {};
        this._input = new BasicCharacterControllerInput();
        this._stateMachine = new CharacterFSM(new BasicCharacterControllerProxy(this._animations));
        this._LoadModels();
    }

    _LoadModels() {

        const loader = new FBXLoader();
        loader.setPath('./assets/models/characters/zombie/');
        let charPath = 'mremireh_o_desbiens.fbx';
        //let charPath = 'remy.fbx';

        loader.load(charPath, (fbx) => {
            fbx.scale.setScalar(0.01);
            fbx.traverse(c => {
                c.castShadow = true;
            });

            this._target = fbx;
            this._params.scene.add(this._target);

            this._mixer = new THREE.AnimationMixer(this._target);

            this._manager = new THREE.LoadingManager();
            this._manager.onLoad = () => {
                this._stateMachine.SetState('idle');
            };

            const _OnLoad = (animName, anim) => {
                const clip = anim.animations[0];
                const action = this._mixer.clipAction(clip);

                this._animations[animName] = {
                    clip: clip,
                    action: action,
                };
            };

            const loader = new FBXLoader(this._manager);
            loader.setPath('./assets/models/characters/zombie/');
            loader.load('walk.fbx', (a) => { _OnLoad('walk', a); });
            loader.load('run.fbx', (a) => { _OnLoad('run', a); });
            loader.load('idle.fbx', (a) => { _OnLoad('idle', a); });

        });
    }

    get Position() {
        return this._position;
    }

    get Rotation() {
        if (!this._target) {
            return new THREE.Quaternion();
        }
        return this._target.quaternion;
    }


    Update(timeInSeconds) {
        if (!this._target) {
            return;
        }

        this._stateMachine.Update(timeInSeconds, this._input);

        const velocity = this._velocity;
        const frameDecceleration = new THREE.Vector3(
            velocity.x * this._decceleration.x,
            velocity.y * this._decceleration.y,
            velocity.z * this._decceleration.z
        );
        frameDecceleration.multiplyScalar(timeInSeconds);
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
            Math.abs(frameDecceleration.z), Math.abs(velocity.z));

        velocity.add(frameDecceleration);

        const controlObject = this._target;
        const _Q = new THREE.Quaternion();
        const _A = new THREE.Vector3();
        const _R = controlObject.quaternion.clone();

        const acc = this._acceleration.clone();
        if (this._input._keys.shift) {
            acc.multiplyScalar(2.0);
        }

        if (this._input._keys.forward) {
            velocity.z += acc.z * timeInSeconds;
        }
        if (this._input._keys.backward) {
            velocity.z -= acc.z * timeInSeconds;
        }
        if (this._input._keys.left) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }
        if (this._input._keys.right) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }

        controlObject.quaternion.copy(_R);

        const oldPosition = new THREE.Vector3();
        oldPosition.copy(controlObject.position);

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(controlObject.quaternion);
        forward.normalize();

        const sideways = new THREE.Vector3(1, 0, 0);
        sideways.applyQuaternion(controlObject.quaternion);
        sideways.normalize();

        sideways.multiplyScalar(velocity.x * timeInSeconds);
        forward.multiplyScalar(velocity.z * timeInSeconds);

        controlObject.position.add(forward);
        controlObject.position.add(sideways);

        this._position.copy(controlObject.position);

        if (this._mixer) {
            this._mixer.update(timeInSeconds);
        }
    }
}

class FiniteStateMachine {
    constructor() {
        this._states = {};
        this._currentState = null;
    }

    _AddState(name, type) {
        this._states[name] = type;
    }

    SetState(name) {
        const prevState = this._currentState;

        if (prevState) {
            if (prevState.Name === name) {
                return;
            }
            prevState.Exit();
        }

        const state = new this._states[name](this);

        this._currentState = state;
        state.Enter(prevState);
    }

    Update(timeElapsed, input) {
        if (this._currentState) {
            this._currentState.Update(timeElapsed, input);
        }
    }
}

class BasicCharacterControllerInput {
    constructor() {
        this._Init();
    }

    _Init() {
        this._keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            shift: false,
        };
        document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }

    _onKeyDown(event) {
        switch (event.keyCode) {
            case 87: // w
                this._keys.forward = true;
                break;
            case 65: // a
                this._keys.left = true;
                break;
            case 83: // s
                this._keys.backward = true;
                break;
            case 68: // d
                this._keys.right = true;
                break;
            case 32: // SPACE
                this._keys.space = true;
                break;
            case 16: // SHIFT
                this._keys.shift = true;
                break;
        }
    }

    _onKeyUp(event) {
        switch(event.keyCode) {
            case 87: // w
                this._keys.forward = false;
                break;
            case 65: // a
                this._keys.left = false;
                break;
            case 83: // s
                this._keys.backward = false;
                break;
            case 68: // d
                this._keys.right = false;
                break;
            case 32: // SPACE
                this._keys.space = false;
                break;
            case 16: // SHIFT
                this._keys.shift = false;
                break;
        }
    }
}

class CharacterFSM extends FiniteStateMachine {
    constructor(proxy) {
        super();
        this._proxy = proxy;
        this._Init();
    }

    _Init() {
        this._AddState('idle', IdleState);
        this._AddState('walk', WalkState);
        this._AddState('run', RunState);
    }
}


class State {
    constructor(parent) {
        this._parent = parent;
    }

    Enter() {}
    Exit() {}
    Update() {}
}


class WalkState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'walk';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['walk'].action;
        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name].action;

            curAction.enabled = true;

            if (prevState.Name === 'run') {
                const ratio = curAction.getClip().duration / prevAction.getClip().duration;
                curAction.time = prevAction.time * ratio;
            } else {
                curAction.time = 0.0;
                curAction.setEffectiveTimeScale(1.0);
                curAction.setEffectiveWeight(1.0);
            }

            curAction.crossFadeFrom(prevAction, 0.5, true);
            curAction.play();
        } else {
            curAction.play();
        }
    }

    Exit() {
    }

    Update(timeElapsed, input) {
        if (input._keys.forward || input._keys.backward) {
            if (input._keys.shift) {
                this._parent.SetState('run');
            }
            return;
        }

        this._parent.SetState('idle');
    }
}


class RunState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'run';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['run'].action;
        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name].action;

            curAction.enabled = true;

            if (prevState.Name === 'walk') {
                const ratio = curAction.getClip().duration / prevAction.getClip().duration;
                curAction.time = prevAction.time * ratio;
            } else {
                curAction.time = 0.0;
                curAction.setEffectiveTimeScale(1.0);
                curAction.setEffectiveWeight(1.0);
            }

            curAction.crossFadeFrom(prevAction, 0.5, true);
            curAction.play();
        } else {
            curAction.play();
        }
    }

    Exit() {
    }

    Update(timeElapsed, input) {
        if (input._keys.forward || input._keys.backward) {
            if (!input._keys.shift) {
                this._parent.SetState('walk');
            }
            return;
        }

        this._parent.SetState('idle');
    }
}


class IdleState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'idle';
    }

    Enter(prevState) {
        const idleAction = this._parent._proxy._animations['idle'].action;
        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name].action;
            idleAction.time = 0.0;
            idleAction.enabled = true;
            idleAction.setEffectiveTimeScale(1.0);
            idleAction.setEffectiveWeight(1.0);
            idleAction.crossFadeFrom(prevAction, 0.5, true);
            idleAction.play();
        } else {
            idleAction.play();
        }
    }

    Exit() {
    }

    Update(_, input) {
        if (input._keys.forward || input._keys.backward) {
            this._parent.SetState('walk');
        } else if (input._keys.space) {
        }
    }
}

class ThirdPersonCamera {
    constructor(params) {
        this._params = params;
        this._camera = params.camera;

        this._currentPosition = new THREE.Vector3();
        this._currentLookat = new THREE.Vector3();
    }

    _CalculateIdealOffset() {
        const idealOffset = new THREE.Vector3(-1, 2, -8);
        idealOffset.applyQuaternion(this._params.target.Rotation);
        idealOffset.add(this._params.target.Position);
        return idealOffset;
    }

    _CalculateIdealLookat() {
        const idealLookat = new THREE.Vector3(0, 10, 50);
        idealLookat.applyQuaternion(this._params.target.Rotation);
        idealLookat.add(this._params.target.Position);
        return idealLookat;
    }

    Update(timeElapsed) {
        const idealOffset = this._CalculateIdealOffset();
        const idealLookat = this._CalculateIdealLookat();

        // const t = 0.05;
        // const t = 4.0 * timeElapsed;
        const t = 1.0 - Math.pow(0.001, timeElapsed);

        this._currentPosition.lerp(idealOffset, t);
        this._currentLookat.lerp(idealLookat, t);

        this._camera.position.copy(this._currentPosition);
        this._camera.lookAt(this._currentLookat);
    }
}

export {Character};


/*

class Character {
    constructor(scene, gltf) {
        this.scene = scene;
        this.model = gltf.scene;
        this.animations = gltf.animations;

        this.mixer = new THREE.AnimationMixer(this.model);
        this.modifyTimeScale(1);

        this.actions = this.setupActions();

        this.characterControllerInput  = new CharacterControllerKeyboardInput();
        this.characterController = new CharacterController(this, this.characterControllerInput);

        this.addCharacterToTheScene();
        this.setupShadows();

        this.idleAction = this.mixer.clipAction( this.animations[ 0 ]);
        this.walkAction = this.mixer.clipAction( this.animations[ 3 ] );
        this.runAction = this.mixer.clipAction( this.animations[ 1 ] );

        this.idleWeight = 0.0;
        this.walkWeight = 1.0;
        this.runWeight = 0.0;

        //this.actions.forEach( function ( action ) {action.play();} );

        //this.walkAction.play();
        this.activateAllActions();
    }

    update(deltaTime) {

        this.idleWeight = this.idleAction.getEffectiveWeight();
        this.walkWeight = this.walkAction.getEffectiveWeight();
        this.runWeight = this.runAction.getEffectiveWeight();


        this.mixer.update(deltaTime);
        this.characterController.update(deltaTime);
    }

    activateAllActions() {

        this.setWeight( this.idleAction, this.idleWeight );
        this.setWeight( this.walkAction, this.walkWeight );
        this.setWeight( this.runAction, this.runWeight);

        this.actions.forEach( function ( action ) {

            action.play();

        } );

    }

    modifyTimeScale( speed ) {

        this.timeScale = speed;

    }

    pauseContinue() {
        if ( this.idleAction.paused ) {
            this.unPauseAllActions();
        }
        else {
            this.pauseAllActions();
        }
    }

    pauseAllActions() {
        this.actions.forEach((action) => { action.paused = true; });
    }

    unPauseAllActions() {
        this.actions.forEach(( action )  => { action.paused = false; });
    }

    prepareCrossFade(startAction, endAction, crossFadeDuration) {
        // Switch default / custom crossfade durataion (according to the user's choice)
        const duration = crossFadeDuration;

        // Make sure that we don't go on in singleStepMode, and that all actions are unpaused
        this.unPauseAllActions();

        // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
        // else wait until the current action has finished its current loop
        if ( startAction === this.idleAction ) {
            this.executeCrossFade( startAction, endAction, duration );
        } else {
            this.synchronizeCrossFade( startAction, endAction, duration );
        }

    }

    synchronizeCrossFade(startAction, endAction, crossFadeDuration) {
        this.mixer.addEventListener( 'loop', onLoopFinished );
        let self = this;
        function onLoopFinished( event ) {
            if ( event.action === startAction ) {
                self.mixer.removeEventListener( 'loop', onLoopFinished );
                self.executeCrossFade( startAction, endAction, crossFadeDuration );
            }
        }
    }

    setWeight(action, weight ) {
        action.enabled = true;
        action.setEffectiveTimeScale( 1 );
        action.setEffectiveWeight( weight );

    }

    executeCrossFade( startAction, endAction, duration ) {
        // Not only the start action, but also the end action must get a weight of 1 before fading
        // (concerning the start action this is already guaranteed in this place)
        this.setWeight( endAction, 1 );
        endAction.time = 0;
        // Crossfade with warping - you can also try without warping by setting the third parameter to false
        startAction.crossFadeTo( endAction, duration, true );
    }

    addCharacterToTheScene(){
        this.scene.add(this.model);
        this.model.scale.setScalar(1.0);
        this.model.position.x = -10;
        this.model.position.y = 10;
    }

    setupActions() {
        Logger.debug("Setting up actions for this character model.")
        let idleAction = this.mixer.clipAction(this.animations[0]);
        let walkAction = this.mixer.clipAction(this.animations[3]);
        let runAction = this.mixer.clipAction(this.animations[1]);

        this.idleAction = idleAction;
        this.walkAction = walkAction;
        this.runAction = runAction;

        return [idleAction, walkAction, runAction];
    }

    setupShadows() {
        Logger.debug("Setting up shadows for this character model.")
        this.model.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }

}

class CharacterController {
    constructor(character, input) {
        this.character = character;
        this.input = input;
    }

    update(deltaTime) {

        if (this.input.keys.moveForward) {
            this.character.prepareCrossFade( this.character.walkAction, this.character.idleAction, 1.0 );
        }
        if (this.input.keys.moveLeft) {
            this.character.prepareCrossFade( this.character.idleAction, this.character.walkAction, 0.5 );
            //this.character.walkAction.play();
        }
        if (this.input.keys.moveRight) {
            this.character.prepareCrossFade( this.character.walkAction, this.character.runAction, 2.5 );
        }
        if (this.input.keys.moveBackward) {
            this.character.prepareCrossFade( this.character.runAction, this.character.walkAction,5.0 );
        }
        this.character.mixer.update(deltaTime);
    }
}

class CharacterControllerKeyboardInput {
    constructor() {
        this.keys = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false
        };

        document.addEventListener("keydown", (event) => this.onInputReceived(event, true));
        document.addEventListener("keyup", (event) => this.onInputReceived(event, false));
    }

    onInputReceived(event, state) {
        Logger.debug("Character controller keyboard input: " + event.key);
        if (event.key === "w" || event.key === "ArrowUp") {
            this.keys.moveForward = state;
        }
        if (event.key === "a" || event.key === "ArrowLeft") {
            this.keys.moveLeft = state;
        }
        if (event.key === "s" || event.key === "ArrowDown") {
            this.keys.moveBackward = state;
        }
        if (event.key === "d" || event.key === "ArrowRight") {
            this.keys.moveRight = state;
        }
    }
}

export {Character};
export {CharacterController};
export {CharacterControllerKeyboardInput};
*/