

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
            window.onresize = function () {
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

/////////
const sceneClasses = [
    OITScene,
    EmptyScene
]
let currentSceneIndex = 0;
let webGL2DemoPlayer: WebGL2DemoPlayer = null;
///////////
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
    webGL2DemoPlayer = new WebGL2DemoPlayer(webgl2Engine);
    const app: Application = new Application(webgl2Engine, webGL2DemoPlayer);
    runApp(app);
    //第一个场景
    changeSceneByIndex(currentSceneIndex, sceneClasses);
}


function changeSceneByIndex(index: number, scenes: any[]): void {
    if (index < scenes.length) {
        const clazz = scenes[index] as any;
        webGL2DemoPlayer.changeScene(new clazz(webGL2DemoPlayer));
    }
}

function nextScene(): void {
    ++currentSceneIndex;
    currentSceneIndex = currentSceneIndex % (sceneClasses.length);
    changeSceneByIndex(currentSceneIndex, sceneClasses);
}




