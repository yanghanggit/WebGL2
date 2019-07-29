
class DeferredScene extends WebGL2DemoScene {

    private projMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private geoVsSource: string;
    private geoFsSource: string;
    private vsSource: string;
    private fsSource: string;
    private lights: any[];
    private boxes: any[];
    private image: HTMLImageElement;

    private geoProgram: WebGL2Program;
    private mainProgram: WebGL2Program;
    private gBuffer: WebGL2Framebuffer;

    public enter(): WebGL2DemoScene {
        this.application.profile.setTitle(egret.getQualifiedClassName(this));
        const engine = this.engine;
        if (!engine.getExtension('EXT_color_buffer_float')) {
            console.error(egret.getQualifiedClassName(this) + ": This example requires extension <b>EXT_color_buffer_float</b> which is not supported on this system.");
            return this;
        }
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
        const PicoGL = GL;
        const utils = engine;
        const canvas = engine.canvas;



        // let canvas = document.getElementById("gl-canvas");
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;

        //let app = PicoGL.createApp(canvas)
        app
            .clearColor(0.0, 0.0, 0.0, 1.0)
            .depthTest()
            .depthFunc(PicoGL.LEQUAL)
            .blendFunc(PicoGL.ONE, PicoGL.ONE);

        // let timer = app.createTimer();

        // // SET UP GBUFFER PROGRAM
        // let geoVsSource =  document.getElementById("geo-vs").text.trim();
        // let geoFsSource =  document.getElementById("geo-fs").text.trim();

        let positionTarget = app.createTexture2DBySize(app.width, app.height, {
            internalFormat: PicoGL.RGBA16F
        });
        let normalTarget = app.createTexture2DBySize(app.width, app.height, {
            internalFormat: PicoGL.RGBA16F
        });
        let uvTarget = app.createTexture2DBySize(app.width, app.height, {
            internalFormat: PicoGL.RG16F
        });
        let depthTarget = app.createRenderbuffer(app.width, app.height, PicoGL.DEPTH_COMPONENT16);
        this.gBuffer = app.createFramebuffer()
            .colorTarget(0, positionTarget)
            .colorTarget(1, normalTarget)
            .colorTarget(3, uvTarget)
            .depthTarget(depthTarget);
        console.assert(this.gBuffer.getStatus() === PicoGL.FRAMEBUFFER_COMPLETE, "G-buffer framebuffer is not complete!");

        // SET UP MAIN PROGRAM
        // let vsSource =  document.getElementById("main-vs").text.trim();
        // let fsSource =  document.getElementById("main-fs").text.trim();

        // GEOMETRY
        let box = utils.createBox();
        let positions = app.createVertexBuffer(PicoGL.FLOAT, 3, box.positions);
        let normals = app.createVertexBuffer(PicoGL.FLOAT, 3, box.normals);
        let uv = app.createVertexBuffer(PicoGL.FLOAT, 2, box.uvs);

        let boxArray = app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, normals)
            .vertexAttributeBuffer(2, uv);

