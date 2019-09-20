

//
// let targetZ = null;
// let targetY = null;
// canvas.addEventListener("mousemove", function(event) {
//     targetZ = -((event.clientX / canvas.width) * 2 - 1);
//     targetY = ((canvas.height - event.clientY) / canvas.height) * 2 - 1;
// });


class ClothScene extends WebGL2DemoScene {

    //
    // private vsSource: string;
    // private fsSource: string;
    // private program: WebGL2Program;
    // private drawCall: WebGL2DrawCall;
    // private angleX: number = 0;
    // private angleY: number = 0;
    // private texture: WebGL2Texture;
    // private modelMatrix: Float32Array;
    // private rotateXMatrix: Float32Array;
    // private rotateYMatrix: Float32Array;
    // private msaaFramebuffer: WebGL2Framebuffer;
    // private textureFramebuffer: WebGL2Framebuffer;

    ///
    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private projMatrix: Float32Array;
    private sceneUniformBuffer: WebGL2UniformBuffer;
    ////
    private updateForceProgram: WebGL2Program;
    private updateConstraintProgram: WebGL2Program;
    private updateCollisionProgram: WebGL2Program;
    private updateNormalProgram: WebGL2Program;
    private ballProgram: WebGL2Program;
    private clothProgram: WebGL2Program;
    private image: HTMLImageElement;



    private onMouseMove: (event: MouseEvent) => void;

