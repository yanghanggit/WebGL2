

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
    private readonly GRID_DIM = 6;
    private readonly NUM_SPHERES = this.GRID_DIM * this.GRID_DIM;
    private readonly hudViewport: number[] = [];
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
        this.application.profile.setTitle(Utils.getClassName(this));
        this.start().catch(e => {
            console.error(e);
        });
        return this;
    }

    private async start(): Promise<void> {
        await this.loadResource();
        this.createScene();
        this.openUI();
        this._ready = true;
    }
    
    private updateHudViewport(): number[] {
        this.hudViewport[0] = 0;
        this.hudViewport[1] = 0;
        this.hudViewport[2] = this.engine.width / 5;
        this.hudViewport[3] = this.engine.width / 5;
        return this.hudViewport;
    }

    private createScene(): void {
        ///
        const engine = this.engine;
        const hudViewport = this.updateHudViewport();
        engine.depthTest()
            .clearColor(0.5, 0.5, 0.5, 1.0)
            .noBlend()
            .blendFunc(GL.ONE_MINUS_SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA)
            .noScissorTest()
            .scissor(hudViewport[0], hudViewport[1], hudViewport[2], hudViewport[3]);

        const sphereData = Utils.createSphere({ radius: 0.6 });

        const spherePositions = engine.createVertexBuffer(GL.FLOAT, 3, sphereData.positions);
        const sphereUVs = engine.createVertexBuffer(GL.FLOAT, 2, sphereData.uvs);
        const sphereNormals = engine.createVertexBuffer(GL.FLOAT, 3, sphereData.normals);
        const sphereIndices = engine.createIndexBuffer(GL.UNSIGNED_SHORT, 3, sphereData.indices);

        const sphereArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, spherePositions)
            .vertexAttributeBuffer(1, sphereUVs)
            .vertexAttributeBuffer(2, sphereNormals)
            .indexBuffer(sphereIndices)

        const boundingBoxData = engine.computeBoundingBox(sphereData.positions, { buildGeometry: true });
        const boundingBoxPositions = engine.createVertexBuffer(GL.FLOAT, 3, boundingBoxData.geometry.positions);
        const boundingBoxArray = engine.createVertexArray().vertexAttributeBuffer(0, boundingBoxPositions);

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.width / engine.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(0, 0, 5);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        const hudProjMatrix = mat4.create();
        mat4.perspective(hudProjMatrix, Math.PI / 2, engine.width / engine.height, 0.1, 10.0);

        const hudViewMatrix = mat4.create();
        const hudEyePosition = vec3.fromValues(0, 5, 0);
        mat4.lookAt(hudViewMatrix, hudEyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, -1));

        const hudViewProjMatrix = mat4.create();
        mat4.multiply(hudViewProjMatrix, hudProjMatrix, hudViewMatrix);

        const lightPosition = vec3.fromValues(1, 1, 40);
        this.sceneUniformBuffer = engine.createUniformBuffer([
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

        const GRID_DIM = this.GRID_DIM;
        const GRID_OFFSET = GRID_DIM / 2 - 0.5;
        const NUM_SPHERES = this.NUM_SPHERES;
        const spheres = this.spheres = new Array(NUM_SPHERES);
        for (let i = 0; i < NUM_SPHERES; ++i) {
            const x = Math.floor(i / GRID_DIM) - GRID_OFFSET;
            const z = i % GRID_DIM - GRID_OFFSET;
            spheres[i] = {
                rotate: [0, 0, 0],
                translate: [x, 0, z],
                modelMatrix: mat4.create(),
                vertexArray: sphereArray,
                boundingBoxVertexArray: boundingBoxArray,
                mainDrawCall: engine.createDrawCall(this.drawProgram, sphereArray)
                    .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
                    .texture("tex", texture),
                boundingBoxDrawCall: engine.createDrawCall(this.boundingBoxProgram, boundingBoxArray)
                    .uniformBlock("SceneUniforms", this.sceneUniformBuffer),
                hudDrawCall: engine.createDrawCall(this.hudProgram, sphereArray)
                    .uniform("uViewProj", hudViewProjMatrix),
                query: engine.createQuery(GL.ANY_SAMPLES_PASSED_CONSERVATIVE),
                occluded: false,
            };
            Utils.xformMatrix(spheres[i].modelMatrix, spheres[i].translate);
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
        engine.viewport(0, 0, engine.width, engine.height)
            .clearColor(0.5, 0.5, 0.5, 1)
            .depthTest()
            .colorMask(true, true, true, true)
            .depthMask(true)
            .clear();

        const spheres = this.spheres;
        const occlusionCullingEnabled = this.occlusionCullingEnabled;
        if (occlusionCullingEnabled) {
            spheres.sort((a: any, b: any): number => {
                return this.depthSort(a, b);
            });
        }
        const rotationMatrix = this.rotationMatrix;
        for (let i = 0; i < this.NUM_SPHERES; ++i) {
            const sphere = spheres[i];
            sphere.rotate[1] += 0.003;
            Utils.xformMatrix(sphere.modelMatrix, sphere.translate, null, sphere.scale);
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
                    engine.colorMask(false, false, false, false).depthMask(false);
                    sphere.query.begin();
                    sphere.boundingBoxDrawCall.uniform("uModel", sphere.modelMatrix).draw();
                    sphere.query.end();
                }
            } else {
                sphere.occluded = false;
            }
            if (!sphere.occluded) {
                engine.colorMask(true, true, true, true).depthMask(true);
                sphere.mainDrawCall.uniform("uModel", sphere.modelMatrix).draw();
            }
        }
        ///
        const hudViewport = this.updateHudViewport();
        const showHUD = true;
        if (showHUD) {
            engine.viewport(hudViewport[0], hudViewport[1], hudViewport[2], hudViewport[3])
                .blend()
                .noDepthTest()
                .scissorTest()
                .colorMask(true, true, true, true)
                .depthMask(true)
                .clearColor(0.3, 0.3, 0.3, 1)
                .clear();
            const spheres = this.spheres;
            for (let i = 0; i < this.NUM_SPHERES; ++i) {
                const sphere = spheres[i];
                if (!sphere.occluded) {
                    sphere.hudDrawCall.uniform("uModel", sphere.modelMatrix).draw();
                }
            }
            engine.noBlend().noScissorTest();
        }
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.drawProgram.delete();
        this.boundingBoxProgram.delete();
        this.hudProgram.delete();
        this.sceneUniformBuffer.delete();
        this.engine.noDepthTest().noBlend().noScissorTest().viewport(0, 0, this.engine.width, this.engine.height);
        this.closeUI();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        //
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        //
        const hudViewport = this.updateHudViewport();
        this.engine.viewport(hudViewport[0], hudViewport[1], hudViewport[2], hudViewport[3]);
        return this;
    }


    private occlusionCullingEnabledDiv: HTMLDivElement;
    private occlusionCullingEnabled: boolean = true;
    private openUI(): HTMLDivElement {
        if (this.occlusionCullingEnabledDiv) {
            return this.occlusionCullingEnabledDiv;
        }
        ///
        this.occlusionCullingEnabledDiv = document.createElement("div");
        document.body.appendChild(this.occlusionCullingEnabledDiv);
        const style = this.occlusionCullingEnabledDiv.style; //置顶，必须显示在最上面
        style.setProperty('position', 'absolute');
        style.setProperty('bottom', '20px');
        style.setProperty('right', '20px');
        style.setProperty('color', 'white');
        style.setProperty('z-index', '999');
        style.setProperty('top', '0');
        this.occlusionCullingEnabledDiv.innerText = 'OcclusionCulling';
        ////
        const input = document.createElement("input");
        this.occlusionCullingEnabledDiv.appendChild(input);
        input.setAttribute("type", "checkbox");
        input.setAttribute("id", "inputid");
        input.setAttribute("name", "inputname");
        input.setAttribute("value", "inputvalue");
        if (this.occlusionCullingEnabled) {
            input.setAttribute("checked", "checked");
        }
        ///
        const self = this;
        input.addEventListener("change", function () {
            self.occlusionCullingEnabled = this.checked;
        });
        return this.occlusionCullingEnabledDiv;
    }

    private closeUI(): void {
        if (this.occlusionCullingEnabledDiv) {
            document.body.removeChild(this.occlusionCullingEnabledDiv);
            this.occlusionCullingEnabledDiv = null;
        }
    }
}