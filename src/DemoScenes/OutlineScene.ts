
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
        this.application.profile.setTitle(Utils.getClassName(this));
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

        const NUM_SPHERES = 32;
        const NUM_PER_ROW = 8;
        const SPHERE_RADIUS = 0.6;
        const NEAR = 0.1;
        const FAR = 10.0;

        this.spheres = new Array(NUM_SPHERES);
        this.modelMatrixData = new Float32Array(NUM_SPHERES * 16);

        const spheres = this.spheres;
        for (let i = 0; i < NUM_SPHERES; ++i) {
            let angle = 2 * Math.PI * (i % NUM_PER_ROW) / NUM_PER_ROW;
            let x = Math.sin(angle) * SPHERE_RADIUS;
            let y = Math.floor(i / NUM_PER_ROW) / (NUM_PER_ROW / 4) - 0.75;
            let z = Math.cos(angle) * SPHERE_RADIUS;
            spheres[i] = {
                scale: [0.8, 0.8, 0.8],
                rotate: [0, 0, 0],
                translate: [x, y, z],
                modelMatrix: mat4.create()
            };
        }
        //
        engine.clearColor(0.5, 0.5, 0.5, 1.0)
            .clearMask(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT | GL.STENCIL_BUFFER_BIT)
            .depthFunc(GL.LEQUAL)
            .stencilTest()
            .stencilOp(GL.KEEP, GL.KEEP, GL.REPLACE);

        const sphere = Utils.createSphere({ radius: 0.5 });
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

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, NEAR, FAR);

        this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(0, 0.8, 2);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        let lightPosition = vec3.fromValues(0.5, 1, 2);
        this.sceneUniforms = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ]).set(0, this.viewProjMatrix)
            .set(1, eyePosition)
            .set(2, lightPosition)
            .update();


        const texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        this.mainDrawcall = engine.createDrawCall(this.mainProgram, sphereArray)
            .uniformBlock("SceneUniforms", this.sceneUniforms)
            .texture("uTexture", texture);

        this.outlineDrawcall = engine.createDrawCall(this.outlineProgram, sphereArray)
            .uniformBlock("SceneUniforms", this.sceneUniforms);

        this.rotationMatrix = mat4.create();
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
        const spheres = this.spheres;
        for (let i = 0, len = spheres.length; i < len; ++i) {
            spheres[i].rotate[1] += 0.002;

            Utils.xformMatrix(spheres[i].modelMatrix, spheres[i].translate, null, spheres[i].scale);
            mat4.fromYRotation(this.rotationMatrix, spheres[i].rotate[1]);
            mat4.multiply(spheres[i].modelMatrix, this.rotationMatrix, spheres[i].modelMatrix)

            this.modelMatrixData.set(spheres[i].modelMatrix, i * 16);
        }

        this.modelMatrices.data(this.modelMatrixData);

        engine.clear()
            .depthTest()
            .stencilFunc(GL.ALWAYS, 1, 0xFF)
            .stencilMask(0xFFFF);

        this.mainDrawcall.draw();

        engine.noDepthTest()
            .stencilFunc(GL.NOTEQUAL, 1, 0xFF)
            .stencilMask(0);

        this.outlineDrawcall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.mainDrawcall.delete();
        this.outlineDrawcall.delete();
        this.mainProgram.delete();
        this.outlineProgram.delete();
        this.sceneUniforms.delete();
        this.modelMatrices.delete();
        const engine = this.engine;
        engine.noDepthTest().noStencilTest();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniforms.set(0, this.viewProjMatrix).update();
        return this;
    }
}