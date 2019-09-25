

class ClothScene extends WebGL2DemoScene {

    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private projMatrix: Float32Array;
    private sceneUniformBuffer: WebGL2UniformBuffer;
    private updateForceProgram: WebGL2Program;
    private updateConstraintProgram: WebGL2Program;
    private updateCollisionProgram: WebGL2Program;
    private updateNormalProgram: WebGL2Program;
    private ballProgram: WebGL2Program;
    private clothProgram: WebGL2Program;
    private image: HTMLImageElement;
    private onMouseMove: (event: MouseEvent) => void;
    private positionTextureA: WebGL2Texture;
    private oldPositionTextureA: WebGL2Texture;
    private positionTextureB: WebGL2Texture;
    private oldPositionTextureB: WebGL2Texture;
    private updateForceFramebuffer: WebGL2Framebuffer;
    private updateFramebuffer: WebGL2Framebuffer;
    private updateForceDrawCall: WebGL2DrawCall;
    private updateHorizontal1DrawCall: WebGL2DrawCall;
    private updateHorizontal2DrawCall: WebGL2DrawCall;
    private updateVertical1DrawCall: WebGL2DrawCall;
    private updateVertical2DrawCall: WebGL2DrawCall;
    private updateShear1DrawCall: WebGL2DrawCall;
    private updateShear2DrawCall: WebGL2DrawCall;
    private updateShear3DrawCall: WebGL2DrawCall;
    private updateShear4DrawCall: WebGL2DrawCall;
    private updateCollisionDrawCall: WebGL2DrawCall;
    private updateNormalDrawCall: WebGL2DrawCall;
    private clothDrawCall: WebGL2DrawCall;
    private ballDrawCall: WebGL2DrawCall;
    private targetZ: number = 0;
    private targetY: number = 0;
    private ballPosition: Float32Array;
    private ballUniforms: WebGL2UniformBuffer;
    private normalTexture: WebGL2Texture;

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

        const engine = this.engine;
        engine.clearColor(0.5, 0.5, 0.5, 1.0);
        engine.depthTest();

        const DATA_TEXTURE_DIM = 60;
        const NUM_PARTICLES = DATA_TEXTURE_DIM * DATA_TEXTURE_DIM;
        const STRUCTURAL_REST = 1 / DATA_TEXTURE_DIM;
        const SHEAR_REST = Math.sqrt(2 * STRUCTURAL_REST * STRUCTURAL_REST);
        const BALL_RADIUS = 0.15;

        const forceTarget1 = engine.createTexture2DBySize(DATA_TEXTURE_DIM, DATA_TEXTURE_DIM, {
            internalFormat: GL.RGBA32F
        });
        const forceTarget2 = engine.createTexture2DBySize(DATA_TEXTURE_DIM, DATA_TEXTURE_DIM, {
            internalFormat: GL.RGBA32F
        });

        this.updateForceFramebuffer = engine.createFramebuffer()
            .colorTarget(0, forceTarget1)
            .colorTarget(1, forceTarget2);

        const updateTarget = engine.createTexture2DBySize(DATA_TEXTURE_DIM, DATA_TEXTURE_DIM, {
            internalFormat: GL.RGBA32F
        });

        this.updateFramebuffer = engine.createFramebuffer()
            .colorTarget(0, updateTarget);

        const clothPositionData = new Float32Array(NUM_PARTICLES * 4);
        const clothNormalData = new Float32Array(NUM_PARTICLES * 4);
        const uvData = new Float32Array(NUM_PARTICLES * 2);
        const dataTextureIndex = new Int16Array(NUM_PARTICLES * 2);
        const indexData = new Uint16Array((DATA_TEXTURE_DIM - 1) * (DATA_TEXTURE_DIM - 1) * 6);

