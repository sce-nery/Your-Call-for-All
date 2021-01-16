class GameUiController {

    constructor(ycfa, renderer) {
        this.ycfa = ycfa;
        this.renderer = renderer;
        this.inSettingsPage = false;
        this.introductionMade = false;
        this.initializeDocumentElements();
        this.showRenderTarget();

        this.ycfa.unregisterPlayerControlListeners();
        this.showMainMenu();


        this.initializeListeners();
        this.hideLoadingBar();
    }

    initializeListeners() {
        document.addEventListener("keyup", (e) => {
            console.debug(`Keyup: ${e.key}`);
            if (e.key === "Escape") {
                this.ycfa.unregisterPlayerControlListeners();
                this.showMainMenu();
            }
        });

        document.addEventListener("pointerlockchange",  (event) => {
            if (document.pointerLockElement !== this.ycfa.character.owner.renderer.domElement) {
                console.log('Showing menu');
                this.ycfa.unregisterPlayerControlListeners();
                this.showMainMenu();
            }
        });

        this.playButton.onclick = () => {
            if (!this.introductionMade) {
                console.debug("TODO: Show messages!");
                // TODO: If the first time, show series of messages to user.

                this.introductionMade = true;
            }

            this.ycfa.registerPlayerControlListeners();
            this.hideMainMenu();

            let buttonTextNode = this.playButton.childNodes.item(0);
            buttonTextNode.textContent = "Resume";

            this.ycfa.character.cameraController.enterPointerLock();
        }
    }

    initializeDocumentElements() {
        this.progressBar = document.querySelector('#progress-bar');
        this.renderTarget = document.querySelector("#render-target");

        this.menu = document.querySelector("#menu-container");

        this.info = document.querySelector("#info-container");

        this.playButton = document.querySelector("#play-button");
        this.settingsButton = document.querySelector("#settings-button");
    }

    showMainMenu() {
        this.menu.style.visibility = "visible";
        this.info.style.visibility = "visible";
    }

    hideMainMenu() {
        this.menu.style.visibility = "hidden";
        this.info.style.visibility = "hidden";
    }

    showRenderTarget() {
        this.renderTarget.style = "visible";
    }

    hideRenderTarget() {
        this.renderTarget.style = "hidden";
    }

    hideLoadingBar() {
        this.progressBar.style.display = 'none';
    }

    showGameSettings() {
        this.settingsMenu.style.visibility = "visible";
    }

    hideGameSettings() {
        this.settingsMenu.style.visibility = "hidden";
    }


}


export {GameUiController}
