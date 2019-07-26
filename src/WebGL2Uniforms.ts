
// const UNIFORM_FUNC_NAME: { [index: number]: string } = {};
// UNIFORM_FUNC_NAME[GL.BOOL] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.INT] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.SAMPLER_2D] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.INT_SAMPLER_2D] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.UNSIGNED_INT_SAMPLER_2D] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.SAMPLER_2D_SHADOW] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.SAMPLER_2D_ARRAY] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.INT_SAMPLER_2D_ARRAY] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.UNSIGNED_INT_SAMPLER_2D_ARRAY] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.SAMPLER_2D_ARRAY_SHADOW] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.SAMPLER_CUBE] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.INT_SAMPLER_CUBE] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.UNSIGNED_INT_SAMPLER_CUBE] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.SAMPLER_CUBE_SHADOW] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.SAMPLER_3D] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.INT_SAMPLER_3D] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.UNSIGNED_INT_SAMPLER_3D] = "uniform1i";
// UNIFORM_FUNC_NAME[GL.UNSIGNED_INT] = "uniform1ui";
// UNIFORM_FUNC_NAME[GL.FLOAT] = "uniform1f";
// UNIFORM_FUNC_NAME[GL.FLOAT_VEC2] = "uniform2f";
// UNIFORM_FUNC_NAME[GL.FLOAT_VEC3] = "uniform3f";
// UNIFORM_FUNC_NAME[GL.FLOAT_VEC4] = "uniform4f";
// UNIFORM_FUNC_NAME[GL.INT_VEC2] = "uniform2i";
// UNIFORM_FUNC_NAME[GL.INT_VEC3] = "uniform3i";
// UNIFORM_FUNC_NAME[GL.INT_VEC4] = "uniform4i";
// UNIFORM_FUNC_NAME[GL.UNSIGNED_INT_VEC2] = "uniform2ui";
// UNIFORM_FUNC_NAME[GL.UNSIGNED_INT_VEC3] = "uniform3ui";
// UNIFORM_FUNC_NAME[GL.UNSIGNED_INT_VEC4] = "uniform4ui";
// UNIFORM_FUNC_NAME[GL.BOOL_VEC2] = "uniform2i";
// UNIFORM_FUNC_NAME[GL.BOOL_VEC3] = "uniform3i";
// UNIFORM_FUNC_NAME[GL.BOOL_VEC4] = "uniform4i";
// UNIFORM_FUNC_NAME[GL.FLOAT_MAT2] = "uniformMatrix2fv";
// UNIFORM_FUNC_NAME[GL.FLOAT_MAT3] = "uniformMatrix3fv";
// UNIFORM_FUNC_NAME[GL.FLOAT_MAT4] = "uniformMatrix4fv";
// UNIFORM_FUNC_NAME[GL.FLOAT_MAT2x3] = "uniformMatrix2x3fv";
// UNIFORM_FUNC_NAME[GL.FLOAT_MAT2x4] = "uniformMatrix2x4fv";
// UNIFORM_FUNC_NAME[GL.FLOAT_MAT3x2] = "uniformMatrix3x2fv";
// UNIFORM_FUNC_NAME[GL.FLOAT_MAT3x4] = "uniformMatrix3x4fv";
// UNIFORM_FUNC_NAME[GL.FLOAT_MAT4x2] = "uniformMatrix4x2fv";
// UNIFORM_FUNC_NAME[GL.FLOAT_MAT4x3] = "uniformMatrix4x3fv";

