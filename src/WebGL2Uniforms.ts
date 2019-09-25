
/**
 * 
 */
class SingleComponentUniform extends WebGL2Object {
    /**
     * 
     */
    private readonly handle: WebGLUniformLocation;
    /**
     * 
     */
    private readonly glFuncName: string;
    /**
     * 
     */
    private cache: boolean | number;
    /**
     * 
     * @param _engine 
     * @param handle 
     * @param type 
     */
    constructor(_engine: WebGL2Engine, handle: WebGLUniformLocation, type: number) {
        super(_engine);
        this.handle = handle;
        this.glFuncName = UNIFORM_FUNC_NAME[type];
        this.cache = (type === GL.BOOL ? false : 0);
        if (!this.gl[this.glFuncName]) {
            console.error('glFuncName do not exist = ' + this.glFuncName);
        }
    }
    /**
     * 
     * @param value 
     */
    public set(value: boolean | number): SingleComponentUniform {
        if (this.cache !== value) {
            this.gl[this.glFuncName](this.handle, value);
            this.cache = value;
        }
        return this;
    }
}
/**
 * 
 */
class MultiNumericUniform extends WebGL2Object {
    /**
     * 
     */
    private readonly handle: WebGLUniformLocation;
    /**
     * 
     */
    private readonly glFuncName: string;
    /**
     * 
     */
    private cache: Int32Array | Uint32Array | Float32Array;
    /**
     * 
     * @param _engine 
     * @param handle 
     * @param type 
     * @param count 
     */
    constructor(_engine: WebGL2Engine, handle: WebGLUniformLocation, type: number, count: number) {
        super(_engine);
        this.handle = handle;
        this.glFuncName = UNIFORM_FUNC_NAME[type] + "v";
        this.cache = new UNIFORM_CACHE_CLASS[type](UNIFORM_COMPONENT_COUNT[type] * count);
        if (!this.gl[this.glFuncName]) {
            console.error('glFuncName do not exist = ' + this.glFuncName);
        }
    }
    /**
     * 
     * @param value 
     */
    public set(value: Int32Array | Uint32Array | Float32Array): MultiNumericUniform {
        for (let i = 0, len = value.length; i < len; ++i) {
            if (this.cache[i] !== value[i]) {
                this.gl[this.glFuncName](this.handle, value);
                this.cache.set(value);
                return this;
            }
        }
        return this;
    }
}
/**
 * 
 */
class MultiBoolUniform extends WebGL2Object {
    /**
     * 
     */
    private readonly handle: WebGLUniformLocation;
    /**
     * 
     */
    private readonly glFuncName: string;
    /**
     * 
     */
    private cache: boolean[];
    /**
     * 
     * @param _engine 
     * @param handle 
     * @param type 
     * @param count 
     */
    constructor(_engine: WebGL2Engine, handle: WebGLUniformLocation, type: number, count: number) {
        super(_engine);
        this.handle = handle;
        this.glFuncName = UNIFORM_FUNC_NAME[type] + "v";
        this.cache = new Array(UNIFORM_COMPONENT_COUNT[type] * count);
        this.cache.fill(false);
        if (!this.gl[this.glFuncName]) {
            console.error('glFuncName do not exist = ' + this.glFuncName);
        }
    }
    /**
     * 
     * @param value 
     */
    public set(value: boolean[]): MultiBoolUniform {
        for (let i = 0, len = value.length; i < len; ++i) {
            if (this.cache[i] !== value[i]) {
                this.gl[this.glFuncName](this.handle, value);
                for (let j = i; j < len; j++) {
                    this.cache[j] = value[j];
                }
                return this;
            }
        }
        return this;
    }
}
/**
 * 
 */
class MatrixUniform extends WebGL2Object {
    /**
     * 
     */
    private readonly handle: WebGLUniformLocation;
    /**
     * 
     */
    private readonly glFuncName: string;
    /**
     * 
     */
    private cache: Float32Array;
    /**
     * 
     * @param _engine 
     * @param handle 
     * @param type 
     * @param count 
     */
    constructor(_engine: WebGL2Engine, handle: WebGLUniformLocation, type: number, count: number) {
        super(_engine);
        this.handle = handle;
        this.glFuncName = UNIFORM_FUNC_NAME[type];
        this.cache = new Float32Array(UNIFORM_COMPONENT_COUNT[type] * count);
        if (!this.gl[this.glFuncName]) {
            console.error('glFuncName do not exist = ' + this.glFuncName);
        }
    }
    /**
     * 
     * @param value 
     */
    public set(value: Float32Array): MatrixUniform {
        for (let i = 0, len = value.length; i < len; ++i) {
            if (this.cache[i] !== value[i]) {
                this.gl[this.glFuncName](this.handle, false, value);
                this.cache.set(value);
                return this;
            }
        }
        return this;
    }
}