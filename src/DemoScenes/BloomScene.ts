
class BloomScene extends WebGL2DemoScene {
    ///
    // private shadowVsSource: string;
    // private shadowFsSource: string;
    // private lightVsSource: string;
    // private lightFsSource: string;
    // private vsSource: string;
    // private fsSource: string;
    // private lightViewMatrixNegX: Float32Array = mat4.create();
    // private lightViewMatrixPosX: Float32Array = mat4.create();
    // private lightViewMatrixNegY: Float32Array = mat4.create();
    // private lightViewMatrixPosY: Float32Array = mat4.create();
    // private lightViewMatrixNegZ: Float32Array = mat4.create();
    // private lightViewMatrixPosZ: Float32Array = mat4.create();
    // private projMatrix: Float32Array;
    // private viewMatrix: Float32Array;
    // private viewProjMatrix: Float32Array;
    // private boxes: any[];
    // private webglImage: HTMLImageElement;
    // private cobblesImage: HTMLImageElement;
    // ///
    // private shadowProgram: WebGL2Program;
    // private lightProgram: WebGL2Program;
    // private mainProgram: WebGL2Program;
    // private shadowBuffer: WebGL2Framebuffer;
    // private shadowTarget: WebGL2Cubemap;
    // private lightDrawcall: WebGL2DrawCall;


    private projMatrix: Float32Array;



    private cubeVsSource: string;
    private cubeFsSource: string;
    private sunVsSource: string;
    private sunFsSource: string;
    private quadVsSource: string;
    private blurFsSource: string;
    private blendFsSource: string;
    private image: HTMLImageElement;


    private cubeProgram: WebGL2Program;
    private sunProgram: WebGL2Program;
    private blurProgram: WebGL2Program;
    private blendProgram: WebGL2Program;


    private drawCall: WebGL2DrawCall;
    private sunDrawCall: WebGL2DrawCall;
    private sun2DrawCall: WebGL2DrawCall;


    private hBlurDrawCall: WebGL2DrawCall;
    private vBlurDrawCall: WebGL2DrawCall;

    private blendDrawCall: WebGL2DrawCall;

    private colorBuffer: WebGL2Framebuffer;


    private blurTextureA: WebGL2Texture;
    private blurTextureB: WebGL2Texture;
    private blurReadTexture: WebGL2Texture;
    private blurWriteTexture: WebGL2Texture;

    private bloomBuffer: WebGL2Framebuffer;

    private blurBuffer: WebGL2Framebuffer;

    private sceneUniforms: WebGL2UniformBuffer;

    


    private cube: any;
    private suns: any[];

    

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
        //return;
        const engine = this.engine;
        const utils = this.engine;
        const app = this.engine;
        const canvas = engine.canvas;
        const PicoGL = GL;

        // utils.addTimerElement();   

        // let bloomEnabled = true;

        // document.getElementById("bloom-toggle").addEventListener("change", function() {
        //     bloomEnabled = this.checked;
        // });

        // let canvas = document.getElementById("gl-canvas");
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;

        let hTexelOffset = new Int32Array([1, 0]);
        let vTexelOffset = new Int32Array([0, 1]);

        //let app = PicoGL.createApp(canvas)
        app
            .clearColor(0.0, 0.0, 0.0, 1.0)
            .depthTest();

        // if (!testExtension("EXT_color_buffer_float")) {
        //     document.body.innerHTML = "This example requires extension <b>EXT_color_buffer_float</b> which is not supported on this system."
        // }

        // let timer = app.createTimer();

        // let resolution = new Int32Array([app.width, app.height]);

        // SET UP PROGRAMS

        // let cubeVsSource =  document.getElementById("vertex-cube").text.trim();
        // let cubeFsSource =  document.getElementById("fragment-cube").text.trim();

        // let sunVsSource =  document.getElementById("vertex-sun").text.trim();
        // let sunFsSource =  document.getElementById("fragment-sun").text.trim();

        // let quadVsSource =  document.getElementById("vertex-quad").text.trim();
        // let quadVertexShader = app.createShader(PicoGL.VERTEX_SHADER, quadVsSource);

        // let blurFsSource =  document.getElementById("fragment-blur").text.trim();

        // let blendFsSource =  document.getElementById("fragment-blend").text.trim();

        // SET UP FRAMEBUFFERS AND TEXTURES

        let colorTarget1 = app.createTexture2DByData(null, app.width, app.height, { internalFormat: PicoGL.RGBA16F });
        let colorTarget2 = app.createTexture2DByData(null, app.width, app.height, { internalFormat: PicoGL.RGBA16F });
        let depthTarget = app.createRenderbuffer(app.width, app.height, PicoGL.DEPTH_COMPONENT16);

        this.colorBuffer = app.createFramebuffer()
            .colorTarget(0, colorTarget1)
            .colorTarget(1, colorTarget2)
            .depthTarget(depthTarget);

