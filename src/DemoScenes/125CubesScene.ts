
class _125CubesScene extends WebGL2DemoScene {
    ///
    private projMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private eyeRadius: number = 30;
    private eyeRotation: number = 0;
    private eyePosition: Float32Array;
    private lightPosition: Float32Array;
    private vsSource: string;
    private fsSource: string;
    private updateVsSource: string;
    private updateFsSource: string;
    private image: HTMLImageElement;
    private NEAR: number = 0.1;
    private FAR: number = 100.0;
    ///
    private program: WebGL2Program;
    private updateProgram: WebGL2Program;
    private sceneUniformBuffer: WebGL2UniformBuffer;
    private updateDrawCallA: WebGL2DrawCall;
    private updateDrawCallB: WebGL2DrawCall;
    private boxesDrawCallA: WebGL2DrawCall;
    private boxesDrawCallB: WebGL2DrawCall;
    private updateDrawCall: WebGL2DrawCall;
    private boxesDrawCall: WebGL2DrawCall;
    ///
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

        const BOX_GRID_DIM = 50;
        const NUM_BOXES = BOX_GRID_DIM * BOX_GRID_DIM * BOX_GRID_DIM;
        this.NEAR = 0.1;
        this.FAR = 100.0;

        const engine = this.engine;
        engine.clearColor(0.5, 0.5, 0.5, 1.0)
            .depthTest()
            .depthFunc(GL.LEQUAL)
            .cullBackfaces();
        //
        const rotationData = new Float32Array(NUM_BOXES);
        const translationData = new Float32Array(NUM_BOXES * 3);
        const axisData = new Float32Array(NUM_BOXES * 3);
        let boxI = 0;
        const offset = -Math.floor(BOX_GRID_DIM / 2);
        const axis = vec3.create();
        for (let i = 0; i < BOX_GRID_DIM; ++i) {
            for (let j = 0; j < BOX_GRID_DIM; ++j) {
                for (let k = 0; k < BOX_GRID_DIM; ++k) {
                    let transI = boxI * 3;

                    rotationData[boxI] = boxI / Math.PI;
                    translationData[transI] = i + offset;
                    translationData[transI + 1] = j + offset;
                    translationData[transI + 2] = k + offset;

                    axis[0] = Math.random() * 2 - 1;
                    axis[1] = Math.random() * 2 - 1;
                    axis[2] = Math.random() * 2 - 1;

                    vec3.normalize(axis, axis);

                    axisData.set(axis, transI);

                    ++boxI;
                }
            }
        }

        const box = engine.createBox({ dimensions: [0.5, 0.5, 0.5] })
        const positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);
        const normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);
        const rotationsA = engine.createVertexBuffer(GL.FLOAT, 1, rotationData);
        const rotationsB = engine.createVertexBuffer(GL.FLOAT, 1, rotationData.length);
        const translations = engine.createVertexBuffer(GL.FLOAT, 3, translationData);
        const axes = engine.createVertexBuffer(GL.FLOAT, 3, axisData);

        const boxArrayA = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .instanceAttributeBuffer(3, translations)
            .instanceAttributeBuffer(4, axes)
            .instanceAttributeBuffer(5, rotationsA);

        const boxArrayB = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .instanceAttributeBuffer(3, translations)
            .instanceAttributeBuffer(4, axes)
            .instanceAttributeBuffer(5, rotationsB);

        const updateVertexArrayA = engine.createVertexArray()
            .vertexAttributeBuffer(0, rotationsA);

        const transformFeedbackA = engine.createTransformFeedback()
            .feedbackBuffer(0, rotationsA);

        const updateVertexArrayB = engine.createVertexArray()
            .vertexAttributeBuffer(0, rotationsB);

        const transformFeedbackB = engine.createTransformFeedback()
            .feedbackBuffer(0, rotationsB);

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, this.NEAR, this.FAR);

        this.viewMatrix = mat4.create();
        this.eyePosition = vec3.fromValues(0, 28, 0);
        this.viewProjMatrix = mat4.create();
        this.lightPosition = vec3.create();

        this.sceneUniformBuffer = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ]);


        const texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        this.updateDrawCallA = engine.createDrawCall(this.updateProgram, updateVertexArrayA)
            .primitive(GL.POINTS)
            .transformFeedback(transformFeedbackB);

        this.updateDrawCallB = engine.createDrawCall(this.updateProgram, updateVertexArrayB)
            .primitive(GL.POINTS)
            .transformFeedback(transformFeedbackA);

        this.boxesDrawCallA = engine.createDrawCall(this.program, boxArrayA)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .texture("uTexture", texture);

        this.boxesDrawCallB = engine.createDrawCall(this.program, boxArrayB)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .texture("uTexture", texture)

        this.updateDrawCall = this.updateDrawCallA;
        this.boxesDrawCall = this.boxesDrawCallB;
        this.eyeRadius = 40;
        this.eyeRotation = 0;
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-125cubes/draw.vs.glsl',
                'resource/assets/shader-125cubes/draw.fs.glsl',
                'resource/assets/shader-125cubes/update.vs.glsl',
                'resource/assets/shader-125cubes/update.fs.glsl'
            ];
            const txts = await this.engine.loadText(ress);
            this.vsSource = txts[0];
            this.fsSource = txts[1];
            this.updateVsSource = txts[2];
            this.updateFsSource = txts[3];
            //
            const programs = await this.engine.createPrograms(
                [this.vsSource, this.fsSource], [this.updateVsSource, this.updateFsSource, ["vRotation"]]
            );
            this.program = programs[0];
            this.updateProgram = programs[1];
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
        this.eyeRotation += 0.002;
        this.eyePosition[0] = Math.sin(this.eyeRotation) * this.eyeRadius;
        this.eyePosition[2] = Math.cos(this.eyeRotation) * this.eyeRadius;
        this.lightPosition.set(this.eyePosition);
        this.lightPosition[0] += 5;
        mat4.lookAt(this.viewMatrix, this.eyePosition, vec3.fromValues(0, -5, 0), vec3.fromValues(0, 1, 0));
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniformBuffer
            .set(0, this.viewProjMatrix)
            .set(1, this.eyePosition)
            .set(2, this.lightPosition)
            .update();
        engine.noRasterize();
        this.updateDrawCall.draw();
        engine.rasterize().clear();
        this.boxesDrawCall.draw()
        this.updateDrawCall = this.updateDrawCall === this.updateDrawCallA ? this.updateDrawCallB : this.updateDrawCallA;
        this.boxesDrawCall = this.boxesDrawCall === this.boxesDrawCallA ? this.boxesDrawCallB : this.boxesDrawCallA;
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.program.delete();
        this.updateProgram.delete();
        this.sceneUniformBuffer.delete();
        this.updateDrawCallA.delete();
        this.updateDrawCallB.delete();
        this.boxesDrawCallA.delete();
        this.boxesDrawCallB.delete();
        this.updateDrawCall.delete();
        this.boxesDrawCall.delete();
        const engine = this.engine;
        engine.noDepthTest().noCullBackfaces();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, this.NEAR, this.FAR);
        return this;
    }
}