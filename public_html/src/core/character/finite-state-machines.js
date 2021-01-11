import {IdleState, RunState, WalkState} from "./states.js";

class FiniteStateMachine {
    constructor() {
        this._states = {};
        this._currentState = null;
    }

    addState(name, type) {
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



class CharacterFSM extends FiniteStateMachine {
    constructor(proxy) {
        super();
        this._proxy = proxy;
        this.addState('idle', IdleState);
        this.addState('walk', WalkState);
        this.addState('run', RunState);
    }

}


export {FiniteStateMachine, CharacterFSM}