// const UNIFORM_COMPONENT_COUNT: { [index: number]: number } = {};
// UNIFORM_COMPONENT_COUNT[GL.BOOL] = 1;
// UNIFORM_COMPONENT_COUNT[GL.INT] = 1;
// UNIFORM_COMPONENT_COUNT[GL.SAMPLER_2D] = 1;
// UNIFORM_COMPONENT_COUNT[GL.INT_SAMPLER_2D] = 1;
// UNIFORM_COMPONENT_COUNT[GL.UNSIGNED_INT_SAMPLER_2D] = 1;
// UNIFORM_COMPONENT_COUNT[GL.SAMPLER_2D_SHADOW] = 1;
// UNIFORM_COMPONENT_COUNT[GL.SAMPLER_2D_ARRAY] = 1;
// UNIFORM_COMPONENT_COUNT[GL.INT_SAMPLER_2D_ARRAY] = 1;
// UNIFORM_COMPONENT_COUNT[GL.UNSIGNED_INT_SAMPLER_2D_ARRAY] = 1;
// UNIFORM_COMPONENT_COUNT[GL.SAMPLER_2D_ARRAY_SHADOW] = 1;
// UNIFORM_COMPONENT_COUNT[GL.SAMPLER_CUBE] = 1;
// UNIFORM_COMPONENT_COUNT[GL.INT_SAMPLER_CUBE] = 1;
// UNIFORM_COMPONENT_COUNT[GL.UNSIGNED_INT_SAMPLER_CUBE] = 1;
// UNIFORM_COMPONENT_COUNT[GL.SAMPLER_CUBE_SHADOW] = 1;
// UNIFORM_COMPONENT_COUNT[GL.SAMPLER_3D] = 1;
// UNIFORM_COMPONENT_COUNT[GL.INT_SAMPLER_3D] = 1;
// UNIFORM_COMPONENT_COUNT[GL.UNSIGNED_INT_SAMPLER_3D] = 1;
// UNIFORM_COMPONENT_COUNT[GL.UNSIGNED_INT] = 1;
// UNIFORM_COMPONENT_COUNT[GL.FLOAT] = 1;
// UNIFORM_COMPONENT_COUNT[GL.FLOAT_VEC2] = 2;
// UNIFORM_COMPONENT_COUNT[GL.FLOAT_VEC3] = 3;
// UNIFORM_COMPONENT_COUNT[GL.FLOAT_VEC4] = 4;
// UNIFORM_COMPONENT_COUNT[GL.INT_VEC2] = 2;
// UNIFORM_COMPONENT_COUNT[GL.INT_VEC3] = 3;
// UNIFORM_COMPONENT_COUNT[GL.INT_VEC4] = 4;
// UNIFORM_COMPONENT_COUNT[GL.UNSIGNED_INT_VEC2] = 2;
// UNIFORM_COMPONENT_COUNT[GL.UNSIGNED_INT_VEC3] = 3;
// UNIFORM_COMPONENT_COUNT[GL.UNSIGNED_INT_VEC4] = 4;
// UNIFORM_COMPONENT_COUNT[GL.BOOL_VEC2] = 2;
// UNIFORM_COMPONENT_COUNT[GL.BOOL_VEC3] = 3;
// UNIFORM_COMPONENT_COUNT[GL.BOOL_VEC4] = 4;
// UNIFORM_COMPONENT_COUNT[GL.FLOAT_MAT2] = 4;
// UNIFORM_COMPONENT_COUNT[GL.FLOAT_MAT3] = 9;
// UNIFORM_COMPONENT_COUNT[GL.FLOAT_MAT4] = 16;
// UNIFORM_COMPONENT_COUNT[GL.FLOAT_MAT2x3] = 6;
// UNIFORM_COMPONENT_COUNT[GL.FLOAT_MAT2x4] = 8;
// UNIFORM_COMPONENT_COUNT[GL.FLOAT_MAT3x2] = 6;
// UNIFORM_COMPONENT_COUNT[GL.FLOAT_MAT3x4] = 12;
// UNIFORM_COMPONENT_COUNT[GL.FLOAT_MAT4x2] = 8;
// UNIFORM_COMPONENT_COUNT[GL.FLOAT_MAT4x3] = 12;

