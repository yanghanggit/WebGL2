
interface DofBoxTransform {
    scale: Float32Array | number[];
    rotate: Float32Array | number[];
    translate: Float32Array | number[];
    modelMatrix: Float32Array;
}

class DofScene extends WebGL2DemoScene {
    
    //
    private projMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private modelMatrixData: Float32Array;
    private boxVsSource: string;
    private boxFsSource: string;
    private quadVsSource: string;
    private blurFsSource: string;
    private resized: boolean;
    private image: HTMLImageElement;
    private boxes: DofBoxTransform[];
    //
    private boxProgram: WebGL2Program;
    private blurProgram: WebGL2Program;
    private boxBuffer: WebGL2Framebuffer;
    private hblurBuffer: WebGL2Framebuffer;
    private blurBuffer: WebGL2Framebuffer;
    private sceneUniforms: WebGL2UniformBuffer;
    private modelMatrices: WebGL2VertexBuffer;
    private boxesDrawCall: WebGL2DrawCall;
    private hBlurDrawCall: WebGL2DrawCall;
    private finalDrawCall: WebGL2DrawCall;

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
        engine.depthTest().clearColor(0.5, 0.5, 0.5, 1.0);
        //
        const NEAR = 0.1;
        const FAR = 10.0;
        const FOCAL_LENGTH = 1.0;
        const FOCUS_DISTANCE = 2.0;
        const MAGNIFICATION = FOCAL_LENGTH / Math.abs(FOCUS_DISTANCE - FOCAL_LENGTH);
        const FSTOP = 2.8;
        const BLUR_COEFFICIENT = FOCAL_LENGTH * MAGNIFICATION / FSTOP;
        const PPM = Math.sqrt(engine.canvas.width * engine.canvas.width + engine.canvas.height * engine.canvas.height) / 35;
        const NUM_ROWS = 5;
        const BOXES_PER_ROW = 20;
        const NUM_BOXES = BOXES_PER_ROW * NUM_ROWS;
        //
        const depthRange = vec2.fromValues(NEAR, FAR);
        const colorTargetA = engine.createTexture2DBySize(engine.width, engine.height, {});
        const colorTargetB = engine.createTexture2DBySize(engine.width, engine.height, {});
        const depthTarget = engine.createTexture2DBySize(engine.width, engine.height, {
            internalFormat: GL.DEPTH_COMPONENT16
        });

        this.boxBuffer = engine.createFramebuffer().colorTarget(0, colorTargetA).depthTarget(depthTarget);
        this.hblurBuffer = engine.createFramebuffer().colorTarget(0, colorTargetB);
        this.blurBuffer = engine.createFramebuffer().colorTarget(0, colorTargetA);


