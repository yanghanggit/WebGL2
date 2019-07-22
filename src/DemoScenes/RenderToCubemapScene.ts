
class RenderToCubemapScene extends WebGL2DemoScene {

    //
    private vsSource: string;
    private fsSource: string;
    //private program: WebGL2Program;
   
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
    private cubemapFsSource: string;
    private skyboxVsSource: string;
    private skyboxFsSource: string;
    private program: WebGL2Program;
    private cubemapProgram: WebGL2Program;
    private skyboxProgram: WebGL2Program;
    private webglImage: HTMLImageElement;
    private readonly cubemapImages: HTMLImageElement[] = [];
    

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

        // utils.addTimerElement();
        // utils.timerDiv.style.color = "black";
        
        // let canvas = document.getElementById("gl-canvas");
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;

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

        let cubemapBuffer = app.createFramebuffer()
        .colorTarget(0, colorTarget, PicoGL.TEXTURE_CUBE_MAP_NEGATIVE_X)
        .colorTarget(1, colorTarget, PicoGL.TEXTURE_CUBE_MAP_POSITIVE_X)
        .colorTarget(2, colorTarget, PicoGL.TEXTURE_CUBE_MAP_NEGATIVE_Y)
        .colorTarget(3, colorTarget, PicoGL.TEXTURE_CUBE_MAP_POSITIVE_Y)
        .colorTarget(4, colorTarget, PicoGL.TEXTURE_CUBE_MAP_NEGATIVE_Z)
        .colorTarget(5, colorTarget, PicoGL.TEXTURE_CUBE_MAP_POSITIVE_Z)
        .depthTarget(depthTarget);

        // GEOMETRY
        let box = utils.createBox({dimensions: [1.0, 1.0, 1.0]})
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

        let projMatrix = mat4.create();
        mat4.perspective(projMatrix, Math.PI / 2, app.canvas.width / app.canvas.height, 0.1, 10.0);

        let viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(1.3, -1.3, 1.3);
        mat4.lookAt(viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        let viewProjMatrix = mat4.create();
        mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);

        let skyboxViewMatrix = mat4.create();
        skyboxViewMatrix.set(viewMatrix);
        skyboxViewMatrix[12] = 0;
        skyboxViewMatrix[13] = 0;
        skyboxViewMatrix[14] = 0;

        let skyboxViewProjMatrix = mat4.create();
        mat4.multiply(skyboxViewProjMatrix, projMatrix, skyboxViewMatrix);

        // UNIFORM BUFFER
        let cubemapSceneUniformBuffer = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4
        ])
        .set(0, cubemapViewProjMatrix)
        .set(1, cubemapEyePosition)
        .update();

        let sceneUniformBuffer = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4
        ])
        .set(0, viewProjMatrix)
        .set(1, eyePosition)
        .update();

        let skyboxSceneUniforms = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4
        ])
        .set(0, skyboxViewProjMatrix)
        .set(1, eyePosition)
        .update();

        let modelMatrix = mat4.create();
        let rotateXMatrix = mat4.create();
        let rotateYMatrix = mat4.create();


        //
        /*
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
                [this.vsSource, this.fsSource],
            );
            //
            this.program = programs[0];
            this.cubemapProgram = programs[1];
            this.skyboxProgram = programs[2];
            //
            const texarrays: string[] = [
                'resource/assets/webgl-logo.png',
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
        // this.msaaFramebuffer.resize();
        // this.textureFramebuffer.resize();
        // mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        // mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        // this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        return this;
    }
}