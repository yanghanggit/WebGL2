
class RenderToCubemapScene extends WebGL2DemoScene {

    //
    private cubemapDrawCall: WebGL2DrawCall;
    private cubeDrawCall: WebGL2DrawCall;
    private skyboxDrawcall: WebGL2DrawCall;
    private angleX: number = 0;
    private angleY: number = 0;
    private cubemapBuffer: WebGL2Framebuffer;
    private cubemapFsSource: string;
    private skyboxVsSource: string;
    private skyboxFsSource: string;
    private program: WebGL2Program;
    private cubemapProgram: WebGL2Program;
    private skyboxProgram: WebGL2Program;
    private webglImage: HTMLImageElement;
    private readonly cubemapImages: HTMLImageElement[] = [];
    private skyboxViewMatrix: Float32Array;
    private skyboxViewProjMatrix: Float32Array;
    private sceneUniformBuffer: WebGL2UniformBuffer;
    private skyboxSceneUniforms: WebGL2UniformBuffer;
    private vsSource: string;
    private fsSource: string;
    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private projMatrix: Float32Array;
    private modelMatrix: Float32Array;
    private rotateXMatrix: Float32Array;
    private rotateYMatrix: Float32Array;

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

        const utils = this.engine;
        const PicoGL = GL;
        const CUBEMAP_DIM = 2048;

        let app = this.engine/*PicoGL.createApp(canvas)*/
            .clearColor(1.0, 1.0, 1.0, 1.0)
            .depthTest();

        let timer = app.createTimer();

        // FRAMEBUFFER
        let colorTarget = app.createCubemap({
            width: CUBEMAP_DIM,
            height: CUBEMAP_DIM
        });
        let depthTarget = app.createRenderbuffer(CUBEMAP_DIM, CUBEMAP_DIM, PicoGL.DEPTH_COMPONENT16);

        this.cubemapBuffer = app.createFramebuffer()
            .colorTarget(0, colorTarget, PicoGL.TEXTURE_CUBE_MAP_NEGATIVE_X)
            .colorTarget(1, colorTarget, PicoGL.TEXTURE_CUBE_MAP_POSITIVE_X)
            .colorTarget(2, colorTarget, PicoGL.TEXTURE_CUBE_MAP_NEGATIVE_Y)
            .colorTarget(3, colorTarget, PicoGL.TEXTURE_CUBE_MAP_POSITIVE_Y)
            .colorTarget(4, colorTarget, PicoGL.TEXTURE_CUBE_MAP_NEGATIVE_Z)
            .colorTarget(5, colorTarget, PicoGL.TEXTURE_CUBE_MAP_POSITIVE_Z)
            .depthTarget(depthTarget);

        // GEOMETRY
        let box = utils.createBox({ dimensions: [1.0, 1.0, 1.0] })
        let positions = app.createVertexBuffer(PicoGL.FLOAT, 3, box.positions);
        let uv = app.createVertexBuffer(PicoGL.FLOAT, 2, box.uvs);
        let normals = app.createVertexBuffer(PicoGL.FLOAT, 3, box.normals);

