class GameUiController {

    constructor(ycfa) {
        this.ycfa = ycfa;
        this.renderer = ycfa.renderer;
        this.inSettingsPage = false;
        this.introductionMade = false;
        this.musicIsPlaying = false;

        this.visibilities = {
            decisionPointActionInfoContainer: false,
            inspectionModeInfoContainer: false,
        }

        this.healthProgress = 0;

        this.initializeDocumentElements();
        this.showRenderTarget();

        this.ycfa.unregisterPlayerControlListeners();
        this.showMainMenu();

        this.initializeListeners();
        this.hideLoadingBar();


    }

    initializeListeners() {

          $('.ui.dropdown').dropdown()



        document.addEventListener("keyup", (e) => {
            if (e.key === "Escape") {
                this.ycfa.unregisterPlayerControlListeners();
                this.showMainMenu();
            }
        });

        document.addEventListener("pointerlockchange", (event) => {
            if (document.pointerLockElement !== this.ycfa.character.owner.renderer.domElement) {
                if (this.ycfa.playerControl.inspectionModeEnabled) {
                    return;
                }

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

            this.settingsPageBar.style.visibility = "hidden";
            this.graphicsSettingsTabMenu.style.visibility = "hidden";
            this.advanceSettingsTabMenu.style.visibility = "hidden";
            this.ycfa.registerPlayerControlListeners();
            this.hideMainMenu();


            let buttonTextNode = this.playButton.childNodes.item(0);
            buttonTextNode.textContent = "Resume";

            this.ycfa.character.cameraController.enterPointerLock();
        }

        this.musicButton.onclick = () => {

            if (this.musicIsPlaying) {
                this.ycfa.audio.stopMusic();
                document.getElementById("volume-on-of").className = "volume off icon";

            } else {
                this.ycfa.audio.playMusic();
                document.getElementById("volume-on-of").className = "volume up icon";
            }
            this.musicIsPlaying = !this.musicIsPlaying;


        }

        this.settingsButton.onclick = () => {

            let v = this.settingsPageBar.style.visibility;

            if (v === "visible"){
                this.settingsPageBar.style.visibility = "hidden";
            }else {
                this.settingsPageBar.style.visibility = "visible";
            }

            this.graphicsSettingsTabMenu.style.visibility = "visible";
            let buttonTextNode = this.settingsButton.childNodes.item(0);
            if (this.settingsPageBar.style.visibility === "visible"){
                buttonTextNode.textContent = "Hide Settings";
            }else {
                buttonTextNode.textContent = "Settings";
                this.graphicsSettingsTabMenu.style.visibility = "hidden";
                this.advanceSettingsTabMenu.style.visibility = "hidden";
            }



            //this.ycfa.flatShadingOption(this.ycfa.hyperParameters.flatShading);
            //this.ycfa.hyperParameters.flatShading = !this.ycfa.hyperParameters.flatShading;
        }

        this.settingsExitButton.onclick = () => {
            let v = this.settingsPageBar.style.visibility;

            if (v === "visible"){
                this.settingsPageBar.style.visibility = "hidden";
            }else {
                this.settingsPageBar.style.visibility = "visible";
            }
            this.graphicsSettingsTabMenu.style.visibility = "hidden";
            this.advanceSettingsTabMenu.style.visibility = "hidden";
        }

        this.graphicsSettingsTab.onclick = () => {
            this.graphicsSettingsTabMenu.style.visibility = "visible";
            this.advanceSettingsTabMenu.style.visibility = "hidden";
        }

        this.advanceSettingsTab.onclick = () => {
            this.advanceSettingsTabMenu.style.visibility = "visible";
            this.graphicsSettingsTabMenu.style.visibility = "hidden";
        }


    }

    update() {
        if (this.ycfa.environment.props.healthFactor !== this.healthProgress) {
            this.healthProgress = this.ycfa.environment.props.healthFactor;
            $('#health')
                .progress({
                    percent: this.healthProgress * 100,
                    text: {
                        active: 'You are surrounded by garbage!',
                        success: 'You saved the world. Thanks you!'
                    }
                });
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

        this.musicButton = document.querySelector("#music-button");
        this.healthBar = document.querySelector("#health-bar-id");

        this.posMessage = document.querySelector("#positive-info");
        this.settingsPageBar = document.querySelector("#settings-page-bar");
        this.settingsExitButton = document.querySelector("#exit-button");
        this.graphicsSettingsTab = document.querySelector("#graphics-settings");
        this.advanceSettingsTab = document.querySelector("#advance-settings");

        this.graphicsSettingsTabMenu = document.querySelector("#graphics-settings-menu");
        this.advanceSettingsTabMenu = document.querySelector("#advance-settings-menu");


    }

    showAndDestroyPositiveInfo() {
        $('.positive-info')
            .transition({
                animation: 'fade',
                duration: '2s',
                onComplete: function () {
                    console.log("fade is done!")
                }
            });
        ;

        $('.positive-info')
            .transition({
                animation: 'fade',
                duration: '5s',
                onComplete: function () {
                    console.log("fade is done!")
                }
            });
        ;
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
        this.healthBar.style.visibility = "visible";
    }

    hideRenderTarget() {
        this.renderTarget.style = "hidden";
    }

    hideLoadingBar() {
        this.progressBar.style.display = 'none';
    }

    showDecisionPointActionInfoContainer(actionText = "Remove") {
        if (!this.visibilities.decisionPointActionInfoContainer) {
            document.querySelector("#action-text").textContent = actionText;
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

    enterInspectionModeUI() {


        document.querySelector("#label-renderer").style.visibility = "hidden";

        if (!this.visibilities.inspectionModeInfoContainer) {
            $("#inspection-mode-info-container").transition("scale in");
            this.visibilities.inspectionModeInfoContainer = true;
        }
    }

    exitInspectionModeUI() {

        document.querySelector("#label-renderer").style.visibility = "visible";

        if (this.visibilities.inspectionModeInfoContainer) {
            $("#inspection-mode-info-container").transition("scale out");
            this.visibilities.inspectionModeInfoContainer = false;
        }
    }

    showGameSettings() {
        this.settingsMenu.style.visibility = "visible";
    }

    hideGameSettings() {
        this.settingsMenu.style.visibility = "hidden";
    }


}


export {GameUiController}
