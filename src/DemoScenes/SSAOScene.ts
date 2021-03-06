
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
    private ssaoEnableDiv: HTMLDivElement;
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
    private ssaoEnabled: boolean = true;
    
    //
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

        ///
        const NEAR = 0.1;
        const FAR = 10.0;
        const SAMPLE_RADIUS = 16.0;
        const BIAS = 0.04;
        const ATTENUATION = vec2.fromValues(1, 1);
        const DEPTH_RANGE = vec2.fromValues(NEAR, FAR);
        const NUM_SPHERES = 32;
        const NUM_PER_ROW = 8;
        const SPHERE_RADIUS = 0.6;

        //
        this.spheres = new Array(NUM_SPHERES);
        this.modelMatrixData = new Float32Array(NUM_SPHERES * 16);
        for (let i = 0; i < NUM_SPHERES; ++i) {
            const angle = 2 * Math.PI * (i % NUM_PER_ROW) / NUM_PER_ROW;
            const x = Math.sin(angle) * SPHERE_RADIUS;
            const y = Math.floor(i / NUM_PER_ROW) / (NUM_PER_ROW / 4) - 0.75;
            const z = Math.cos(angle) * SPHERE_RADIUS;
            this.spheres[i] = {
                scale: [0.8, 0.8, 0.8],
                rotate: [0, 0, 0],
                translate: [x, y, z],
                modelMatrix: mat4.create()
            };
        }

        const engine = this.engine;
        engine.clearColor(0.5, 0.5, 0.5, 1.0)
            .depthTest()
            .depthFunc(GL.LEQUAL);

        const screenWidth = engine.width;
        const screenHeight = engine.height;

        const colorTarget = engine.createTexture2DBySize(screenWidth, screenHeight, {});
        const positionTarget = engine.createTexture2DBySize(screenWidth, screenHeight, {
            internalFormat: GL.RGBA16F
        });
        const normalTarget = engine.createTexture2DBySize(screenWidth, screenHeight, {
            internalFormat: GL.RGBA16F
        });
        const depthTarget = engine.createRenderbuffer(screenWidth, screenHeight, GL.DEPTH_COMPONENT16);
        this.colorGeoBuffer = engine.createFramebuffer()
            .colorTarget(0, colorTarget)
            .colorTarget(1, positionTarget)
            .colorTarget(2, normalTarget)
            .depthTarget(depthTarget);

        ///
        const ssaoTarget = engine.createTexture2DBySize(screenWidth, screenHeight, {
            internalFormat: GL.RGBA16F
        });
        this.ssaoBuffer = engine.createFramebuffer().colorTarget(0, ssaoTarget);

        //
        const sphere = engine.createSphere({ radius: 0.5 });
        const positions = engine.createVertexBuffer(GL.FLOAT, 3, sphere.positions);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, sphere.uvs);
        const normals = engine.createVertexBuffer(GL.FLOAT, 3, sphere.normals);
        const indices = engine.createIndexBuffer(GL.UNSIGNED_SHORT, 3, sphere.indices);

        this.modelMatrices = engine.createMatrixBuffer(GL.FLOAT_MAT4, this.modelMatrixData);
        const sphereArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .instanceAttributeBuffer(3, this.modelMatrices)
            .indexBuffer(indices);

        const quadPositions = engine.createVertexBuffer(GL.FLOAT, 2, new Float32Array([
            -1, 1,
            -1, -1,
            1, -1,
            -1, 1,
            1, -1,
            1, 1,
        ]));

        const quadArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, quadPositions);

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, NEAR, FAR);

        const viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(0, 0.8, 2);
        mat4.lookAt(viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        const lightPosition = vec3.fromValues(0.5, 1, 2);

        this.sceneUniforms = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ]).set(0, viewMatrix)
            .set(1, this.projMatrix)
            .set(2, eyePosition)
            .set(3, lightPosition)
            .update();

        const ssaoUniforms = engine.createUniformBuffer([
            GL.FLOAT,
            GL.FLOAT,
            GL.FLOAT_VEC2,
            GL.FLOAT_VEC2
        ]).set(0, SAMPLE_RADIUS)
            .set(1, BIAS)
            .set(2, ATTENUATION)
            .set(3, DEPTH_RANGE)
            .update();

        const numNoisePixels = screenWidth * screenHeight;
        const noiseTextureData = new Float32Array(numNoisePixels * 2);

        for (let i = 0; i < numNoisePixels; ++i) {
            const index = i * 2;
            noiseTextureData[index] = Math.random() * 2.0 - 1.0;
            noiseTextureData[index + 1] = Math.random() * 2.0 - 1.0;
        }

        this.noiseTexture = engine.createTexture2DByData(
            noiseTextureData,
            engine.gl.drawingBufferWidth,
            engine.gl.drawingBufferHeight,
            {
                internalFormat: GL.RG32F,
                minFilter: GL.LINEAR,
                magFilter: GL.LINEAR,
                wrapS: GL.CLAMP_TO_EDGE,
                wrapT: GL.CLAMP_TO_EDGE,
                generateMipmaps: false
            }
        );

        ////
        const texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        //
        this.colorGeoDrawcall = engine.createDrawCall(this.colorGeoProgram, sphereArray)
            .uniformBlock("SceneUniforms", this.sceneUniforms)
            .texture("uTexture", texture);

        this.ssaoDrawCall = engine.createDrawCall(this.ssaoProgram, quadArray)
            .uniformBlock("SSAOUniforms", ssaoUniforms)
            .texture("uPositionBuffer", this.colorGeoBuffer.colorAttachments[1] as WebGL2Texture)
            .texture("uNormalBuffer", this.colorGeoBuffer.colorAttachments[2] as WebGL2Texture)
            .texture("uNoiseBuffer", this.noiseTexture);

        this.aoBlendDrawCall = engine.createDrawCall(this.aoBlendProgram, quadArray)
            .texture("uColorBuffer", this.colorGeoBuffer.colorAttachments[0] as WebGL2Texture)
            .texture("uOcclusionBuffer", this.ssaoBuffer.colorAttachments[0] as WebGL2Texture);

        this.noSSAODrawCall = engine.createDrawCall(this.noSSAOProgram, quadArray)
            .texture("uColorBuffer", this.colorGeoBuffer.colorAttachments[0] as WebGL2Texture);

        this.rotationMatrix = mat4.create();

        //
        this.openUI();
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
        const spheres = this.spheres;
        for (let i = 0, len = spheres.length; i < len; ++i) {
            spheres[i].rotate[1] += 0.002;

            engine.xformMatrix(spheres[i].modelMatrix, spheres[i].translate, null, spheres[i].scale);
            mat4.fromYRotation(this.rotationMatrix, spheres[i].rotate[1]);
            mat4.multiply(spheres[i].modelMatrix, this.rotationMatrix, spheres[i].modelMatrix)

            this.modelMatrixData.set(spheres[i].modelMatrix, i * 16);
        }
        this.modelMatrices.data(this.modelMatrixData);
        ///
        engine.drawFramebuffer(this.colorGeoBuffer).clear();
        this.colorGeoDrawcall.draw();
        //const ssaoEnabled = true;
        if (this.ssaoEnabled) {
            engine.drawFramebuffer(this.ssaoBuffer).clear()
            this.ssaoDrawCall.draw();
            engine.defaultDrawFramebuffer().clear()
            this.aoBlendDrawCall.draw();
        } else {
            engine.defaultDrawFramebuffer().clear();
            this.noSSAODrawCall.draw();
        }
        return this;
    }

    public leave(): WebGL2DemoScene {
        //删除对象
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
        //还原状态
        const app = this.engine;
        app.noDepthTest().depthFunc(GL.LESS);
        //删除对象
        this.closeUI();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {

        const app = this.engine;

        this.colorGeoBuffer.resize(width, height);
        this.ssaoBuffer.resize(width, height);

        const numNoisePixels = app.gl.drawingBufferWidth * app.gl.drawingBufferHeight;
        const noiseTextureData = new Float32Array(numNoisePixels * 2);

        for (let i = 0; i < numNoisePixels; ++i) {
            const index = i * 2;
            noiseTextureData[index] = Math.random() * 2.0 - 1.0;
            noiseTextureData[index + 1] = Math.random() * 2.0 - 1.0;
        }

        this.noiseTexture.resize(app.gl.drawingBufferWidth, app.gl.drawingBufferHeight)
            .data(noiseTextureData);

        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        this.sceneUniforms.set(1, this.projMatrix).update();
        return this;
    }

    private openUI(): HTMLDivElement {
        if (this.ssaoEnableDiv) {
            return this.ssaoEnableDiv;
        }
        ///
        this.ssaoEnableDiv = document.createElement("div");
        document.body.appendChild(this.ssaoEnableDiv);
        const style = this.ssaoEnableDiv.style; //置顶，必须显示在最上面
        style.setProperty('position', 'absolute');
        style.setProperty('bottom', '20px');
        style.setProperty('right', '20px');
        style.setProperty('color', 'white');
        style.setProperty('z-index', '999');
        style.setProperty('top', '0');
        this.ssaoEnableDiv.innerText = 'ssao';
        ////
        const input = document.createElement("input"); 
        this.ssaoEnableDiv.appendChild(input); 
        input.setAttribute("type","checkbox");  
        input.setAttribute("id","inputid");  
        input.setAttribute("name","inputname");  
        input.setAttribute("value","inputvalue");  
        if (this.ssaoEnabled) {
            input.setAttribute("checked", "checked");  
        }
        ///
        const self = this;
        input.addEventListener("change", function() {
            self.ssaoEnabled = this.checked;
        });
        return this.ssaoEnableDiv;
    }

    private closeUI(): void {
        if (this.ssaoEnableDiv) {
            document.body.removeChild(this.ssaoEnableDiv);
            this.ssaoEnableDiv = null;
        }
    }
}