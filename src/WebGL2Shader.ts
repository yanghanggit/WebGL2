
class WebGL2Shader extends WebGL2Object {
    //
    public shader: WebGLShader;
    private type: number;
    private source: string;
    //
    constructor(_engine: WebGL2Engine, type, source) {
        super(_engine);
        this.shader = null;
        this.type = type;
        this.source = source;
        this.restore();
    }

    public restore(): WebGL2Shader {
        this.shader = this.gl.createShader(this.type);
        this.gl.shaderSource(this.shader, this.source);
        this.gl.compileShader(this.shader);
        return this;
    }

    public translatedSource(): string {
        if (/*WEBGL_INFO.DEBUG_SHADERS*/ this.engine.capbility('DEBUG_SHADERS')) {
            return this.state.extensions.debugShaders.getTranslatedShaderSource(this.shader);
        } else {
            return "(Unavailable)";
        }
    }

    public delete(): WebGL2Shader {
        if (this.shader) {
            this.gl.deleteShader(this.shader);
            this.shader = null;
        }
        return this;
    }

    public checkCompilation(): WebGL2Shader {
        if (!this.gl.getShaderParameter(this.shader, GL.COMPILE_STATUS)) {
            let i: number, lines: string[];
            console.error(this.gl.getShaderInfoLog(this.shader));
            lines = this.source.split("\n");
            for (i = 0; i < lines.length; ++i) {
                console.error(`${i + 1}: ${lines[i]}`);
            }
        }
        return this;
    }
}
