

class WebGL2VertexBuffer extends WebGL2Object {

    public buffer: WebGLBuffer = null;
    private readonly type: number = 0;
    private readonly itemSize: number = 0;
    private readonly numItems: number = 0;
    private readonly numColumns: number = 0;
    private readonly byteLength: number = 0;
    private readonly dataLength: number = 0;
    private readonly usage: number = 0;
    private readonly indexArray: boolean = false;
    private readonly integer: boolean = false;
    private readonly binding: number = 0;

    constructor(_engine: WebGL2Engine, type: number, itemSize: number, data: number | Float32Array | Uint16Array | Uint8Array, usage: number = GL.STATIC_DRAW, indexArray: boolean = false) {
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

    public restore(data: number | Float32Array | Uint16Array | Uint8Array): WebGL2VertexBuffer {
        if (!data) {
            data = this.byteLength;
        }
        if (this.state.vertexArray) {
            this.gl.bindVertexArray(null);
            this.state.vertexArray = null;
        }
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.binding, this.buffer);
        this.gl.bufferData(this.binding, (data as any), this.usage);
        this.gl.bindBuffer(this.binding, null);
        return this;
    }

    public data(data: Float32Array | Uint16Array | Uint8Array): WebGL2VertexBuffer {
        if (this.state.vertexArray) {
            this.gl.bindVertexArray(null);
            this.state.vertexArray = null;
        }
        this.gl.bindBuffer(this.binding, this.buffer);
        this.gl.bufferSubData(this.binding, 0, data);
        this.gl.bindBuffer(this.binding, null);
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
