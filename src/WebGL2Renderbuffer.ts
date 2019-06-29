
class WebGL2Renderbuffer extends WebGL2Object {

    public renderbuffer: WebGLRenderbuffer;
    private width;
    private height;
    private readonly internalFormat;
    private readonly samples;

    constructor(_engine: WebGL2Engine, width, height, internalFormat, samples = 0) {
        super(_engine);
        this.width = width;
        this.height = height;
        this.internalFormat = internalFormat;
        this.samples = samples;
        this.restore();
    }

    restore() {
        this.renderbuffer = this.gl.createRenderbuffer();
        this.resize(this.width, this.height);

        return this;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.gl.bindRenderbuffer(GL.RENDERBUFFER, this.renderbuffer);
        this.gl.renderbufferStorageMultisample(GL.RENDERBUFFER, this.samples, this.internalFormat, this.width, this.height);
        this.gl.bindRenderbuffer(GL.RENDERBUFFER, null);

        return this;
    }

    delete() {
        this.gl.deleteRenderbuffer(this.renderbuffer);
        this.renderbuffer = null;

        return this;
    }
}