        let sphere = utils.createSphere();
        let lightPositions = app.createVertexBuffer(PicoGL.FLOAT, 3, sphere.positions);
        let lightIndices = app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, sphere.indices);

        let sphereArray = app.createVertexArray()
            .vertexAttributeBuffer(0, lightPositions)
            .indexBuffer(lightIndices);

        // CAMERA STUFF
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, canvas.width / canvas.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        /*
        window.onresize = function() {
            app.resize(window.innerWidth, window.innerHeight);
            gBuffer.resize();

            mat4.perspective(projMatrix, Math.PI / 2, app.canvas.width / app.canvas.height, 0.1, 10.0);
            mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);

            for (let i = 0, len = lights.length; i < len; ++i) {
                lightMatrix = mat4.create();
                utils.xformMatrix(lightMatrix, lights[i].position);
                mat4.multiply(lightMatrix, viewProjMatrix, lightMatrix);


                lights[i].uniforms.set(0, lightMatrix).update();
            }
        }
        */

        let texture = app.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: app.capbility('MAX_TEXTURE_ANISOTROPY')//PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY
        });

        // BOX DESCRIPTIONS FOR GEO PASS
        this.boxes = [
            {
                scale: [1, 1, 1],
                rotate: [0, 0, 0],
                translate: [0, 0, 0],
                modelMatrix: mat4.create(),
                mvpMatrix: mat4.create(),
                matrixUniforms: app.createUniformBuffer([
                    PicoGL.FLOAT_MAT4,
                    PicoGL.FLOAT_MAT4
                ]),
                drawCall: null
            },
            {
                scale: [0.1, 0.1, 0.1],
                rotate: [0, 0, Math.PI / 3],
                translate: [0.8, 0.8, 0.4],
                modelMatrix: mat4.create(),
                mvpMatrix: mat4.create(),
                matrixUniforms: app.createUniformBuffer([
                    PicoGL.FLOAT_MAT4,
                    PicoGL.FLOAT_MAT4
                ]),
                drawCall: null
            }
        ];
        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].drawCall = app.createDrawCall(this.geoProgram, boxArray)
                .uniformBlock("BoxUniforms", boxes[i].matrixUniforms);
        }

        // LIGHT DESCRIPTIONS FOR DRAW PASS
        this.lights = [
            {
                position: vec3.fromValues(0, 1, 0.5),
                color: vec3.fromValues(0.8, 0.0, 0.0),
                uniforms: null,
                drawCall: null
            },
            {
                position: vec3.fromValues(1, 1, 0.5),
                color: vec3.fromValues(0.0, 0.0, 0.8),
                uniforms: null,
                drawCall: null
            },
            {
                position: vec3.fromValues(1, 0, 0.5),
                color: vec3.fromValues(0.0, 0.8, 0.0),
                uniforms: null,
                drawCall: null
            },
            {
                position: vec3.fromValues(0.5, 0, 1),
                color: vec3.fromValues(0.0, 0.8, 0.8),
                uniforms: null,
                drawCall: null
            }
        ];

        // LIGHT UNIFORMS AND DRAW CALLS    
        let lightMatrix;
        const lights = this.lights;
        for (let i = 0, len = lights.length; i < len; ++i) {
            lightMatrix = mat4.create();
            utils.xformMatrix(lightMatrix, lights[i].position);
            mat4.multiply(lightMatrix, this.viewProjMatrix, lightMatrix);

            lights[i].uniforms = app.createUniformBuffer([
                PicoGL.FLOAT_MAT4,
                PicoGL.FLOAT_VEC4,
                PicoGL.FLOAT_VEC4
            ])
                .set(0, lightMatrix)
                .set(1, lights[i].position)
                .set(2, lights[i].color)
                .update();

            lights[i].drawCall = app.createDrawCall(this.mainProgram, sphereArray)
                .uniformBlock("LightUniforms", lights[i].uniforms)
                .uniform("uEyePosition", eyePosition)
                .texture("uTextureMap", texture)
                .texture("uPositionBuffer", this.gBuffer.colorAttachments[0] as WebGL2Texture)
                .texture("uNormalBuffer", this.gBuffer.colorAttachments[1] as WebGL2Texture)
                .texture("uUVBuffer", this.gBuffer.colorAttachments[3] as WebGL2Texture);
        }
    }

    private async loadResource(): Promise<void> {

        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-deferred/geo.vs.glsl',
                'resource/assets/shader-deferred/geo.fs.glsl',
                'resource/assets/shader-deferred/main.vs.glsl',
                'resource/assets/shader-deferred/main.fs.glsl'
            ];
            const txts = await this.engine.loadText(ress);
            this.geoVsSource = txts[0];
            this.geoFsSource = txts[1];
            this.vsSource = txts[2];
            this.fsSource = txts[3];
            const programs = await this.engine.createPrograms(
                [this.geoVsSource, this.geoFsSource], [this.vsSource, this.fsSource]
            );
            this.geoProgram = programs[0];
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
        const app = this.engine;
        // this.drawCall.uniform("uTime", (performance.now() - this.startTime) / 1000);
        // this.engine.clear();
        // this.drawCall.draw();
        const utils = this.engine;
        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].rotate[0] += 0.01;
            boxes[i].rotate[1] += 0.02;

            utils.xformMatrix(boxes[i].modelMatrix, boxes[i].translate, boxes[i].rotate, boxes[i].scale);
            mat4.multiply(boxes[i].mvpMatrix, this.viewProjMatrix, boxes[i].modelMatrix);

            boxes[i].matrixUniforms.set(0, boxes[i].mvpMatrix)
                .set(1, boxes[i].modelMatrix)
                .update();
        }

        // DRAW TO GBUFFER
        app.drawFramebuffer(this.gBuffer)
            .depthMask(true)
            .noBlend()
            .clear();

        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].drawCall.draw();
        }

        // DRAW LIGHTS
        app.defaultDrawFramebuffer()
            .blend()
            .depthMask(false)
            .clear();
        const lights = this.lights;
        for (let i = 0, len = lights.length; i < len; ++i) {
            lights[i].drawCall.draw();
        }

        return this;
    }

    public leave(): WebGL2DemoScene {


        // private geoProgram: WebGL2Program;
        // private mainProgram: WebGL2Program;
        // private gBuffer: WebGL2Framebuffer;

        this.geoProgram.delete();
        this.mainProgram.delete();
        this.gBuffer.delete();
        // this.program.delete();
        // this.drawCall.delete();
        const engine = this.engine;
        engine.noDepthTest().noBlend();


      

        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        // mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        // mat4.multiply(this.mvpMatrix, this.projMatrix, this.viewMatrix);

        const engine = this.engine;

        this.gBuffer.resize();

        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        let lightMatrix: Float32Array;
        const lights = this.lights;
        for (let i = 0, len = lights.length; i < len; ++i) {
            lightMatrix = mat4.create();
            engine.xformMatrix(lightMatrix, lights[i].position);
            mat4.multiply(lightMatrix, this.viewProjMatrix, lightMatrix);


            lights[i].uniforms.set(0, lightMatrix).update();
        }
        return this;
    }
}