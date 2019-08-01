
class OcclusionScene extends WebGL2DemoScene {
    //
    private drawVsSource: string;
    private drawFsSource: string;
    private boundingBoxVSource: string;
    private boundingBoxFSource: string;
    private hudVSSource: string;
    private hudFSSource: string;
    private image: HTMLImageElement;
    private sortPositionA: Float32Array = vec4.create();
    private sortPositionB: Float32Array = vec4.create();
    private sortModelView: Float32Array = mat4.create();
    private viewMatrix: Float32Array = mat4.create();
    private rotationMatrix: Float32Array = mat4.create();
    private projMatrix: Float32Array = mat4.create();
    private spheres: any[];
    private viewProjMatrix: Float32Array = mat4.create();
    //
    private drawProgram: WebGL2Program;
    private boundingBoxProgram: WebGL2Program;
    private hudProgram: WebGL2Program;
    private sceneUniformBuffer: WebGL2UniformBuffer;
    //
    private depthSort(a: any, b: any): number {
        //
        const sortPositionA = this.sortPositionA;
        const sortPositionB = this.sortPositionB;
        const sortModelView = this.sortModelView;
        const viewMatrix = this.viewMatrix;
        //
        vec4.set(sortPositionA, a.translate[0], a.translate[1], a.translate[2], 1.0);
        vec4.set(sortPositionB, b.translate[0], b.translate[1], b.translate[2], 1.0);
        mat4.mul(sortModelView, viewMatrix, a.modelMatrix);
        vec4.transformMat4(sortPositionA, sortPositionA, sortModelView);
        mat4.mul(sortModelView, viewMatrix, b.modelMatrix);
        vec4.transformMat4(sortPositionB, sortPositionB, sortModelView);
        return sortPositionB[2] - sortPositionA[2];
    }

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
        ///
        const engine = this.engine;
        const app = engine;
        const utils = engine;
        const PicoGL = GL;
       

        let hudViewport = [
            0,
            0,
            app.width / 5,
            app.height / 5
        ];
        app.depthTest()
            .clearColor(0.5, 0.5, 0.5, 1.0)
            .noBlend()
            .blendFunc(PicoGL.ONE_MINUS_SRC_ALPHA, PicoGL.ONE_MINUS_SRC_ALPHA)
            .noScissorTest()
            .scissor(hudViewport[0], hudViewport[1], hudViewport[2], hudViewport[3]);

        let sphereData = utils.createSphere({ radius: 0.6 });

