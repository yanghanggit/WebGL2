
class WebGL2Framebuffer extends WebGL2Object {

    private framebuffer: WebGLFramebuffer = null;
    private numColorTargets: number = 0;
    public colorAttachments: Array<WebGL2Texture | WebGL2Renderbuffer | WebGL2Cubemap> = [];
    private colorAttachmentEnums: number[] = [];
    private colorAttachmentTargets: number[] = [];
    public depthAttachment;
    private depthAttachmentTarget;
    public width: number = 0;
    public height: number = 0;

    constructor(_engine: WebGL2Engine) {
        super(_engine);
        this.restore();
    }

    public restore(): WebGL2Framebuffer {
        if (this.state.drawFramebuffer === this) {
            this.state.drawFramebuffer = null;
        }
        if (this.state.readFramebuffer === this) {
            this.state.readFramebuffer = null;
        }
        this.framebuffer = this.gl.createFramebuffer();
        return this;
    }

    public colorTarget(index: number, attachment: WebGL2Texture | WebGL2Renderbuffer | WebGL2Cubemap, target: number = 0 /*target: number = attachment.is3D ? 0 : GL.TEXTURE_2D*/): WebGL2Framebuffer {
        target = target || ( attachment.is3D ? 0 : GL.TEXTURE_2D);
        if (index >= this.numColorTargets) {
            let numColorTargets = index + 1;
            this.colorAttachmentEnums.length = numColorTargets;
            this.colorAttachments.length = numColorTargets;
            this.colorAttachmentTargets.length = numColorTargets;
            for (let i = this.numColorTargets; i < numColorTargets - 1; ++i) {
                this.colorAttachmentEnums[i] = GL.NONE;
                this.colorAttachments[i] = null;
                this.colorAttachmentTargets[i] = 0;
            }
            this.numColorTargets = numColorTargets;
        }
        this.colorAttachmentEnums[index] = GL.COLOR_ATTACHMENT0 + index;
        this.colorAttachments[index] = attachment;
        this.colorAttachmentTargets[index] = target;
        //
        const currentFramebuffer = this.bindAndCaptureState();
        if (attachment instanceof WebGL2Renderbuffer) {
            this.gl.framebufferRenderbuffer(GL.DRAW_FRAMEBUFFER, this.colorAttachmentEnums[index], GL.RENDERBUFFER, attachment.renderbuffer);
        } else if (attachment.is3D) {
            this.gl.framebufferTextureLayer(GL.DRAW_FRAMEBUFFER, this.colorAttachmentEnums[index], attachment.texture, 0, target);
        } else {
            this.gl.framebufferTexture2D(GL.DRAW_FRAMEBUFFER, this.colorAttachmentEnums[index], target, attachment.texture, 0);
        }
        //
        this.gl.drawBuffers(this.colorAttachmentEnums);
        this.width = attachment.width;
        this.height = attachment.height;
        this.restoreState(currentFramebuffer);
        return this;
    }

    public depthTarget(attachment: WebGL2Texture | WebGL2Renderbuffer/*, target = attachment.is3D ? 0 : GL.TEXTURE_2D*/): WebGL2Framebuffer {
        const target = attachment.is3D ? 0 : GL.TEXTURE_2D;
        const currentFramebuffer = this.bindAndCaptureState();
        this.depthAttachment = attachment;
        this.depthAttachmentTarget = target;
        if (attachment instanceof WebGL2Renderbuffer) {
            this.gl.framebufferRenderbuffer(GL.DRAW_FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, attachment.renderbuffer);
        } else if (attachment.is3D) {
            this.gl.framebufferTextureLayer(GL.DRAW_FRAMEBUFFER, GL.DEPTH_ATTACHMENT, attachment.texture, 0, target);
        } else {
            this.gl.framebufferTexture2D(GL.DRAW_FRAMEBUFFER, GL.DEPTH_ATTACHMENT, target, attachment.texture, 0);
        }
        this.width = attachment.width;
        this.height = attachment.height;
        this.restoreState(currentFramebuffer);
        return this;
    }

