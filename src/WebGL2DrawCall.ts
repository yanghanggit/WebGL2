
class WebGL2DrawCall extends WebGL2Object {

    private currentProgram: WebGL2Program;
    private drawPrimitive: number;
    private currentVertexArray: WebGL2VertexArray;
    private currentTransformFeedback: WebGL2TransformFeedback;

    private uniformIndices;
    private uniformNames;
    private uniformValues;
    private uniformCount: number;
    private uniformBuffers: WebGL2UniformBuffer[];
    private uniformBlockNames;
    private uniformBlockCount: number;
    private textures: WebGL2Texture[];
    private textureCount: number;
    private offsets: Int32Array;
    private numElements: Int32Array;
    private numInstances: Int32Array;
    private numDraws: number;
    private MULTI_DRAW_INSTANCED: boolean = false;

    constructor(_engine: WebGL2Engine, program: WebGL2Program, vertexArray: WebGL2VertexArray = null, primitive?: number) {
        super(_engine);
        //
        this.currentProgram = program;
        this.drawPrimitive = GL.TRIANGLES;
        this.currentVertexArray = vertexArray;
        //this.currentTransformFeedback = null;
        this.uniformIndices = {};
        this.uniformNames = new Array(/*WEBGL_INFO.MAX_UNIFORMS*/this.engine.capbility('MAX_UNIFORMS'));
        this.uniformValues = new Array(/*WEBGL_INFO.MAX_UNIFORMS*/this.engine.capbility('MAX_UNIFORMS'));
        this.uniformCount = 0;
        this.uniformBuffers = new Array(/*WEBGL_INFO.MAX_UNIFORM_BUFFERS*/this.engine.capbility('MAX_UNIFORM_BUFFERS'));
        this.uniformBlockNames = new Array(/*WEBGL_INFO.MAX_UNIFORM_BUFFERS*/this.engine.capbility('MAX_UNIFORM_BUFFERS'));
        this.uniformBlockCount = 0;
        this.textures = new Array(/*WEBGL_INFO.MAX_TEXTURE_UNITS*/this.engine.capbility('MAX_TEXTURE_UNITS'));
        this.textureCount = 0;
        this.offsets = new Int32Array(1);
        this.numElements = new Int32Array(1);
        this.numInstances = new Int32Array(1);

        if (this.currentVertexArray) {
            this.numElements[0] = this.currentVertexArray.numElements;
            this.numInstances[0] = this.currentVertexArray.numInstances;
        }

        this.numDraws = 1;

        if (primitive !== undefined) {
            console.warn("Primitive argument to 'App.createDrawCall' is deprecated and will be removed. Use 'DrawCall.primitive' instead.");
            this.primitive(primitive);
        }

        this.MULTI_DRAW_INSTANCED = this.engine.capbility('MULTI_DRAW_INSTANCED');
    }

    public primitive(primitive: number): WebGL2DrawCall {
        this.drawPrimitive = primitive;
        return this;
    }

    public transformFeedback(transformFeedback: WebGL2TransformFeedback): WebGL2DrawCall {
        this.currentTransformFeedback = transformFeedback;
        return this;
    }

    uniform(name, value) {
        let index = this.uniformIndices[name];
        if (index === undefined) {
            index = this.uniformCount++;
            this.uniformIndices[name] = index;
            this.uniformNames[index] = name;
        }
        this.uniformValues[index] = value;
        return this;
    }

    public texture(name: string, texture: WebGL2Texture): WebGL2DrawCall  {
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
        if (this.MULTI_DRAW_INSTANCED/*WEBGL_INFO.MULTI_DRAW_INSTANCED*/) {
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
}
