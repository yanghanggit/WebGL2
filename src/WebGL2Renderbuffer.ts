
//import { GL } from "./constants.js";

/**
    Offscreen drawing attachment.

    @class
    @prop {WebGLRenderingContext} gl The WebGL context.
    @prop {WebGLRenderbuffer} renderbuffer Handle to the renderbuffer.
    @prop {number} width Renderbuffer width.
    @prop {number} height Renderbuffer height.
    @prop {GLEnum} internalFormat Internal arrangement of the renderbuffer data.
    @prop {number} samples Number of MSAA samples.
*/
class WebGL2Renderbuffer {

    private readonly _engine: WebGL2Engine;
    private readonly gl: WebGLRenderingContext;
    private readonly appState: WebGL2State;

    public renderbuffer;// = null;
    private width;// = width;
    private height;// = height;
    private internalFormat;// = internalFormat;
    private samples;// = samples;

    constructor(/*gl,*/_engine: WebGL2Engine, width, height, internalFormat, samples = 0) {
        this._engine = _engine;
        this.gl = _engine.gl;//gl;
        this.appState = _engine.state;//appState;
        //this.gl = gl;
        this.renderbuffer = null;
        this.width = width;
        this.height = height;
        this.internalFormat = internalFormat;
        this.samples = samples;
        this.restore();
    }

    /**
        Restore renderbuffer after context loss.

        @method
        @return {Renderbuffer} The Renderbuffer object.
    */
    restore() {
        this.renderbuffer = this.gl.createRenderbuffer();
        this.resize(this.width, this.height);

        return this;
    }

    /**
        Resize the renderbuffer.

        @method
        @param {number} width New width of the renderbuffer.
        @param {number} height New height of the renderbuffer.
        @return {Renderbuffer} The Renderbuffer object.
    */
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.gl.bindRenderbuffer(GL.RENDERBUFFER, this.renderbuffer);
        this.gl.renderbufferStorageMultisample(GL.RENDERBUFFER, this.samples, this.internalFormat, this.width, this.height);
        this.gl.bindRenderbuffer(GL.RENDERBUFFER, null);
        
        return this;
    }

    /**
        Delete this renderbuffer.

        @method
        @return {Renderbuffer} The Renderbuffer object.
    */
    delete() {
        this.gl.deleteRenderbuffer(this.renderbuffer);
        this.renderbuffer = null;

        return this;
    }   
}
