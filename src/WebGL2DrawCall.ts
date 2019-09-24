/**
 * WebGL2DrawCall 封装一个draw的行为
 */
class WebGL2DrawCall extends WebGL2Object {
    /**
     * program
     */
    private currentProgram: WebGL2Program;
    /**
     * POINTS 点
     * LINES 线段
     * LINE_STRIP 线条
     * LINE_LOOP 回路
     * TRIANGLES 三角形
     * TRIANGLE_STRIP 三角带
     * TRIANGLE_FAN 三角扇
     */
    private drawPrimitive: number = GL.TRIANGLES;
    /**
     * WebGL2VertexArray
     */
    private readonly currentVertexArray: WebGL2VertexArray;
    /**
     * WebGL2TransformFeedback
     */
    private currentTransformFeedback: WebGL2TransformFeedback;
    /**
     * uniform data
     */
    private readonly uniformIndices: { [index: string]: number } = {};
    private readonly uniformNames: Array<string>;
    private readonly uniformValues: Array<number | Float32Array | Int32Array>;
    private uniformCount: number = 0;
    /**
     * uniform buffer data
     */
    private readonly uniformBuffers: WebGL2UniformBuffer[];
    private readonly uniformBlockNames: string[];
    private readonly uniformBlockCount: number = 0;
    /**
     * 对应纹理
     */
    private readonly textures: Array<WebGL2Texture | WebGL2Cubemap> = [];
    private readonly textureCount: number = 0;
    /**
     * 绘制所需辅助数据
     */
    private offsets: Int32Array;
    private numElements: Int32Array;
    private numInstances: Int32Array;
    private numDraws: number = 1;
    /**
     * 一个扩展
     */
    private readonly multiDrawInstanced: boolean;
    /**
     * constructor
     * @param _engine 
     * @param program 
     * @param vertexArray 
     * @param primitive 
     */
    constructor(_engine: WebGL2Engine, program: WebGL2Program, vertexArray: WebGL2VertexArray = null, primitive?: number) {
        super(_engine);
        const engine = this.engine;
        this.currentProgram = program;
        this.currentVertexArray = vertexArray;
        //把所有max的信息拿出来，做初始化
        //最大uniform数量
        const MAX_UNIFORMS: number = engine.capbility('MAX_UNIFORMS');
        this.uniformNames = new Array(MAX_UNIFORMS);
        this.uniformValues = new Array(MAX_UNIFORMS);
        //最大uniform buffer数量
        const MAX_UNIFORM_BUFFERS: number = engine.capbility('MAX_UNIFORM_BUFFERS');
        this.uniformBuffers = new Array(MAX_UNIFORM_BUFFERS);
        this.uniformBlockNames = new Array(MAX_UNIFORM_BUFFERS);
        //最多激活的纹理单元数
        this.textures = new Array(engine.capbility('MAX_TEXTURE_UNITS') as number);
        //我的数据
        this.offsets = new Int32Array(1);
        this.numElements = new Int32Array(1);
        this.numInstances = new Int32Array(1);
        if (this.currentVertexArray) {
            this.numElements[0] = this.currentVertexArray.numElements;
            this.numInstances[0] = this.currentVertexArray.numInstances;
        }
        //输出图元类型
        if (primitive) {
            this.primitive(primitive);
        }
        //这个扩展一般不支持
        this.multiDrawInstanced = engine.capbility('MULTI_DRAW_INSTANCED') as boolean;
    }
    /**
     * 设置 primitive
     * @param primitive 设置数值，必须是那几项
     */
    public primitive(primitive: number): WebGL2DrawCall {
        const checkPram = (primitive === GL.POINTS
            || primitive === GL.LINES
            || primitive === GL.LINE_STRIP
            || primitive === GL.LINE_LOOP
            || primitive === GL.TRIANGLES
            || primitive === GL.TRIANGLE_STRIP
            || primitive === GL.TRIANGLE_FAN);
        if (checkPram) {
            this.drawPrimitive = primitive;
        }
        else {
            //一个不合理的设置
            console.error('invalid primitive = ' + primitive);
        }
        return this;
    }
    /**
     * 设置WebGL2TransformFeedback
     * @param transformFeedback 
     */
    public transformFeedback(transformFeedback: WebGL2TransformFeedback): WebGL2DrawCall {
        this.currentTransformFeedback = transformFeedback;
        return this;
    }
    /**
     * 设置uniform
     * @param name 
     * @param value 
     */
    public uniform(name: string, value: number | Float32Array | Int32Array): WebGL2DrawCall {
        let index = this.uniformIndices[name];
        if (index === undefined) {
            index = this.uniformCount++;
            this.uniformIndices[name] = index;
            this.uniformNames[index] = name;
        }
        this.uniformValues[index] = value;
        return this;
    }
    /**
     * 设置纹理
     * @param samplerName 
     * @param texture 
     */
    public texture(samplerName: string, texture: WebGL2Texture | WebGL2Cubemap): WebGL2DrawCall {
        const unit = this.currentProgram.samplers[samplerName];
        this.textures[unit] = texture;
        return this;
    }
    /**
     * 设置uniformBlock
     * @param uniformBlockName
     * @param buffer 
     */
    public uniformBlock(uniformBlockName: string, buffer: WebGL2UniformBuffer): WebGL2DrawCall {
        const base = this.currentProgram.uniformBlocks[uniformBlockName];
        this.uniformBuffers[base] = buffer;
        return this;
    }
    /**
     * 
     * @param counts 
     */
    public drawRanges(...counts: any[]): WebGL2DrawCall {
        this.numDraws = counts.length;
        if (this.offsets.length < this.numDraws) {
            this.offsets = new Int32Array(this.numDraws);
        }
        if (this.numElements.length < this.numDraws) {
            this.numElements = new Int32Array(this.numDraws);
        }
        if (this.numInstances.length < this.numDraws) {
            this.numInstances = new Int32Array(this.numDraws);
        }
        for (let i = 0; i < this.numDraws; ++i) {
            const count = counts[i];
            this.offsets[i] = count[0];
            this.numElements[i] = count[1];
            this.numInstances[i] = count[2] || 1;
        }
        return this;
    }
    /**
     * 设置program（行为）和vao（顶点数据）=> 向program传递参数 => begin transformFeedback => draw => end transformFeedback
     */
    public draw(): WebGL2DrawCall {
        //加一个绘制次数
        ++this.engine.drawCalls;
        const uniformNames = this.uniformNames;
        const uniformValues = this.uniformValues;
        const uniformBuffers = this.uniformBuffers;
        const uniformBlockCount = this.currentProgram.uniformBlockCount;
        const textures = this.textures;
        const textureCount = this.currentProgram.samplerCount;
        //设置program
        this.currentProgram.bind();
        for (let uIndex = 0; uIndex < this.uniformCount; ++uIndex) {
            this.currentProgram.uniform(uniformNames[uIndex], uniformValues[uIndex]);
        }
        for (let base = 0; base < uniformBlockCount; ++base) {
            uniformBuffers[base].bind(base);
        }
        for (let tIndex = 0; tIndex < textureCount; ++tIndex) {
            textures[tIndex].bind(tIndex);
        }
        //buffer数据
        let indexed = false;
        if (this.currentVertexArray) {
            this.currentVertexArray.bind();
            indexed = this.currentVertexArray.indexed;
        }
        //TransformFeedback启动
        const gl = this.gl;
        if (this.currentTransformFeedback) {
            this.currentTransformFeedback.bind();
            gl.beginTransformFeedback(this.drawPrimitive);
        } else if (this.state.transformFeedback) {
            gl.bindTransformFeedback(GL.TRANSFORM_FEEDBACK, null);
            this.state.transformFeedback = null;
        }
        //核心绘制
        if (this.multiDrawInstanced) {
            const ext = this.state.extensions.multiDrawInstanced;
            if (indexed) {
                ext.multiDrawElementsInstancedWEBGL(this.drawPrimitive, this.numElements, 0, this.currentVertexArray.indexType, this.offsets, 0, this.numInstances, 0, this.numDraws);
            } else {
                ext.multiDrawArraysInstancedWEBGL(this.drawPrimitive, this.offsets, 0, this.numElements, 0, this.numInstances, 0, this.numDraws);
            }
        } else if (indexed) {
            for (let i = 0; i < this.numDraws; ++i) {
                gl.drawElementsInstanced(this.drawPrimitive, this.numElements[i], this.currentVertexArray.indexType, this.offsets[i], this.numInstances[i]);
            }
        } else {
            for (let i = 0; i < this.numDraws; ++i) {
                gl.drawArraysInstanced(this.drawPrimitive, this.offsets[i], this.numElements[i], this.numInstances[i]);
            }
        }
        //TransformFeedback关闭
        if (this.currentTransformFeedback) {
            gl.endTransformFeedback();
        }
        return this;
    }
    /**
     * 删除对象，空实现
     */
    public delete(): WebGL2Object {
        return this;
    }
}
