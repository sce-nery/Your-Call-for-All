
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
        return 'Walk';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['Walk'];
        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name];

            curAction.enabled = true;

            if (prevState.Name === 'Run') {
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
        if (input.keys.forward || input.keys.backward) {
            if (input.keys.shift) {
                this._parent.SetState('Run');
            }
            return;
        }

        this._parent.SetState('Idle');
    }
}


class RunState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'Run';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['Run'];
        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name];

            curAction.enabled = true;

            if (prevState.Name === 'Walk') {
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
        if (input.keys.forward || input.keys.backward) {
            if (!input.keys.shift) {
                this._parent.SetState('Walk');
            }
            return;
        }

        this._parent.SetState('Idle');
    }
}


class IdleState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'Idle';
    }

    Enter(prevState) {
        const idleAction = this._parent._proxy._animations['Idle'];
        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name];
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
        if (input.keys.forward || input.keys.backward) {
            this._parent.SetState('Walk');
        } else if (input.keys.space) {
        }
    }
}

class JumpState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'Jump';
    }

    Enter(prevState) {
        const jumpAction = this._parent._proxy._animations['Jump'];
        if (prevState.Name === 'Walk') {
            const prevAction = this._parent._proxy._animations[prevState.Name];
            const ratio = jumpAction.getClip().duration / jumpAction.getClip().duration;
            jumpAction.time = prevAction.time * ratio;
        } else {
            jumpAction.time = 0.0;
            jumpAction.setEffectiveTimeScale(1.0);
            jumpAction.setEffectiveWeight(1.0);
        }
    }

    Exit() {
    }

    Update(_, input) {
        if (input.keys.forward || input.keys.backward) {

        } else if (input.keys.space) {
            this._parent.SetState('Jump');
        }
    }
}



export {State, WalkState, RunState, IdleState, JumpState};