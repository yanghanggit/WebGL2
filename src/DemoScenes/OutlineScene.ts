
class OutlineScene extends WebGL2DemoScene {

    private mainVsSource: string;
    private mainFsSource: string;
    private outlineVsSource: string;
    private outlineFsSource: string;
    private image: HTMLImageElement;
    private rotationMatrix: Float32Array;
    private modelMatrixData: Float32Array;
    private projMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private spheres: any[];
    //
    private mainDrawcall: WebGL2DrawCall;
    private outlineDrawcall: WebGL2DrawCall;
    private mainProgram: WebGL2Program;
    private outlineProgram: WebGL2Program;
    private sceneUniforms: WebGL2UniformBuffer;
    private modelMatrices: WebGL2VertexBuffer;
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
        const app = engine;
        const utils = engine;
        const canvas = engine.canvas;
        const PicoGL = GL;
        //utils.addTimerElement();

        const NUM_SPHERES = 32;
        const NUM_PER_ROW = 8;
        const SPHERE_RADIUS = 0.6;
        const NEAR = 0.1;
        const FAR = 10.0;

        // let canvas = document.getElementById("gl-canvas");
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;

        this. spheres = new Array(NUM_SPHERES);
        this. modelMatrixData = new Float32Array(NUM_SPHERES * 16);

        const spheres = this.spheres;
        for (let i = 0; i < NUM_SPHERES; ++i) {
            let angle = 2 * Math.PI * (i % NUM_PER_ROW) / NUM_PER_ROW;
            let x = Math.sin(angle) * SPHERE_RADIUS;
            let y = Math.floor(i / NUM_PER_ROW) / (NUM_PER_ROW / 4) - 0.75;
            let z = Math.cos(angle) * SPHERE_RADIUS;
            spheres[i] = {
                scale: [0.8, 0.8, 0.8],
                rotate: [0, 0, 0], // Will be used for global rotation
                translate: [x, y, z],
                modelMatrix: mat4.create()
            };
        }

