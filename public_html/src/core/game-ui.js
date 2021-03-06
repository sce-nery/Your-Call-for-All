import * as THREE from "../../vendor/three-js/build/three.module.js";

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
        this.messages = [
            "Hurry up before you lose it all.",
            "You are surrounded by garbage!",
            "You really like to destroy it, huh?",
            "Ew! It smells awful.",
            "What did you do to butterflies?",


            "Do something before it’s too late.",
            "Not a pretty scenery, huh?",
            "Don’t you care about the sharks, trees, even yourself?",
            "Not the best view I have ever seen.",
            "So quiet, where are the animals?",


            "It could be better but I could live here.",
            "You can do it, listen to your heart.",
            "This place could look so much better with more green.",
            "Make this place like somewhere you dream to live in!",
            "Go ahead and clean this place, I trust you.",


            "Wow! What a lovely place.",
            "Look at the butterflies, they are dancing!",
            "This place brings me joy, make it stay that way!",
            "The air is addictive today if there is such a thing.",
            "Have you ever seen such a blue? It’s magical.",


            "I want to stay here forever if only everyone treated the environment as you do!",
            "The air, the smell, the view, it’s fascinating.",
            "There is something in the air, almost addictive.",
            "You’re doing great, look at how beautiful the butterflies look!",
            "You are our saviour! Enjoy the beautiful scenery.",
        ];

    }

    update(deltaTime) {
        if (this.ycfa.environment.props.healthFactor !== this.healthProgress) {
            this.healthProgress = this.ycfa.environment.props.healthFactor;

            let health = Math.round(this.healthProgress * 4) * 5; // 0 5 10 15 20
            let randomNum = Math.round(Math.random() * 4);  // 0-4
            let message = this.messages[health + randomNum];

            $('#health')
                .progress({
                    percent: this.healthProgress * 100,
                    text: {
                        active: message,
                    }
                });
        }
    }

    initializeDocumentElements() {
        this.progressBar = document.querySelector('#progress-bar');
        this.renderTarget = document.querySelector("#render-target");

        this.menu = document.querySelector("#menu-container");

        this.info = document.querySelector("#info-container");

        this.controlsInfo = document.querySelector("#main-menu-controls-info-container");

        this.playButton = document.querySelector("#play-button");
        this.settingsButton = document.querySelector("#settings-button");

        this.decisionPointActionInfoContainer = document.querySelector("#decision-point-action-info-container");

        this.musicButton = document.querySelector("#music-button");
        this.healthBar = document.querySelector("#health-bar-id");

        this.posMessage = document.querySelector("#positive-info");


        this.settingsPageBar = document.querySelector("#settings-page-bar");
        this.graphicsSettingsTab = document.querySelector("#graphics-settings");
        this.advanceSettingsTab = document.querySelector("#advance-settings");

        this.graphicsSettingsTabMenu = document.querySelector("#graphics-settings-menu");
        this.advanceSettingsTabMenu = document.querySelector("#advance-settings-menu");

        this.smoothShadingOption = document.querySelector("#smooth-shading-option");
        this.flatShadingOption = document.querySelector("#flat-shading-option");
        this.pixelRatio1 = document.querySelector("#pixel-ratio-1");
        this.pixelRatioHalf = document.querySelector("#pixel-ratio-half");
        this.pixelRatioQuarter = document.querySelector("#pixel-ratio-quarter");
        this.toneMappingNone = document.querySelector("#no-tone-mapping");
        this.toneMappingACES = document.querySelector("#aces-tone-mapping");
        this.toneMappingReinhard = document.querySelector("#reinhard-tone-mapping");
        this.environmentMappingEnable = document.querySelector("#enable-env-mapping");
        this.environmentMappingDisable = document.querySelector("#disable-env-mapping");
        this.bloomEnable = document.querySelector("#enable-bloom");
        this.bloomDisable = document.querySelector("#disable-bloom");


        this.creditsButton = document.querySelector("#credits-button");
        this.creditsPageBar = document.querySelector("#credits-page-bar");
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
            this.creditsPageBar.style.visibility = "hidden";
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

            if (v === "visible") {
                this.settingsPageBar.style.visibility = "hidden";
            } else {
                this.settingsPageBar.style.visibility = "visible";
            }

            this.graphicsSettingsTabMenu.style.visibility = "visible";
            let buttonTextNode = this.settingsButton.childNodes.item(0);

            if (this.settingsPageBar.style.visibility === "visible") {
                buttonTextNode.textContent = "Hide Settings";
            } else {
                buttonTextNode.textContent = "Settings";
                this.graphicsSettingsTabMenu.style.visibility = "hidden";
                this.advanceSettingsTabMenu.style.visibility = "hidden";
            }

        }

        this.graphicsSettingsTab.onclick = () => {
            this.graphicsSettingsTabMenu.style.visibility = "visible";
            this.advanceSettingsTabMenu.style.visibility = "hidden";
        }

        this.advanceSettingsTab.onclick = () => {
            this.advanceSettingsTabMenu.style.visibility = "visible";
            this.graphicsSettingsTabMenu.style.visibility = "hidden";
        }

        this.creditsButton.onclick = () => {

            let v = this.creditsPageBar.style.visibility;

            let buttonTextNode = this.creditsButton.childNodes.item(0);

            if (v === "visible") {
                this.creditsPageBar.style.visibility = "hidden";
                buttonTextNode.textContent = "Credits";
            } else {
                this.creditsPageBar.style.visibility = "visible";
                buttonTextNode.textContent = "Hide Credits";
            }

        }


        this.smoothShadingOption.onclick = () => {
            this.ycfa.settings.shading = "smooth";
            this.ycfa.updateShading();
        }

        this.flatShadingOption.onclick = () => {
            this.ycfa.settings.shading = "flat";
            this.ycfa.updateShading();
        }

        this.pixelRatio1.onclick = () => {
            this.ycfa.renderer.setPixelRatio(1);
        }

        this.pixelRatioHalf.onclick = () => {
            this.ycfa.renderer.setPixelRatio(0.5);
        }

        this.pixelRatioQuarter.onclick = () => {
            this.ycfa.renderer.setPixelRatio(0.25);
        }

        this.toneMappingNone.onclick = () => {
            this.ycfa.renderer.toneMapping = THREE.NoToneMapping;
            this.ycfa.renderer.outputEncoding = THREE.LinearEncoding;
        }

        this.toneMappingReinhard.onclick = () => {
            this.ycfa.renderer.toneMapping = THREE.ReinhardToneMapping;
            this.ycfa.renderer.outputEncoding = THREE.sRGBEncoding;
        }

        this.toneMappingACES.onclick = () => {
            this.ycfa.renderer.toneMapping = THREE.ACESFilmicToneMapping;
             this.ycfa.renderer.outputEncoding = THREE.sRGBEncoding;
        }

        this.environmentMappingEnable.onclick = () => {
            this.ycfa.settings.environmentMappingEnabled = true;
        }

        this.environmentMappingDisable.onclick = () => {
            this.ycfa.settings.environmentMappingEnabled = false;
        }

        this.bloomEnable.onclick = () => {
            this.ycfa.settings.enableBloom();
        }

        this.bloomDisable.onclick = () => {
            this.ycfa.settings.disableBloom();
        }
    }

    showAndDestroyPositiveInfo(infoText) {
        let wordCount = infoText.split(" ").length;
        let duration = wordCount * 0.28;


        document.querySelector("#info-text").textContent = infoText;


        $('.positive-info').transition('scale');


        // sleep time expects milliseconds
        function sleep(time) {
            return new Promise((resolve) => setTimeout(resolve, time));
        }

        sleep(duration * 1000).then(() => {
            $('.positive-info').transition("scale");
        });

    }

    showMainMenu() {
        this.menu.style.visibility = "visible";
        this.info.style.visibility = "visible";
        this.controlsInfo.style.visibility = "visible";
    }

    hideMainMenu() {
        this.menu.style.visibility = "hidden";
        this.info.style.visibility = "hidden";
        this.controlsInfo.style.visibility = "hidden";
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


}


export {GameUiController}