    //
    public enter(): WebGL2DemoScene {
        // this.application.profile.setTitle(egret.getQualifiedClassName(this));
        // this.start().catch(e => {
        //     console.error(e);
        // });
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



        // let canvas = document.getElementById("gl-canvas");
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;
        const PicoGL = GL;
        const utils = this.engine;
        const canvas = this.engine.canvas;

        let app = this.engine;//PicoGL.createApp(canvas)
        app.clearColor(0.0, 0.0, 0.0, 1.0)
        app.depthTest();

        //let timer = app.createTimer();

        const CONSTRAINT_ITERATIONS = 20;
        const DATA_TEXTURE_DIM = 60;
        const NUM_PARTICLES = DATA_TEXTURE_DIM * DATA_TEXTURE_DIM;
        const STRUCTURAL_REST = 1 / DATA_TEXTURE_DIM;
        const SHEAR_REST = Math.sqrt(2 * STRUCTURAL_REST * STRUCTURAL_REST);
        const BALL_RADIUS = 0.15;
        const BALL_RANGE = 0.9;
        let ballSpeed = 0.004;

        ///////////////////
        // PROGRAMS
        ///////////////////

        // Generic quad vertex shader
        // let quadVsSource = document.getElementById("quad-vs").text.trim();
        // let quadShader = app.createShader(PicoGL.VERTEX_SHADER, quadVsSource);

        // Update wind and gravity forces
        // let updateForceFsSource = document.getElementById("update-force-fs").text.trim();

        // // Apply structural and shear constraints
        // let updateConstraintFsSource = document.getElementById("update-constraint-fs").text.trim();

        // // Check for collision with ball
        // let updateCollisionFsSource = document.getElementById("update-collision-fs").text.trim();
        // // Calculate normals
        // let updateNormalFsSource = document.getElementById("update-normal-fs").text.trim();


        // Generic phong shader used for drawing
        // let phongSource = document.getElementById("phong-fs").text.trim();
        // let phongShader = app.createShader(PicoGL.FRAGMENT_SHADER, phongSource);

        // // Draw ball
        // let ballVsSource = document.getElementById("ball-vs").text.trim();

        // // Draw cloth
        // let clothVsSource = document.getElementById("cloth-vs").text.trim();

        ////////////////////
        // FRAME BUFFERS
        ////////////////////

        // Store results of force update
        let forceTarget1 = app.createTexture2DBySize(DATA_TEXTURE_DIM, DATA_TEXTURE_DIM, {
            internalFormat: PicoGL.RGBA32F
        });
        let forceTarget2 = app.createTexture2DBySize(DATA_TEXTURE_DIM, DATA_TEXTURE_DIM, {
            internalFormat: PicoGL.RGBA32F
        });

        let updateForceFramebuffer = app.createFramebuffer(/*DATA_TEXTURE_DIM, DATA_TEXTURE_DIM*/)
            .colorTarget(0, forceTarget1)
            .colorTarget(1, forceTarget2);

        // Results of constraint satisfaction passes
        let updateTarget = app.createTexture2DBySize(DATA_TEXTURE_DIM, DATA_TEXTURE_DIM, {
            internalFormat: PicoGL.RGBA32F
        });

        let updateFramebuffer = app.createFramebuffer(/*DATA_TEXTURE_DIM, DATA_TEXTURE_DIM*/)
            .colorTarget(0, updateTarget);

        ///////////////////////////
        // CLOTH GEOMETRY DATA
        ///////////////////////////

        let clothPositionData = new Float32Array(NUM_PARTICLES * 4);
        let clothNormalData = new Float32Array(NUM_PARTICLES * 4);
        let uvData = new Float32Array(NUM_PARTICLES * 2);
        let dataTextureIndex = new Int16Array(NUM_PARTICLES * 2);
        let indexData = new Uint16Array((DATA_TEXTURE_DIM - 1) * (DATA_TEXTURE_DIM - 1) * 6);

        let indexI = 0;
        for (let i = 0; i < NUM_PARTICLES; ++i) {
            let vec4i = i * 4;
            let vec2i = i * 2;

            let x = (i % DATA_TEXTURE_DIM);
            let y = Math.floor(i / DATA_TEXTURE_DIM);

            let u = x / DATA_TEXTURE_DIM;
            let v = y / DATA_TEXTURE_DIM;

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

        ///////////////////////////
        // SIM DATA TEXTURES
        ///////////////////////////

        let positionTextureA = app.createTexture2DByData(clothPositionData, DATA_TEXTURE_DIM, DATA_TEXTURE_DIM, {
            internalFormat: PicoGL.RGBA32F,
            minFilter: PicoGL.NEAREST,
            magFilter: PicoGL.NEAREST,
            wrapS: PicoGL.CLAMP_TO_EDGE,
            wrapT: PicoGL.CLAMP_TO_EDGE
        });

        let oldPositionTextureA = app.createTexture2DByData(clothPositionData, DATA_TEXTURE_DIM, DATA_TEXTURE_DIM, {
            internalFormat: PicoGL.RGBA32F,
            minFilter: PicoGL.NEAREST,
            magFilter: PicoGL.NEAREST,
            wrapS: PicoGL.CLAMP_TO_EDGE,
            wrapT: PicoGL.CLAMP_TO_EDGE
        });

        let positionTextureB = updateForceFramebuffer.colorAttachments[0];
        let oldPositionTextureB = updateForceFramebuffer.colorAttachments[1];

        let normalTexture = app.createTexture2DByData(clothNormalData, DATA_TEXTURE_DIM, DATA_TEXTURE_DIM, {
            internalFormat: PicoGL.RGBA32F,
            minFilter: PicoGL.NEAREST,
            magFilter: PicoGL.NEAREST,
            wrapS: PicoGL.CLAMP_TO_EDGE,
            wrapT: PicoGL.CLAMP_TO_EDGE
        });

        /////////////////////////
        // GEOMETRY FOR DRAWING
        /////////////////////////

        // Quad for simulation passes
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

        // Cloth geometry for drawing
        let dataIndex = app.createVertexBuffer(PicoGL.SHORT, 2, dataTextureIndex);
        let uv = app.createVertexBuffer(PicoGL.FLOAT, 2, uvData);
        let indices = app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, indexData);

        let clothArray = app.createVertexArray()
            .vertexAttributeBuffer(0, dataIndex)
            .vertexAttributeBuffer(1, uv)
            .indexBuffer(indices);

        // Ball geometry
        let ballGeo = utils.createSphere({ radius: BALL_RADIUS });
        let ballPositions = app.createVertexBuffer(PicoGL.FLOAT, 3, ballGeo.positions);
        let ballNormals = app.createVertexBuffer(PicoGL.FLOAT, 3, ballGeo.normals);
        let ballIndices = app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, ballGeo.indices);

        let ballArray = app.createVertexArray()
            .vertexAttributeBuffer(0, ballPositions)
            .vertexAttributeBuffer(1, ballNormals)
            .indexBuffer(ballIndices);


        ////////////////
        // UNIFORMS
        ////////////////

        // Constraint uniforms
        let updateHorizontal1Uniforms = app.createUniformBuffer([
            PicoGL.INT_VEC2,
            PicoGL.INT,
            PicoGL.FLOAT
        ])
            .set(0, new Int32Array([1, 0]))
            .set(1, 0)
            .set(2, STRUCTURAL_REST)
            .update();

        let updateHorizontal2Uniforms = app.createUniformBuffer([
            PicoGL.INT_VEC2,
            PicoGL.INT,
            PicoGL.FLOAT
        ])
            .set(0, new Int32Array([1, 0]))
            .set(1, 1)
            .set(2, STRUCTURAL_REST)
            .update();

        let updateVertical1Uniforms = app.createUniformBuffer([
            PicoGL.INT_VEC2,
            PicoGL.INT,
            PicoGL.FLOAT
        ])
            .set(0, new Int32Array([0, 1]))
            .set(1, 0)
            .set(2, STRUCTURAL_REST)
            .update();

