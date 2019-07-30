
interface DeferredScnBoxTransform {
    scale: Float32Array | number[];
    rotate: Float32Array | number[];
    translate: Float32Array | number[];
    modelMatrix: Float32Array;
    mvpMatrix: Float32Array;
    matrixUniforms: WebGL2UniformBuffer;
    drawCall: WebGL2DrawCall;
}

interface DeferredScnLightTransform {
    position: Float32Array;
    color: Float32Array;
    uniforms: WebGL2UniformBuffer;
    drawCall: WebGL2DrawCall;
}

class DeferredScene extends WebGL2DemoScene {

    //
    private projMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private geoVsSource: string;
    private geoFsSource: string;
    private vsSource: string;
    private fsSource: string;
    private lights: DeferredScnLightTransform[];
    private boxes: DeferredScnBoxTransform[];
    private image: HTMLImageElement;
    //
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
        engine.clearColor(0.0, 0.0, 0.0, 1.0)
            .depthTest()
            .depthFunc(GL.LEQUAL)
            .blendFunc(GL.ONE, GL.ONE);

        const positionTarget = engine.createTexture2DBySize(engine.width, engine.height, {
            internalFormat: GL.RGBA16F
        });
        const normalTarget = engine.createTexture2DBySize(engine.width, engine.height, {
            internalFormat: GL.RGBA16F
        });
        const uvTarget = engine.createTexture2DBySize(engine.width, engine.height, {
            internalFormat: GL.RG16F
        });
        const depthTarget = engine.createRenderbuffer(engine.width, engine.height, GL.DEPTH_COMPONENT16);
        this.gBuffer = engine.createFramebuffer()
            .colorTarget(0, positionTarget)
            .colorTarget(1, normalTarget)
            .colorTarget(3, uvTarget)
            .depthTarget(depthTarget);
        console.assert(this.gBuffer.getStatus() === GL.FRAMEBUFFER_COMPLETE, "G-buffer framebuffer is not complete!");

        ///
        const box = engine.createBox();
        const positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        const normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);
        const boxArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, normals)
            .vertexAttributeBuffer(2, uv);

        const sphere = engine.createSphere();
        const lightPositions = engine.createVertexBuffer(GL.FLOAT, 3, sphere.positions);
        const lightIndices = engine.createIndexBuffer(GL.UNSIGNED_SHORT, 3, sphere.indices);
        const sphereArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, lightPositions)
            .indexBuffer(lightIndices);

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        const texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        this.boxes = [
            {
                scale: [1, 1, 1],
                rotate: [0, 0, 0],
                translate: [0, 0, 0],
                modelMatrix: mat4.create(),
                mvpMatrix: mat4.create(),
                matrixUniforms: engine.createUniformBuffer([
                    GL.FLOAT_MAT4,
                    GL.FLOAT_MAT4
                ]),
                drawCall: null
            },
            {
                scale: [0.1, 0.1, 0.1],
                rotate: [0, 0, Math.PI / 3],
                translate: [0.8, 0.8, 0.4],
                modelMatrix: mat4.create(),
                mvpMatrix: mat4.create(),
                matrixUniforms: engine.createUniformBuffer([
                    GL.FLOAT_MAT4,
                    GL.FLOAT_MAT4
                ]),
                drawCall: null
            }
        ];

        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].drawCall = engine.createDrawCall(this.geoProgram, boxArray)
                .uniformBlock("BoxUniforms", boxes[i].matrixUniforms);
        }

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

        const lights = this.lights;
        for (let i = 0, len = lights.length; i < len; ++i) {
            const lightMatrix = mat4.create();
            engine.xformMatrix(lightMatrix, lights[i].position);
            mat4.multiply(lightMatrix, this.viewProjMatrix, lightMatrix);

            lights[i].uniforms = engine.createUniformBuffer([
                GL.FLOAT_MAT4,
                GL.FLOAT_VEC4,
                GL.FLOAT_VEC4
            ]).set(0, lightMatrix)
                .set(1, lights[i].position)
                .set(2, lights[i].color)
                .update();

            lights[i].drawCall = engine.createDrawCall(this.mainProgram, sphereArray)
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
        const engine = this.engine;
        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].rotate[0] += 0.01;
            boxes[i].rotate[1] += 0.02;
            engine.xformMatrix(boxes[i].modelMatrix, boxes[i].translate as Float32Array, boxes[i].rotate as Float32Array, boxes[i].scale as Float32Array);
            mat4.multiply(boxes[i].mvpMatrix, this.viewProjMatrix, boxes[i].modelMatrix);
            boxes[i].matrixUniforms.set(0, boxes[i].mvpMatrix)
                .set(1, boxes[i].modelMatrix)
                .update();
        }

        engine.drawFramebuffer(this.gBuffer)
            .clearColor(0.0, 0.0, 0.0, 1.0)
            .depthMask(true)
            .noBlend()
            .clear();

        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].drawCall.draw();
        }

        engine.defaultDrawFramebuffer()
            .clearColor(0.0, 0.0, 0.0, 1.0)
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
        this.geoProgram.delete();
        this.mainProgram.delete();
        this.gBuffer.delete();
        const engine = this.engine;
        engine.noDepthTest().noBlend().depthMask(true);
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
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