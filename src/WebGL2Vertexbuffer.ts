

class WebGL2VertexBuffer extends WebGL2Object {

    public buffer: WebGLBuffer;
    public readonly type: number = 0;
    public readonly itemSize: number = 0;
    public readonly numItems: number = 0;
    public readonly numColumns: number = 0;
    private readonly byteLength: number = 0;
    private readonly dataLength: number = 0;
    private readonly usage: number = 0;
    private readonly indexArray: boolean = false;
    public readonly integer: boolean = false;
    private readonly binding: number = 0;

    constructor(_engine: WebGL2Engine, type: number, itemSize: number, data: number | Float32Array | Uint16Array | Uint8Array | Int8Array | Int16Array, usage: number = GL.STATIC_DRAW, indexArray: boolean = false) {
        super(_engine);
        let numColumns = 0;
        switch (type) {
            case GL.FLOAT_MAT4:
            case GL.FLOAT_MAT4x2:
            case GL.FLOAT_MAT4x3:
                numColumns = 4;
                break;
            case GL.FLOAT_MAT3:
            case GL.FLOAT_MAT3x2:
            case GL.FLOAT_MAT3x4:
                numColumns = 3;
                break;
            case GL.FLOAT_MAT2:
            case GL.FLOAT_MAT2x3:
            case GL.FLOAT_MAT2x4:
                numColumns = 2;
                break;
            default:
                numColumns = 1;
                break;
        }
        switch (type) {
            case GL.FLOAT_MAT4:
            case GL.FLOAT_MAT3x4:
            case GL.FLOAT_MAT2x4:
                itemSize = 4;
                type = GL.FLOAT;
                break;
            case GL.FLOAT_MAT3:
            case GL.FLOAT_MAT4x3:
            case GL.FLOAT_MAT2x3:
                itemSize = 3;
                type = GL.FLOAT;
                break;
            case GL.FLOAT_MAT2:
            case GL.FLOAT_MAT3x2:
            case GL.FLOAT_MAT4x2:
                itemSize = 2;
                type = GL.FLOAT;
                break;
        }
        let dataLength = 0;
        let byteLength = 0;
        if (typeof data === "number") {
            dataLength = data;
            if (type) {
                /*
                const TYPE_SIZE = {
                    [GL.BYTE]: 1,
                    [GL.UNSIGNED_BYTE]: 1,
                    [GL.SHORT]: 2,
                    [GL.UNSIGNED_SHORT]: 2,
                    [GL.INT]: 4,
                    [GL.UNSIGNED_INT]: 4,
                    [GL.FLOAT]: 4
                };
                */
                data *= TYPE_SIZE[type];
            }
            byteLength = data;
        } else {
            dataLength = data.length;
            byteLength = data.byteLength;
        }
        this.type = type;
        this.itemSize = itemSize;
        this.numItems = type ? dataLength / (itemSize * numColumns) : byteLength / itemSize;
        this.numColumns = numColumns;
        this.byteLength = byteLength;
        this.dataLength = dataLength;
        this.usage = usage;
        this.indexArray = Boolean(indexArray);
        this.integer = Boolean(INTEGER_TYPES[this.type]);
        this.binding = this.indexArray ? GL.ELEMENT_ARRAY_BUFFER : GL.ARRAY_BUFFER;
        this.restore(data);
    }

    public restore(data: number | Float32Array | Uint16Array | Uint8Array | Int8Array | Int16Array): WebGL2VertexBuffer {
        if (!data) {
            data = this.byteLength;
        }
        const gl = this.gl;
        if (this.state.vertexArray) {
            gl.bindVertexArray(null);
            this.state.vertexArray = null;
        }
        this.buffer = gl.createBuffer();
        gl.bindBuffer(this.binding, this.buffer);
        gl.bufferData(this.binding, (data as any), this.usage);
        gl.bindBuffer(this.binding, null);
        return this;
    }

    public data(data: Float32Array | Uint16Array | Uint8Array): WebGL2VertexBuffer {
        const gl = this.gl;
        if (this.state.vertexArray) {
            gl.bindVertexArray(null);
            this.state.vertexArray = null;
        }
        gl.bindBuffer(this.binding, this.buffer);
        gl.bufferSubData(this.binding, 0, data);
        gl.bindBuffer(this.binding, null);
        return this;
    }

    public delete(): WebGL2VertexBuffer {
        if (this.buffer) {
            this.gl.deleteBuffer(this.buffer);
            this.buffer = null;
        }
        return this;
    }
}
