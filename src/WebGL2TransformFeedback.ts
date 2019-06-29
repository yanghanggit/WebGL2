

class WebGL2TransformFeedback extends WebGL2Object {
    //
    private transformFeedback: WebGLTransformFeedback;

    constructor(engine: WebGL2Engine) {
        super(engine);
        this.restore();
    }

    public restore(): WebGL2TransformFeedback {
        if (this.state.transformFeedback === this) {
            this.state.transformFeedback = null;
        }
        this.transformFeedback = this.gl.createTransformFeedback();
        return this;
    }

    public feedbackBuffer(index: number, buffer: WebGL2VertexBuffer): WebGL2TransformFeedback {
        this.gl.bindTransformFeedback(GL.TRANSFORM_FEEDBACK, this.transformFeedback);
        this.gl.bindBufferBase(GL.TRANSFORM_FEEDBACK_BUFFER, index, buffer.buffer);
        this.gl.bindTransformFeedback(GL.TRANSFORM_FEEDBACK, null);
        this.gl.bindBufferBase(GL.TRANSFORM_FEEDBACK_BUFFER, index, null);
        return this;
    }

    public delete(): WebGL2TransformFeedback {
        if (this.transformFeedback) {
            this.gl.deleteTransformFeedback(this.transformFeedback);
            this.transformFeedback = null;
            if (this.state.transformFeedback === this) {
                this.gl.bindTransformFeedback(GL.TRANSFORM_FEEDBACK, null);
                this.state.transformFeedback = null;
            }
        }
        return this;
    }

    public bind(): WebGL2TransformFeedback {
        if (this.state.transformFeedback !== this) {
            this.gl.bindTransformFeedback(GL.TRANSFORM_FEEDBACK, this.transformFeedback);
            this.state.transformFeedback = this;
        }
        return this;
    }
}
