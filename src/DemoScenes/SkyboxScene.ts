/**
 * 
 */
class SkyboxScene extends WebGL2DemoScene {
    /**
     * 
     */
    private skyboxDrawcall: WebGL2DrawCall;
    /**
     * 
     */
    private skyboxProgram: WebGL2Program;
    /**
     * 
     */
    private readonly cubemapImages: HTMLImageElement[] = [];
    /**
     * 
     */
    private skyboxViewMatrix: Float32Array;
    /**
     * 
     */
    private skyboxViewProjMatrix: Float32Array;
    /**
     * 
     */
    private skyboxSceneUniforms: WebGL2UniformBuffer;
    /**
     * 
     */
    private viewMatrix: Float32Array;
    /**
     * 
     */
    private viewProjMatrix: Float32Array;
    /**
     * 
     */
    private projMatrix: Float32Array;
    /**
     * 
     */
    private _actionSet: ActionSet = null;

    /**
     * 
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
        this._ready = true;
    }
    /**
     * 
     */
    private createScene(): void {

        const engine = this.engine;
        engine.clearColor(1.0, 1.0, 1.0, 1.0).depthTest();

        const box = Utils.createCube({ dimensions: [1.0, 1.0, 1.0] })
        const positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);
        const normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);
        const boxArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals);

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(1.2, -1.3, 1.3);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        this.skyboxViewMatrix = mat4.create();
        this.skyboxViewMatrix.set(this.viewMatrix);
        this.skyboxViewMatrix[12] = 0;
        this.skyboxViewMatrix[13] = 0;
        this.skyboxViewMatrix[14] = 0;

        this.skyboxViewProjMatrix = mat4.create();
        mat4.multiply(this.skyboxViewProjMatrix, this.projMatrix, this.skyboxViewMatrix);
        
        //
        this.skyboxSceneUniforms = engine.createUniformBuffer([GL.FLOAT_MAT4])
        .set(0, this.skyboxViewProjMatrix).update();

        //
        const skyCubemap = engine.createCubemap({
            negX: this.cubemapImages[0],
            posX: this.cubemapImages[1],
            negY: this.cubemapImages[2],
            posY: this.cubemapImages[3],
            negZ: this.cubemapImages[4],
            posZ: this.cubemapImages[5],
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        //
        this.skyboxDrawcall = engine.createDrawCall(this.skyboxProgram, boxArray)
            .texture("skyCubemap", skyCubemap)
            .uniformBlock("SceneUniforms", this.skyboxSceneUniforms);


        //设置操作
        this._actionSet = new ActionSet();
        this.application.webTouchHandler.setActionSet(this._actionSet);
    }
    /**
     * 
     */
    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-skybox/skybox.vs.glsl',
                'resource/assets/shader-skybox/skybox.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            const skyboxVsSource = txts[0];
            const skyboxFsSource = txts[1];
            //
            const programs = await this.engine.createPrograms(
                [skyboxVsSource, skyboxFsSource]
            );
            //
            this.skyboxProgram = programs[0];
            //
            const texarrays: string[] = [
                'resource/assets/sky-negx.png',
                'resource/assets/sky-posx.png',
                'resource/assets/sky-negy.png',
                'resource/assets/sky-posy.png',
                'resource/assets/sky-negz.png',
                'resource/assets/sky-posz.png'
            ];
            const loadImages = await this.engine.loadImages(texarrays);
            for (let i = 0; i < 6; ++i) {
                this.cubemapImages[i] = loadImages[i];
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    /**
     * 
     */
    public update(): WebGL2DemoScene {
        if (!this._ready) {
            return;
        }
        this.engine.defaultDrawFramebuffer().defaultViewport().clear();
        this.skyboxDrawcall.draw();
        return this;
    }
    /**
     * 
     */
    public leave(): WebGL2DemoScene {
        this.skyboxDrawcall.delete();
        this.skyboxProgram.delete();
        this.skyboxSceneUniforms.delete();
        this.engine.noDepthTest();


        //
        this.application.webTouchHandler.clearActionSet();
        this._actionSet = null;
        return this;
    }
    /**
     * 
     * @param width 
     * @param height 
     */
    public resize(width: number, height: number): WebGL2DemoScene {
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        mat4.multiply(this.skyboxViewProjMatrix, this.projMatrix, this.skyboxViewMatrix);
        this.skyboxSceneUniforms.set(0, this.skyboxViewProjMatrix).update();
        return this;
    }
}