        let spherePositions = app.createVertexBuffer(PicoGL.FLOAT, 3, sphereData.positions);
        let sphereUVs = app.createVertexBuffer(PicoGL.FLOAT, 2, sphereData.uvs);
        let sphereNormals = app.createVertexBuffer(PicoGL.FLOAT, 3, sphereData.normals);
        let sphereIndices = app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, sphereData.indices);

        let sphereArray = app.createVertexArray()
            .vertexAttributeBuffer(0, spherePositions)
            .vertexAttributeBuffer(1, sphereUVs)
            .vertexAttributeBuffer(2, sphereNormals)
            .indexBuffer(sphereIndices)

        let boundingBoxData = utils.computeBoundingBox(sphereData.positions, { buildGeometry: true });
        let boundingBoxPositions = app.createVertexBuffer(PicoGL.FLOAT, 3, boundingBoxData.geometry.positions);
        let boundingBoxArray = app.createVertexArray().vertexAttributeBuffer(0, boundingBoxPositions);


        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, app.width / app.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(0, 0, 5);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        // HUD
        let hudProjMatrix = mat4.create();
        mat4.perspective(hudProjMatrix, Math.PI / 2, app.width / app.height, 0.1, 10.0);

        let hudViewMatrix = mat4.create();
        let hudEyePosition = vec3.fromValues(0, 5, 0);
        mat4.lookAt(hudViewMatrix, hudEyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, -1));

        let hudViewProjMatrix = mat4.create();
        mat4.multiply(hudViewProjMatrix, hudProjMatrix, hudViewMatrix);

        let lightPosition = vec3.fromValues(1, 1, 40);
        this.sceneUniformBuffer = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4
        ]).set(0, this.viewProjMatrix)
            .set(1, eyePosition)
            .set(2, lightPosition)
            .update();

        let texture = app.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: app.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        const GRID_DIM = 6;
        const GRID_OFFSET = GRID_DIM / 2 - 0.5;
        const NUM_SPHERES = GRID_DIM * GRID_DIM;
        const spheres = this.spheres = new Array(NUM_SPHERES);

        for (let i = 0; i < NUM_SPHERES; ++i) {
            let x = Math.floor(i / GRID_DIM) - GRID_OFFSET;
            let z = i % GRID_DIM - GRID_OFFSET;

            spheres[i] = {
                rotate: [0, 0, 0],
                translate: [x, 0, z],
                modelMatrix: mat4.create(),

                vertexArray: sphereArray,
                boundingBoxVertexArray: boundingBoxArray,

                mainDrawCall: app.createDrawCall(this.drawProgram, sphereArray)
                    .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
                    .texture("tex", texture),
                boundingBoxDrawCall: app.createDrawCall(this.boundingBoxProgram, boundingBoxArray)
                    .uniformBlock("SceneUniforms", this.sceneUniformBuffer),
                hudDrawCall: app.createDrawCall(this.hudProgram, sphereArray)
                    .uniform("uViewProj", hudViewProjMatrix),
                query: app.createQuery(PicoGL.ANY_SAMPLES_PASSED_CONSERVATIVE),
                occluded: false,

            };

            utils.xformMatrix(spheres[i].modelMatrix, spheres[i].translate);
        }
    }

    private async loadResource(): Promise<void> {

        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-occlusion/draw.vs.glsl',
                'resource/assets/shader-occlusion/draw.fs.glsl',
                'resource/assets/shader-occlusion/boundingBox.vs.glsl',
                'resource/assets/shader-occlusion/boundingBox.fs.glsl',
                'resource/assets/shader-occlusion/hud.vs.glsl',
                'resource/assets/shader-occlusion/hud.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.drawVsSource = txts[0];
            this.drawFsSource = txts[1];
            this.boundingBoxVSource = txts[2];
            this.boundingBoxFSource = txts[3];
            this.hudVSSource = txts[4];
            this.hudFSSource = txts[5];
            //
            const programs = await this.engine.createPrograms(
                [this.drawVsSource, this.drawFsSource],
                [this.boundingBoxVSource, this.boundingBoxFSource],
                [this.hudVSSource, this.hudFSSource]
            );
            this.drawProgram = programs[0];
            this.boundingBoxProgram = programs[1];
            this.hudProgram = programs[2];
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
        const utils = app;
        const spheres = this.spheres;

        let occlusionCullingEnabled = true;

        const GRID_DIM = 6;
        const NUM_SPHERES = GRID_DIM * GRID_DIM;

        if (occlusionCullingEnabled) {
            spheres.sort((a: any, b: any): number => {
                return this.depthSort(a, b);
            });
        }

        app.viewport(0, 0, app.width, app.height)
            .clearColor(0.5, 0.5, 0.5, 1)
            .depthTest()
            .colorMask(true, true, true, true)
            .depthMask(true)
            .clear();

        const rotationMatrix = this.rotationMatrix;
        for (let i = 0; i < NUM_SPHERES; ++i) {
            const sphere = spheres[i];
            sphere.rotate[1] += 0.003;
            utils.xformMatrix(sphere.modelMatrix, sphere.translate, null, sphere.scale);
            mat4.fromYRotation(rotationMatrix, sphere.rotate[1]);
            mat4.multiply(sphere.modelMatrix, rotationMatrix, sphere.modelMatrix);

            //
            if (occlusionCullingEnabled) {
                if (sphere.query.ready()) {
                    sphere.occluded = sphere.query.result === 0;
                    if (sphere.occluded) {
                    }
                }
                if (!sphere.query.active) {
                    app.colorMask(false, false, false, false).depthMask(false);
                    sphere.query.begin();
                    sphere.boundingBoxDrawCall.uniform("uModel", sphere.modelMatrix).draw();
                    sphere.query.end();
                }
            } else {
                sphere.occluded = false;
            }
            if (!sphere.occluded) {
                app.colorMask(true, true, true, true).depthMask(true);
                sphere.mainDrawCall.uniform("uModel", sphere.modelMatrix).draw();
            }
        }
        const hudViewport = [
            0,
            0,
            app.width / 5,
            app.height / 5
        ];
        const showHUD = true;
        if (showHUD) {
            app.viewport(hudViewport[0], hudViewport[1], hudViewport[2], hudViewport[3])
                .blend()
                .noDepthTest()
                .scissorTest()
                .colorMask(true, true, true, true)
                .depthMask(true)
                .clearColor(0.3, 0.3, 0.3, 1)
                .clear();
            const spheres = this.spheres;
            for (let i = 0; i < NUM_SPHERES; ++i) {
                const sphere = spheres[i];
                if (!sphere.occluded) {
                    sphere.hudDrawCall.uniform("uModel", sphere.modelMatrix).draw();
                }
            }
            app.noBlend().noScissorTest();
        }
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.drawProgram.delete();
        this.boundingBoxProgram.delete();
        this.hudProgram.delete();
        this.sceneUniformBuffer.delete();
        const engine = this.engine;
        engine.noDepthTest().noBlend().noScissorTest();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        const app = this.engine;
        const hudViewport = [
            0,
            0,
            app.width / 5,
            app.height / 5
        ];
        this.engine.viewport(hudViewport[0], hudViewport[1], hudViewport[2], hudViewport[3]);
        return this;
    }
}