        let indexI = 0;
        for (let i = 0; i < NUM_PARTICLES; ++i) {
            const vec4i = i * 4;
            const vec2i = i * 2;

            const x = (i % DATA_TEXTURE_DIM);
            const y = Math.floor(i / DATA_TEXTURE_DIM);

            const u = x / DATA_TEXTURE_DIM;
            const v = y / DATA_TEXTURE_DIM;

            clothPositionData[vec4i] = u - 0.5;
            clothPositionData[vec4i + 1] = v + 0.8;

            clothNormalData[vec4i + 2] = 1;

            uvData[vec2i] = u;
            uvData[vec2i + 1] = v;

            dataTextureIndex[vec2i] = (i % DATA_TEXTURE_DIM);
            dataTextureIndex[vec2i + 1] = Math.floor(i / DATA_TEXTURE_DIM);

            if (x < DATA_TEXTURE_DIM - 1 && y < DATA_TEXTURE_DIM - 1) {
                indexData[indexI] = i;
                indexData[indexI + 1] = i + DATA_TEXTURE_DIM;
                indexData[indexI + 2] = i + DATA_TEXTURE_DIM + 1;
                indexData[indexI + 3] = i;
                indexData[indexI + 4] = i + DATA_TEXTURE_DIM + 1;
                indexData[indexI + 5] = i + 1;
                indexI += 6;
            }
        }

        this.positionTextureA = engine.createTexture2DByData(clothPositionData, DATA_TEXTURE_DIM, DATA_TEXTURE_DIM, {
            internalFormat: GL.RGBA32F,
            minFilter: GL.NEAREST,
            magFilter: GL.NEAREST,
            wrapS: GL.CLAMP_TO_EDGE,
            wrapT: GL.CLAMP_TO_EDGE
        });

        this.oldPositionTextureA = engine.createTexture2DByData(clothPositionData, DATA_TEXTURE_DIM, DATA_TEXTURE_DIM, {
            internalFormat: GL.RGBA32F,
            minFilter: GL.NEAREST,
            magFilter: GL.NEAREST,
            wrapS: GL.CLAMP_TO_EDGE,
            wrapT: GL.CLAMP_TO_EDGE
        });

        this.positionTextureB = this.updateForceFramebuffer.colorAttachments[0] as WebGL2Texture;
        this.oldPositionTextureB = this.updateForceFramebuffer.colorAttachments[1] as WebGL2Texture;

        this.normalTexture = engine.createTexture2DByData(clothNormalData, DATA_TEXTURE_DIM, DATA_TEXTURE_DIM, {
            internalFormat: GL.RGBA32F,
            minFilter: GL.NEAREST,
            magFilter: GL.NEAREST,
            wrapS: GL.CLAMP_TO_EDGE,
            wrapT: GL.CLAMP_TO_EDGE
        });

        //
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

