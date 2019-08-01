

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

function getQualifiedClassName(value: any): string {
    let type = typeof value;
    if (!value || (type != "object" && !value.prototype)) {
        return type;
    }
    let prototype: any = value.prototype ? value.prototype : Object.getPrototypeOf(value);
    if (prototype.hasOwnProperty("__class__")) {
        return prototype["__class__"];
    }
    let constructorString: string = prototype.constructor.toString().trim();
    let index: number = constructorString.indexOf("(");
    let className: string = constructorString.substring(9, index);
    Object.defineProperty(prototype, "__class__", {
        value: className,
        enumerable: false,
        writable: true
    });
    return className;
}

/////////
const __SceneClasses__ = [
    OcclusionScene,
    MeshCompressionScene,
    BloomScene,
    OmniShadowScene,
    ParticlesScene,
    OutlineScene,
    DofScene,
    DeferredScene,
    PickingScene,
    InterleavedTriangleScene,
    _125CubesScene,
    _64CubesScene,
    InstancedScene,
    _3DTextureScene,
    RenderTo3DTextureScene,
    WanderingTrianglesScene,
    CubemapScene,
    CubeScene,
    RenderToCubemapScene,
    MSAAScene,
    RTTScene,
    SSAOScene,
    ShadowScene,
    TextureArrayScene,
    TriangleScene,
    UBOScene,
    OITScene,
];
let __currentSceneIndex__ = 0;
let __webGL2DemoPlayer__: WebGL2DemoPlayer = null;
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
    const contextAttributes = {
        stencil: true
    };
    const webgl2Engine = new WebGL2Engine(canvas, contextAttributes);
    __webGL2DemoPlayer__ = new WebGL2DemoPlayer(webgl2Engine);
    const app: Application = new Application(webgl2Engine, __webGL2DemoPlayer__);
    runApp(app);
    //第一个场景
    gotoScene(__webGL2DemoPlayer__, __currentSceneIndex__, __SceneClasses__);
}


function gotoScene(webGL2DemoPlayer: WebGL2DemoPlayer, index: number, scenes: any[]): void {
    if (!webGL2DemoPlayer) {
        return;
    }
    if (index < scenes.length) {
        const clazz = scenes[index] as any;
        console.log(`[${index}] => ` + getQualifiedClassName(clazz));
        webGL2DemoPlayer.changeScene(new clazz(webGL2DemoPlayer));
    }
}

let __lockChangeScene__: boolean = false;
function lockChangeScene(lock: boolean = true): void {
    __lockChangeScene__ = lock;
}

function nextScene(): void {
    if (__lockChangeScene__) {
        return;
    }
    ++__currentSceneIndex__;
    __currentSceneIndex__ = __currentSceneIndex__ % (__SceneClasses__.length);
    gotoScene(__webGL2DemoPlayer__, __currentSceneIndex__, __SceneClasses__);
}