// const UNIFORM_CACHE_CLASS: { [index: number]: Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor } = {};
// UNIFORM_CACHE_CLASS[GL.INT] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.SAMPLER_2D] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.INT_SAMPLER_2D] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.UNSIGNED_INT_SAMPLER_2D] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.SAMPLER_2D_SHADOW] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.SAMPLER_2D_ARRAY] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.INT_SAMPLER_2D_ARRAY] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.UNSIGNED_INT_SAMPLER_2D_ARRAY] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.SAMPLER_2D_ARRAY_SHADOW] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.SAMPLER_CUBE] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.INT_SAMPLER_CUBE] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.UNSIGNED_INT_SAMPLER_CUBE] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.SAMPLER_CUBE_SHADOW] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.SAMPLER_3D] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.INT_SAMPLER_3D] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.UNSIGNED_INT_SAMPLER_3D] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.UNSIGNED_INT] = Uint32Array;
// UNIFORM_CACHE_CLASS[GL.FLOAT] = Float32Array;
// UNIFORM_CACHE_CLASS[GL.FLOAT_VEC2] = Float32Array;
// UNIFORM_CACHE_CLASS[GL.FLOAT_VEC3] = Float32Array;
// UNIFORM_CACHE_CLASS[GL.FLOAT_VEC4] = Float32Array;
// UNIFORM_CACHE_CLASS[GL.INT_VEC2] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.INT_VEC3] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.INT_VEC4] = Int32Array;
// UNIFORM_CACHE_CLASS[GL.UNSIGNED_INT_VEC2] = Uint32Array;
// UNIFORM_CACHE_CLASS[GL.UNSIGNED_INT_VEC3] = Uint32Array;
// UNIFORM_CACHE_CLASS[GL.UNSIGNED_INT_VEC4] = Uint32Array;

class SingleComponentUniform extends WebGL2Object {

    private handle: WebGLUniformLocation;
    private glFuncName: string;
    private cache: boolean | number;

    constructor(_engine: WebGL2Engine, handle: WebGLUniformLocation, type: number) {
        super(_engine);
        this.handle = handle;
        this.glFuncName = UNIFORM_FUNC_NAME[type];
        this.cache = (type === GL.BOOL ? false : 0);
    }

    public set(value: boolean | number): SingleComponentUniform {
        if (this.cache !== value) {
            this.gl[this.glFuncName](this.handle, value);
            this.cache = value;
        }
        return this;
    }
}

class MultiNumericUniform extends WebGL2Object {

    private handle: WebGLUniformLocation;
    private glFuncName: string;
    private count: number;
    private cache: Int32Array | Uint32Array | Float32Array;

    constructor(_engine: WebGL2Engine, handle: WebGLUniformLocation, type: number, count: number) {
        super(_engine);
        this.handle = handle;
        this.glFuncName = UNIFORM_FUNC_NAME[type] + "v";
        this.count = count;
        this.cache = new UNIFORM_CACHE_CLASS[type](UNIFORM_COMPONENT_COUNT[type] * count);
    }

    public set(value: Int32Array | Uint32Array | Float32Array): MultiNumericUniform {
        for (let i = 0, len = value.length; i < len; ++i) {
            if (this.cache[i] !== value[i]) {
                this.gl[this.glFuncName](this.handle, value);
                this.cache.set(value);
                return;
            }
        }
        return this;
    }
}

class MultiBoolUniform extends WebGL2Object {

    private handle: WebGLUniformLocation;
    private glFuncName: string;
    private count: number;
    private cache: boolean[];

    constructor(_engine: WebGL2Engine, handle: WebGLUniformLocation, type: number, count: number) {
        super(_engine);
        this.handle = handle;
        this.glFuncName = UNIFORM_FUNC_NAME[type] + "v";
        this.count = count;
        this.cache = new Array(UNIFORM_COMPONENT_COUNT[type] * count)/*.fill(false)*/;
    }

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

class MatrixUniform extends WebGL2Object {

    private handle: WebGLUniformLocation;
    private glFuncName: string;
    private count: number;
    private cache: Float32Array;

    constructor(_engine: WebGL2Engine, handle: WebGLUniformLocation, type: number, count: number) {
        super(_engine);
        this.handle = handle;
        this.glFuncName = UNIFORM_FUNC_NAME[type];
        this.count = count;
        this.cache = new Float32Array(UNIFORM_COMPONENT_COUNT[type] * count);
    }

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
