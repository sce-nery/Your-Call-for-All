class CharacterState {
    constructor(parent) {
        this.characterStateMachine = parent;
    }

    enter() {
    }

    exit() {
    }

    update() {
    }
}


class WalkState extends CharacterState {
    constructor(parent) {
        super(parent);

        this.name = "Walk";
    }

    enter(prevState) {
        const curAction = this.characterStateMachine.actions['Walk'];
        if (prevState) {
            const prevAction = this.characterStateMachine.actions[prevState.name];

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
                this.characterStateMachine.setState('Run');
            }
            return;
        }

        this.characterStateMachine.setState('Idle');
    }
}


class RunState extends CharacterState {
    constructor(parent) {
        super(parent);

        this.name = "Run";
    }

    enter(prevState) {
        const curAction = this.characterStateMachine.actions['Run'];
        if (prevState) {
            const prevAction = this.characterStateMachine.actions[prevState.name];

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
                this.characterStateMachine.setState('Walk');
            }
            return;
        }

        this.characterStateMachine.setState('Idle');
    }
}


class IdleState extends CharacterState {
    constructor(parent) {
        super(parent);

        this.name = "Idle";
    }

    enter(prevState) {
        const idleAction = this.characterStateMachine.actions['Idle'];
        if (prevState) {
            const prevAction = this.characterStateMachine.actions[prevState.name];
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
            this.characterStateMachine.setState('Walk');
        } else if (input.keys.space) {
        }
    }
}

class JumpState extends CharacterState {
    constructor(parent) {
        super(parent);

        this.name = "Jump";
    }

    enter(prevState) {
        const jumpAction = this.characterStateMachine.actions['Jump'];
        if (prevState.name === 'Walk') {
            const prevAction = this.characterStateMachine.actions[prevState.name];
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
            this.characterStateMachine.setState('Jump');
        }
    }
}


export {CharacterState, WalkState, RunState, IdleState, JumpState};
