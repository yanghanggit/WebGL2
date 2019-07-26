
class PickingScene extends WebGL2DemoScene {
    ///
    private vsSource: string;
    private fsSource: string;

    private pickingVsSource: string;
    private pickingFsSource: string;
    private image: HTMLImageElement;

    private projMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private boxes: any;

    private highlightColor: Float32Array;
    private unhighlightColor: Float32Array;



    private mouseX: number = 0;
    private mouseY: number = 0;
    private picked: boolean = false;
    private pickedColor: Uint8Array = new Uint8Array(4);

    // private program: WebGL2Program;
    // private drawCall: WebGL2DrawCall;


    private pickingProgram: WebGL2Program;
    private mainProgram: WebGL2Program;
    private pickingBuffer: WebGL2Framebuffer;




    ///
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

        //utils.addTimerElement();

        // let canvas = document.getElementById("gl-canvas");
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;

        //let app = PicoGL.createApp(canvas)
        engine.clearColor(0.0, 0.0, 0.0, 1.0)
            .depthTest()
            .cullBackfaces();

        // let timer = app.createTimer();

        // // SET UP PICKING PROGRAM
        // let pickingVsSource = document.getElementById("picking-vs").text.trim();
        // let pickingFsSource = document.getElementById("picking-fs").text.trim();

        let pickColorTarget = engine.createTexture2DBySize(engine.width, engine.height, {});
        let pickDepthTarget = engine.createRenderbuffer(engine.width, engine.height, GL.DEPTH_COMPONENT16);

        let pickingBuffer = engine.createFramebuffer().colorTarget(0, pickColorTarget).depthTarget(pickDepthTarget);

        // SET UP MAIN PROGRAM
        // let vsSource = document.getElementById("main-vs").text.trim();
        // let fsSource = document.getElementById("main-fs").text.trim();

        // GEOMETRY
        let box = engine.createBox({ dimensions: [1.0, 1.0, 1.0] })
        let positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        let uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);
        let normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);

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

        this.highlightColor = vec3.fromValues(1.5, 1.5, 0.5);
        this.unhighlightColor = vec3.fromValues(1.0, 1.0, 1.0);

        // UNIFORM BUFFER
        let sceneUniforms = engine.createUniformBuffer([
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ]).set(0, lightPosition)
            .set(1, eyePosition)
            .update();

        // OBJECT DESCRIPTIONS
        this.boxes = [
            {
                translate: [0, 0, 0],
                rotate: [0, 0, 0],
                scale: [1, 1, 1],
                mvpMatrix: mat4.create(),
                modelMatrix: mat4.create(),
                pickColor: vec3.fromValues(1.0, 0.0, 0.0),
                frameUniforms: engine.createUniformBuffer([
                    GL.FLOAT_MAT4,
                    GL.FLOAT_MAT4,
                    GL.FLOAT_VEC4
                ]).set(2, this.unhighlightColor),
                mainDrawCall: null,
                pickingDrawCall: null
            },
            {
                translate: [0.8, 0.8, 0.4],
                rotate: [0, 0, Math.PI / 6],
                scale: [0.1, 0.1, 0.1],
                mvpMatrix: mat4.create(),
                modelMatrix: mat4.create(),
                pickColor: vec3.fromValues(0.0, 1.0, 0.0),
                frameUniforms: engine.createUniformBuffer([
                    GL.FLOAT_MAT4,
                    GL.FLOAT_MAT4,
                    GL.FLOAT_VEC4
                ]).set(2, this.unhighlightColor),
                mainDrawCall: null,
                pickingDrawCall: null
            }
        ];

        let texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')//GL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY 
        });

        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].pickingDrawCall = engine.createDrawCall(this.pickingProgram, boxArray)
                .uniform("uPickColor", boxes[i].pickColor);

            boxes[i].mainDrawCall = engine.createDrawCall(this.mainProgram, boxArray)
                .uniformBlock("SceneUniforms", sceneUniforms)
                .uniformBlock("FrameUniforms", boxes[i].frameUniforms)
                .texture("uTextureMap", texture);
        }

        // MOUSE HANDLER FOR PICKING
        this.mouseX = 0;
        this.mouseY = 0;
        this.picked = false;
        this.pickedColor = new Uint8Array(4);

        const self = this;
        window.addEventListener("mouseup", function (event) {
            self.mouseX = event.clientX;
            self.mouseY = event.clientY;
            self.picked = true;
        });
    }

    private async loadResource(): Promise<void> {
        // app.createPrograms([pickingVsSource, pickingFsSource], [vsSource, fsSource]),
        // utils.loadImages(["img/webgl-logo.png"])

        // [pickingProgram, mainProgram],
        //     [image]
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-picking/picking.vs.glsl',
                'resource/assets/shader-picking/picking.fs.glsl',
                'resource/assets/shader-picking/main.vs.glsl',
                'resource/assets/shader-picking/main.fs.glsl'
            ];
            const txts = await this.engine.loadText(ress);
            this.pickingVsSource = txts[0];
            this.pickingFsSource = txts[1];
            this.vsSource = txts[2];
            this.fsSource = txts[3];
            //
            const programs = await this.engine.createPrograms(
                [this.pickingVsSource, this.pickingFsSource], [this.vsSource, this.fsSource]
            );
            this.pickingProgram = programs[0];
            this.mainProgram = programs[1];
            //
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

        const engine = this.engine;
        // this.engine.clear();
        // this.drawCall.draw();

        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].rotate[0] += 0.01;
            boxes[i].rotate[1] += 0.02;

            engine.xformMatrix(boxes[i].modelMatrix, boxes[i].translate, boxes[i].rotate, boxes[i].scale);
            mat4.multiply(boxes[i].mvpMatrix, this.viewProjMatrix, boxes[i].modelMatrix);

            boxes[i].pickingDrawCall.uniform("uMVP", boxes[i].mvpMatrix);

            boxes[i].frameUniforms.set(0, boxes[i].mvpMatrix)
                .set(1, boxes[i].modelMatrix);
        }

        if (this.picked) {
            // DRAW TO PICKING BUFFER
            engine.drawFramebuffer(this.pickingBuffer).clear();

            for (let i = 0, len = boxes.length; i < len; ++i) {
                boxes[i].pickingDrawCall.draw();
            }

            engine.defaultDrawFramebuffer()
                .readFramebuffer(this.pickingBuffer)
                .readPixel(this.mouseX, engine.canvas.height - this.mouseY, this.pickedColor);

            if (this.pickedColor[0] === 255) {
                boxes[0].frameUniforms.set(2, this.highlightColor);
            } else {
                boxes[0].frameUniforms.set(2, this.unhighlightColor);
            }

            if (this.pickedColor[1] === 255) {
                boxes[1].frameUniforms.set(2, this.highlightColor);
            } else {
                boxes[1].frameUniforms.set(2, this.unhighlightColor);
            }

            this.picked = false;
        }

        boxes[0].frameUniforms.update();
        boxes[1].frameUniforms.update();

        // MAIN DRAW
        engine.clear();

        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].mainDrawCall.draw();
        }



        return this;
    }

    public leave(): WebGL2DemoScene {
        // this.program.delete();
        // this.drawCall.delete();



        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        this.pickingBuffer.resize();
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        return this;
    }
}