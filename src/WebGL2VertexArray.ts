/**
 * AttributeBufferOptions
 */
interface AttributeBufferOptions {
    type?: number;
    size?: number;
    stride?: number;
    offset?: number;
    normalized?: boolean;
    integer?: boolean;
}
/**
 * WebGL2VertexArray
 * 那其实VAO主要是将一个绘制物体的各种顶点缓冲（VBO)包装一个整体.
 * 顶点缓冲可以有顶点坐标，纹理坐标等。优点就在于能提高开发效率.
 * 它将所有顶点绘制过程中的这些顶点的设置和绑定过程集中存储在一起.
 * 当我们需要时，只需要使用相应的VAO即可。
 * VAO的这种方式有点像一个中介，把所有繁琐的绑定和顶点设置工作都集中起来处理，我们需要绘制时，直接找这个中介就好了.
 */
class WebGL2VertexArray extends WebGL2Object {
    /**
     * WebGLVertexArrayObject
     */
    private vertexArray: WebGLVertexArrayObject;
    /**
     * 
     */
    public indexType: number = 0;
    /**
    * 是否是索引缓冲区
    */
    public indexed: boolean;
    /**
     *
     */
    public numElements: number = 0;
    /**
     *
     */
    public numInstances: number = 1;
    /**
     *
     */
    private offsets: number = 0;
    /**
     *
     */
    private numDraws: number = 1;
    /**
     * constructor
     * @param _engine 
     */
    constructor(_engine: WebGL2Engine) {
        super(_engine);
    }
    /**
     * 重制
     */
    public restore(): WebGL2VertexArray {
        if (this.state.vertexArray === this) {
            this.state.vertexArray = null;
        }
        if (this.vertexArray) {
            //会在attributeBuffer 和 indexBuffer 这2个调用点，做惰性初始化
            this.vertexArray = this.gl.createVertexArray();
        }
        return this;
    }
    /**
     * 对vertex buffer进行属性描述
     * @param attributeIndex 
     * @param vertexBuffer 
     * @param options 
     */
    public vertexAttributeBuffer(attributeIndex: number, vertexBuffer: WebGL2VertexBuffer, options: AttributeBufferOptions = DUMMY_OBJECT): WebGL2VertexArray {
        this.attributeBuffer(attributeIndex, vertexBuffer, options, false);
        return this;
    }
    /**
     * 对instance vertex buffer进行属性描述
     * @param attributeIndex 
     * @param vertexBuffer 
     * @param options 
     */
    public instanceAttributeBuffer(attributeIndex: number, vertexBuffer: WebGL2VertexBuffer, options: AttributeBufferOptions = DUMMY_OBJECT): WebGL2VertexArray {
        this.attributeBuffer(attributeIndex, vertexBuffer, options, true);
        return this;
    }
    /**
     * index buffer进行属性描述
     * @param vertexBuffer 
     */
    public indexBuffer(vertexBuffer: WebGL2VertexBuffer): WebGL2VertexArray {
        if (!this.vertexArray) {
            this.vertexArray = this.gl.createVertexArray();
        }
        this.bind();
        this.gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, vertexBuffer.buffer);
        this.numElements = vertexBuffer.numItems * 3;
        this.indexType = vertexBuffer.type;
        this.indexed = true;
        return this;
    }
    /**
     * 释放WebGL对象
     */
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
    /**
     * 
     */
    public bind(): WebGL2VertexArray {
        if (this.state.vertexArray !== this) {
            this.gl.bindVertexArray(this.vertexArray);
            this.state.vertexArray = this;
        }
        return this;
    }
    /**
     * 对一个buffer属性描述的核心实现
     * @param attributeIndex 
     * @param vertexBuffer 
     * @param options 
     * @param instanced 
     */
    public attributeBuffer(attributeIndex: number,
        vertexBuffer: WebGL2VertexBuffer,
        options: AttributeBufferOptions = DUMMY_OBJECT,
        instanced: boolean): WebGL2VertexArray {
        //惰性初始化
        if (!this.vertexArray) {
            this.vertexArray = this.gl.createVertexArray();
        }
        //绑定
        this.bind();
        //用vertexAttribPointer，对vertexbuffer进行描述，先bind
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
        const typeSize = TYPE_SIZE[type];
        if (stride === 0) {
            //间距
            stride = numColumns * size * typeSize;
        }
        //
        for (let i = 0; i < numColumns; ++i) {
            if (integer) {
                //描述开始，这里IPointer, 不考虑归一化normalized的情况
                this.gl.vertexAttribIPointer(
                    attributeIndex + i,
                    size,
                    type,
                    stride,
                    offset + i * size * typeSize);
            } else {
                //描述开始
                this.gl.vertexAttribPointer(
                    attributeIndex + i,
                    size,
                    type,
                    normalized,
                    stride,
                    offset + i * size * typeSize);
            }
            //如果是instanced
            if (instanced) {
                this.gl.vertexAttribDivisor(attributeIndex + i, 1);
            }
            //激活单元
            this.gl.enableVertexAttribArray(attributeIndex + i);
        }
        //?
        if (this.numDraws === 1) {
            if (instanced) {
                this.numInstances = vertexBuffer.numItems;
            } else {
                this.numElements = this.numElements || vertexBuffer.numItems;
            }
        }
        //描述完成，解绑
        this.gl.bindBuffer(GL.ARRAY_BUFFER, null);
        return this;
    }
}
