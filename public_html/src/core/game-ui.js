

class GameUiController {

    constructor(ycfa, renderer) {
        this.ycfa = ycfa;
        this.renderer = renderer;
        this.inSettingsPage =  false;
        this.initDocumentElements();
        this.showRenderTarget();
        this.addListeners();
    }

    update(deltaTime){
        this.ycfa.update(deltaTime);
    }

    addListeners(){
        this.settingsButton.addEventListener("click", ()=> {
            this.inSettingsPage  = !this.inSettingsPage;

            if(this.inSettingsPage){
                this.showGameSettings();
                this.ycfa.unregisterPlayerControlListeners();
            }else {
                this.hideGameSettings();
                this.ycfa.registerPlayerControlListeners();
            }

        });

        this.resumeGameButton.addEventListener("click", ()=> {
            this.inSettingsPage  = !this.inSettingsPage;

            if(this.inSettingsPage){
                this.showGameSettings();
                this.ycfa.unregisterPlayerControlListeners();
            }else {
                this.hideGameSettings();
                this.ycfa.registerPlayerControlListeners();
            }

        });
    }

    initDocumentElements(){
        this.progressBar = document.querySelector('#progress-bar');
        this.renderTarget = document.querySelector("#render-target");
        this.settingsMenu = document.querySelector("#settings-menu");
        this.settingsButton = document.querySelector("#settings-button-id");

        // Settings page elements
        this.resumeGameButton = document.querySelector("#resume-game-button-id");
    }

    showRenderTarget(){
        this.renderTarget.style  = "visible";
    }

    hideRenderTarget(){
        this.renderTarget.style  = "hidden";
    }

    hideLoadingBar(){
        this.progressBar.style.display = 'none';
    }

    showGameSettings(){
        this.settingsMenu.style.visibility = "visible";
    }

    hideGameSettings(){
        this.settingsMenu.style.visibility = "hidden";
    }





}


export {GameUiController}