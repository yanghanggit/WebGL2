

interface AttributeBufferOptions {
    type?: number;
    size?: number;
    stride?: number;
    offset?: number;
    normalized?: boolean;
    integer?: boolean;
}

class WebGL2VertexArray extends WebGL2Object {

    private vertexArray: WebGLVertexArrayObject = null;
    public indexType: number;
    public indexed: boolean;
    public numElements: number;
    public numInstances: number;
    private offsets: number;
    private numDraws: number;

    constructor(_engine: WebGL2Engine) {
        super(_engine);
        this.vertexArray = null;
        this.indexType = null;
        this.indexed = false;
        this.numElements = 0;
        this.numInstances = 1;
        this.offsets = 0;
        this.numDraws = 1;
    }

    public restore(): WebGL2VertexArray {
        if (this.state.vertexArray === this) {
            this.state.vertexArray = null;
        }
        if (this.vertexArray !== null) {
            this.vertexArray = this.gl.createVertexArray();
        }
        return this;
    }

    public vertexAttributeBuffer(attributeIndex: number, vertexBuffer: WebGL2VertexBuffer, options: AttributeBufferOptions = DUMMY_OBJECT): WebGL2VertexArray {
        this.attributeBuffer(attributeIndex, vertexBuffer, options, false);
        return this;
    }

    public instanceAttributeBuffer(attributeIndex: number, vertexBuffer: WebGL2VertexBuffer, options: AttributeBufferOptions = DUMMY_OBJECT): WebGL2VertexArray {
        this.attributeBuffer(attributeIndex, vertexBuffer, options, true);
        return this;
    }

    public indexBuffer(vertexBuffer: WebGL2VertexBuffer): WebGL2VertexArray {
        if (this.vertexArray === null) {
            this.vertexArray = this.gl.createVertexArray();
        }
        this.bind();
        this.gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, vertexBuffer.buffer);
        this.numElements = vertexBuffer.numItems * 3;
        this.indexType = vertexBuffer.type;
        this.indexed = true;
        return this;
    }

    public delete(): WebGL2VertexArray {
        if (this.vertexArray) {
            this.gl.deleteVertexArray(this.vertexArray);
            this.vertexArray = null;
            if (this.state.vertexArray === this) {
                this.gl.bindVertexArray(null);
                this.state.vertexArray = null;
            }
        }
        return this;
    }

    public bind(): WebGL2VertexArray {
        if (this.state.vertexArray !== this) {
            this.gl.bindVertexArray(this.vertexArray);
            this.state.vertexArray = this;
        }
        return this;
    }

    public attributeBuffer(attributeIndex: number, vertexBuffer: WebGL2VertexBuffer, options: AttributeBufferOptions = DUMMY_OBJECT, instanced: boolean): WebGL2VertexArray {
        if (this.vertexArray === null) {
            this.vertexArray = this.gl.createVertexArray();
        }
        this.bind();
        this.gl.bindBuffer(GL.ARRAY_BUFFER, vertexBuffer.buffer);
        let {
            type = vertexBuffer.type,
            size = vertexBuffer.itemSize,
            stride = 0,
            offset = 0,
            normalized = false,
            integer = Boolean(vertexBuffer.integer && !normalized)
        } = options as AttributeBufferOptions;
        const numColumns = vertexBuffer.numColumns;
        if (stride === 0) {
            stride = numColumns * size * TYPE_SIZE[type];
        }
        for (let i = 0; i < numColumns; ++i) {
            if (integer) {
                this.gl.vertexAttribIPointer(
                    attributeIndex + i,
                    size,
                    type,
                    stride,
                    offset + i * size * TYPE_SIZE[type]);
            } else {
                this.gl.vertexAttribPointer(
                    attributeIndex + i,
                    size,
                    type,
                    normalized,
                    stride,
                    offset + i * size * TYPE_SIZE[type]);
            }
            if (instanced) {
                this.gl.vertexAttribDivisor(attributeIndex + i, 1);
            }
            this.gl.enableVertexAttribArray(attributeIndex + i);
        }
        if (this.numDraws === 1) {
            if (instanced) {
                this.numInstances = vertexBuffer.numItems;
            } else {
                this.numElements = this.numElements || vertexBuffer.numItems;
            }
        }
        this.gl.bindBuffer(GL.ARRAY_BUFFER, null);
        return this;
    }
}