        let updateVertical2Uniforms = app.createUniformBuffer([
            PicoGL.INT_VEC2,
            PicoGL.INT,
            PicoGL.FLOAT
        ])
            .set(0, new Int32Array([0, 1]))
            .set(1, 1)
            .set(2, STRUCTURAL_REST)
            .update();

        let updateShear1Uniforms = app.createUniformBuffer([
            PicoGL.INT_VEC2,
            PicoGL.INT,
            PicoGL.FLOAT
        ])
            .set(0, new Int32Array([1, 1]))
            .set(1, 0)
            .set(2, SHEAR_REST)
            .update();

        let updateShear2Uniforms = app.createUniformBuffer([
            PicoGL.INT_VEC2,
            PicoGL.INT,
            PicoGL.FLOAT
        ])
            .set(0, new Int32Array([1, 1]))
            .set(1, 1)
            .set(2, SHEAR_REST)
            .update();

        let updateShear3Uniforms = app.createUniformBuffer([
            PicoGL.INT_VEC2,
            PicoGL.INT,
            PicoGL.FLOAT
        ])
            .set(0, new Int32Array([1, -1]))
            .set(1, 0)
            .set(2, SHEAR_REST)
            .update();

        let updateShear4Uniforms = app.createUniformBuffer([
            PicoGL.INT_VEC2,
            PicoGL.INT,
            PicoGL.FLOAT
        ])
            .set(0, new Int32Array([1, -1]))
            .set(1, 1)
            .set(2, SHEAR_REST)
            .update();

        // Draw uniforms
        let ballPosition = vec3.fromValues(0, 0.15, -0.8);
        let ballUniforms = app.createUniformBuffer([
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT
        ])
            .set(0, ballPosition)
            .set(1, BALL_RADIUS)
            .update();

        let ballColor = new Uint8Array([255, 20, 20]);
        let ballTexture = app.createTexture2DByData(ballColor, 1, 1, { internalFormat: PicoGL.RGB8 });

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, canvas.width / canvas.height, 0.1, 3.0);

        this.viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(0.5, 0.7, 1.2);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0.1, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        let lightPosition = vec3.fromValues(1, 1, 1);

        this. sceneUniformBuffer = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4
        ]).set(0, this.viewProjMatrix)
            .set(1, lightPosition)
            .update();

        let targetZ = 0;
        let targetY = 0;
        this.onMouseMove = (event: MouseEvent): void => {
            targetZ = -((event.clientX / canvas.width) * 2 - 1);
            targetY = ((canvas.height - event.clientY) / canvas.height) * 2 - 1;
            //console.log('targetZ = ' + targetZ + 'targetY = ' + targetY);
        };
        canvas.addEventListener("mousemove", this.onMouseMove);


        let texture = app.createTexture2DByImage(this.image, {
            maxAnisotropy: app.capbility('MAX_TEXTURE_ANISOTROPY')/*PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY*/
        });

        ///////////////
        // DRAW CALLS
        ///////////////

        // Update forces
        let updateForceDrawCall = app.createDrawCall(this.updateForceProgram, quadArray)
            .texture("uPositionBuffer", positionTextureA)
            .texture("uNormalBuffer", normalTexture);

        // Structural constraints
        let updateHorizontal1DrawCall = app.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateHorizontal1Uniforms);

        let updateHorizontal2DrawCall = app.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateHorizontal2Uniforms);

        let updateVertical1DrawCall = app.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateVertical1Uniforms);

        let updateVertical2DrawCall = app.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateVertical2Uniforms);

        // Shear constraints
        let updateShear1DrawCall = app.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateShear1Uniforms);

        let updateShear2DrawCall = app.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateShear2Uniforms);

        let updateShear3DrawCall = app.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateShear3Uniforms);

        let updateShear4DrawCall = app.createDrawCall(this.updateConstraintProgram, quadArray)
            .uniformBlock("ConstraintUniforms", updateShear4Uniforms);

        let updateCollisionDrawCall = app.createDrawCall(this.updateCollisionProgram, quadArray)
            .uniformBlock("BallUniforms", ballUniforms);

        let updateNormalDrawCall = app.createDrawCall(this.updateNormalProgram, quadArray);

        let clothDrawCall = app.createDrawCall(this.clothProgram, clothArray)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .texture("uDiffuse", texture)
            .texture("uNormalBuffer", normalTexture);

        let ballDrawCall = app.createDrawCall(this.ballProgram, ballArray)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .uniformBlock("BallUniforms", ballUniforms)
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
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 3.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        return this;
    }
}