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
    private currentVertexArray: WebGL2VertexArray;
    private currentTransformFeedback: WebGL2TransformFeedback;
    private readonly uniformIndices: { [index: string]: number } = {};
    private uniformNames: Array<string>;
    private uniformValues: Array<number | Float32Array | Int32Array>;
    private uniformCount: number = 0;
    private uniformBuffers: WebGL2UniformBuffer[];
    private uniformBlockNames: string[];
    private uniformBlockCount: number = 0;
    private textures: Array<WebGL2Texture | WebGL2Cubemap> = [];
    private textureCount: number = 0;
    private offsets: Int32Array;
    private numElements: Int32Array;
    private numInstances: Int32Array;
    private numDraws: number = 1;
    private MULTI_DRAW_INSTANCED: boolean = false;

    constructor(_engine: WebGL2Engine, program: WebGL2Program, vertexArray: WebGL2VertexArray = null, primitive?: number) {
        super(_engine);
        const engine = this.engine;
        this.currentProgram = program;
        this.currentVertexArray = vertexArray;
        //
        const MAX_UNIFORMS: number = engine.capbility('MAX_UNIFORMS');
        this.uniformNames = new Array(MAX_UNIFORMS);
        this.uniformValues = new Array(MAX_UNIFORMS);
        //
        const MAX_UNIFORM_BUFFERS: number = engine.capbility('MAX_UNIFORM_BUFFERS');
        this.uniformBuffers = new Array(MAX_UNIFORM_BUFFERS);
        this.uniformBlockNames = new Array(MAX_UNIFORM_BUFFERS);
        //
        this.textures = new Array(engine.capbility('MAX_TEXTURE_UNITS') as number);
        this.offsets = new Int32Array(1);
        this.numElements = new Int32Array(1);
        this.numInstances = new Int32Array(1);
        if (this.currentVertexArray) {
            this.numElements[0] = this.currentVertexArray.numElements;
            this.numInstances[0] = this.currentVertexArray.numInstances;
        }
        if (primitive) {
            this.primitive(primitive);
        }
        this.MULTI_DRAW_INSTANCED = engine.capbility('MULTI_DRAW_INSTANCED');
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
            console.error('invalid primitive = ' + primitive);
        }
        return this;
    }

    public transformFeedback(transformFeedback: WebGL2TransformFeedback): WebGL2DrawCall {
        this.currentTransformFeedback = transformFeedback;
        return this;
    }

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

    public texture(name: string, texture: WebGL2Texture | WebGL2Cubemap): WebGL2DrawCall {
        const unit = this.currentProgram.samplers[name];
        this.textures[unit] = texture;
        return this;
    }

    public uniformBlock(name: string, buffer: WebGL2UniformBuffer): WebGL2DrawCall {
        const base = this.currentProgram.uniformBlocks[name];
        this.uniformBuffers[base] = buffer;
        return this;
    }

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

    public draw(): WebGL2DrawCall {

        ///
        ++this.engine.drawCalls;
        ///

        const uniformNames = this.uniformNames;
        const uniformValues = this.uniformValues;
        const uniformBuffers = this.uniformBuffers;
        const uniformBlockCount = this.currentProgram.uniformBlockCount;
        const textures = this.textures;
        const textureCount = this.currentProgram.samplerCount;
        let indexed = false;
        ///
        this.currentProgram.bind();
        if (this.currentVertexArray) {
            this.currentVertexArray.bind();
            indexed = this.currentVertexArray.indexed;
        }
        for (let uIndex = 0; uIndex < this.uniformCount; ++uIndex) {
            this.currentProgram.uniform(uniformNames[uIndex], uniformValues[uIndex]);
        }
        for (let base = 0; base < uniformBlockCount; ++base) {
            uniformBuffers[base].bind(base);
        }
        for (let tIndex = 0; tIndex < textureCount; ++tIndex) {
            textures[tIndex].bind(tIndex);
        }
        const gl = this.gl;
        if (this.currentTransformFeedback) {
            this.currentTransformFeedback.bind();
            gl.beginTransformFeedback(this.drawPrimitive);
        } else if (this.state.transformFeedback) {
            gl.bindTransformFeedback(GL.TRANSFORM_FEEDBACK, null);
            this.state.transformFeedback = null;
        }
        if (this.MULTI_DRAW_INSTANCED) {
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
        if (this.currentTransformFeedback) {
            gl.endTransformFeedback();
        }
        return this;
    }

    public delete(): WebGL2Object {
        return this;
    }
}
