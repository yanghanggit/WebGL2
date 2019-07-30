
class MSAAScene extends WebGL2DemoScene {

    //
    private vsSource: string;
    private fsSource: string;
    private program: WebGL2Program;
    private image: HTMLImageElement;
    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private sceneUniformBuffer: WebGL2UniformBuffer;
    private drawCall: WebGL2DrawCall;
    private angleX: number = 0;
    private angleY: number = 0;
    private texture: WebGL2Texture;
    private projMatrix: Float32Array;
    private modelMatrix: Float32Array;
    private rotateXMatrix: Float32Array;
    private rotateYMatrix: Float32Array;
    private msaaFramebuffer: WebGL2Framebuffer;
    private textureFramebuffer: WebGL2Framebuffer;

    //
    public enter(): WebGL2DemoScene {
        this.application.profile.setTitle(egret.getQualifiedClassName(this));
        this.start().catch(e => {
            console.error(e);
        });
        return this;
    }

    private async start(): Promise<void> {
        await this.loadResource();
        this.createScene();
        this._ready = true;
    }

    private createScene(): void {
        //
        const engine = this.engine;
        engine.depthTest().clearColor(0.5, 0.5, 0.5, 1.0);
        //
        const SAMPLES = engine.capbility('SAMPLES');
        const colorTarget = engine.createRenderbuffer(engine.width, engine.height, GL.RGBA8, SAMPLES);
        const depthTarget = engine.createRenderbuffer(engine.width, engine.height, GL.DEPTH_COMPONENT16, SAMPLES);
        this.msaaFramebuffer = engine.createFramebuffer().colorTarget(0, colorTarget).depthTarget(depthTarget);
        //
        const textureColorTarget = engine.createTexture2DBySize(engine.width, engine.height, {});
        this.textureFramebuffer = engine.createFramebuffer().colorTarget(0, textureColorTarget);
        //
        const box = engine.createBox({ dimensions: [1.0, 1.0, 1.0] })
        const positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);
        const normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);
        const boxArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals);
        //
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        const lightPosition = vec3.fromValues(1, 1, 0.5);
        this.sceneUniformBuffer = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ]).set(0, this.viewProjMatrix)
            .set(1, eyePosition)
            .set(2, lightPosition)
            .update();

        this.modelMatrix = mat4.create();
        this.rotateXMatrix = mat4.create();
        this.rotateYMatrix = mat4.create();

        this.texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        this.drawCall = engine.createDrawCall(this.program, boxArray).uniformBlock("SceneUniforms", this.sceneUniformBuffer);
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-rtt/rtt.vs.glsl',
                'resource/assets/shader-rtt/rtt.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.vsSource = txts[0];
            this.fsSource = txts[1];
            //
            const programs = await this.engine.createPrograms(
                [this.vsSource, this.fsSource],
            );
            //
            this.program = programs[0];
            //
            const texarrays: string[] = [
                'resource/assets/bg.jpg',
            ];
            const loadImages = await this.engine.loadImages(texarrays);
            this.image = loadImages[0];
        }
        catch (e) {
            console.error(e);
        }
    }

    public update(): WebGL2DemoScene {
        if (!this._ready) {
            return;
        }
        const engine = this.engine;
        this.angleX += 0.01;
        this.angleY += 0.02;
        mat4.fromXRotation(this.rotateXMatrix, this.angleX);
        mat4.fromYRotation(this.rotateYMatrix, this.angleY);
        mat4.multiply(this.modelMatrix, this.rotateXMatrix, this.rotateYMatrix);
        this.drawCall.uniform("uModel", this.modelMatrix);
        engine.drawFramebuffer(this.msaaFramebuffer).clearColor(0.4, 0.4, 0.4, 1.0).clear();
        this.drawCall.texture("tex", this.texture).draw();
        engine.readFramebuffer(this.msaaFramebuffer)
            .drawFramebuffer(this.textureFramebuffer)
            .blitFramebuffer(GL.COLOR_BUFFER_BIT);
        engine.defaultDrawFramebuffer().clearColor(0.5, 0.5, 0.5, 1.0).clear()
        this.drawCall.texture("tex", this.textureFramebuffer.colorAttachments[0] as WebGL2Texture).draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.program.delete();
        this.sceneUniformBuffer.delete();
        this.drawCall.delete();
        this.texture.delete();
        this.msaaFramebuffer.delete();
        this.textureFramebuffer.delete();
        const engine = this.engine;
        engine.noDepthTest();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        this.msaaFramebuffer.resize(width, height);
        this.textureFramebuffer.resize(width, height);
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        return this;
    }
}