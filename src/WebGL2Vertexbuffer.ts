/**
 * WebGL2VertexBuffer
 */
type WebGL2VertexBufferDataType = number | Float32Array | Uint16Array | Int16Array | Uint8Array | Int8Array;
/**
 * WebGL2VertexBuffer
 */
class WebGL2VertexBuffer extends WebGL2Object {
    /**
     * WebGLBuffer
     */
    public buffer: WebGLBuffer;
    /**
     * 
     */
    public readonly type: number = 0;
    /**
    * 
    */
    public readonly itemSize: number = 0;
    /**
    * 
    */
    public readonly numItems: number = 0;
    /**
    * 
    */
    public readonly numColumns: number = 0;
    /**
    * 数据byte长度
    */
    private readonly byteLength: number = 0;
    /**
    * 数据长度
    */
    private readonly dataLength: number = 0;
    /**
    * STREAM_DRAW: 0x88E0,
    * STATIC_DRAW: 0x88E4,
    * DYNAMIC_DRAW: 0x88E8,
    */
    private readonly usage: number = 0;
    /**
    * 是否是索引缓存
    */
    private readonly indexArray: boolean;
    /**
    * 是否是整形数据的buffer
    */
    public readonly integer: boolean;
    /**
    * GL.ELEMENT_ARRAY_BUFFER or GL.ARRAY_BUFFER?
    */
    private readonly binding: number = 0;
    /**
     * constructor
     * @param _engine 
     * @param type 
     * @param itemSize 
     * @param data 
     * @param usage 
     * @param indexArray 
     */
    constructor(_engine: WebGL2Engine,
        type: number,
        itemSize: number,
        data: WebGL2VertexBufferDataType,
        usage: number = GL.STATIC_DRAW,
        indexArray: boolean = false) {

        super(_engine);
        //针对矩阵的特殊处理
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
        //计算数据长
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
        //设置
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
        //重制
        this.restore(data);
    }
    /**
     * 重制
     * @param data 
     */
    public restore(data: WebGL2VertexBufferDataType): WebGL2VertexBuffer {
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
    /**
     * 设置数据
     * @param data 
     */
    public data(data: WebGL2VertexBufferDataType): WebGL2VertexBuffer {
        const gl = this.gl;
        if (this.state.vertexArray) {
            gl.bindVertexArray(null);
            this.state.vertexArray = null;
        }
        gl.bindBuffer(this.binding, this.buffer);
        gl.bufferSubData(this.binding, 0, data as BufferSource);
        gl.bindBuffer(this.binding, null);
        return this;
    }
    /**
     * 删除
     */
    public delete(): WebGL2VertexBuffer {
        if (this.buffer) {
            this.gl.deleteBuffer(this.buffer);
            this.buffer = null;
        }
        return this;
    }
}