        let boxArray = app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals);

        // UNIFORMS
        let cubemapProjMatrix = mat4.create();
        mat4.perspective(cubemapProjMatrix, Math.PI / 2, 1, 0.1, 10.0);

        let cubemapViewMatrix = mat4.create();
        let cubemapEyePosition = vec3.fromValues(1.2, 0, 1.2);
        mat4.lookAt(cubemapViewMatrix, cubemapEyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        let cubemapViewProjMatrix = mat4.create();
        mat4.multiply(cubemapViewProjMatrix, cubemapProjMatrix, cubemapViewMatrix);

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, app.canvas.width / app.canvas.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(1.3, -1.3, 1.3);
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

        // UNIFORM BUFFER
        let cubemapSceneUniformBuffer = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4
        ])
            .set(0, cubemapViewProjMatrix)
            .set(1, cubemapEyePosition)
            .update();

        this.sceneUniformBuffer = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4
        ])
            .set(0, this.viewProjMatrix)
            .set(1, eyePosition)
            .update();

        this.skyboxSceneUniforms = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4
        ])
            .set(0, this.skyboxViewProjMatrix)
            .set(1, eyePosition)
            .update();

        this.modelMatrix = mat4.create();
        this.rotateXMatrix = mat4.create();
        this.rotateYMatrix = mat4.create();



        let texture = app.createTexture2DByImage(this.webglImage, {
            flipY: true,
            maxAnisotropy: app.capbility('MAX_TEXTURE_ANISOTROPY')/*PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY*/
        });

        let skyCubemap = app.createCubemap({
            negX: this.cubemapImages[0],
            posX: this.cubemapImages[1],
            negY: this.cubemapImages[2],
            posY: this.cubemapImages[3],
            negZ: this.cubemapImages[4],
            posZ: this.cubemapImages[5],
            maxAnisotropy: app.capbility('MAX_TEXTURE_ANISOTROPY')/*PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY*/
        });

        this.cubemapDrawCall = app.createDrawCall(this.cubemapProgram, boxArray)
            .texture("tex", texture)
            .uniformBlock("SceneUniforms", cubemapSceneUniformBuffer);

        this.cubeDrawCall = app.createDrawCall(this.program, boxArray)
            .texture("renderCubemap", colorTarget)
            .texture("skyCubemap", skyCubemap)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer);

        this.skyboxDrawcall = app.createDrawCall(this.skyboxProgram, boxArray)
            .texture("renderCubemap", colorTarget)
            .texture("skyCubemap", skyCubemap)
            .uniformBlock("SceneUniforms", this.skyboxSceneUniforms)

        this.angleX = 0;
        this.angleY = 0;
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-rtt-cubemap/cube.vs.glsl',
                'resource/assets/shader-rtt-cubemap/cube.fs.glsl',
                'resource/assets/shader-rtt-cubemap/cubemap.fs.glsl',
                'resource/assets/shader-rtt-cubemap/skybox.vs.glsl',
                'resource/assets/shader-rtt-cubemap/skybox.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.vsSource = txts[0];
            this.fsSource = txts[1];
            this.cubemapFsSource = txts[2];
            this.skyboxVsSource = txts[3];
            this.skyboxFsSource = txts[4];
            //
            const programs = await this.engine.createPrograms(
                // [this.vsSource, this.fsSource],
                [this.vsSource, this.fsSource],
                [this.vsSource, this.cubemapFsSource],
                [this.skyboxVsSource, this.skyboxFsSource]
            );
            //
            this.program = programs[0];
            this.cubemapProgram = programs[1];
            this.skyboxProgram = programs[2];
            //
            const texarrays: string[] = [
                //'resource/assets/webgl-logo.png',
                'resource/assets/bg.jpg',
                'resource/assets/sky-negx.png',
                'resource/assets/sky-posx.png',
                'resource/assets/sky-negy.png',
                'resource/assets/sky-posy.png',
                'resource/assets/sky-negz.png',
                'resource/assets/sky-posz.png'
            ];
            const loadImages = await this.engine.loadImages(texarrays);
            this.webglImage = loadImages[0];
            for (let i = 0; i < 6; ++i) {
                this.cubemapImages[i] = loadImages[1 + i];
            }
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
        this.angleX += 0.01;
        this.angleY += 0.02;

        mat4.fromXRotation(this.rotateXMatrix, this.angleX);
        mat4.fromYRotation(this.rotateYMatrix, this.angleY);
        mat4.multiply(this.modelMatrix, this.rotateXMatrix, this.rotateYMatrix);

        this.cubemapDrawCall.uniform("uModel", this.modelMatrix);
        this.cubeDrawCall.uniform("uModel", this.modelMatrix);

        const CUBEMAP_DIM = 2048;
        // DRAW SAME IMAGE TO ALL SIX FACES OF CUBEMAP
        app
            .drawFramebuffer(this.cubemapBuffer)
            .viewport(0, 0, CUBEMAP_DIM, CUBEMAP_DIM)
            .clear();
        this.cubemapDrawCall.draw();

        // RENDER TO SCREEN
        // Multi draw seems to require a clear here?
        app.defaultDrawFramebuffer().defaultViewport().clear();
        this.skyboxDrawcall.draw();
        this.cubeDrawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.cubemapDrawCall.delete();
        this.cubeDrawCall.delete();
        this.skyboxDrawcall.delete();
        this.cubemapBuffer.delete();
        this.program.delete();
        this.cubemapProgram.delete();
        this.skyboxProgram.delete();
        this.sceneUniformBuffer.delete();
        this.skyboxSceneUniforms.delete();
        const engine = this.engine;
        engine.noDepthTest();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        mat4.multiply(this.skyboxViewProjMatrix, this.projMatrix, this.skyboxViewMatrix);
        this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        this.skyboxSceneUniforms.set(0, this.skyboxViewProjMatrix).update();
        return this;
    }
}