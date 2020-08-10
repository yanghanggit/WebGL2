
/**
 * CubeIntancedScene
 */
class CubeIntancedScene extends WebGL2DemoScene {
    /**
    * camera
    */
    private camera: Camera;
    /**
     * 做逻辑的
     */
    private eyeRadius: number = 30;
    private eyeRotation: number = 0;
    /**
     * 灯管位置
     */
    private lightPosition: Float32Array;
    /**
     * 盒子模型
     */
    private boxes: any[] = [];
    private rotationAxis: Float32Array;
    private modelMatrixData: Float32Array;
    /**
     * 资源
     */
    private image: HTMLImageElement;
    private program: WebGL2Program;
    private boxesDrawCall: WebGL2DrawCall;
    private sceneUniformBuffer: WebGL2UniformBuffer;
    private modelMatrices: WebGL2VertexBuffer;
    /**
     * 
     */
    public enter(): WebGL2DemoScene {
        this.application.profile.setTitle(Utils.getClassName(this));
        this.start().catch(e => {
            console.error(e);
        });
        return this;
    }
    /**
     * 
     */
    private async start(): Promise<void> {
        await this.loadResource();
        this.createScene();
        this.ready();
    }
    /**
     * 
     */
    private createScene(): void {
        //
        const engine = this.engine;
        engine.clearColor(0.5, 0.5, 0.5, 1.0)
            .depthTest()
            .depthFunc(GL.LEQUAL)
            .cullBackfaces();

        //
        const BOX_GRID_DIM = 40;
        const NUM_BOXES = BOX_GRID_DIM * BOX_GRID_DIM * BOX_GRID_DIM;
        this.modelMatrixData = new Float32Array(NUM_BOXES * 16);
        this.modelMatrices = engine.createMatrixBuffer(GL.FLOAT_MAT4, this.modelMatrixData);
        const boxVAO = engine.createCubeVAO({ dimensions: [0.5, 0.5, 0.5] })
            .instanceAttributeBuffer(3, this.modelMatrices);

        //摄像机
        this.camera = new Camera(Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 100.0)
            .eye(0, 22, 0)
            .lookAt(0, 0, 0)
            .update();

        //灯光
        this.lightPosition = vec3.create();
        this.sceneUniformBuffer = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ]);
        //
        const texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });
        //
        this.boxes = new Array(NUM_BOXES);
        this.boxesDrawCall = engine.createDrawCall(this.program, boxVAO)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .texture("uTexture", texture);
        //
        this.rotationAxis = vec3.fromValues(1, 1, 1);
        vec3.normalize(this.rotationAxis, this.rotationAxis);
        //
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
        //
        this.updateCamera(0);
    }
    /**
     * 
     */
    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-64cubes/64cubes.vs.glsl',
                'resource/assets/shader-64cubes/64cubes.fs.glsl'
            ];
            const txts = await this.engine.loadText(ress);
            const vsSource = txts[0];
            const fsSource = txts[1];
            //
            const programs = await this.engine.createPrograms(
                [vsSource, fsSource]
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
    /**
     * 更新摄像机的位置，绕着跑
     * @param rot 
     */
    private updateCamera(rot: number): WebGL2DemoScene {
        this.eyeRotation += rot;
        const camera = this.camera;
        const newX = Math.sin(this.eyeRotation) * this.eyeRadius;
        const oldY = camera.eyePosition[1];
        const newZ = Math.cos(this.eyeRotation) * this.eyeRadius;
        camera.eye(newX, oldY, newZ).update();
        return this;
    }
    /**
     * 
     */
    public onUpdate(): WebGL2DemoScene {
        //
        this.updateCamera(0.002);
        //
        const camera = this.camera;
        this.lightPosition.set(camera.eyePosition);
        this.lightPosition[0] += 5;
        this.sceneUniformBuffer
            .set(0, camera.viewProjMatrix)
            .set(1, camera.eyePosition)
            .set(2, this.lightPosition)
            .update();
        //
        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            const box = boxes[i];
            mat4.rotate(box.rotationMatrix, box.rotationMatrix, 0.02, this.rotationAxis);
            mat4.multiply(box.modelMatrix, box.translationMatrix, box.rotationMatrix)
        }
        this.modelMatrices.data(this.modelMatrixData);
        //
        this.engine.clear();
        this.boxesDrawCall.draw();
        return this;
    }
    /**
     * 
     */
    public leave(): WebGL2DemoScene {
        this.program.delete();
        this.boxesDrawCall.delete();
        this.sceneUniformBuffer.delete();
        this.modelMatrices.delete();
        this.engine.noDepthTest().noCullBackfaces();
        return this;
    }
    /**
     * 
     */
    public resize(width: number, height: number): WebGL2DemoScene {
        super.resize(width, height);
        this.camera.aspect = width / height;
        return this;
    }
    /**
     * 
     */
    protected onResize(): WebGL2DemoScene {
        this.sceneUniformBuffer.set(0, this.camera.viewProjMatrix).update();
        return this;
    }
}