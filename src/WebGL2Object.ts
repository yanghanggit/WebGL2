
/**
 * 把WebGL对象包一层，方便管理
 */
class WebGL2Object {
    /**
     * 引擎唯一对象
     */
    private readonly _engine: WebGL2Engine;
    /**
     * WebGLRenderingContext
     */
    private readonly _gl: WebGLRenderingContext;
    /**
     * 当前 WebGL状态的StateCache
     */
    private readonly _state: WebGL2State;
    /**
     * constructor
     * @param engine 
     */
    constructor(engine: WebGL2Engine) {
        this._engine = engine;
        this._gl = this._engine.gl;
        this._state = this._engine.state;
    }
    /**
     * 删除，可以释放WebGL资源
     */
    public delete(): WebGL2Object {
        console.warn(getQualifiedClassName(this) + ' miss delete();');
        return this;
    }
    /**
     * getter
     */
    public get engine(): WebGL2Engine {
        return this._engine;
    }
    /**
    * getter
    */
    public get gl(): WebGLRenderingContext {
        return this._gl;
    }
    /**
    * getter
    */
    public get state(): WebGL2State {
        return this._state;
    }
}
