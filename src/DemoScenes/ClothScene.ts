
class ClothScene extends WebGL2DemoScene {

    //
    private vsSource: string;
    private fsSource: string;
    private program: WebGL2Program;
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

    ////
    private updateForceProgram: WebGL2Program;
    private updateConstraintProgram: WebGL2Program;
    private updateCollisionProgram: WebGL2Program;
    private updateNormalProgram: WebGL2Program;
    private ballProgram: WebGL2Program;
    private clothProgram: WebGL2Program;
    private image: HTMLImageElement;

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
        /*
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
        */
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-cloth/quad.vs.glsl',
                'resource/assets/shader-cloth/update-force.fs.glsl',
                'resource/assets/shader-cloth/update-constraint.fs.glsl',
                'resource/assets/shader-cloth/update-collision.fs.glsl',
                'resource/assets/shader-cloth/update-normal.fs.glsl',
                'resource/assets/shader-cloth/ball.vs.glsl',
                'resource/assets/shader-cloth/cloth.vs.glsl',
                'resource/assets/shader-cloth/phong.fs.glsl',
            ];
            //
            const txts = await this.engine.loadText(ress);
            const quadShader = txts[0];
            const updateForceFsSource = txts[1];
            const updateConstraintFsSource = txts[2];
            const updateCollisionFsSource = txts[3];
            const updateNormalFsSource = txts[4];
            const ballVsSource = txts[5];
            const clothVsSource = txts[6];
            const phongShader = txts[7];
            const programs = await this.engine.createPrograms(
                [quadShader, updateForceFsSource],
                [quadShader, updateConstraintFsSource],
                [quadShader, updateCollisionFsSource],
                [quadShader, updateNormalFsSource],
                [ballVsSource, phongShader],
                [clothVsSource, phongShader]
            );
            this.updateForceProgram = programs[1];
            this.updateConstraintProgram = programs[2];
            this.updateCollisionProgram = programs[3];
            this.updateNormalProgram = programs[4];
            this.ballProgram = programs[5];
            this.clothProgram = programs[6];
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
        // const engine = this.engine;
        // this.angleX += 0.01;
        // this.angleY += 0.02;
        // mat4.fromXRotation(this.rotateXMatrix, this.angleX);
        // mat4.fromYRotation(this.rotateYMatrix, this.angleY);
        // mat4.multiply(this.modelMatrix, this.rotateXMatrix, this.rotateYMatrix);
        // this.drawCall.uniform("uModel", this.modelMatrix);
        // engine.drawFramebuffer(this.msaaFramebuffer).clearColor(0.4, 0.4, 0.4, 1.0).clear();
        // this.drawCall.texture("tex", this.texture).draw();
        // engine.readFramebuffer(this.msaaFramebuffer)
        //     .drawFramebuffer(this.textureFramebuffer)
        //     .blitFramebuffer(GL.COLOR_BUFFER_BIT);
        // engine.defaultDrawFramebuffer().clearColor(0.5, 0.5, 0.5, 1.0).clear()
        // this.drawCall.texture("tex", this.textureFramebuffer.colorAttachments[0] as WebGL2Texture).draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        // this.program.delete();
        // this.sceneUniformBuffer.delete();
        // this.drawCall.delete();
        // this.texture.delete();
        // this.msaaFramebuffer.delete();
        // this.textureFramebuffer.delete();
        // const engine = this.engine;
        // engine.noDepthTest();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        // this.msaaFramebuffer.resize(width, height);
        // this.textureFramebuffer.resize(width, height);
        // mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        // mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        // this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        return this;
    }
}