
// interface ShadowSceneBoxTransform {

//     translate: Float32Array;
//     rotate: Float32Array;
//     scale: Float32Array;
//     mvpMatrix: Float32Array;
//     modelMatrix: Float32Array;
//     lightMvpMatrix: Float32Array;
//     mainDrawCall: WebGL2DrawCall;
//     shadowDrawCall: WebGL2DrawCall;
// }

class SSAOScene extends WebGL2DemoScene {

    private colorGeoVsSource: string;
    private colorGeoFsSource: string;
    private quadShader: string;
    private ssaoFsSource: string;
    private aoBlendFsSource: string;
    private noSSAOFsSource: string;

    private colorGeoProgram: WebGL2Program;
    private ssaoProgram: WebGL2Program;
    private aoBlendProgram: WebGL2Program;
    private noSSAOProgram: WebGL2Program;


    // this.colorGeoProgram= programs[0];
    // this.ssaoProgram= programs[1];
    // this.aoBlendProgram= programs[2];
    // this.noSSAOProgram = programs[3];

    // private vsSource: string;
    // private fsSource: string;
    // private shadowVsSource: string;
    // private shadowFsSource: string;
     private image: HTMLImageElement;
    // private mainProgram: WebGL2Program;
    // private shadowProgram: WebGL2Program;
    // private shadowBuffer: WebGL2Framebuffer;
    // private boxes: ShadowSceneBoxTransform[] = [];
    // private viewProjMatrix: Float32Array;
    // private projMatrix: Float32Array;
    // private viewMatrix: Float32Array;
    // private lightViewProjMatrix: Float32Array;
    // private texture: WebGL2Texture;

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
        //
        const engine = this.engine;
        /*
        engine.clearColor(0.5, 0.5, 0.5, 1.0)
            .depthTest()
            .cullBackfaces();


        const shadowDepthTarget = engine.createTexture2DBySize(engine.width, engine.height, {
            internalFormat: GL.DEPTH_COMPONENT16,
            compareMode: GL.COMPARE_REF_TO_TEXTURE
        });
        this.shadowBuffer = engine.createFramebuffer().depthTarget(shadowDepthTarget);
        //
        const box = engine.createBox({ dimensions: [1.0, 1.0, 1.0] })
        const positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        const normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);

        const boxArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, normals)
            .vertexAttributeBuffer(2, uv);

        //
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 2.0);

        this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        const lightPosition = vec3.fromValues(1, 1, 0.5);
        const lightViewMatrix = mat4.create();
        this.lightViewProjMatrix = mat4.create();
        mat4.lookAt(lightViewMatrix, lightPosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
        mat4.multiply(this.lightViewProjMatrix, this.projMatrix, lightViewMatrix);

        //
        this.boxes = [
            {
                translate: new Float32Array([0, 0, 0]),
                rotate: new Float32Array([0, 0, 0]),
                scale: new Float32Array([1, 1, 1]),
                mvpMatrix: mat4.create(),
                modelMatrix: mat4.create(),
                lightMvpMatrix: mat4.create(),
                mainDrawCall: null,
                shadowDrawCall: null
            },
            {
                translate: new Float32Array([0.8, 0.8, 0.4]),
                rotate: new Float32Array([0, 0, Math.PI / 6]),
                scale: new Float32Array([0.1, 0.1, 0.1]),
                mvpMatrix: mat4.create(),
                modelMatrix: mat4.create(),
                lightMvpMatrix: mat4.create(),
                mainDrawCall: null,
                shadowDrawCall: null
            }
        ];

        //
        this.texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        //
        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].shadowDrawCall = engine.createDrawCall(this.shadowProgram, boxArray)

            boxes[i].mainDrawCall = engine.createDrawCall(this.mainProgram, boxArray)
                .uniform("uLightPosition", lightPosition)
                .uniform("uEyePosition", eyePosition)
                .texture("uTextureMap", this.texture)
                .texture("uShadowMap", this.shadowBuffer.depthAttachment);
        }
        */
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-ssao/colorgeo.vs.glsl',
                'resource/assets/shader-ssao/colorgeo.fs.glsl',
                'resource/assets/shader-ssao/quad.vs.glsl',
                'resource/assets/shader-ssao/ssao.fs.glsl',
                'resource/assets/shader-ssao/aoblend.fs.glsl',
                'resource/assets/shader-ssao/color.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.colorGeoVsSource = txts[0];
            this.colorGeoFsSource = txts[1];
            this.quadShader = txts[2];
            this.ssaoFsSource = txts[3];
            this.aoBlendFsSource = txts[4];
            this.noSSAOFsSource = txts[5];
            //
            const programs = await this.engine.createPrograms(
                [this.colorGeoVsSource, this.colorGeoFsSource],
                [this.quadShader, this.ssaoFsSource],
                [this.quadShader, this.aoBlendFsSource],
                [this.quadShader, this.noSSAOFsSource]
            );
            //
            this.colorGeoProgram = programs[0];
            this.ssaoProgram = programs[1];
            this.aoBlendProgram = programs[2];
            this.noSSAOProgram = programs[3];

            ////
            const texarrays: string[] = [
                //"resource/assets/webgl-logo.png",
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
        /*
        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].rotate[0] += 0.01;
            boxes[i].rotate[1] += 0.02;

            engine.xformMatrix(boxes[i].modelMatrix, boxes[i].translate, boxes[i].rotate, boxes[i].scale);
            mat4.multiply(boxes[i].mvpMatrix, this.viewProjMatrix, boxes[i].modelMatrix);
            mat4.multiply(boxes[i].lightMvpMatrix, this.lightViewProjMatrix, boxes[i].modelMatrix);

            boxes[i].mainDrawCall.uniform("uMVP", boxes[i].mvpMatrix)
                .uniform("uModelMatrix", boxes[i].modelMatrix)
                .uniform("uMVPFromLight", boxes[i].lightMvpMatrix);
            boxes[i].shadowDrawCall.uniform("uMVP", boxes[i].lightMvpMatrix);
        }
        engine.drawFramebuffer(this.shadowBuffer).clear();
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].shadowDrawCall.draw();
        }
        engine.defaultDrawFramebuffer().clear()
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].mainDrawCall.draw();
        }
        */
        return this;
    }

    public leave(): WebGL2DemoScene {
        // this.mainProgram.delete();
        // this.shadowProgram.delete();
        // this.shadowBuffer.delete();
        // this.texture.delete();
        // const engine = this.engine;
        // engine.noDepthTest().noCullBackfaces();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        // this.shadowBuffer.resize();
        // mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        // mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        return this;
    }
}