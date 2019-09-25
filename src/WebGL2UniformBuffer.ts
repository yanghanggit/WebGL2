/**
 * 
 */
class WebGL2UniformBuffer extends WebGL2Object {
    /**
     * WebGLBuffer
     */
    private buffer: WebGLBuffer;
    /**
     * 多个格式的数据
     */
    private readonly dataViews: { [index: number]: Float32Array | Int32Array | Uint32Array } = {};
    /**
     * 更新使用
     */
    private readonly offsets: number[];
    /**
     * 更新使用
     */
    private readonly sizes: number[];
    /**
     * 
     */
    private readonly types: number[];
    /**
     * 
     */
    private size: number = 0;
    /**
     * 
     */
    private readonly usage: number = 0;
    /**
     * 
     */
    private currentBase: number = -1;
    /**
     * 
     */
    private readonly type: number;
    /**
     * 
     */
    private readonly data: Float32Array;
    /**
     * 更新使用
     */
    private dirtyStart: number;
    /**
     * 更新使用
     */
    private dirtyEnd: number = 0;

    constructor(_engine: WebGL2Engine, layout: number[], usage: number = GL.DYNAMIC_DRAW) {
        super(_engine);
        this.offsets = new Array(layout.length);
        this.sizes = new Array(layout.length);
        this.types = new Array(layout.length);
        this.usage = usage;
        for (let i = 0, len = layout.length; i < len; ++i) {
            const type = layout[i];
            switch (type) {
                case GL.FLOAT:
                case GL.INT:
                case GL.UNSIGNED_INT:
                case GL.BOOL:
                    this.offsets[i] = this.size;
                    this.sizes[i] = 1;
                    if (type === GL.INT) {
                        this.types[i] = GL.INT;
                    } else if (this.type === GL.UNSIGNED_INT) {
                        this.types[i] = GL.UNSIGNED_INT;
                    } else {
                        this.types[i] = GL.FLOAT;
                    }
                    this.size++;
                    break;
                case GL.FLOAT_VEC2:
                case GL.INT_VEC2:
                case GL.UNSIGNED_INT_VEC2:
                case GL.BOOL_VEC2:
                    this.size += this.size % 2;
                    this.offsets[i] = this.size;
                    this.sizes[i] = 2;
                    if (type === GL.INT_VEC2) {
                        this.types[i] = GL.INT;
                    } else if (this.type === GL.UNSIGNED_INT_VEC2) {
                        this.types[i] = GL.UNSIGNED_INT;
                    } else {
                        this.types[i] = GL.FLOAT;
                    }
                    this.size += 2;
                    break;
                case GL.FLOAT_VEC3:
                case GL.INT_VEC3:
                case GL.UNSIGNED_INT_VEC3:
                case GL.BOOL_VEC3:
                case GL.FLOAT_VEC4:
                case GL.INT_VEC4:
                case GL.UNSIGNED_INT_VEC4:
                case GL.BOOL_VEC4:
                    this.size += (4 - this.size % 4) % 4;
                    this.offsets[i] = this.size;
                    this.sizes[i] = 4;
                    if (type === GL.INT_VEC4 || type === GL.INT_VEC3) {
                        this.types[i] = GL.INT;
                    } else if (this.type === GL.UNSIGNED_INT_VEC4 || this.type === GL.UNSIGNED_INT_VEC3) {
                        this.types[i] = GL.UNSIGNED_INT;
                    } else {
                        this.types[i] = GL.FLOAT;
                    }
                    this.size += 4;
                    break;
                case GL.FLOAT_MAT2:
                case GL.FLOAT_MAT2x3:
                case GL.FLOAT_MAT2x4:
                    this.size += (4 - this.size % 4) % 4;
                    this.offsets[i] = this.size;
                    this.sizes[i] = 8;
                    this.types[i] = GL.FLOAT;
                    this.size += 8;
                    break;
                case GL.FLOAT_MAT3:
                case GL.FLOAT_MAT3x2:
                case GL.FLOAT_MAT3x4:
                    this.size += (4 - this.size % 4) % 4;
                    this.offsets[i] = this.size;
                    this.sizes[i] = 12;
                    this.types[i] = GL.FLOAT;
                    this.size += 12;
                    break;
                case GL.FLOAT_MAT4:
                case GL.FLOAT_MAT4x2:
                case GL.FLOAT_MAT4x3:
                    this.size += (4 - this.size % 4) % 4;
                    this.offsets[i] = this.size;
                    this.sizes[i] = 16;
                    this.types[i] = GL.FLOAT;
                    this.size += 16;
                    break;
                default:
                    console.error("Unsupported type for uniform buffer.");
                    break;
            }
        }
        this.size += (4 - this.size % 4) % 4;
        this.data = new Float32Array(this.size);
        this.dataViews[GL.FLOAT] = this.data;
        this.dataViews[GL.INT] = new Int32Array(this.data.buffer);
        this.dataViews[GL.UNSIGNED_INT] = new Uint32Array(this.data.buffer);
        this.dirtyStart = this.size;
        this.restore();
    }
    /**
     * 
     */
    public restore(): WebGL2UniformBuffer {
        if (this.currentBase !== -1 && this.state.uniformBuffers[this.currentBase] === this) {
            this.state.uniformBuffers[this.currentBase] = null;
        }
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(GL.UNIFORM_BUFFER, this.buffer);
        this.gl.bufferData(GL.UNIFORM_BUFFER, this.size * 4, this.usage);
        this.gl.bindBuffer(GL.UNIFORM_BUFFER, null);
        return this;
    }
    /**
     * 局部赋值，等update来更新 dirtyStart + dirtyEnd
     * @param index 
     * @param value 
     */
    public set(index: number, value: number | boolean | Float32Array | Int32Array): WebGL2UniformBuffer {
        const view = this.dataViews[this.types[index]];
        const offset = this.offsets[index];
        const size = this.sizes[index];
        if (this.sizes[index] === 1) {
            view[offset] = value as number;
        } else {
            view.set(value as Float32Array | Int32Array | Uint32Array, offset);
        }
        if (offset < this.dirtyStart) {
            this.dirtyStart = offset;
        }
        if (this.dirtyEnd < offset + size) {
            this.dirtyEnd = offset + size;
        }
        return this;
    }
    /**
     * 局部更新bufferSubData
     */
    public update(): WebGL2UniformBuffer {
        if (this.dirtyStart >= this.dirtyEnd) {
            return this;
        }
        const data = this.data.subarray(this.dirtyStart, this.dirtyEnd);
        const offset = this.dirtyStart * 4;
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, this.buffer);
        this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, offset, data);
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null);
        this.dirtyStart = this.size;
        this.dirtyEnd = 0;
        return this;
    }
    /**
     * 删除对象
     */
    public delete(): WebGL2UniformBuffer {
        if (this.buffer) {
            this.gl.deleteBuffer(this.buffer);
            this.buffer = null;
            if (this.currentBase !== -1 && this.state.uniformBuffers[this.currentBase] === this) {
                this.state.uniformBuffers[this.currentBase] = null;
            }
        }
        return this;
    }
    /**
     * 绑定
     * @param base 
     */
    public bind(base: number): WebGL2UniformBuffer {
        const currentBuffer = this.state.uniformBuffers[base];
        if (currentBuffer !== this) {
            if (currentBuffer) {
                currentBuffer.currentBase = -1;
            }
            if (this.currentBase !== -1) {
                this.state.uniformBuffers[this.currentBase] = null;
            }
            this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, base, this.buffer);
            this.state.uniformBuffers[base] = this;
            this.currentBase = base;
        }
        return this;
    }
}
