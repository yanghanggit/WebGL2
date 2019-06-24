

function createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = +width;
    canvas.height = +height;
    return canvas;
}

function queryContainer(): HTMLDivElement {
    const list = document.querySelectorAll(".egret-player");
    if (list.length > 0) {
        return list[0] as HTMLDivElement;
    }
    return null;
}

function attachCanvasToContainer(container: HTMLElement, canvas: HTMLCanvasElement): void {
    let style = canvas.style;
    style.cursor = "inherit";
    style.position = "absolute";
    style.top = "0";
    style.bottom = "0";
    style.left = "0";
    style.right = "0";
    container.appendChild(canvas);
    style = container.style;
    style.overflow = "hidden";
    style.position = "absolute";
}

function main(): void {
    //
    const version: string = '0.0.1';
    console.log('webgl2 demo version = ' + version);
    //
    const canvas = createCanvas(window.innerWidth, window.innerHeight);
    const container = queryContainer();
    attachCanvasToContainer(container, canvas);
    //
    const webgl2Engine = new WebGL2Engine(canvas, null);
    const gamePlay = new GamePlay;
    let app: Application = new Application(webgl2Engine, gamePlay);
    //
    window.onresize = function() {
        if (app) {
            app.resize(window.innerWidth, window.innerHeight);
        }
    };
    //
    let stop: number = 0;
    function tick(): void {   
        if (!app) {
            cancelAnimationFrame(stop);
            return;
        }
        if (!app.started) {
            app.start();
        }
        if (!app.paused) {
            app.run();
        }
        if (app.exit) {
            app.stop();
            app.destroy();
            app = null;
            cancelAnimationFrame(stop);
        }
        else {
            stop = requestAnimationFrame(tick);
        }
    }
    stop = requestAnimationFrame(tick);

    


    // const ctx2d = canvas.getContext('2d');
    // ctx2d.fillStyle = 'black';
    // ctx2d.fillRect(0, 0, canvas.width, canvas.height);
}


