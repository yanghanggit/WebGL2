
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
    ////
    private colorGeoVsSource: string;
    private colorGeoFsSource: string;
    private quadShader: string;
    private ssaoFsSource: string;
    private aoBlendFsSource: string;
    private noSSAOFsSource: string;
    private image: HTMLImageElement;
    private projMatrix: Float32Array;
    private spheres: any[] = [];
    private rotationMatrix: Float32Array;
    private modelMatrixData: Float32Array;
   


    //
    public enter(): WebGL2DemoScene {
        this.application.profile.setTitle(egret.getQualifiedClassName(this));
        const engine = this.engine;
        if (!engine.getExtension('EXT_color_buffer_float')) {
            console.error("OITScene: This example requires extension <b>EXT_color_buffer_float</b> which is not supported on this system.");
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
        //
        const engine = this.engine;


        // import { PicoGL } from "../src/picogl.js";

        // utils.addTimerElement();
        const app = engine;
        const PicoGL = GL;
        const utils = engine;
        const canvas = engine.canvas

        let ssaoEnabled = true;

        // document.getElementById("ssao-toggle").addEventListener("change", function() {
        //     ssaoEnabled = this.checked;
        // });

        const NEAR = 0.1;
        const FAR = 10.0;
        const SAMPLE_RADIUS = 16.0;
        const BIAS = 0.04;
        const ATTENUATION = vec2.fromValues(1, 1);
        const DEPTH_RANGE = vec2.fromValues(NEAR, FAR);

        const NUM_SPHERES = 32;
        const NUM_PER_ROW = 8;
        const SPHERE_RADIUS = 0.6;

        // if (!testExtension("EXT_color_buffer_float")) {
        //     document.body.innerHTML = "This example requires extension <b>EXT_color_buffer_float</b> which is not supported on this system."
        // }

        // let canvas = document.getElementById("gl-canvas");
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;

        this.spheres = new Array(NUM_SPHERES);
        this.modelMatrixData = new Float32Array(NUM_SPHERES * 16);

        for (let i = 0; i < NUM_SPHERES; ++i) {
            let angle = 2 * Math.PI * (i % NUM_PER_ROW) / NUM_PER_ROW;
            let x = Math.sin(angle) * SPHERE_RADIUS;
            let y = Math.floor(i / NUM_PER_ROW) / (NUM_PER_ROW / 4) - 0.75;
            let z = Math.cos(angle) * SPHERE_RADIUS;
            this.spheres[i] = {
                scale: [0.8, 0.8, 0.8],
                rotate: [0, 0, 0], // Will be used for global rotation
                translate: [x, y, z],
                modelMatrix: mat4.create()
            };
        }

        //let app = PicoGL.createApp(canvas)
        app
            .clearColor(0.0, 0.0, 0.0, 1.0)
            .depthTest()
            .depthFunc(PicoGL.LEQUAL);

        let timer = app.createTimer();

        // SET UP COLOR/GEO PROGRAM
        // let colorGeoVsSource =  document.getElementById("vertex-colorgeo").text.trim();
        // let colorGeoFsSource =  document.getElementById("fragment-colorgeo").text.trim();

        let colorTarget = app.createTexture2DBySize/*createTexture2D*/(app.width, app.height, {});
        let positionTarget = app.createTexture2DBySize/*createTexture2D*/(app.width, app.height, {
            internalFormat: PicoGL.RGBA16F
        });
        let normalTarget = app.createTexture2DBySize/*createTexture2D*/(app.width, app.height, {
            internalFormat: PicoGL.RGBA16F
        });
        let depthTarget = app.createRenderbuffer(app.width, app.height, PicoGL.DEPTH_COMPONENT16);
        this.colorGeoBuffer = app.createFramebuffer()
            .colorTarget(0, colorTarget)
            .colorTarget(1, positionTarget)
            .colorTarget(2, normalTarget)
            .depthTarget(depthTarget);

        // QUAD VERTEX SHADER
        //let quadVsSource =  document.getElementById("vertex-quad").text.trim();
        let quadShader = app.createShader(PicoGL.VERTEX_SHADER, /*this.quadVsSource*/this.quadShader);

        // SET UP SSAO PROGRAM
        //let ssaoFsSource =  document.getElementById("fragment-ssao").text.trim();
        let ssaoTarget = app.createTexture2DBySize/*createTexture2D*/(app.width, app.height, {
            internalFormat: PicoGL.RGBA16F
        });
        this.ssaoBuffer = app.createFramebuffer().colorTarget(0, ssaoTarget);

        // SET UP AO BLEND PROGRAM
        //let aoBlendFsSource =  document.getElementById("fragment-aoblend").text.trim();

        // DRAW WITHOUT SSAO
        //let noSSAOFsSource =  document.getElementById("fragment-color").text.trim();

        // INSTANCED SPHERE GEOMETRY
        let sphere = utils.createSphere({ radius: 0.5 });
        let positions = app.createVertexBuffer(PicoGL.FLOAT, 3, sphere.positions);
        let uv = app.createVertexBuffer(PicoGL.FLOAT, 2, sphere.uvs);
        let normals = app.createVertexBuffer(PicoGL.FLOAT, 3, sphere.normals);
        let indices = app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, sphere.indices);

        // PER-INSTANCE MODEL MATRICES
        this.modelMatrices = app.createMatrixBuffer(PicoGL.FLOAT_MAT4, this.modelMatrixData);

        let sphereArray = app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .instanceAttributeBuffer(3, this.modelMatrices)
            .indexBuffer(indices);

        // QUAD GEOMETRY
        let quadPositions = app.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            -1, 1,
            -1, -1,
            1, -1,
            -1, 1,
            1, -1,
            1, 1,
        ]));

        let quadArray = app.createVertexArray()
            .vertexAttributeBuffer(0, quadPositions);

        // UNIFORM DATA
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, canvas.width / canvas.height, NEAR, FAR);

        let viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(0, 0.8, 2);
        mat4.lookAt(viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        let lightPosition = vec3.fromValues(0.5, 1, 2);

        // UNIFORM BUFFERS
        this.sceneUniforms = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4
        ])
            .set(0, viewMatrix)
            .set(1, this.projMatrix)
            .set(2, eyePosition)
            .set(3, lightPosition)
            .update();

        let ssaoUniforms = app.createUniformBuffer([
            PicoGL.FLOAT,
            PicoGL.FLOAT,
            PicoGL.FLOAT_VEC2,
            PicoGL.FLOAT_VEC2
        ])
            .set(0, SAMPLE_RADIUS)
            .set(1, BIAS)
            .set(2, ATTENUATION)
            .set(3, DEPTH_RANGE)
            .update();

        // NOISE TEXTURE TO RADOMIZE SSAO SAMPLING
        let numNoisePixels = app.gl.drawingBufferWidth * app.gl.drawingBufferHeight;
        let noiseTextureData = new Float32Array(numNoisePixels * 2);

        for (let i = 0; i < numNoisePixels; ++i) {
            let index = i * 2;
            noiseTextureData[index] = Math.random() * 2.0 - 1.0;
            noiseTextureData[index + 1] = Math.random() * 2.0 - 1.0;
        }

        this.noiseTexture = app.createTexture2DByData/*.createTexture2D*/(
            noiseTextureData,
            app.gl.drawingBufferWidth,
            app.gl.drawingBufferHeight,
            {
                internalFormat: PicoGL.RG32F,
                minFilter: PicoGL.LINEAR,
                magFilter: PicoGL.LINEAR,
                wrapS: PicoGL.CLAMP_TO_EDGE,
                wrapT: PicoGL.CLAMP_TO_EDGE,
                generateMipmaps: false
            }
        );





        ////


        let texture = app.createTexture2DByImage/*createTexture2D*/(this.image, {
            flipY: true,
            maxAnisotropy: /*PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY */ app.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        // DRAW CALLS
        this.colorGeoDrawcall = app.createDrawCall(this.colorGeoProgram, sphereArray)
            .uniformBlock("SceneUniforms", this.sceneUniforms)
            .texture("uTexture", texture);

        this.ssaoDrawCall = app.createDrawCall(this.ssaoProgram, quadArray)
            .uniformBlock("SSAOUniforms", ssaoUniforms)
            .texture("uPositionBuffer", this.colorGeoBuffer.colorAttachments[1])
            .texture("uNormalBuffer", this.colorGeoBuffer.colorAttachments[2])
            .texture("uNoiseBuffer", this.noiseTexture);

        this.aoBlendDrawCall = app.createDrawCall(this.aoBlendProgram, quadArray)
            .texture("uColorBuffer", this.colorGeoBuffer.colorAttachments[0])
            .texture("uOcclusionBuffer", this.ssaoBuffer.colorAttachments[0]);

        this.noSSAODrawCall = app.createDrawCall(this.noSSAOProgram, quadArray)
            .texture("uColorBuffer", this.colorGeoBuffer.colorAttachments[0]);

        this.rotationMatrix = mat4.create();
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
                'resource/assets/webgl-logo.png',
                //'resource/assets/bg.jpg',
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
        const utils = this.engine;
        const app = this.engine;
        for (let i = 0, len = spheres.length; i < len; ++i) {
            spheres[i].rotate[1] += 0.002;

            utils.xformMatrix(spheres[i].modelMatrix, spheres[i].translate, null, spheres[i].scale);
            mat4.fromYRotation(this.rotationMatrix, spheres[i].rotate[1]);
            mat4.multiply(spheres[i].modelMatrix, this.rotationMatrix, spheres[i].modelMatrix)

            this.modelMatrixData.set(spheres[i].modelMatrix, i * 16);
        }
        this.modelMatrices.data(this.modelMatrixData);

        // DRAW TO COLORGEOBUFFER
        app.drawFramebuffer(this.colorGeoBuffer).clear();
        this.colorGeoDrawcall.draw();
        const ssaoEnabled = true;
        if (ssaoEnabled) {
            // OCCLUSION PASS
            app.drawFramebuffer(this.ssaoBuffer).clear()
            this.ssaoDrawCall.draw();

            // OCCLUSION BLEND PASS
            app.defaultDrawFramebuffer().clear()
            this.aoBlendDrawCall.draw();
        } else {
            // DRAW WITHOUT SSAO
            app.defaultDrawFramebuffer().clear();
            this.noSSAODrawCall.draw();
        }

        // timer.end();

        // requestAnimationFrame(draw);






        return this;
    }

    public leave(): WebGL2DemoScene {
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

        const app = this.engine;
        app.noDepthTest().depthFunc(GL.LESS);
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        
        const app = this.engine;

        this.colorGeoBuffer.resize();
        this.ssaoBuffer.resize();

        const numNoisePixels = app.gl.drawingBufferWidth * app.gl.drawingBufferHeight;
        const noiseTextureData = new Float32Array(numNoisePixels * 2);

        for (let i = 0; i < numNoisePixels; ++i) {
            let index = i * 2;
            noiseTextureData[index] = Math.random() * 2.0 - 1.0;
            noiseTextureData[index + 1] = Math.random() * 2.0 - 1.0;
        }

        this.noiseTexture.resize(app.gl.drawingBufferWidth, app.gl.drawingBufferHeight)
            .data(noiseTextureData);

        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        this.sceneUniforms.set(1, this.projMatrix).update();
        return this;
    }
}