import {IdleState, RunState, WalkState, JumpState} from "./states.js";

class FiniteStateMachine {
    constructor() {
        this.states = {};
        this.currentState = null;
    }

    addState(name, type) {
        this.states[name] = type;
    }

    setState(name) {
        const prevState = this.currentState;

        if (prevState) {
            if (prevState.name === name) {
                return;
            }
            prevState.exit();
        }

        const state = new this.states[name](this);

        this.currentState = state;
        state.enter(prevState);
    }

    update(deltaTime, input) {
        if (this.currentState) {
            this.currentState.update(deltaTime, input);
        }
    }
}



class CharacterFSM extends FiniteStateMachine {
    constructor(actions) {
        super();
        this.actions = actions;
        this.addState('Idle', IdleState);
        this.addState('Walk', WalkState);
        this.addState('Run', RunState);
        this.addState('Jump', JumpState);

    }

}


export {FiniteStateMachine, CharacterFSM}
