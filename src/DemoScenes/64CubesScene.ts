
class _64CubesScene extends WebGL2DemoScene {
    
    ///
    private projMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private eyeRadius: number = 30;
    private eyeRotation: number = 0;
    private eyePosition: Float32Array;
    private lightPosition: Float32Array;
    private boxes: any[] = [];
    private rotationAxis: Float32Array;
    private modelMatrixData: Float32Array;
    private vsSource: string;
    private fsSource: string;
    private image: HTMLImageElement;
    private NEAR: number = 0.1;
    private FAR: number = 100.0;
    ///
    private program: WebGL2Program;
    private boxesDrawCall: WebGL2DrawCall;
    private sceneUniformBuffer: WebGL2UniformBuffer;
    private modelMatrices: WebGL2VertexBuffer;

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
        const BOX_GRID_DIM = 40;
        const NUM_BOXES = BOX_GRID_DIM * BOX_GRID_DIM * BOX_GRID_DIM;
        this.NEAR = 0.1;
        this.FAR = 100.0;
        //
        engine.clearColor(0.5, 0.5, 0.5, 1.0)
            .depthTest()
            .depthFunc(GL.LEQUAL)
            .cullBackfaces();
        //
        const box = Utils.createCube({ dimensions: [0.5, 0.5, 0.5] })
        const positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);
        const normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);
        this.modelMatrixData = new Float32Array(NUM_BOXES * 16);
        this.modelMatrices = engine.createMatrixBuffer(GL.FLOAT_MAT4, this.modelMatrixData);
        const boxArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .instanceAttributeBuffer(3, this.modelMatrices)
        //
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, this.NEAR, this.FAR);
        this.viewMatrix = mat4.create();
        this.eyePosition = vec3.fromValues(0, 22, 0);
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

        this.boxes = new Array(NUM_BOXES);
        this.boxesDrawCall = engine.createDrawCall(this.program, boxArray)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .texture("uTexture", texture);

        this.rotationAxis = vec3.fromValues(1, 1, 1);
        vec3.normalize(this.rotationAxis, this.rotationAxis);

        let boxI = 0;
        let offset = -Math.floor(BOX_GRID_DIM / 2);
        const boxes = this.boxes;
        for (let i = 0; i < BOX_GRID_DIM; ++i) {
            for (let j = 0; j < BOX_GRID_DIM; ++j) {
                for (let k = 0; k < BOX_GRID_DIM; ++k) {
                    boxes[boxI] = {
                        rotate: boxI / Math.PI,
                        rotationMatrix: mat4.create(),
                        translationMatrix: mat4.create(),
                        modelMatrix: new Float32Array(this.modelMatrixData.buffer, boxI * 64, 16),
                    }
                    mat4.fromRotation(boxes[boxI].rotationMatrix, boxes[boxI].rotate, this.rotationAxis);
                    mat4.fromTranslation(boxes[boxI].translationMatrix, new Float32Array([i + offset, j + offset, k + offset]));
                    ++boxI;
                }
            }
        }
        this.eyeRadius = 30;
        this.eyeRotation = 0;
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-64cubes/64cubes.vs.glsl',
                'resource/assets/shader-64cubes/64cubes.fs.glsl'
            ];
            const txts = await this.engine.loadText(ress);
            this.vsSource = txts[0];
            this.fsSource = txts[1];
            //
            const programs = await this.engine.createPrograms(
                [this.vsSource, this.fsSource]
            );
            this.program = programs[0];
            //
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

        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            let box = boxes[i];

            mat4.rotate(box.rotationMatrix, box.rotationMatrix, 0.02, this.rotationAxis);
            mat4.multiply(box.modelMatrix, box.translationMatrix, box.rotationMatrix)
        }
        this.modelMatrices.data(this.modelMatrixData);
        //
        this.engine.clear();
        this.boxesDrawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.program.delete();
        this.boxesDrawCall.delete();
        this.sceneUniformBuffer.delete();
        this.modelMatrices.delete();
        const engine = this.engine;
        engine.noDepthTest().noCullBackfaces();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, this.NEAR, this.FAR);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        return this;
    }
}