        // CREATE APP WITH STENCIL BUFFER
        //let app = PicoGL.createApp(canvas, { stencil: true })
        app.clearColor(0.0, 0.0, 0.0, 1.0)
            .clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT | PicoGL.STENCIL_BUFFER_BIT)
            .depthTest()
            .depthFunc(PicoGL.LEQUAL)
            // ENABLE STENCIL TESTING
            .stencilTest()
            // SET STENCIL TEST TO UPDATE STENCIL VALUE WHEN 
            // DEPTH AND STENCIL TESTS PASS
            .stencilOp(PicoGL.KEEP, PicoGL.KEEP, PicoGL.REPLACE);

        // let timer = app.createTimer();

        // // SET UP MAIN DRAW PROGRAM
        // let mainVsSource =  document.getElementById("vertex-main").text.trim();
        // let mainFsSource =  document.getElementById("fragment-main").text.trim();

        // // SET UP OUTLINE PROGRAM, WHICH SCALES UP GEOMETRY AND DRAWS
        // // IN SOLID YELLOW 
        // let outlineVsSource =  document.getElementById("vertex-outline").text.trim();
        // let outlineFsSource =  document.getElementById("fragment-outline").text.trim();


        // INSTANCED SPHERE GEOMETRY
        let sphere = utils.createSphere({ radius: 0.5 });
        let positions = app.createVertexBuffer(PicoGL.FLOAT, 3, sphere.positions);
        let uv = app.createVertexBuffer(PicoGL.FLOAT, 2, sphere.uvs);
        let normals = app.createVertexBuffer(PicoGL.FLOAT, 3, sphere.normals);
        let indices = app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, sphere.indices);

        // PER-INSTANCE MODEL MATRICES
        this. modelMatrices = app.createMatrixBuffer(PicoGL.FLOAT_MAT4, this.modelMatrixData);

        let sphereArray = app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .instanceAttributeBuffer(3, this.modelMatrices)
            .indexBuffer(indices);

        // UNIFORM DATA
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, canvas.width / canvas.height, NEAR, FAR);

        this.viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(0, 0.8, 2);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        let lightPosition = vec3.fromValues(0.5, 1, 2);

        // UNIFORM BUFFERS
        this.sceneUniforms = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4
        ])
            .set(0, this.viewProjMatrix)
            .set(1, eyePosition)
            .set(2, lightPosition)
            .update();


            let texture = app.createTexture2DByImage(this.image, { 
                flipY: true,
                maxAnisotropy: app.capbility('MAX_TEXTURE_ANISOTROPY')//PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY 
            });

            // DRAW CALLS
            this. mainDrawcall = app.createDrawCall(this.mainProgram, sphereArray)
            .uniformBlock("SceneUniforms", this.sceneUniforms)
            .texture("uTexture", texture);

            this. outlineDrawcall = app.createDrawCall(this.outlineProgram, sphereArray)
            .uniformBlock("SceneUniforms", this.sceneUniforms);

            this. rotationMatrix = mat4.create();


    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-outline/main.vs.glsl',
                'resource/assets/shader-outline/main.fs.glsl',
                'resource/assets/shader-outline/outline.vs.glsl',
                'resource/assets/shader-outline/outline.fs.glsl'
            ];
            const txts = await this.engine.loadText(ress);
            this.mainVsSource = txts[0];
            this.mainFsSource = txts[1];
            this.outlineVsSource = txts[2];
            this.outlineFsSource = txts[3];
            //
            const programs = await this.engine.createPrograms(
                [this.mainVsSource, this.mainFsSource], [this.outlineVsSource, this.outlineFsSource]
            );
            this.mainProgram = programs[0];
            this.outlineProgram = programs[1];

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


        // UPDATE TRANSFORMS
        const spheres = this.spheres;
        for (let i = 0, len = spheres.length; i < len; ++i) {
            spheres[i].rotate[1] += 0.002;

            engine.xformMatrix(spheres[i].modelMatrix, spheres[i].translate, null, spheres[i].scale);
            mat4.fromYRotation(this.rotationMatrix, spheres[i].rotate[1]);
            mat4.multiply(spheres[i].modelMatrix, this.rotationMatrix, spheres[i].modelMatrix)

            this.modelMatrixData.set(spheres[i].modelMatrix, i * 16);
        }

        this.modelMatrices.data(this.modelMatrixData);

        engine.clear()
        .depthTest()
        // SET STENCIL VALUE TO 1 FOR EVERY PIXEL
        // THAT GETS DRAWN
        .stencilFunc(GL.ALWAYS, 1, 0xFF)
        .stencilMask(0xFFFF);
        this.mainDrawcall.draw();
        
        engine.noDepthTest()
        // ONLY DRAW WHERE STENCIL VALUE IS NOT 1
        // (I.E. WHERE WE DIDN'T DRAW BEFORE)
        .stencilFunc(GL.NOTEQUAL, 1, 0xFF)
        .stencilMask(0);
        this.outlineDrawcall.draw();
        



        // if (this.resized) {
        //     this.boxBuffer.resize();
        //     this.hblurBuffer.resize();
        //     this.blurBuffer.resize();
        //     mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 10.0);
        //     mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        //     this.sceneUniforms.set(0, this.viewProjMatrix).update();
        //     this.resized = false;
        // }
        // const boxes = this.boxes;
        // for (let i = 0, len = boxes.length; i < len; ++i) {
        //     boxes[i].rotate[0] += 0.01;
        //     boxes[i].rotate[1] += 0.02;
        //     engine.xformMatrix(boxes[i].modelMatrix, boxes[i].translate as Float32Array, boxes[i].rotate as Float32Array, boxes[i].scale as Float32Array);
        //     this.modelMatrixData.set(boxes[i].modelMatrix, i * 16);
        // }
        // this.modelMatrices.data(this.modelMatrixData);
        // engine.drawFramebuffer(this.boxBuffer).clear();
        // this.boxesDrawCall.draw();
        // engine.drawFramebuffer(this.hblurBuffer).clear()
        // this.hBlurDrawCall.draw()
        // engine.defaultDrawFramebuffer().clear()
        // this.finalDrawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        // this.boxProgram.delete();
        // this.blurProgram.delete();
        // this.boxBuffer.delete();
        // this.hblurBuffer.delete();
        // this.blurBuffer.delete();
        // this.sceneUniforms.delete();
        // this.modelMatrices.delete();
        // this.boxesDrawCall.delete();
        // this.hBlurDrawCall.delete();
        // this.finalDrawCall.delete();

        this.mainDrawcall.delete();
        this.outlineDrawcall.delete();
        this.mainProgram.delete();
        this.outlineProgram.delete();
        this.sceneUniforms.delete();
        this.modelMatrices.delete();
        const engine = this.engine;
        //engine.noDepthTest();

        engine.noDepthTest().noStencilTest();
        // app.clearColor(0.0, 0.0, 0.0, 1.0)
        //     .clearMask(PicoGL.COLOR_BUFFER_BIT | PicoGL.DEPTH_BUFFER_BIT | PicoGL.STENCIL_BUFFER_BIT)
        //     .depthTest()
        //     .depthFunc(PicoGL.LEQUAL)
        //     // ENABLE STENCIL TESTING
        //     .stencilTest()
        //     // SET STENCIL TEST TO UPDATE STENCIL VALUE WHEN 
        //     // DEPTH AND STENCIL TESTS PASS
        //     .stencilOp(PicoGL.KEEP, PicoGL.KEEP, PicoGL.REPLACE);
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        //this.resized = true;

        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniforms.set(0, this.viewProjMatrix).update();
        return this;
    }
}