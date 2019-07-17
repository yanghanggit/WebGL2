
class RTTScene extends WebGL2DemoScene {
    ///
    private colorGeoProgram: WebGL2Program;
    private ssaoProgram: WebGL2Program;
    private aoBlendProgram: WebGL2Program;
    private noSSAOProgram: WebGL2Program;
    private colorGeoBuffer: WebGL2Framebuffer;
    private ssaoBuffer: WebGL2Framebuffer;
    private noiseTexture: WebGL2Texture;
    private sceneUniforms: WebGL2UniformBuffer;
    private modelMatrices: WebGL2VertexBuffer;
    private colorGeoDrawcall: WebGL2DrawCall;
    private ssaoDrawCall: WebGL2DrawCall;
    private aoBlendDrawCall: WebGL2DrawCall;
    private noSSAODrawCall: WebGL2DrawCall;
    private ssaoEnableDiv: HTMLDivElement;
    ////
    private colorGeoVsSource: string;
    private colorGeoFsSource: string;
    private quadShader: string;
    private ssaoFsSource: string;
    private aoBlendFsSource: string;
    private noSSAOFsSource: string;

    private projMatrix: Float32Array;
    private spheres: any[] = [];
    private rotationMatrix: Float32Array;
    private modelMatrixData: Float32Array;
    private ssaoEnabled: boolean = true;





    //////
    private vsSource: string;
    private fsSource: string;
    private program: WebGL2Program;
    private image: HTMLImageElement;
    private rttBuffer: WebGL2Framebuffer;
    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private sceneUniformBuffer: WebGL2UniformBuffer;
    private drawCall: WebGL2DrawCall;
    private angleX: number = 0;
    private angleY: number = 0;
    private texture: WebGL2Texture;

    private modelMatrix: Float32Array;
    private rotateXMatrix : Float32Array;
    private rotateYMatrix : Float32Array;


    
    
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

        //utils.addTimerElement();

        // let canvas = document.getElementById("gl-canvas");
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;
        const PicoGL = GL;
        const utils = this.engine;
        let app = this.engine;//PicoGL.createApp(canvas)
        app.depthTest();

        //let timer = app.createTimer();

        // PROGRAM
        //let vsSource =  document.getElementById("vertex-draw").text.trim();
        //let fsSource =  document.getElementById("fragment-draw").text.trim();

        // FRAMEBUFFER
        let colorTarget = app.createTexture2DBySize(app.width, app.height, {});
        let depthTarget = app.createRenderbuffer(app.width, app.height, PicoGL.DEPTH_COMPONENT16);

        this.rttBuffer = app.createFramebuffer().colorTarget(0, colorTarget).depthTarget(depthTarget);

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
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, app.canvas.width / app.canvas.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        let lightPosition = vec3.fromValues(1, 1, 0.5);

