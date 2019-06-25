
class WebGL2Engine {

    private readonly _canvas: HTMLCanvasElement = null;
    private readonly _webgl2Context: WebGLRenderingContext = null;

    constructor(canvas: HTMLCanvasElement, contextAttributes: any) {
        this._canvas = canvas;
        this._webgl2Context = canvas.getContext("webgl2", contextAttributes) as WebGLRenderingContext;
    }

    public get gl(): WebGLRenderingContext {
        return this._webgl2Context;
    }

    public render(): void {
    }

    public stop(): void {
    }

    public dispose(): void {
    }

    public resize(width: number, height: number): void {
    }

    public createTimer(): WebGL2Timer {
      return new WebGL2Timer(this);
  }
}

