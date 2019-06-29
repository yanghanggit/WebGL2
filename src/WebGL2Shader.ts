
//import { GL, WEBGL_INFO } from "./constants.js";

/**
    WebGL shader.

    @class
    @prop {WebGLRenderingContext} gl The WebGL context.
    @prop {WebGLShader} shader The shader.
*/
class WebGL2Shader {

    private readonly _engine: WebGL2Engine;
    private readonly gl: WebGLRenderingContext;
    private readonly appState: WebGL2State;
    public shader: WebGLShader = null;
    private type = null;
    private source = null;

    constructor(/*gl, appState,*/ _engine: WebGL2Engine, type, source) {
        this._engine = _engine;
        this.gl = _engine.gl;//gl;
        this.appState = _engine.state;//appState;
        // this.gl = gl;
        // this.appState = appState;
        this.shader = null;
        this.type = type;
        this.source = source;

        this.restore();
    }

    /**
        Restore shader after context loss.

        @method
        @return {Shader} The Shader object.
    */
    restore() {
        this.shader = this.gl.createShader(this.type);
        this.gl.shaderSource(this.shader, this.source);
        this.gl.compileShader(this.shader);

        return this;
    }

    /**
        Get the shader source translated for the platform's API.

        @method
        @return {String} The translated shader source.
    */
    translatedSource() {
        if (WEBGL_INFO.DEBUG_SHADERS) {
            return this.appState.extensions.debugShaders.getTranslatedShaderSource(this.shader);
        } else {
            return "(Unavailable)";
        }
    }

    /**
        Delete this shader.

        @method
        @return {Shader} The Shader object.
    */
    delete() {
        if (this.shader) {
            this.gl.deleteShader(this.shader);
            this.shader = null;
        }

        return this;
    }


    checkCompilation() {
        if (!this.gl.getShaderParameter(this.shader, GL.COMPILE_STATUS)) {
            let i, lines;

            console.error(this.gl.getShaderInfoLog(this.shader));
            lines = this.source.split("\n");
            for (i = 0; i < lines.length; ++i) {
                console.error(`${i + 1}: ${lines[i]}`);
            }
        }

        return this;
    }
}
