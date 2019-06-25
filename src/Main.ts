

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

function runApp(app: Application): void {
    let stop: number = 0;
    function updateApp(): void {   
        if (!app.started) {
            window.onresize = function() {
                app.resize(window.innerWidth, window.innerHeight);
            };
            app.start();
        }
        if (!app.paused && app.started) {
            app.update();
        }
        if (app.exited) {
            app.stop().dispose();
            app = null;
            cancelAnimationFrame(stop);
        }
        else {
            stop = requestAnimationFrame(updateApp);
        }
    }
    stop = requestAnimationFrame(updateApp);
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
    const player = new Player;
    const app: Application = new Application(webgl2Engine, player);
    runApp(app);

    ///Users/yanghang/WebGL2/resource/assets
    // const vsFile = "resource/assets/vertex-accum.vertex";
    // //const fsFile = "resource/assets/shader1.frag.glsl";
    // loadShaderFromFile(vsFile, function (content: string) {
    //    console.log(vsFile + ' => ' + content);
    // });
}


