
class WebGL2Engine {

    private readonly _canvas: HTMLCanvasElement = null;
    private readonly _webgl2Context: WebGLRenderingContext = null;

    constructor(canvas: HTMLCanvasElement, contextAttributes: any) {
        //super();
        this._canvas = canvas;
        this._webgl2Context = canvas.getContext("webgl2", contextAttributes) as WebGLRenderingContext;
    }

    public get gl(): WebGLRenderingContext {
        return this._webgl2Context;
    }

    public render(): void {
       //super.render();
    }

    public stop(): void {
       // super.stop();
    }

    public destroy(): void {
       // super.destroy();
    }

    public resize(width: number, height: number): void {
       // super.resize(width, height);
    }
}

