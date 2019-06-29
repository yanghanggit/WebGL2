
// import { GL, TYPE_SIZE } from "./constants.js";

const INTEGER_TYPES = {
    [GL.BYTE]: true,
    [GL.UNSIGNED_BYTE]: true,
    [GL.SHORT]: true,
    [GL.UNSIGNED_SHORT]: true,
    [GL.INT]: true,
    [GL.UNSIGNED_INT]: true
};

/**
    Storage for vertex data.

    @class
    @prop {WebGLRenderingContext} gl The WebGL context.
    @prop {WebGLBuffer} buffer Allocated buffer storage.
    @prop {GLEnum} type The type of data stored in the buffer.
    @prop {number} itemSize Number of array elements per vertex.
    @prop {number} numItems Number of vertices represented.
    @prop {GLEnum} usage The usage pattern of the buffer.
    @prop {boolean} indexArray Whether this is an index array.
    @prop {GLEnum} binding GL binding point (ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER).
    @prop {Object} appState Tracked GL state.
*/
class WebGL2VertexBuffer {

    private readonly _engine: WebGL2Engine;
    private readonly gl: WebGLRenderingContext;
    private readonly appState: WebGL2State;

    public buffer;// = null;
    private type;// = type;
    private itemSize;// = itemSize;  // In bytes for interleaved arrays.
    private numItems;// = type ? dataLength / (itemSize * numColumns) : byteLength / itemSize;
    private numColumns;// = numColumns;
    private byteLength;// = byteLength;
    private dataLength;// = dataLength;
    private usage;// = usage;
    private indexArray;// = Boolean(indexArray);
    private integer;// = Boolean(INTEGER_TYPES[this.type]);
    private binding;// = this.indexArray ? GL.ELEMENT_ARRAY_BUFFER : GL.ARRAY_BUFFER;



    //    createVertexBuffer(type, itemSize, data, usage) {
    //     return new WebGL2VertexBuffer(/*this.gl, this.state,*/this, type, itemSize, data, usage);
    //  }

    constructor(/*gl, appState,*/_engine: WebGL2Engine, type, itemSize, data, usage: number = GL.STATIC_DRAW, indexArray: boolean = false) {
        this._engine = _engine;
        this.gl = _engine.gl;//gl;
        this.appState = _engine.state;//appState;
        //
        let numColumns;
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

        let dataLength;
        let byteLength;
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

        //this.gl = gl;
        this.buffer = null;
        //this.appState = appState;
        this.type = type;
        this.itemSize = itemSize;  // In bytes for interleaved arrays.
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

    /**
        Restore vertex buffer after context loss.

        @method
        @param {ArrayBufferView|number} data Buffer data itself or the total 
            number of elements to be allocated.
        @return {VertexBuffer} The VertexBuffer object.
    */
    restore(data) {
        if (!data) {
            data = this.byteLength;
        }

        // Don't want to update vertex array bindings
        if (this.appState.vertexArray) {
            this.gl.bindVertexArray(null);
            this.appState.vertexArray = null;
        }

        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.binding, this.buffer);
        this.gl.bufferData(this.binding, data, this.usage);
        this.gl.bindBuffer(this.binding, null);

        return this;
    }

    /**
        Update data in this buffer. NOTE: the data must fit
        the originally-allocated buffer!

        @method
        @param {VertexBufferView} data Data to store in the buffer.
        @return {VertexBuffer} The VertexBuffer object.
    */
    data(data) {
        // Don't want to update vertex array bindings
        if (this.appState.vertexArray) {
            this.gl.bindVertexArray(null);
            this.appState.vertexArray = null;
        }

        this.gl.bindBuffer(this.binding, this.buffer);
        this.gl.bufferSubData(this.binding, 0, data);
        this.gl.bindBuffer(this.binding, null);

        return this;
    }

    /**
        Delete this array buffer.

        @method
        @return {VertexBuffer} The VertexBuffer object.
    */
    delete() {
        if (this.buffer) {
            this.gl.deleteBuffer(this.buffer);
            this.buffer = null;
        }

        return this;
    }

}