        const box = Utils.createCube({ dimensions: [1.0, 1.0, 1.0] })
        const positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);
        const normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);

        this.modelMatrixData = new Float32Array(NUM_BOXES * 16);
        this.modelMatrices = engine.createMatrixBuffer(GL.FLOAT_MAT4, this.modelMatrixData);

        const boxArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .instanceAttributeBuffer(3, this.modelMatrices);

        const quadPositions = engine.createVertexBuffer(GL.FLOAT, 2, new Float32Array([
            -1, 1,
            -1, -1,
            1, -1,
            -1, 1,
            1, -1,
            1, 1,
        ]));

        const quadArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, quadPositions);

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, NEAR, FAR);

        this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(1, 1.5, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        const lightPosition = vec3.fromValues(1, 1, 0.5);
        this.sceneUniforms = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ]).set(0, this.viewProjMatrix)
            .set(1, eyePosition)
            .set(2, lightPosition)
            .update();
        const dofUniforms = engine.createUniformBuffer([
            GL.FLOAT_VEC2,
            GL.FLOAT,
            GL.FLOAT,
            GL.FLOAT
        ]).set(0, depthRange)
            .set(1, FOCUS_DISTANCE)
            .set(2, BLUR_COEFFICIENT)
            .set(3, PPM)
            .update();


        const hTexelOffset = vec2.fromValues(1.0, 0.0);
        const vTexelOffset = vec2.fromValues(0.0, 1.0);

        const texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        this.boxes = new Array(NUM_BOXES);
        this.boxesDrawCall = engine.createDrawCall(this.boxProgram, boxArray)
            .uniformBlock("SceneUniforms", this.sceneUniforms)
            .texture("uTexture", texture);

        let boxI = 0;
        const boxes = this.boxes;
        for (let j = 0; j < NUM_ROWS; ++j) {
            let rowOffset = (j - Math.floor(NUM_ROWS / 2));
            for (let i = 0; i < BOXES_PER_ROW; ++i) {
                boxes[boxI] = {
                    scale: [0.9, 0.9, 0.9],
                    rotate: [-boxI / Math.PI, 0, boxI / Math.PI],
                    translate: [-i + 2 - rowOffset, 0, -i + 2 + rowOffset],
                    modelMatrix: mat4.create(),
                }
                ++boxI;
            }
        }

        this.hBlurDrawCall = engine.createDrawCall(this.blurProgram, quadArray)
            .uniformBlock("DOFUniforms", dofUniforms)
            .uniform("uTexelOffset", hTexelOffset)
            .texture("uColor", this.boxBuffer.colorAttachments[0] as WebGL2Texture)
            .texture("uDepth", this.boxBuffer.depthAttachment);

        this.finalDrawCall = engine.createDrawCall(this.blurProgram, quadArray)
            .uniformBlock("DOFUniforms", dofUniforms)
            .uniform("uTexelOffset", vTexelOffset)
            .texture("uColor", this.hblurBuffer.colorAttachments[0] as WebGL2Texture)
            .texture("uDepth", this.boxBuffer.depthAttachment);
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-dof/boxes.vs.glsl',
                'resource/assets/shader-dof/boxes.fs.glsl',
                'resource/assets/shader-dof/quad.vs.glsl',
                'resource/assets/shader-dof/blur.fs.glsl'
            ];
            const txts = await this.engine.loadText(ress);
            this.boxVsSource = txts[0];
            this.boxFsSource = txts[1];
            this.quadVsSource = txts[2];
            this.blurFsSource = txts[3];
            //
            const programs = await this.engine.createPrograms(
                [this.boxVsSource, this.boxFsSource], [this.quadVsSource, this.blurFsSource]
            );
            this.boxProgram = programs[0];
            this.blurProgram = programs[1];

            const texarrays: string[] = [
                'resource/assets/bg.png',
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
        if (this.resized) {
            this.boxBuffer.resize(engine.width, engine.width);
            this.hblurBuffer.resize(engine.width, engine.width);
            this.blurBuffer.resize(engine.width, engine.width);
            mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 10.0);
            mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
            this.sceneUniforms.set(0, this.viewProjMatrix).update();
            this.resized = false;
        }
        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].rotate[0] += 0.01;
            boxes[i].rotate[1] += 0.02;
            engine.xformMatrix(boxes[i].modelMatrix, boxes[i].translate as Float32Array, boxes[i].rotate as Float32Array, boxes[i].scale as Float32Array);
            this.modelMatrixData.set(boxes[i].modelMatrix, i * 16);
        }
        this.modelMatrices.data(this.modelMatrixData);
        engine.drawFramebuffer(this.boxBuffer).clear();
        this.boxesDrawCall.draw();
        engine.drawFramebuffer(this.hblurBuffer).clear()
        this.hBlurDrawCall.draw()
        engine.defaultDrawFramebuffer().clear()
        this.finalDrawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.boxProgram.delete();
        this.blurProgram.delete();
        this.boxBuffer.delete();
        this.hblurBuffer.delete();
        this.blurBuffer.delete();
        this.modelMatrices.delete();
        this.boxesDrawCall.delete();
        this.hBlurDrawCall.delete();
        this.finalDrawCall.delete();
        this.sceneUniforms.delete();
        const engine = this.engine;
        engine.noDepthTest();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        this.resized = true;
        return this;
    }
}