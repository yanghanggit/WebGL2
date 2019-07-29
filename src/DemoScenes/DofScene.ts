
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
    private boxes: any[];
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
        const app = engine;
        const canvas = engine.canvas;
        const PicoGL = GL;
        const utils = engine;


        const NEAR = 0.1;
        const FAR = 10.0;
        const FOCAL_LENGTH = 1.0;
        const FOCUS_DISTANCE = 2.0;
        const MAGNIFICATION = FOCAL_LENGTH / Math.abs(FOCUS_DISTANCE - FOCAL_LENGTH);
        const FSTOP = 2.8;
        const BLUR_COEFFICIENT = FOCAL_LENGTH * MAGNIFICATION / FSTOP;
        const PPM = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) / 35;

        const NUM_ROWS = 5;
        const BOXES_PER_ROW = 20;
        const NUM_BOXES = BOXES_PER_ROW * NUM_ROWS;

        app.depthTest().clearColor(0.0, 0.0, 0.0, 1.0);

        let depthRange = vec2.fromValues(NEAR, FAR);
        let colorTargetA = app.createTexture2DBySize(app.width, app.height, {});
        let colorTargetB = app.createTexture2DBySize(app.width, app.height, {});
        let depthTarget = app.createTexture2DBySize(app.width, app.height, {
            internalFormat: PicoGL.DEPTH_COMPONENT16
        });

        this.boxBuffer = app.createFramebuffer().colorTarget(0, colorTargetA).depthTarget(depthTarget);
        this.hblurBuffer = app.createFramebuffer().colorTarget(0, colorTargetB);
        this.blurBuffer = app.createFramebuffer().colorTarget(0, colorTargetA);


        let box = utils.createBox({ dimensions: [1.0, 1.0, 1.0] })
        let positions = app.createVertexBuffer(PicoGL.FLOAT, 3, box.positions);
        let uv = app.createVertexBuffer(PicoGL.FLOAT, 2, box.uvs);
        let normals = app.createVertexBuffer(PicoGL.FLOAT, 3, box.normals);

        this.modelMatrixData = new Float32Array(NUM_BOXES * 16);
        this.modelMatrices = app.createMatrixBuffer(PicoGL.FLOAT_MAT4, this.modelMatrixData);

        let boxArray = app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .instanceAttributeBuffer(3, this.modelMatrices);

        // QUAD GEOMETRY
        let quadPositions = app.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            -1, 1,
            -1, -1,
            1, -1,
            -1, 1,
            1, -1,
            1, 1,
        ]));

        let quadArray = app.createVertexArray()
            .vertexAttributeBuffer(0, quadPositions);

        // UNIFORM DATA
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, canvas.width / canvas.height, NEAR, FAR);

        this.viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(1, 1.5, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        let lightPosition = vec3.fromValues(1, 1, 0.5);

        let sceneUniforms = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4
        ])
            .set(0, this.viewProjMatrix)
            .set(1, eyePosition)
            .set(2, lightPosition)
            .update();

        let dofUniforms = app.createUniformBuffer([
            PicoGL.FLOAT_VEC2,
            PicoGL.FLOAT,
            PicoGL.FLOAT,
            PicoGL.FLOAT
        ])
            .set(0, depthRange)
            .set(1, FOCUS_DISTANCE)
            .set(2, BLUR_COEFFICIENT)
            .set(3, PPM)
            .update();


        let hTexelOffset = vec2.fromValues(1.0, 0.0);
        let vTexelOffset = vec2.fromValues(0.0, 1.0);

        let texture = app.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: app.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        this.boxes = new Array(NUM_BOXES);
        this.boxesDrawCall = app.createDrawCall(this.boxProgram, boxArray)
            .uniformBlock("SceneUniforms", sceneUniforms)
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

        this.hBlurDrawCall = app.createDrawCall(this.blurProgram, quadArray)
            .uniformBlock("DOFUniforms", dofUniforms)
            .uniform("uTexelOffset", hTexelOffset)
            .texture("uColor", this.boxBuffer.colorAttachments[0] as WebGL2Texture)
            .texture("uDepth", this.boxBuffer.depthAttachment);

        this.finalDrawCall = app.createDrawCall(this.blurProgram, quadArray)
            .uniformBlock("DOFUniforms", dofUniforms)
            .uniform("uTexelOffset", hTexelOffset)
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
        const app = this.engine;
        if (this.resized) {
            this.boxBuffer.resize();
            this.hblurBuffer.resize();
            this.blurBuffer.resize();
            mat4.perspective(this.projMatrix, Math.PI / 2, app.canvas.width / app.canvas.height, 0.1, 10.0);
            mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
            this.sceneUniforms.set(0, this.viewProjMatrix).update();
            this.resized = false;
        }
        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].rotate[0] += 0.01;
            boxes[i].rotate[1] += 0.02;

            app.xformMatrix(boxes[i].modelMatrix, boxes[i].translate, boxes[i].rotate, boxes[i].scale);

            this.modelMatrixData.set(boxes[i].modelMatrix, i * 16);
        }
        this.modelMatrices.data(this.modelMatrixData);
        app.drawFramebuffer(this.boxBuffer).clear();
        this.boxesDrawCall.draw();
        app.drawFramebuffer(this.hblurBuffer).clear()
        this.hBlurDrawCall.draw()
        app.defaultDrawFramebuffer().clear()
        this.finalDrawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.boxProgram.delete();
        this.blurProgram.delete();
        this.boxBuffer.delete();
        this.hblurBuffer.delete();
        this.blurBuffer.delete();
        this.sceneUniforms.delete();
        this.modelMatrices.delete();
        this.boxesDrawCall.delete();
        this.hBlurDrawCall.delete();
        this.finalDrawCall.delete();
        const engine = this.engine;
        engine.noDepthTest();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        this.resized = true;
        return this;
    }
}