
class RenderTo3DTextureScene extends WebGL2DemoScene {

    private projMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private mvpMatrix: Float32Array;
    private drawCall: WebGL2DrawCall;
    private tex3DVsSource: string;
    private tex3DFsSource: string;
    private vsSource: string;
    private fsSource: string;
    private tex3DProgram: WebGL2Program;
    private program: WebGL2Program;
    private image: HTMLImageElement;
    private startTime: number = 0;

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
        const engine = this.engine;
        const DIMENSIONS = 128;
        engine.clearColor(0.5, 0.5, 0.5, 1.0)
            .blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA)
            .cullBackfaces()
            .clear();
        //
        const colorTarget = engine.createTexture3DBySize(DIMENSIONS, DIMENSIONS, DIMENSIONS, {
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });
        const framebuffer = engine.createFramebuffer().colorTarget(0, colorTarget);
        const box = engine.createBox({ dimensions: [1.0, 1.0, 1.0] })
        const positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);
        const normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);
        const boxArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals);

        // 
        const INCREMENT = 1 / DIMENSIONS;
        const positionData = new Float32Array(DIMENSIONS * DIMENSIONS * DIMENSIONS * 3);
        let positionIndex = 0;
        let x = -0.5;
        for (let i = 0; i < DIMENSIONS; ++i) {
            let y = -0.5;
            for (let j = 0; j < DIMENSIONS; ++j) {
                let z = -0.5;
                for (let k = 0; k < DIMENSIONS; ++k) {
                    positionData[positionIndex++] = x + (Math.random() - 0.5) / (DIMENSIONS);
                    positionData[positionIndex++] = y + (Math.random() - 0.5) / (DIMENSIONS);
                    positionData[positionIndex++] = z + (Math.random() - 0.5) / (DIMENSIONS);
                    z += INCREMENT;
                }
                y += INCREMENT;
            }
            x += INCREMENT;
        }
        const pointPositions = engine.createVertexBuffer(GL.FLOAT, 3, positionData)
        const pointArray = engine.createVertexArray().vertexAttributeBuffer(0, pointPositions);

        const tex3DViewMatrix = mat4.create();
        const tex3DEyePosition = vec3.fromValues(0.7, 0.7, 0.7);
        mat4.lookAt(tex3DViewMatrix, tex3DEyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(0.6, 0.6, 0.6);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        const tex3DProjMatrix = mat4.create();
        mat4.perspective(tex3DProjMatrix, Math.PI / 2, 1, 0.1, 10.0);

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 10.0);

        const tex3DViewProjMatrix = mat4.create();
        mat4.multiply(tex3DViewProjMatrix, tex3DProjMatrix, tex3DViewMatrix);

        this.mvpMatrix = mat4.create();
        mat4.multiply(this.mvpMatrix, this.projMatrix, this.viewMatrix);

        const lightPosition = vec3.fromValues(1, 1, 0.5);
        const sceneUniformBuffer = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ]).set(0, tex3DViewProjMatrix)
            .set(1, tex3DEyePosition)
            .set(2, lightPosition)
            .update();

        //
        const modelMatrix = mat4.create();
        const rotateXMatrix = mat4.create();
        const rotateYMatrix = mat4.create();
        let angleX = 0;
        let angleY = 0;
        const texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        const tex3DDrawCall = engine.createDrawCall(this.tex3DProgram, boxArray)
            .uniformBlock("SceneUniforms", sceneUniformBuffer)
            .texture("tex", texture);

        this.startTime = performance.now();

        this.drawCall = engine.createDrawCall(this.program, pointArray)
            .primitive(GL.POINTS)
            .texture("tex", colorTarget)
            .uniform("uMVP", this.mvpMatrix);

        engine.drawFramebuffer(framebuffer)
            .viewport(0, 0, DIMENSIONS, DIMENSIONS)
            .depthTest()
            .clearColor(0.0, 0.0, 0.0, 0.0);

        for (let i = 0; i < DIMENSIONS; ++i) {
            angleX += Math.PI / DIMENSIONS;
            angleY += 0.5 * Math.PI / DIMENSIONS;
            mat4.fromXRotation(rotateXMatrix, angleX);
            mat4.fromYRotation(rotateYMatrix, angleY);
            mat4.multiply(modelMatrix, rotateXMatrix, rotateYMatrix);
            tex3DDrawCall.uniform("uModel", modelMatrix);
            framebuffer.colorTarget(0, colorTarget, i);
            engine.clear();
            tex3DDrawCall.draw();
        }
        framebuffer.resize(DIMENSIONS, DIMENSIONS);//???
        
        engine.defaultDrawFramebuffer()
            .defaultViewport()
            .noDepthTest()
            .blend()
            .clearColor(0.5, 0.5, 0.5, 1.0);
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-rtt-3dtexture/3dtexture.vs.glsl',
                'resource/assets/shader-rtt-3dtexture/3dtexture.fs.glsl',
                'resource/assets/shader-rtt-3dtexture/draw.vs.glsl',
                'resource/assets/shader-rtt-3dtexture/draw.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.tex3DVsSource = txts[0];
            this.tex3DFsSource = txts[1];
            this.vsSource = txts[2];
            this.fsSource = txts[3];
            //
            const programs = await this.engine.createPrograms(
                [this.tex3DVsSource, this.tex3DFsSource],
                [this.vsSource, this.fsSource]
            );
            //
            this.tex3DProgram = programs[0];
            this.program = programs[1];
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
        this.drawCall.uniform("uTime", (performance.now() - this.startTime) / 1000);
        this.engine.clear();
        this.drawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.drawCall.delete();
        this.tex3DProgram.delete();
        this.program.delete();
        //
        const engine = this.engine;
        engine.noBlend().noCullBackfaces();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.mvpMatrix, this.projMatrix, this.viewMatrix);
        return this;
    }
}