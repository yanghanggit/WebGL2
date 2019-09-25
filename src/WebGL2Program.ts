/**
 * WebGL2Program 封装 WebGLProgram
 */
class WebGL2Program extends WebGL2Object {
    /**
     * WebGLProgram
     */
    private program: WebGLProgram;
    /**
     * transformFeedback
     */
    private readonly transformFeedbackVaryings: string[];
    /**
     * 维护的uniform数据
     */
    private uniforms = {};
    public uniformBlocks: { [index: string]: number } = {};
    public uniformBlockCount = 0;
    /**
     * 纹理数据
     */
    public readonly samplers: { [index: string]: number } = {};
    public samplerCount: number = 0;
    /**
     * vertex shader
     */
    private vertexSource: string;
    private vertexShader: WebGL2Shader;
    /**
     * fragment shader
     */
    private fragmentSource: string;
    private fragmentShader: WebGL2Shader;
    /**
     * 是否连接成功
     */
    public linked: boolean = false;
    /**
     * constructor
     * @param _engine 
     * @param vsSource 
     * @param fsSource 
     * @param xformFeebackVars 
     */
    constructor(_engine: WebGL2Engine, vsSource: string | WebGL2Shader, fsSource: string | WebGL2Shader, transformFeedback: string[]) {
        super(_engine);
        this.transformFeedbackVaryings = transformFeedback || null;
        if (typeof vsSource === "string") {
            this.vertexSource = vsSource;
        } else {
            this.vertexShader = vsSource;
        }
        if (typeof fsSource === "string") {
            this.fragmentSource = fsSource;
        } else {
            this.fragmentShader = fsSource;
        }
        this.initialize();
    }
    /**
     * 
     */
    public restore(): WebGL2Program {
        this.initialize();
        this.link();
        this.checkLinkage();
        return this;
    }
    /**
     * 
     */
    public translatedVertexSource(): string {
        if (this.vertexShader) {
            return this.vertexShader.translatedSource();
        }
        const vertexShader = new WebGL2Shader(this.engine, GL.VERTEX_SHADER, this.vertexSource);
        const translatedSource = vertexShader.translatedSource();
        vertexShader.delete();
        return translatedSource;
    }
    /**
     * 
     */
    public translatedFragmentSource(): string {
        if (this.fragmentShader) {
            return this.fragmentShader.translatedSource();
        }
        const fragmentShader = new WebGL2Shader(this.engine, GL.FRAGMENT_SHADER, this.fragmentSource);
        const translatedSource = fragmentShader.translatedSource();
        fragmentShader.delete();
        return translatedSource;
    }
    /**
     * 
     */
    public delete(): WebGL2Object {
        if (this.program) {
            this.gl.deleteProgram(this.program);
            this.program = null;
            if (this.state.program === this) {
                this.gl.useProgram(null);
                this.state.program = null;
            }
        }
        return this;
    }
    /**
     * 
     */
    public initialize(): WebGL2Program {
        if (this.state.program === this) {
            this.gl.useProgram(null);
            this.state.program = null;
        }
        this.linked = false;
        this.uniformBlockCount = 0;
        this.samplerCount = 0;
        if (this.vertexSource) {
            this.vertexShader = new WebGL2Shader(this.engine, GL.VERTEX_SHADER, this.vertexSource);
        }
        if (this.fragmentSource) {
            this.fragmentShader = new WebGL2Shader(this.engine, GL.FRAGMENT_SHADER, this.fragmentSource);
        }
        this.program = this.gl.createProgram();
        return this;
    }
    /**
     * 
     */
    public link(): WebGL2Program {
        this.gl.attachShader(this.program, this.vertexShader.shader);
        this.gl.attachShader(this.program, this.fragmentShader.shader);
        if (this.transformFeedbackVaryings) {
            this.gl.transformFeedbackVaryings(this.program, this.transformFeedbackVaryings, GL.SEPARATE_ATTRIBS);
        }
        this.gl.linkProgram(this.program);
        return this;
    }
    /**
     * 
     */
    public checkCompletion(): boolean {
        if (this.engine.capbility('PARALLEL_SHADER_COMPILE')) {
            return this.gl.getProgramParameter(this.program, GL.COMPLETION_STATUS_KHR);
        }
        return true;
    }
    /**
     * 
     */
    public checkLinkage(): WebGL2Program {
        if (this.linked) {
            return this;
        }
        if (this.gl.getProgramParameter(this.program, GL.LINK_STATUS)) {
            this.linked = true;
            this.initVariables();
        } else {
            console.error(this.gl.getProgramInfoLog(this.program));
            this.vertexShader.checkCompilation();
            this.fragmentShader.checkCompilation();
        }
        if (this.vertexSource) {
            this.vertexShader.delete();
            this.vertexShader = null;
        }
        if (this.fragmentSource) {
            this.fragmentShader.delete();
            this.fragmentShader = null;
        }
        return this;
    }
    /**
     * 初始化所有uniform 和 uniform block
     */
    public initVariables(): WebGL2Program {
        //必须先绑定
        this.bind();
        //
        const numUniforms = this.gl.getProgramParameter(this.program, GL.ACTIVE_UNIFORMS);
        let textureUnit = 0;
        for (let i = 0; i < numUniforms; ++i) {
            const uniformInfo = this.gl.getActiveUniform(this.program, i);
            const uniformHandle = this.gl.getUniformLocation(this.program, uniformInfo.name);

            let UniformClass: {
                new(engine: WebGL2Engine, handle: WebGLUniformLocation, type: number, count: number):
                    SingleComponentUniform | MultiNumericUniform | MultiBoolUniform | MatrixUniform
            };

            const type = uniformInfo.type;
            const numElements = uniformInfo.size;
            switch (type) {
                case GL.SAMPLER_2D:
                case GL.INT_SAMPLER_2D:
                case GL.UNSIGNED_INT_SAMPLER_2D:
                case GL.SAMPLER_2D_SHADOW:
                case GL.SAMPLER_2D_ARRAY:
                case GL.INT_SAMPLER_2D_ARRAY:
                case GL.UNSIGNED_INT_SAMPLER_2D_ARRAY:
                case GL.SAMPLER_2D_ARRAY_SHADOW:
                case GL.SAMPLER_CUBE:
                case GL.INT_SAMPLER_CUBE:
                case GL.UNSIGNED_INT_SAMPLER_CUBE:
                case GL.SAMPLER_CUBE_SHADOW:
                case GL.SAMPLER_3D:
                case GL.INT_SAMPLER_3D:
                case GL.UNSIGNED_INT_SAMPLER_3D:
                    textureUnit = this.samplerCount++;
                    this.samplers[uniformInfo.name] = textureUnit;
                    this.gl.uniform1i(uniformHandle, textureUnit);
                    break;
                case GL.INT:
                case GL.UNSIGNED_INT:
                case GL.FLOAT:
                    UniformClass = numElements > 1 ? MultiNumericUniform : SingleComponentUniform;
                    break;
                case GL.BOOL:
                    UniformClass = numElements > 1 ? MultiBoolUniform : SingleComponentUniform;
                    break;
                case GL.FLOAT_VEC2:
                case GL.INT_VEC2:
                case GL.UNSIGNED_INT_VEC2:
                case GL.FLOAT_VEC3:
                case GL.INT_VEC3:
                case GL.UNSIGNED_INT_VEC3:
                case GL.FLOAT_VEC4:
                case GL.INT_VEC4:
                case GL.UNSIGNED_INT_VEC4:
                    UniformClass = MultiNumericUniform;
                    break;
                case GL.BOOL_VEC2:
                case GL.BOOL_VEC3:
                case GL.BOOL_VEC4:
                    UniformClass = MultiBoolUniform;
                    break;
                case GL.FLOAT_MAT2:
                case GL.FLOAT_MAT3:
                case GL.FLOAT_MAT4:
                case GL.FLOAT_MAT2x3:
                case GL.FLOAT_MAT2x4:
                case GL.FLOAT_MAT3x2:
                case GL.FLOAT_MAT3x4:
                case GL.FLOAT_MAT4x2:
                case GL.FLOAT_MAT4x3:
                    UniformClass = MatrixUniform;
                    break;
                default:
                    console.error("Unrecognized type for uniform ", uniformInfo.name);
                    break;
            }
            if (UniformClass) {
                this.uniforms[uniformInfo.name] = new UniformClass(this.engine, uniformHandle, type, numElements);
            }
        }
        const numUniformBlocks = this.gl.getProgramParameter(this.program, GL.ACTIVE_UNIFORM_BLOCKS);
        for (let i = 0; i < numUniformBlocks; ++i) {
            const blockName = this.gl.getActiveUniformBlockName(this.program, i);
            const blockIndex = this.gl.getUniformBlockIndex(this.program, blockName);
            const uniformBlockBase = this.uniformBlockCount++;
            this.gl.uniformBlockBinding(this.program, blockIndex, uniformBlockBase);
            this.uniformBlocks[blockName] = uniformBlockBase;
        }
        return this;
    }
    /**
     * 设置一个uniform的值
     */
    public uniform(name: string, value: number | Float32Array | Int32Array): WebGL2Program {
        if (this.uniforms[name]) {
            this.uniforms[name].set(value);
        }
        else {
            //console.warn('uniform name do not exist = ' + name + ', value = ' + value);
        }
        return this;
    }
    /**
     * 绑定
     */
    public bind(): WebGL2Program {
        if (this.state.program !== this) {
            this.gl.useProgram(this.program);
            this.state.program = this;
        }
        return this;
    }
}