        let blurTarget = app.createTexture2DByData(null, app.width, app.height, { type: PicoGL.FLOAT });

        this. blurBuffer = app.createFramebuffer()
            .colorTarget(0, blurTarget);

        let bloomTarget = app.createTexture2DByData(null, app.width, app.height, { type: PicoGL.FLOAT });

        this. bloomBuffer = app.createFramebuffer()
            .colorTarget(0, bloomTarget);

        let blankTexture = app.createTexture2DByData(null, 1, 1, {});

        // SET UP GEOMETRY

        let cubeData = utils.createBox({ dimensions: [1.0, 1.0, 1.0] })
        let cubePositions = app.createVertexBuffer(PicoGL.FLOAT, 3, cubeData.positions);
        let cubeUVs = app.createVertexBuffer(PicoGL.FLOAT, 2, cubeData.uvs);
        let cubeNormals = app.createVertexBuffer(PicoGL.FLOAT, 3, cubeData.normals);

        let cubeArray = app.createVertexArray()
            .vertexAttributeBuffer(0, cubePositions)
            .vertexAttributeBuffer(1, cubeUVs)
            .vertexAttributeBuffer(2, cubeNormals);

        let sun = utils.createSphere({ radius: 0.1 });
        let sunPositions = app.createVertexBuffer(PicoGL.FLOAT, 3, sun.positions);
        let sunIndices = app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, sun.indices);

        let sunArray = app.createVertexArray()
            .vertexAttributeBuffer(0, sunPositions)
            .indexBuffer(sunIndices);

        let quadPositions = app.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            -1, 1,
            -1, -1,
            1, -1,
            -1, 1,
            1, -1,
            1, 1,
        ]));

        let quadArray = app.createVertexArray().vertexAttributeBuffer(0, quadPositions);


        // SET UP OTHER DATA

        this. projMatrix = mat4.create();
        mat4.perspective( this.projMatrix, Math.PI / 2, app.width / app.height, 0.1, 10.0);

        this. viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this. viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix,  this.projMatrix, this.viewMatrix);

        this.cube = {
            rotation: vec3.create(),
            modelMatrix: mat4.create(),
            mvpMatrix: mat4.create()
        };

        const suns = this.suns = [
            {
                position: vec3.fromValues(0.7, 0.75, 0.3),
                color: vec3.fromValues(1, 1, 1),
                modelMatrix: mat4.create(),
                mvpMatrix: mat4.create(),
                uniforms: app.createUniformBuffer([
                    PicoGL.FLOAT_MAT4,
                    PicoGL.FLOAT_VEC4,
                ])
            },
            {
                position: vec3.fromValues(-4, -1.5, -2),
                color: vec3.fromValues(0, 0, 1),
                modelMatrix: mat4.create(),
                mvpMatrix: mat4.create(),
                uniforms: app.createUniformBuffer([
                    PicoGL.FLOAT_MAT4,
                    PicoGL.FLOAT_VEC4,
                ])
            }

        ];

        utils.xformMatrix(suns[0].modelMatrix, suns[0].position, null, null);
        mat4.multiply(suns[0].mvpMatrix, this.viewProjMatrix, suns[0].modelMatrix);
        suns[0].uniforms.set(0, suns[0].mvpMatrix)
            .set(1, suns[0].color)
            .update();

        utils.xformMatrix(suns[1].modelMatrix, suns[1].position, null, vec3.fromValues(30, 30, 30));
        mat4.multiply(suns[1].mvpMatrix, this.viewProjMatrix, suns[1].modelMatrix);
        suns[1].uniforms.set(0, suns[1].mvpMatrix)
            .set(1, suns[1].color)
            .update();

        this. sceneUniforms = app.createUniformBuffer([
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4
        ])
            .set(0, eyePosition)
            .set(1, this.viewProjMatrix)
            .set(2, suns[0].position)
            .set(3, suns[0].color)
            .set(4, suns[1].position)
            .set(5, suns[1].color)
            .update();


        let texture = app.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: app.capbility('MAX_TEXTURE_ANISOTROPY')/*PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY*/
        });

        // PREPARE DRAW CALLS
        this.drawCall = app.createDrawCall(this.cubeProgram, cubeArray)
            .uniformBlock("SceneUniforms", this.sceneUniforms)
            .texture("tex", texture);

        this.sunDrawCall = app.createDrawCall(this.sunProgram, sunArray)
            .uniformBlock("SunUniforms", suns[0].uniforms);

        this.sun2DrawCall = app.createDrawCall(this.sunProgram, sunArray)
            .uniformBlock("SunUniforms", suns[1].uniforms);

        this.hBlurDrawCall = app.createDrawCall(this.blurProgram, quadArray)
            .uniform("uTexelOffset", hTexelOffset)
            .texture("uTexture", this.colorBuffer.colorAttachments[1] as WebGL2Texture);

        this.vBlurDrawCall = app.createDrawCall(this.blurProgram, quadArray)
            .uniform("uTexelOffset", vTexelOffset)
            .texture("uTexture", this.blurBuffer.colorAttachments[0] as WebGL2Texture);

        this.blendDrawCall = app.createDrawCall(this.blendProgram, quadArray)
            .texture("uColor", this.colorBuffer.colorAttachments[0] as WebGL2Texture)
            .texture("uBloom", this.bloomBuffer.colorAttachments[0] as WebGL2Texture);

        // TEXTURES FOR PING PONGING THE BLUR
        this.blurTextureA = this.colorBuffer.colorAttachments[1] as WebGL2Texture;
        this.blurTextureB = this.bloomBuffer.colorAttachments[0] as WebGL2Texture;
        this.blurReadTexture = this.blurTextureA;
        this.blurWriteTexture = this.blurTextureB;

    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-bloom/cube.vs.glsl',
                'resource/assets/shader-bloom/cube.fs.glsl',
                'resource/assets/shader-bloom/sun.vs.glsl',
                'resource/assets/shader-bloom/sun.fs.glsl',
                'resource/assets/shader-bloom/quad.vs.glsl',
                'resource/assets/shader-bloom/blur.fs.glsl',
                'resource/assets/shader-bloom/blend.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.cubeVsSource = txts[0];
            this.cubeFsSource = txts[1];
            this.sunVsSource = txts[2];
            this.sunFsSource = txts[3];
            this.quadVsSource = txts[4];
            this.blurFsSource = txts[5];
            this.blendFsSource = txts[6];
            //
            const programs = await this.engine.createPrograms(
                [this.cubeVsSource, this.cubeFsSource],
                [this.sunVsSource, this.sunFsSource],
                [this.quadVsSource, this.blurFsSource],
                [this.quadVsSource, this.blendFsSource],
            );
            this.cubeProgram = programs[0];
            this.sunProgram = programs[1];
            this.blurProgram = programs[2];
            this.blendProgram = programs[3];
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

        const bloomEnabled = true;
        const cube = this.cube;
        const utils = this.engine;
        const app = this.engine;

        cube.rotation[0] += 0.01;
        cube.rotation[1] += 0.02;

        utils.xformMatrix(cube.modelMatrix, null, cube.rotation, null);
        this.drawCall.uniform("uModel", cube.modelMatrix);

        this.colorBuffer.colorTarget(1, this.blurReadTexture);


        app.drawFramebuffer(this.colorBuffer).clear();
        this.drawCall.draw();
        this.sunDrawCall.draw();
        this.sun2DrawCall.draw();

        if (bloomEnabled) {
            for (let i = 0; i < 4; ++i) {
                this.hBlurDrawCall.texture("uTexture", this.blurReadTexture);
                this.bloomBuffer.colorTarget(0, this.blurWriteTexture);

                app.drawFramebuffer(this.blurBuffer).clear();
                this.hBlurDrawCall.draw()

                app.drawFramebuffer(this.bloomBuffer).clear();
                this.vBlurDrawCall.draw();

                if (this.blurReadTexture === this.blurTextureA) {
                    this.blurReadTexture = this.blurTextureB;
                    this.blurWriteTexture = this.blurTextureA;
                } else {
                    this.blurReadTexture = this.blurTextureA;
                    this.blurWriteTexture = this.blurTextureB;
                }
            }

            this.blendDrawCall.texture("uBloom", this.blurWriteTexture);
        } else {
            //blendDrawCall.texture("uBloom", blankTexture);
        }



        app.defaultDrawFramebuffer().clear();
        this.blendDrawCall.draw();

        return this;
    }

    public leave(): WebGL2DemoScene {
        // this.shadowProgram.delete();
        // this.lightProgram.delete();
        // this.mainProgram.delete();
        // this.shadowBuffer.delete();
        // this.shadowTarget.delete();
        // this.lightDrawcall.delete();
        const engine = this.engine;
        //engine.noDepthTest();
        return this;
    }


    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;

    public resize(width: number, height: number): WebGL2DemoScene {
        // const NEAR = 0.1;
        // const FAR = 20.0
        // mat4.perspective(this.projMatrix, Math.PI / 2, width / height, NEAR, FAR);
        // mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);


        this.colorBuffer.resize();
        this.blurBuffer.resize();
        this.bloomBuffer.resize();

        // Make sure both targets are correct size.
        this.blurTextureA.resize(width, height);
        this.blurTextureB.resize(width, height);

        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniforms.set(1, this.viewProjMatrix).update();

        const suns = this.suns;

        mat4.multiply(suns[0].mvpMatrix, this.viewProjMatrix, suns[0].modelMatrix);
        suns[0].uniforms.set(0, suns[0].mvpMatrix).update();

        mat4.multiply(suns[1].mvpMatrix, this.viewProjMatrix, suns[1].modelMatrix);
        suns[1].uniforms.set(0, suns[1].mvpMatrix).update();
        return this;
    }
}