class GameUiController {

    constructor(ycfa) {
        this.ycfa = ycfa;
        this.renderer = ycfa.renderer;
        this.inSettingsPage = false;
        this.introductionMade = false;
        this.musicIsPlaying = false;

        this.visibilities = {
            decisionPointActionInfoContainer: false,
        }

        this.initializeDocumentElements();
        this.showRenderTarget();

        this.ycfa.unregisterPlayerControlListeners();
        this.showMainMenu();

        this.initializeListeners();
        this.hideLoadingBar();
    }

    initializeListeners() {
        document.addEventListener("keyup", (e) => {
            if (e.key === "Escape") {
                this.ycfa.unregisterPlayerControlListeners();
                this.showMainMenu();
            }
        });

        document.addEventListener("pointerlockchange", (event) => {
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
                if (!this.musicIsPlaying) {
                    this.ycfa.audio.playMusic();
                    this.musicIsPlaying = !this.musicIsPlaying;
                }
            }



            this.ycfa.registerPlayerControlListeners();
            this.hideMainMenu();


            let buttonTextNode = this.playButton.childNodes.item(0);
            buttonTextNode.textContent = "Resume";

            this.ycfa.character.cameraController.enterPointerLock();
        }

        this.musicButton.onclick = () => {

            if (this.musicIsPlaying) {
                this.ycfa.audio.stopMusic();
                this.volumeOnOff.classList.remove(["volume", "off", "icon"]);
                this.volumeOnOff.classList.add(["volume", "up", "icon"]);

            } else {
                this.ycfa.audio.playMusic();
            }
            this.musicIsPlaying = !this.musicIsPlaying;


            //let buttonTextNode = this.playButton.childNodes.item(0);
            //buttonTextNode.textContent = "Resume";
            //this.ycfa.character.cameraController.enterPointerLock();
        }
    }

    initializeDocumentElements() {
        this.progressBar = document.querySelector('#progress-bar');
        this.renderTarget = document.querySelector("#render-target");

        this.menu = document.querySelector("#menu-container");

        this.info = document.querySelector("#info-container");

        this.playButton = document.querySelector("#play-button");
        this.settingsButton = document.querySelector("#settings-button");

        this.decisionPointActionInfoContainer = document.querySelector("#decision-point-action-info-container");

        this.musicButton =  document.querySelector("#music-button");
        this.volumeOnOff = document.querySelector("#volume-on-of");
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

    showDecisionPointActionInfoContainer() {
        if (!this.visibilities.decisionPointActionInfoContainer) {
            $("#decision-point-action-info-container").transition("scale in");
            this.visibilities.decisionPointActionInfoContainer = true;
        }
    }

    hideDecisionPointActionInfoContainer() {
        if (this.visibilities.decisionPointActionInfoContainer) {
            $("#decision-point-action-info-container").transition("scale out");
            this.visibilities.decisionPointActionInfoContainer = false;
        }
    }

    toggleDecisionPointActionInfoContainer() {
        $("#decision-point-action-info-container").transition("scale");
    }

    showGameSettings() {
        this.settingsMenu.style.visibility = "visible";
    }

    hideGameSettings() {
        this.settingsMenu.style.visibility = "hidden";
    }


}


export {GameUiController}
