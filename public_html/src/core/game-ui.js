

class GameUiController {

    constructor(ycfa, renderer) {
        this.ycfa = ycfa;
        this.renderer = renderer;
        this.initDocumentElements();
        //this.showRenderTarget();

    }

    initDocumentElements(){
        this.progressBar = document.querySelector('#progress-bar');
        this.renderTarget = document.querySelector("#render-target");
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
        /*
        let flag  = -1;
        const loadingElem = document.querySelector('#button');
        loadingElem.addEventListener("click", () => {
            flag *= -1;

            $('#menu')
                .transition('pulse')
            ;
            const menuEl = document.querySelector('#menu');

            if (flag === -1){
                menuEl.style.visibility = 'hidden';
                //abc.style.visibility = 'hidden';
            }
            else {
                menuEl.style.visibility = 'visible';
                //abc.style.visibility = 'visible';
            }

        });

        const resume = document.querySelector('#abc');
        resume.addEventListener("click",()=>{
            const menuEl = document.querySelector('#menu');
            flag *= -1;
            if (flag === -1){
                menuEl.style.visibility = 'hidden';
                //abc.style.visibility = 'hidden';
            }
            else {
                menuEl.style.visibility = 'visible';
                //abc.style.visibility = 'visible';
            }
        })

         */
    }





}


export {GameUiController}