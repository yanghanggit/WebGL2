
interface BloomScnBoxTransform {
    rotation: Float32Array;
    modelMatrix: Float32Array;
    mvpMatrix: Float32Array;
};

interface BloomScnSunData {
    position: Float32Array;
    color: Float32Array;
    modelMatrix: Float32Array;
    mvpMatrix: Float32Array;
    uniforms: WebGL2UniformBuffer;
};

class BloomScene extends WebGL2DemoScene {

    //
    private projMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private cubeVsSource: string;
    private cubeFsSource: string;
    private sunVsSource: string;
    private sunFsSource: string;
    private quadVsSource: string;
    private blurFsSource: string;
    private blendFsSource: string;
    private image: HTMLImageElement;
    private cube: BloomScnBoxTransform;
    private suns: BloomScnSunData[];
    //
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
    private blankTexture: WebGL2Texture;

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
        engine.clearColor(0.0, 0.0, 0.0, 1.0).depthTest();

        const hTexelOffset = new Int32Array([1, 0]);
        const vTexelOffset = new Int32Array([0, 1]);
        const colorTarget1 = engine.createTexture2DByData(null, engine.width, engine.height, { internalFormat: GL.RGBA16F });
        const colorTarget2 = engine.createTexture2DByData(null, engine.width, engine.height, { internalFormat: GL.RGBA16F });
        const depthTarget = engine.createRenderbuffer(engine.width, engine.height, GL.DEPTH_COMPONENT16);

        this.colorBuffer = engine.createFramebuffer()
            .colorTarget(0, colorTarget1)
            .colorTarget(1, colorTarget2)
            .depthTarget(depthTarget);

        const blurTarget = engine.createTexture2DByData(null, engine.width, engine.height, { type: GL.FLOAT });

        this.blurBuffer = engine.createFramebuffer()
            .colorTarget(0, blurTarget);

        const bloomTarget = engine.createTexture2DByData(null, engine.width, engine.height, { type: GL.FLOAT });

        this.bloomBuffer = engine.createFramebuffer()
            .colorTarget(0, bloomTarget);

        const cubeData = engine.createBox({ dimensions: [1.0, 1.0, 1.0] });
        const cubePositions = engine.createVertexBuffer(GL.FLOAT, 3, cubeData.positions);
        const cubeUVs = engine.createVertexBuffer(GL.FLOAT, 2, cubeData.uvs);
        const cubeNormals = engine.createVertexBuffer(GL.FLOAT, 3, cubeData.normals);