        // Cloth geometry for drawing
        const dataIndex = engine.createVertexBuffer(GL.SHORT, 2, dataTextureIndex);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, uvData);
        const indices = engine.createIndexBuffer(GL.UNSIGNED_SHORT, 3, indexData);

        const clothArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, dataIndex)
            .vertexAttributeBuffer(1, uv)
            .indexBuffer(indices);

        // Ball geometry
        const ballGeo = engine.createSphere({ radius: BALL_RADIUS });
        const ballPositions = engine.createVertexBuffer(GL.FLOAT, 3, ballGeo.positions);
        const ballNormals = engine.createVertexBuffer(GL.FLOAT, 3, ballGeo.normals);
        const ballIndices = engine.createIndexBuffer(GL.UNSIGNED_SHORT, 3, ballGeo.indices);

        const ballArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, ballPositions)
            .vertexAttributeBuffer(1, ballNormals)
            .indexBuffer(ballIndices);

        const updateHorizontal1Uniforms = engine.createUniformBuffer([
            GL.INT_VEC2,
            GL.INT,
            GL.FLOAT
        ])
            .set(0, new Int32Array([1, 0]))
            .set(1, 0)
            .set(2, STRUCTURAL_REST)
            .update();

        const updateHorizontal2Uniforms = engine.createUniformBuffer([
            GL.INT_VEC2,
            GL.INT,
            GL.FLOAT
        ])
            .set(0, new Int32Array([1, 0]))
            .set(1, 1)
            .set(2, STRUCTURAL_REST)
            .update();

        const updateVertical1Uniforms = engine.createUniformBuffer([
            GL.INT_VEC2,
            GL.INT,
            GL.FLOAT
        ])
            .set(0, new Int32Array([0, 1]))
            .set(1, 0)
            .set(2, STRUCTURAL_REST)
            .update();

        const updateVertical2Uniforms = engine.createUniformBuffer([
            GL.INT_VEC2,
            GL.INT,
            GL.FLOAT
        ])
            .set(0, new Int32Array([0, 1]))
            .set(1, 1)
            .set(2, STRUCTURAL_REST)
            .update();

        const updateShear1Uniforms = engine.createUniformBuffer([
            GL.INT_VEC2,
            GL.INT,
            GL.FLOAT
        ])
            .set(0, new Int32Array([1, 1]))
            .set(1, 0)
            .set(2, SHEAR_REST)
            .update();

        const updateShear2Uniforms = engine.createUniformBuffer([
            GL.INT_VEC2,
            GL.INT,
            GL.FLOAT
        ])
            .set(0, new Int32Array([1, 1]))
            .set(1, 1)
            .set(2, SHEAR_REST)
            .update();

        const updateShear3Uniforms = engine.createUniformBuffer([
            GL.INT_VEC2,
            GL.INT,
            GL.FLOAT
        ])
            .set(0, new Int32Array([1, -1]))
            .set(1, 0)
            .set(2, SHEAR_REST)
            .update();

        const updateShear4Uniforms = engine.createUniformBuffer([
            GL.INT_VEC2,
            GL.INT,
            GL.FLOAT
        ])
            .set(0, new Int32Array([1, -1]))
            .set(1, 1)
            .set(2, SHEAR_REST)
            .update();

        // Draw uniforms
        this.ballPosition = vec3.fromValues(0, 0.15, -0.8);
        this.ballUniforms = engine.createUniformBuffer([
            GL.FLOAT_VEC4,
            GL.FLOAT
        ])
            .set(0, this.ballPosition)
            .set(1, BALL_RADIUS)
            .update();

        const ballColor = new Uint8Array([0, 0, 0]);
        const ballTexture = engine.createTexture2DByData(ballColor, 1, 1, { internalFormat: GL.RGB8 });

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 3.0);

        this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(0.5, 0.7, 1.2);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0.1, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        const lightPosition = vec3.fromValues(1, 1, 1);

        this.sceneUniformBuffer = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4
        ]).set(0, this.viewProjMatrix)
            .set(1, lightPosition)
            .update();

        //
        this.targetZ = 0;
        this.targetY = 0;
        this.onMouseMove = (event: MouseEvent): void => {
            this.targetZ = -((event.clientX / engine.canvas.width) * 2 - 1);
            this.targetY = ((engine.canvas.height - event.clientY) / engine.canvas.height) * 2 - 1;
        };
        engine.canvas.addEventListener("mousemove", this.onMouseMove);

        const texture = engine.createTexture2DByImage(this.image, {
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        this.updateForceDrawCall = engine.createDrawCall(this.updateForceProgram, quadArray)
            .texture("uPositionBuffer", this.positionTextureA)
            .texture("uNormalBuffer", this.normalTexture);

        // Structural constraints
        this.updateHorizontal1DrawCall = engine.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateHorizontal1Uniforms);

        this.updateHorizontal2DrawCall = engine.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateHorizontal2Uniforms);

        this.updateVertical1DrawCall = engine.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateVertical1Uniforms);

        this.updateVertical2DrawCall = engine.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateVertical2Uniforms);

        this.updateShear1DrawCall = engine.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateShear1Uniforms);

        this.updateShear2DrawCall = engine.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateShear2Uniforms);

        this.updateShear3DrawCall = engine.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateShear3Uniforms);

        this.updateShear4DrawCall = engine.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateShear4Uniforms);

        this.updateCollisionDrawCall = engine.createDrawCall(this.updateCollisionProgram, quadArray)
            .uniformBlock("BallUniforms", this.ballUniforms);

        this.updateNormalDrawCall = engine.createDrawCall(this.updateNormalProgram, quadArray);

        this.clothDrawCall = engine.createDrawCall(this.clothProgram, clothArray)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .texture("uDiffuse", texture)
            .texture("uNormalBuffer", this.normalTexture);

        this.ballDrawCall = engine.createDrawCall(this.ballProgram, ballArray)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .uniformBlock("BallUniforms", this.ballUniforms)
            .texture("uDiffuse", ballTexture);
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-cloth/quad.vs.glsl',
                'resource/assets/shader-cloth/update-force.fs.glsl',
                'resource/assets/shader-cloth/update-constraint.fs.glsl',
                'resource/assets/shader-cloth/update-collision.fs.glsl',
                'resource/assets/shader-cloth/update-normal.fs.glsl',
                'resource/assets/shader-cloth/ball.vs.glsl',
                'resource/assets/shader-cloth/cloth.vs.glsl',
                'resource/assets/shader-cloth/phong.fs.glsl',
            ];
            //
            const txts = await this.engine.loadText(ress);
            const quadShader = txts[0];
            const updateForceFsSource = txts[1];
            const updateConstraintFsSource = txts[2];
            const updateCollisionFsSource = txts[3];
            const updateNormalFsSource = txts[4];
            const ballVsSource = txts[5];
            const clothVsSource = txts[6];
            const phongShader = txts[7];
            const programs = await this.engine.createPrograms(
                [quadShader, updateForceFsSource],
                [quadShader, updateConstraintFsSource],
                [quadShader, updateCollisionFsSource],
                [quadShader, updateNormalFsSource],
                [ballVsSource, phongShader],
                [clothVsSource, phongShader]
            );
            this.updateForceProgram = programs[0];
            this.updateConstraintProgram = programs[1];
            this.updateCollisionProgram = programs[2];
            this.updateNormalProgram = programs[3];
            this.ballProgram = programs[4];
            this.clothProgram = programs[5];
            //
            const texarrays: string[] = [
                'resource/assets/longmao.jpg',
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
        const CONSTRAINT_ITERATIONS = 20;
        const DATA_TEXTURE_DIM = 60;
        const BALL_RANGE = 0.9;
        let ballSpeed = 0.004;

        

        this.updateForceDrawCall.texture("uPositionBuffer", this.positionTextureA);
        this.updateForceDrawCall.texture("uOldPositionBuffer", this.oldPositionTextureA);
        this.updateForceFramebuffer.colorTarget(0, this.positionTextureB);
        this.updateForceFramebuffer.colorTarget(1, this.oldPositionTextureB);

        engine.viewport(0, 0, DATA_TEXTURE_DIM, DATA_TEXTURE_DIM);

        engine.drawFramebuffer(this.updateForceFramebuffer);
        this.updateForceDrawCall.draw();

        for (let i = 0; i < CONSTRAINT_ITERATIONS; ++i) {
            engine.drawFramebuffer(this.updateFramebuffer);

            this.updateFramebuffer.colorTarget(0, this.positionTextureA);
            this.updateHorizontal1DrawCall.texture("uPositionBuffer", this.positionTextureB).draw();

            this.updateFramebuffer.colorTarget(0, this.positionTextureB);
            this.updateHorizontal2DrawCall.texture("uPositionBuffer", this.positionTextureA).draw();

            this.updateFramebuffer.colorTarget(0, this.positionTextureA);
            this.updateVertical1DrawCall.texture("uPositionBuffer", this.positionTextureB).draw();

            this.updateFramebuffer.colorTarget(0, this.positionTextureB);
            this.updateVertical2DrawCall.texture("uPositionBuffer", this.positionTextureA).draw();

            this.updateFramebuffer.colorTarget(0, this.positionTextureA);
            this.updateShear1DrawCall.texture("uPositionBuffer", this.positionTextureB).draw();

            this.updateFramebuffer.colorTarget(0, this.positionTextureB);
            this.updateShear2DrawCall.texture("uPositionBuffer", this.positionTextureA).draw();

            this.updateFramebuffer.colorTarget(0, this.positionTextureA);
            this.updateShear3DrawCall.texture("uPositionBuffer", this.positionTextureB).draw();

            this.updateFramebuffer.colorTarget(0, this.positionTextureB);
            this.updateShear4DrawCall.texture("uPositionBuffer", this.positionTextureA).draw();
        }

        if (this.targetZ === 0) {
            this.ballPosition[2] += ballSpeed;

            if (this.ballPosition[2] > BALL_RANGE || this.ballPosition[2] < -BALL_RANGE) {
                ballSpeed *= -1;
            }

            this.ballUniforms.set(0, this.ballPosition).update();
        } else {
            const zDiff = this.targetZ - this.ballPosition[2];
            const yDiff = this.targetY - this.ballPosition[1];

            if (Math.abs(zDiff) > 0.001 || Math.abs(yDiff) > 0.001) {
                this.ballPosition[2] += zDiff * 0.02;
                this.ballPosition[1] += yDiff * 0.02;
                this.ballUniforms.set(0, this.ballPosition).update();
            }
        }

        this.updateFramebuffer.colorTarget(0, this.positionTextureA);
        this.updateCollisionDrawCall.texture("uPositionBuffer", this.positionTextureB).draw();

        this.updateFramebuffer.colorTarget(0, this.normalTexture);
        this.updateNormalDrawCall.texture("uPositionBuffer", this.positionTextureA).draw();

        this.clothDrawCall.texture("uPositionBuffer", this.positionTextureA);

        engine.defaultViewport().defaultDrawFramebuffer().clear();
        this.clothDrawCall.draw();
        this.ballDrawCall.draw();

        const temp = this.oldPositionTextureA;
        this.oldPositionTextureA = this.oldPositionTextureB;
        this.oldPositionTextureB = temp;
        return this;
    }

    public leave(): WebGL2DemoScene {

        this.updateForceProgram.delete();
        this.updateConstraintProgram.delete();
        this.updateCollisionProgram.delete();
        this.updateNormalProgram.delete();
        this.ballProgram.delete();
        this.clothProgram.delete();
        //
        this.engine.canvas.removeEventListener("mousemove", this.onMouseMove);
        this.onMouseMove = null;
        /////
        this.positionTextureA.delete();
        this.oldPositionTextureA.delete();
        this.positionTextureB.delete();
        this.oldPositionTextureB.delete();
        /////////
        this.updateForceFramebuffer.delete();
        this.updateFramebuffer.delete();
        ////////
        this.updateForceDrawCall.delete();
        this.updateHorizontal1DrawCall.delete();
        this.updateHorizontal2DrawCall.delete();
        this.updateVertical1DrawCall.delete();
        this.updateVertical2DrawCall.delete();
        this.updateShear1DrawCall.delete();
        this.updateShear2DrawCall.delete();
        this.updateShear3DrawCall.delete();
        this.updateShear4DrawCall.delete();
        this.updateCollisionDrawCall.delete();
        this.updateNormalDrawCall.delete();
        this.clothDrawCall.delete();
        this.ballDrawCall.delete();
        ////////
        this.ballUniforms.delete();
        this.normalTexture.delete();
        //
        this.engine.noDepthTest();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 3.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        return this;
    }
}