/**
 * 一个简单盒子的场景
 */
class SphereScene extends WebGL2DemoScene {
    /**
     * camera
     */
    private camera: Camera;
    /**
     * cube 辅助数据, 控制盒子的
     */
    private readonly modelMatrix: Float32Array = mat4.create();
    private readonly scale = vec3.fromValues(1, 1, 1);
    private readonly translate = vec3.fromValues(0, 0, 0);
    /**
     * move
     */
    private readonly path: Array<Float32Array> = [];
    private nextPathIndex: number = 0;
    private readonly speed: Float32Array = vec3.fromValues(0.01, 0.01, 0.01);
    private readonly direction: Float32Array = vec3.create();
    /**
     * 资源
     */
    private image: HTMLImageElement;
    private sceneUniformBuffer: WebGL2UniformBuffer;
    private program: WebGL2Program;
    private drawCall: WebGL2DrawCall;
    /**
     * 
     */
    public enter(): WebGL2DemoScene {
        this.application.profile.setTitle(egret.getQualifiedClassName(this));
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
        engine.clearColor(0.5, 0.5, 0.5, 1.0).depthTest();

        //摄像机
        this.camera = new Camera(Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 10.0)
            .eye(1, 1, 3)
            .lookAt(0, 0, 0)
            .update();

        //灯光
        this.sceneUniformBuffer = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ])
            .set(0, this.camera.viewProjMatrix)
            .set(1, this.camera.eyePosition)
            .set(2, vec3.fromValues(1, 1, 0.5)) //灯光位置
            .update();

        //drawcall： texture + vao
        const texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });
        const vao = engine.createSphereVAO({ radius: 0.5 });
        Utils.xformMatrix(this.modelMatrix, this.translate, null, this.scale);
        //
        this.drawCall = engine.createDrawCall(this.program, vao)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .texture("tex", texture)
            .uniform('powv', 100.0)
            .uniform('ambient', 0.1)
            .uniform("uModel", this.modelMatrix);
    }
    /**
     * 
     */
    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-sphere/sphere.vs.glsl',
                'resource/assets/shader-sphere/sphere.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            const vsSource = txts[0];
            const fsSource = txts[1];
            //
            const programs = await this.engine.createPrograms(
                [vsSource, fsSource],
            );
            //
            this.program = programs[0];
            //
            const texarrays: string[] = [
                'resource/assets/brick.png',
            ];
            const loadImages = await this.engine.loadImages(texarrays);
            this.image = loadImages[0];
        }
        catch (e) {
            console.error(e);
        }
    }
    /**
     * 
     */
    private moveSphere(): void {
        const path = this.path;
        if (path.length === 0) {
            path[0] = new Float32Array([0.5, 0, 0]);
            path[1] = new Float32Array([-0.5, 0, 0]);
            path[2] = new Float32Array([0, 0, 0.5]);
            path[3] = new Float32Array([0, 0, -0.5]);
        }
        //
        const targetPos = path[this.nextPathIndex];
        const distance = vec3.distance(targetPos, this.translate);
        if (distance < 0.1) {
            ++this.nextPathIndex;
            if (this.nextPathIndex >= path.length) {
                this.nextPathIndex = 0;
            }
        }
        //
        vec3.subtract(this.direction, targetPos, this.translate);
        vec3.normalize(this.direction, this.direction);
        vec3.multiply(this.direction, this.direction, this.speed);
        vec3.add(this.translate, this.translate, this.direction);
        Utils.xformMatrix(this.modelMatrix, this.translate, null, this.scale);
    }
    /**
     * 
     */
    public onUpdate(): WebGL2DemoScene {
        //逻辑
        this.camera.update();
        this.moveSphere();
        //渲染
        this.drawCall.uniform("uModel", this.modelMatrix);
        this.engine.clear();
        this.drawCall.draw();
        return this;
    }
    /**
     * 
     */
    public leave(): WebGL2DemoScene {
        this.drawCall.delete();
        this.sceneUniformBuffer.delete();
        this.program.delete();
        this.engine.noDepthTest();
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