    public resize(width?: number /*= this.gl.drawingBufferWidth*/, height?: number /*= this.gl.drawingBufferHeight*/): WebGL2Framebuffer {
        width = width || this.gl.drawingBufferWidth;
        height = height || this.gl.drawingBufferHeight;
        let currentFramebuffer = this.bindAndCaptureState();
        for (let i = 0; i < this.numColorTargets; ++i) {
            let attachment = this.colorAttachments[i];
            if (!attachment) {
                continue;
            }
            attachment.resize(width, height);
            if (attachment instanceof WebGL2Texture) {
                if (attachment.is3D) {
                    this.gl.framebufferTextureLayer(GL.DRAW_FRAMEBUFFER, this.colorAttachmentEnums[i], attachment.texture, 0, this.colorAttachmentTargets[i]);
                } else {
                    this.gl.framebufferTexture2D(GL.DRAW_FRAMEBUFFER, this.colorAttachmentEnums[i], this.colorAttachmentTargets[i], attachment.texture, 0);
                }
            }
        }
        if (this.depthAttachment) {
            this.depthAttachment.resize(width, height);
            if (this.depthAttachment instanceof WebGL2Texture) {
                if (this.depthAttachment.is3D) {
                    this.gl.framebufferTextureLayer(GL.DRAW_FRAMEBUFFER, GL.DEPTH_ATTACHMENT, this.depthAttachment.texture, 0, this.depthAttachmentTarget);
                } else {
                    this.gl.framebufferTexture2D(GL.DRAW_FRAMEBUFFER, GL.DEPTH_ATTACHMENT, this.depthAttachmentTarget, this.depthAttachment.texture, 0);
                }
            }
        }
        this.width = width;
        this.height = height;
        this.restoreState(currentFramebuffer);
        return this;
    }

    public delete(): WebGL2Framebuffer {
        if (this.framebuffer) {
            this.gl.deleteFramebuffer(this.framebuffer);
            this.framebuffer = null;
            if (this.state.drawFramebuffer === this) {
                this.gl.bindFramebuffer(GL.DRAW_FRAMEBUFFER, null);
                this.state.drawFramebuffer = null;
            }
            if (this.state.readFramebuffer === this) {
                this.gl.bindFramebuffer(GL.READ_FRAMEBUFFER, null);
                this.state.readFramebuffer = null;
            }
        }
        return this;
    }

    public getStatus(): number {
        let currentFramebuffer = this.bindAndCaptureState();
        let status = this.gl.checkFramebufferStatus(GL.DRAW_FRAMEBUFFER);
        this.restoreState(currentFramebuffer);
        return status;
    }

    public bindForDraw(): WebGL2Framebuffer {
        if (this.state.drawFramebuffer !== this) {
            this.gl.bindFramebuffer(GL.DRAW_FRAMEBUFFER, this.framebuffer);
            this.state.drawFramebuffer = this;
        }
        return this;
    }

    public bindForRead(): WebGL2Framebuffer {
        if (this.state.readFramebuffer !== this) {
            this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, this.framebuffer);
            this.state.readFramebuffer = this;
        }
        return this;
    }

    public bindAndCaptureState(): WebGL2Framebuffer {
        const currentFramebuffer = this.state.drawFramebuffer;
        if (currentFramebuffer !== this) {
            this.gl.bindFramebuffer(GL.DRAW_FRAMEBUFFER, this.framebuffer);
        }
        return currentFramebuffer;
    }

    public restoreState(framebuffer: WebGL2Framebuffer): WebGL2Framebuffer {
        if (framebuffer !== this) {
            this.gl.bindFramebuffer(GL.DRAW_FRAMEBUFFER, framebuffer ? framebuffer.framebuffer : null);
        }
        return this;
    }

    // public get colorTextures() {
    //     console.error("Framebuffer.colorTextures is deprecated and will be removed. Please use Framebuffer.colorAttachments.");
    //     return this.colorAttachments;
    // }

    // public get depthTexture() {
    //     console.error("Framebuffer.depthTexture is deprecated and will be removed. Please use Framebuffer.depthAttachment.");
    //     return this.depthAttachment;
    // }

}