        const cubeArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, cubePositions)
            .vertexAttributeBuffer(1, cubeUVs)
            .vertexAttributeBuffer(2, cubeNormals);

        const sun = engine.createSphere({ radius: 0.1 });
        const sunPositions = engine.createVertexBuffer(GL.FLOAT, 3, sun.positions);
        const sunIndices = engine.createIndexBuffer(GL.UNSIGNED_SHORT, 3, sun.indices);

        const sunArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, sunPositions)
            .indexBuffer(sunIndices);

        const quadPositions = engine.createVertexBuffer(GL.FLOAT, 2, new Float32Array([
            -1, 1,
            -1, -1,
            1, -1,
            -1, 1,
            1, -1,
            1, 1,
        ]));

        const quadArray = engine.createVertexArray().vertexAttributeBuffer(0, quadPositions);


        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.width / engine.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

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
                uniforms: engine.createUniformBuffer([
                    GL.FLOAT_MAT4,
                    GL.FLOAT_VEC4,
                ])
            },
            {
                position: vec3.fromValues(-4, -1.5, -2),
                color: vec3.fromValues(1, 0.5, 0),
                modelMatrix: mat4.create(),
                mvpMatrix: mat4.create(),
                uniforms: engine.createUniformBuffer([
                    GL.FLOAT_MAT4,
                    GL.FLOAT_VEC4,
                ])
            }
        ];

        engine.xformMatrix(suns[0].modelMatrix, suns[0].position, null, null);
        mat4.multiply(suns[0].mvpMatrix, this.viewProjMatrix, suns[0].modelMatrix);
        suns[0].uniforms.set(0, suns[0].mvpMatrix)
            .set(1, suns[0].color)
            .update();

        engine.xformMatrix(suns[1].modelMatrix, suns[1].position, null, vec3.fromValues(30, 30, 30));
        mat4.multiply(suns[1].mvpMatrix, this.viewProjMatrix, suns[1].modelMatrix);
        suns[1].uniforms.set(0, suns[1].mvpMatrix)
            .set(1, suns[1].color)
            .update();

        this.sceneUniforms = engine.createUniformBuffer([
            GL.FLOAT_VEC4,
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ]).set(0, eyePosition)
            .set(1, this.viewProjMatrix)
            .set(2, suns[0].position)
            .set(3, suns[0].color)
            .set(4, suns[1].position)
            .set(5, suns[1].color)
            .update();


        const texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        this.drawCall = engine.createDrawCall(this.cubeProgram, cubeArray)
            .uniformBlock("SceneUniforms", this.sceneUniforms)
            .texture("tex", texture);

        this.sunDrawCall = engine.createDrawCall(this.sunProgram, sunArray)
            .uniformBlock("SunUniforms", suns[0].uniforms);

        this.sun2DrawCall = engine.createDrawCall(this.sunProgram, sunArray)
            .uniformBlock("SunUniforms", suns[1].uniforms);

        this.hBlurDrawCall = engine.createDrawCall(this.blurProgram, quadArray)
            .uniform("uTexelOffset", hTexelOffset)
            .texture("uTexture", this.colorBuffer.colorAttachments[1] as WebGL2Texture);

        this.vBlurDrawCall = engine.createDrawCall(this.blurProgram, quadArray)
            .uniform("uTexelOffset", vTexelOffset)
            .texture("uTexture", this.blurBuffer.colorAttachments[0] as WebGL2Texture);

        this.blendDrawCall = engine.createDrawCall(this.blendProgram, quadArray)
            .texture("uColor", this.colorBuffer.colorAttachments[0] as WebGL2Texture)
            .texture("uBloom", this.bloomBuffer.colorAttachments[0] as WebGL2Texture);

        //
        this.blurTextureA = this.colorBuffer.colorAttachments[1] as WebGL2Texture;
        this.blurTextureB = this.bloomBuffer.colorAttachments[0] as WebGL2Texture;
        this.blurReadTexture = this.blurTextureA;
        this.blurWriteTexture = this.blurTextureB;

        this.blankTexture = engine.createTexture2DByData(null, 1, 1, {});

        this.openUI();
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
        const engine = this.engine;
        const cube = this.cube;

        cube.rotation[0] += 0.01;
        cube.rotation[1] += 0.02;

        engine.xformMatrix(cube.modelMatrix, null, cube.rotation, null);
        this.drawCall.uniform("uModel", cube.modelMatrix);

        this.colorBuffer.colorTarget(1, this.blurReadTexture);


        engine.drawFramebuffer(this.colorBuffer).clear();
        this.drawCall.draw();
        this.sunDrawCall.draw();
        this.sun2DrawCall.draw();

        if (this.bloomEnabled) {
            for (let i = 0; i < 4; ++i) {
                this.hBlurDrawCall.texture("uTexture", this.blurReadTexture);
                this.bloomBuffer.colorTarget(0, this.blurWriteTexture);

                engine.drawFramebuffer(this.blurBuffer).clear();
                this.hBlurDrawCall.draw()

                engine.drawFramebuffer(this.bloomBuffer).clear();
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
            this.blendDrawCall.texture("uBloom", this.blankTexture);
        }
        engine.defaultDrawFramebuffer().clear();
        this.blendDrawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.cubeProgram.delete();
        this.sunProgram.delete();
        this.blurProgram.delete();
        this.blendProgram.delete();
        this.drawCall.delete();
        this.sunDrawCall.delete();
        this.sun2DrawCall.delete();
        this.hBlurDrawCall.delete();
        this.vBlurDrawCall.delete();
        this.blendDrawCall.delete();
        this.colorBuffer.delete();
        this.blurTextureA.delete();
        this.blurTextureB.delete();
        this.blurReadTexture.delete();
        this.blurWriteTexture.delete();
        this.bloomBuffer.delete();
        this.blurBuffer.delete();
        this.sceneUniforms.delete();
        this.blankTexture.delete();
        const engine = this.engine;
        engine.noDepthTest();
        this.closeUI();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        //
        this.colorBuffer.resize(width, height);
        this.blurBuffer.resize(width, height);
        this.bloomBuffer.resize(width, height);
        this.blurTextureA.resize(width, height);
        this.blurTextureB.resize(width, height);
        //
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniforms.set(1, this.viewProjMatrix).update();
        //
        const suns = this.suns;
        mat4.multiply(suns[0].mvpMatrix, this.viewProjMatrix, suns[0].modelMatrix);
        suns[0].uniforms.set(0, suns[0].mvpMatrix).update();
        mat4.multiply(suns[1].mvpMatrix, this.viewProjMatrix, suns[1].modelMatrix);
        suns[1].uniforms.set(0, suns[1].mvpMatrix).update();
        return this;
    }

    private bloomEnableDiv: HTMLDivElement;
    private bloomEnabled: boolean = true;
    private openUI(): HTMLDivElement {
        if (this.bloomEnableDiv) {
            return this.bloomEnableDiv;
        }
        ///
        this.bloomEnableDiv = document.createElement("div");
        document.body.appendChild(this.bloomEnableDiv);
        const style = this.bloomEnableDiv.style; //置顶，必须显示在最上面
        style.setProperty('position', 'absolute');
        style.setProperty('bottom', '20px');
        style.setProperty('right', '20px');
        style.setProperty('color', 'white');
        style.setProperty('z-index', '999');
        style.setProperty('top', '0');
        this.bloomEnableDiv.innerText = 'bloom';
        ////
        const input = document.createElement("input");
        this.bloomEnableDiv.appendChild(input);
        input.setAttribute("type", "checkbox");
        input.setAttribute("id", "inputid");
        input.setAttribute("name", "inputname");
        input.setAttribute("value", "inputvalue");
        if (this.bloomEnabled) {
            input.setAttribute("checked", "checked");
        }
        ///
        const self = this;
        input.addEventListener("change", function () {
            self.bloomEnabled = this.checked;
        });
        return this.bloomEnableDiv;
    }

    private closeUI(): void {
        if (this.bloomEnableDiv) {
            document.body.removeChild(this.bloomEnableDiv);
            this.bloomEnableDiv = null;
        }
    }
}