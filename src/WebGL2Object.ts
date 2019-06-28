
class WebGL2Object {

    private readonly _engine: WebGL2Engine;
    private readonly _gl: WebGLRenderingContext;
    private readonly _state: WebGL2State;

    constructor(engine: WebGL2Engine) {
        this._engine = engine;
        this._gl = this._engine.gl;
        this._state = this._engine.state;
    }

    public delete(): WebGL2Object {
        console.warn(getQualifiedClassName(this) + ' miss delete();');
        return this;
    }

    public get engine(): WebGL2Engine {
        return this._engine;
    }

    public get gl(): WebGLRenderingContext {
        return this._gl;
    }

    public get state(): WebGL2State {
        return this._state;
    }
}
