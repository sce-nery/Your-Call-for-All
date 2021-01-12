class State {
    constructor(parent) {
        this.parent = parent;
    }

    enter() {
    }

    exit() {
    }

    update() {
    }
}


class WalkState extends State {
    constructor(parent) {
        super(parent);

        this.name = "Walk";
    }

    enter(prevState) {
        const curAction = this.parent.actions['Walk'];
        if (prevState) {
            const prevAction = this.parent.actions[prevState.name];

            curAction.enabled = true;

            if (prevState.name === 'Run') {
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

    exit() {
    }

    update(deltaTime, input) {
        if (input.keys.forward || input.keys.backward) {
            if (input.keys.shift) {
                this.parent.setState('Run');
            }
            return;
        }

        this.parent.setState('Idle');
    }
}


class RunState extends State {
    constructor(parent) {
        super(parent);

        this.name = "Run";
    }

    enter(prevState) {
        const curAction = this.parent.actions['Run'];
        if (prevState) {
            const prevAction = this.parent.actions[prevState.name];

            curAction.enabled = true;

            if (prevState.name === 'Walk') {
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

    exit() {
    }

    update(deltaTime, input) {
        if (input.keys.forward || input.keys.backward) {
            if (!input.keys.shift) {
                this.parent.setState('Walk');
            }
            return;
        }

        this.parent.setState('Idle');
    }
}


class IdleState extends State {
    constructor(parent) {
        super(parent);

        this.name = "Idle";
    }

    enter(prevState) {
        const idleAction = this.parent.actions['Idle'];
        if (prevState) {
            const prevAction = this.parent.actions[prevState.name];
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

    exit() {
    }

    update(deltaTime, input) {
        if (input.keys.forward || input.keys.backward) {
            this.parent.setState('Walk');
        } else if (input.keys.space) {
        }
    }
}

class JumpState extends State {
    constructor(parent) {
        super(parent);

        this.name = "Jump";
    }

    enter(prevState) {
        const jumpAction = this.parent.actions['Jump'];
        if (prevState.name === 'Walk') {
            const prevAction = this.parent.actions[prevState.name];
            const ratio = jumpAction.getClip().duration / jumpAction.getClip().duration;
            jumpAction.time = prevAction.time * ratio;
        } else {
            jumpAction.time = 0.0;
            jumpAction.setEffectiveTimeScale(1.0);
            jumpAction.setEffectiveWeight(1.0);
        }
    }

    exit() {
    }

    update(deltaTime, input) {
        if (input.keys.forward || input.keys.backward) {

        } else if (input.keys.space) {
            this.parent.setState('Jump');
        }
    }
}


export {State, WalkState, RunState, IdleState, JumpState};
