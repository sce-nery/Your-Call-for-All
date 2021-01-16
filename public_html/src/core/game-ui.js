

class GameUiController {

    constructor(ycfa, renderer) {
        this.ycfa = ycfa;
        this.renderer = renderer;
        this.initDocumentElements();
        this.showRenderTarget();
        //this.showGameSettings();
    }

    update(deltaTime){
        this.ycfa.update(deltaTime);
    }

    initDocumentElements(){
        this.progressBar = document.querySelector('#progress-bar');
        this.renderTarget = document.querySelector("#render-target");
        this.settings = document.querySelector("#settings");
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

        this.settings.style.visibility = "visible";
        this.ycfa.unregisterPlayerControlListeners();
    }





}


export {GameUiController}