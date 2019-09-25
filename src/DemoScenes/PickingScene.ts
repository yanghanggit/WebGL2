
interface PickingSceneBoxData {
    translate: Float32Array | number[];
    rotate: Float32Array | number[];
    scale: Float32Array | number[];
    mvpMatrix: Float32Array;
    modelMatrix: Float32Array;
    pickColor: Float32Array;
    frameUniforms: WebGL2UniformBuffer;
    mainDrawCall: WebGL2DrawCall;
    pickingDrawCall: WebGL2DrawCall;
}

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
    private boxes: PickingSceneBoxData[];
    private highlightColor: Float32Array;
    private unhighlightColor: Float32Array;
    private mouseX: number = 0;
    private mouseY: number = 0;
    private picked: boolean = false;
    private pickedColor: Uint8Array = new Uint8Array(4);
    private mouseClick: boolean = false;
    //
    private pickingProgram: WebGL2Program;
    private mainProgram: WebGL2Program;
    private pickingBuffer: WebGL2Framebuffer;

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

        const engine = this.engine;
        engine.clearColor(0.5, 0.5, 0.5, 1.0)
            .depthTest()
            .cullBackfaces();

        const pickColorTarget = engine.createTexture2DBySize(engine.width, engine.height, {});
        const pickDepthTarget = engine.createRenderbuffer(engine.width, engine.height, GL.DEPTH_COMPONENT16);
        this.pickingBuffer = engine.createFramebuffer().colorTarget(0, pickColorTarget).depthTarget(pickDepthTarget);

        const box = engine.createBox({ dimensions: [1.0, 1.0, 1.0] })
        const positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);
        const normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);
        const boxArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, normals)
            .vertexAttributeBuffer(2, uv);

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 2.0);

        this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        const lightPosition = vec3.fromValues(1, 1, 0.5);
        this.highlightColor = vec3.fromValues(1.5, 1.5, 0.5);
        this.unhighlightColor = vec3.fromValues(1.0, 1.0, 1.0);

        const sceneUniforms = engine.createUniformBuffer([
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ]).set(0, lightPosition)
            .set(1, eyePosition)
            .update();

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
        const texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
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
        //
        lockChangeScene();
        window.addEventListener("mouseup", (event) => {
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
            this.picked = true;
            this.mouseClick = true;
        });
    }

    private async loadResource(): Promise<void> {
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
        const engine = this.engine;
        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].rotate[0] += 0.01;
            boxes[i].rotate[1] += 0.02;
            engine.xformMatrix(boxes[i].modelMatrix, boxes[i].translate as Float32Array, boxes[i].rotate as Float32Array, boxes[i].scale as Float32Array);
            mat4.multiply(boxes[i].mvpMatrix, this.viewProjMatrix, boxes[i].modelMatrix);
            boxes[i].pickingDrawCall.uniform("uMVP", boxes[i].mvpMatrix);
            boxes[i].frameUniforms.set(0, boxes[i].mvpMatrix)
                .set(1, boxes[i].modelMatrix);
        }
        //
        let pickRessult = false;
        if (this.picked) {
            engine.drawFramebuffer(this.pickingBuffer).clear();
            for (let i = 0, len = boxes.length; i < len; ++i) {
                boxes[i].pickingDrawCall.draw();
            }
            engine.defaultDrawFramebuffer()
                .readFramebuffer(this.pickingBuffer)
                .readPixel(this.mouseX, engine.canvas.height - this.mouseY, this.pickedColor);
            if (this.pickedColor[0] === 255) {
                boxes[0].frameUniforms.set(2, this.highlightColor);
                pickRessult = true;
            } else {
                boxes[0].frameUniforms.set(2, this.unhighlightColor);
            }
            if (this.pickedColor[1] === 255) {
                boxes[1].frameUniforms.set(2, this.highlightColor);
                pickRessult = true;
            } else {
                boxes[1].frameUniforms.set(2, this.unhighlightColor);
            }
            this.picked = false;
        }
        //
        boxes[0].frameUniforms.update();
        boxes[1].frameUniforms.update();
        //
        engine.clear();
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].mainDrawCall.draw();
        }
        //
        if (this.mouseClick) {
            this.mouseClick = false;
            if (!pickRessult) {
                lockChangeScene(false);
                nextScene();
            }
        }
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.pickingProgram.delete();
        this.mainProgram.delete();
        this.pickingBuffer.delete();
        const engine = this.engine;
        engine.noDepthTest().noCullBackfaces();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        this.pickingBuffer.resize(width, height);
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        return this;
    }
}