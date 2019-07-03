
class ShadowScene extends WebGL2DemoScene {

    private vsSource: string;
    private fsSource: string;
    private shadowVsSource: string;
    private shadowFsSource: string;
    private image: HTMLImageElement;
    private mainProgram: WebGL2Program;
    private shadowProgram: WebGL2Program;
    private shadowBuffer: WebGL2Framebuffer;
    private boxes: any[] = [];
    private viewProjMatrix: Float32Array;
    private projMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private lightViewProjMatrix: Float32Array;

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

        // utils.addTimerElement();

        // let canvas = document.getElementById("gl-canvas");
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;

        // let app = PicoGL.createApp(canvas)
        engine.clearColor(0.0, 0.0, 0.0, 1.0)
            .depthTest()
            .cullBackfaces();

        // let timer = app.createTimer();

        // SET UP SHADOW PROGRAM
        // let shadowVsSource =  document.getElementById("shadow-vs").text.trim();
        // let shadowFsSource =  document.getElementById("shadow-fs").text.trim();

        let shadowDepthTarget = engine.createTexture2DBySize(engine.width, engine.height, {
            internalFormat: GL.DEPTH_COMPONENT16,
            compareMode: GL.COMPARE_REF_TO_TEXTURE
        });
        this.shadowBuffer = engine.createFramebuffer().depthTarget(shadowDepthTarget);

        // SET UP MAIN PROGRAM
        // let vsSource =  document.getElementById("main-vs").text.trim();
        // let fsSource =  document.getElementById("main-fs").text.trim();

        // GEOMETRY
        let box = engine.createBox({ dimensions: [1.0, 1.0, 1.0] })
        let positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        let normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);
        let uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);

        let boxArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, normals)
            .vertexAttributeBuffer(2, uv);

        // UNIFORMS
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 2.0);

        this.viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        let lightPosition = vec3.fromValues(1, 1, 0.5);
        let lightViewMatrix = mat4.create();
        this.lightViewProjMatrix = mat4.create();
        mat4.lookAt(lightViewMatrix, lightPosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
        mat4.multiply(this.lightViewProjMatrix, this.projMatrix, lightViewMatrix);

        // OBJECT DESCRIPTIONS
        this.boxes = [
            {
                translate: [0, 0, 0],
                rotate: [0, 0, 0],
                scale: [1, 1, 1],
                mvpMatrix: mat4.create(),
                modelMatrix: mat4.create(),
                lightMvpMatrix: mat4.create(),
                mainDrawCall: null,
                shadowDrawCall: null
            },
            {
                translate: [0.8, 0.8, 0.4],
                rotate: [0, 0, Math.PI / 6],
                scale: [0.1, 0.1, 0.1],
                mvpMatrix: mat4.create(),
                modelMatrix: mat4.create(),
                lightMvpMatrix: mat4.create(),
                mainDrawCall: null,
                shadowDrawCall: null
            }
        ];

        // window.onresize = function() {
        //     app.resize(window.innerWidth, window.innerHeight);
        //     shadowBuffer.resize();

        //     mat4.perspective(projMatrix, Math.PI / 2, app.width / app.height, 0.1, 10.0);
        //     mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);
        // };



        let texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')/*GL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY*/
        });

        // DRAW CALLS
        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].shadowDrawCall = engine.createDrawCall(this.shadowProgram, boxArray)
            boxes[i].mainDrawCall = engine.createDrawCall(this.mainProgram, boxArray)
                .uniform("uLightPosition", lightPosition)
                .uniform("uEyePosition", eyePosition)
                .texture("uTextureMap", texture)
                .texture("uShadowMap", this.shadowBuffer.depthAttachment);
        }
    }

    private async loadResource(): Promise<void> {
        try {

            // app.createPrograms([vsSource, fsSource], [shadowVsSource, shadowFsSource]),
            // utils.loadImages(["img/webgl-logo.png"])

            ////
            const ress: string[] = [
                'resource/assets/shader-shadow/shadow-main.vs.glsl',
                'resource/assets/shader-shadow/shadow-main.fs.glsl',
                'resource/assets/shader-shadow/shadow.vs.glsl',
                'resource/assets/shader-shadow/shadow.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.vsSource = txts[0];
            this.fsSource = txts[1];
            this.shadowVsSource = txts[2];
            this.shadowFsSource = txts[3];

            /////
            const programs = await this.engine.createPrograms(
                [this.vsSource, this.fsSource], [this.shadowVsSource, this.shadowFsSource]
            );
            this.mainProgram = programs[0];
            this.shadowProgram = programs[1];
            //
            const texarrays: string[] = [
                "resource/assets/webgl-logo.png",
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
        // UPDATE TRANSFORMS
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

        // DRAW TO SHADOW BUFFER
        engine.drawFramebuffer(this.shadowBuffer).clear();
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].shadowDrawCall.draw();
        }

        // DRAW TO SCREEN     
        engine.defaultDrawFramebuffer().clear()
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].mainDrawCall.draw();
        }

        return this;
    }

    public leave(): WebGL2DemoScene {
        this.mainProgram.delete();
        this.shadowProgram.delete();
        this.shadowBuffer.delete();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        const engine = this.engine;
        this.shadowBuffer.resize();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.width / engine.height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        return this;
    }
}