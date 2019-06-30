
class WebGL2Renderbuffer extends WebGL2Object {

    public renderbuffer: WebGLRenderbuffer;
    private width: number;
    private height: number;
    private readonly internalFormat: number;
    private readonly samples: number;

    constructor(_engine: WebGL2Engine, width: number, height: number, internalFormat: number, samples: number = 0) {
        super(_engine);
        this.width = width;
        this.height = height;
        this.internalFormat = internalFormat;
        this.samples = samples;
        this.restore();
    }

    public restore(): WebGL2Renderbuffer {
        this.renderbuffer = this.gl.createRenderbuffer();
        this.resize(this.width, this.height);
        return this;
    }

    public resize(width: number, height: number): WebGL2Renderbuffer {
        this.width = width;
        this.height = height;
        this.gl.bindRenderbuffer(GL.RENDERBUFFER, this.renderbuffer);
        this.gl.renderbufferStorageMultisample(GL.RENDERBUFFER, this.samples, this.internalFormat, this.width, this.height);
        this.gl.bindRenderbuffer(GL.RENDERBUFFER, null);
        return this;
    }

    public delete(): WebGL2Renderbuffer {
        this.gl.deleteRenderbuffer(this.renderbuffer);
        this.renderbuffer = null;
        return this;
    }
}