        // UNIFORM BUFFER
        this.sceneUniformBuffer = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4
        ])
            .set(0, this.viewProjMatrix)
            .set(1, eyePosition)
            .set(2, lightPosition)
            .update();

        this. modelMatrix = mat4.create();
        this. rotateXMatrix = mat4.create();
        this. rotateYMatrix = mat4.create();


        this.texture = app.createTexture2DByImage(this.image, { 
            flipY: true,
            maxAnisotropy: app.capbility('MAX_TEXTURE_ANISOTROPY')
        });
        this.drawCall = app.createDrawCall(this.program, boxArray)
        .uniformBlock("SceneUniforms", this.sceneUniformBuffer);
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-rtt/rtt.vs.glsl',
                'resource/assets/shader-rtt/rtt.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.vsSource = txts[0];
            this.fsSource = txts[1];
            // this.colorGeoFsSource = txts[1];
            // this.quadShader = txts[2];
            // this.ssaoFsSource = txts[3];
            // this.aoBlendFsSource = txts[4];
            // this.noSSAOFsSource = txts[5];
            //
            const programs = await this.engine.createPrograms(
                [this.vsSource, this.fsSource],
                // [this.quadShader, this.ssaoFsSource],
                // [this.quadShader, this.aoBlendFsSource],
                // [this.quadShader, this.noSSAOFsSource]
            );
            //
            this.program = programs[0];
            // this.ssaoProgram = programs[1];
            // this.aoBlendProgram = programs[2];
            // this.noSSAOProgram = programs[3];

            ////
            const texarrays: string[] = [
                //'resource/assets/webgl-logo.png',
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
        this.angleX += 0.01;
        this.angleY += 0.02;

        mat4.fromXRotation(this.rotateXMatrix, this.angleX);
        mat4.fromYRotation(this.rotateYMatrix, this.angleY);
        mat4.multiply(this.modelMatrix, this.rotateXMatrix, this.rotateYMatrix);

        this.drawCall.uniform("uModel", this.modelMatrix);

        // RENDER TO OFFSCREEN TEXTURE
        app.drawFramebuffer(this.rttBuffer).clearColor(0.4, 0.4, 0.4, 1.0).clear();
        this.drawCall.texture("tex", this.texture).draw();
        
        // RENDER TO SCREEN
        app.defaultDrawFramebuffer().clearColor(0.0, 0.0, 0.0, 1.0).clear();
        this.drawCall.texture("tex", this.rttBuffer.colorAttachments[0]).draw();


        /*
        const engine = this.engine;
        const spheres = this.spheres;
        for (let i = 0, len = spheres.length; i < len; ++i) {
            spheres[i].rotate[1] += 0.002;

            engine.xformMatrix(spheres[i].modelMatrix, spheres[i].translate, null, spheres[i].scale);
            mat4.fromYRotation(this.rotationMatrix, spheres[i].rotate[1]);
            mat4.multiply(spheres[i].modelMatrix, this.rotationMatrix, spheres[i].modelMatrix)

            this.modelMatrixData.set(spheres[i].modelMatrix, i * 16);
        }
        this.modelMatrices.data(this.modelMatrixData);
        ///
        engine.drawFramebuffer(this.colorGeoBuffer).clear();
        this.colorGeoDrawcall.draw();
        //const ssaoEnabled = true;
        if (this.ssaoEnabled) {
            engine.drawFramebuffer(this.ssaoBuffer).clear()
            this.ssaoDrawCall.draw();
            engine.defaultDrawFramebuffer().clear()
            this.aoBlendDrawCall.draw();
        } else {
            engine.defaultDrawFramebuffer().clear();
            this.noSSAODrawCall.draw();
        }
        */
        return this;
    }

    public leave(): WebGL2DemoScene {
        /*
        //删除对象
        this.colorGeoProgram.delete();
        this.ssaoProgram.delete();
        this.aoBlendProgram.delete();
        this.noSSAOProgram.delete();
        this.colorGeoBuffer.delete();
        this.ssaoBuffer.delete();
        this.noiseTexture.delete();
        this.sceneUniforms.delete();
        this.modelMatrices.delete();
        this.colorGeoDrawcall.delete();
        this.ssaoDrawCall.delete();
        this.aoBlendDrawCall.delete();
        this.noSSAODrawCall.delete();
        //还原状态
        const app = this.engine;
        app.noDepthTest().depthFunc(GL.LESS);
        //删除对象
        */
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {

        //const app = this.engine;
        this.rttBuffer.resize();
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();

        /*
        this.colorGeoBuffer.resize();
        this.ssaoBuffer.resize();

        const numNoisePixels = app.gl.drawingBufferWidth * app.gl.drawingBufferHeight;
        const noiseTextureData = new Float32Array(numNoisePixels * 2);

        for (let i = 0; i < numNoisePixels; ++i) {
            const index = i * 2;
            noiseTextureData[index] = Math.random() * 2.0 - 1.0;
            noiseTextureData[index + 1] = Math.random() * 2.0 - 1.0;
        }

        this.noiseTexture.resize(app.gl.drawingBufferWidth, app.gl.drawingBufferHeight)
            .data(noiseTextureData);

        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        this.sceneUniforms.set(1, this.projMatrix).update();
        */
        return this;
    }
}