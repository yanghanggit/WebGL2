

interface OITSceneSphereTransform {
    scale: Float32Array,
    rotate: Float32Array,
    translate: Float32Array,
    modelMatrix: Float32Array
}

class OITScene extends WebGL2DemoScene {

    private accumVsSource: string;
    private accumFsSource: string;
    private blendVsSource: string;
    private blendFsSource: string;
    private accumBuffer: WebGL2Framebuffer;
    private viewProjMatrix: Float32Array;
    private projMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private sceneUniforms: WebGL2UniformBuffer;
    private image: HTMLImageElement;
    private accumProgram: WebGL2Program;
    private blendProgram: WebGL2Program;
    private accumDrawCall: WebGL2DrawCall;
    private blendDrawCall: WebGL2DrawCall;
    private rotationMatrix: Float32Array = mat4.create();
    private spheresTransform: OITSceneSphereTransform[] = [];
    private modelMatrixData: Float32Array;
    private modelMatrices: WebGL2VertexBuffer;

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
        //
        const engine = this.engine;
        engine.clearColor(0.5, 0.5, 0.5, 1.0)
            .blend()
            .depthMask(false);
        //
        const NUM_SPHERES = 32;
        const NUM_PER_ROW = 8;
        const RADIUS = 0.6;
        const spheresTransform = this.spheresTransform = new Array(NUM_SPHERES);
        const sphereColorData = new Uint8Array(NUM_SPHERES * 4);
        const modelMatrixData = this.modelMatrixData = new Float32Array(NUM_SPHERES * 16);
        for (let i = 0; i < NUM_SPHERES; ++i) {
            const angle = 2 * Math.PI * (i % NUM_PER_ROW) / NUM_PER_ROW;
            const x = Math.sin(angle) * RADIUS;
            const y = Math.floor(i / NUM_PER_ROW) / (NUM_PER_ROW / 4) - 0.75;
            const z = Math.cos(angle) * RADIUS;
            spheresTransform[i] = {
                scale: vec3.fromValues(0.8, 0.8, 0.8),
                rotate: vec3.fromValues(0, 0, 0),
                translate: vec3.fromValues(x, y, z),
                modelMatrix: mat4.create()
            } as OITSceneSphereTransform;
            sphereColorData.set(vec4.fromValues(
                Math.floor(Math.sqrt(Math.random()) * 256),
                Math.floor(Math.sqrt(Math.random()) * 256),
                Math.floor(Math.sqrt(Math.random()) * 256),
                128
            ), i * 4);
        }
        //
        const NEAR = 0.1;
        const FAR = 10.0;
        const projMatrix = this.projMatrix = mat4.create();
        mat4.perspective(projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, NEAR, FAR);
        const viewMatrix = this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(0, 0.8, 2);
        mat4.lookAt(viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
        const viewProjMatrix = this.viewProjMatrix = mat4.create();
        mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);
        //
        const sphere = engine.createSphere({ radius: 0.5 } as CreateSphereModelOptions);
        const positions = engine.createVertexBuffer(GL.FLOAT, 3, sphere.positions);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, sphere.uvs);
        const normals = engine.createVertexBuffer(GL.FLOAT, 3, sphere.normals);
        const indices = engine.createIndexBuffer(GL.UNSIGNED_SHORT, 3, sphere.indices);
        const colors = engine.createVertexBuffer(GL.UNSIGNED_BYTE, 4, sphereColorData);
        const modelMatrices = this.modelMatrices = engine.createMatrixBuffer(GL.FLOAT_MAT4, modelMatrixData);
        const sphereArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .instanceAttributeBuffer(3, colors, { normalized: true })
            .instanceAttributeBuffer(4, modelMatrices)
            .indexBuffer(indices);
        this.sceneUniforms = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ]).set(0, viewProjMatrix).set(1, eyePosition).set(2, vec3.fromValues(0.5, 1, 2)).update();
        //
        const texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });
        this.accumDrawCall = engine.createDrawCall(this.accumProgram, sphereArray)
            .uniformBlock("SceneUniforms", this.sceneUniforms)
            .texture("uTexture", texture);
        //
        const accumulateTarget = engine.createTexture2DBySize(engine.width, engine.height, {
            internalFormat: GL.RGBA16F
        });
        const accumulateAlphaTarget = engine.createTexture2DBySize(engine.width, engine.height, {
            internalFormat: GL.RGBA16F
        });
        this.accumBuffer = engine.createFramebuffer()
            .colorTarget(0, accumulateTarget)
            .colorTarget(1, accumulateAlphaTarget);
        const quadPositions = engine.createVertexBuffer(GL.FLOAT, 2, new Float32Array([
            -1, 1,
            -1, -1,
            1, -1,
            -1, 1,
            1, -1,
            1, 1,
        ]));
        const quadArray = engine.createVertexArray().vertexAttributeBuffer(0, quadPositions);
        this.blendDrawCall = engine.createDrawCall(this.blendProgram, quadArray)
            .texture("uAccumulate", this.accumBuffer.colorAttachments[0])
            .texture("uAccumulateAlpha", this.accumBuffer.colorAttachments[1]);
    }

    private async loadResource(): Promise<void> {
        try {
            const ress: string[] = [
                'resource/assets/vertex-accum.vertex.glsl',
                'resource/assets/fragment-accum.fragment.glsl',
                'resource/assets/vertex-quad.vertex.glsl',
                'resource/assets/fragment-blend.fragment.glsl'
            ];
            //
            const txts = await this.engine.loadText(ress);
            this.accumVsSource = txts[0];
            this.accumFsSource = txts[1];
            this.blendVsSource = txts[2];
            this.blendFsSource = txts[3];
            //
            const programs = await this.engine.createPrograms([this.accumVsSource, this.accumFsSource], [this.blendVsSource, this.blendFsSource]);
            this.accumProgram = programs[0];
            this.blendProgram = programs[1];
            //
            const images = await this.engine.loadImages(["resource/assets/bg.jpg"]);//(["resource/assets/webgl-logo.png"]);
            this.image = images[0];
        }
        catch (e) {
            console.error(e);
        }
    }

    public update(): WebGL2DemoScene {
        if (!this._ready) {
            return this;
        }
        //
        const spheresTransform = this.spheresTransform;
        const modelMatrixData = this.modelMatrixData;
        const rotationMatrix = this.rotationMatrix;
        const engine = this.engine;
        //
        let sphereTrans: OITSceneSphereTransform = null;
        let modelMatrix: Float32Array = null;
        for (let i = 0, len = spheresTransform.length; i < len; ++i) {
            sphereTrans = spheresTransform[i];
            modelMatrix = sphereTrans.modelMatrix;
            sphereTrans.rotate[1] += 0.002;
            engine.xformMatrix(modelMatrix, sphereTrans.translate, null, sphereTrans.scale);
            mat4.fromYRotation(rotationMatrix, sphereTrans.rotate[1]);
            mat4.multiply(modelMatrix, rotationMatrix, modelMatrix)
            modelMatrixData.set(modelMatrix, i * 4 * 4);
        }
        this.modelMatrices.data(modelMatrixData);
        //
        engine.drawFramebuffer(this.accumBuffer)
            .blendFuncSeparate(GL.ONE, GL.ONE, GL.ZERO, GL.ONE_MINUS_SRC_ALPHA)
            .clear();
        this.accumDrawCall.draw();
        //
        engine.defaultDrawFramebuffer()
            .blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA)
            .clear();
        this.blendDrawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.accumBuffer.delete();
        this.sceneUniforms.delete();
        this.accumProgram.delete();
        this.blendProgram.delete();
        this.modelMatrices.delete();
        const engine = this.engine;
        engine.noBlend().depthMask(true);
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        this.accumBuffer.resize(width, height);
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniforms.set(0, this.viewProjMatrix).update();
        return this;
    }
}