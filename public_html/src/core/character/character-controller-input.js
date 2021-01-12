class CharacterControllerKeyboardInput {
    constructor() {
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            shift: false,
        };
        this.initializeListeners();
    }

    initializeListeners() {
        document.addEventListener('keydown', (e) => this.onInputReceived(e, true));
        document.addEventListener('keyup', (e) => this.onInputReceived(e, false));
    }

    onInputReceived(event, state) {
        switch(event.key) {
            case "w":
                this.keys.forward = state;
                break;
            case "a":
                this.keys.left = state;
                break;
            case "s":
                this.keys.backward = state;
                break;
            case "d":
                this.keys.right = state;
                break;
            case " ":
                this.keys.space = state;
                break;
            case "Shift":
                this.keys.shift = state;
                break;
        }
    }
}

export {CharacterControllerKeyboardInput}
