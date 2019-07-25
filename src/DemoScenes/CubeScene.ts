
class CubeScene extends WebGL2DemoScene {

    private projMatrix: Float32Array;
    private viewProjMatrix: Float32Array;


    private viewMatrix: Float32Array;
    // private mvpMatrix: Float32Array;
    private drawCall: WebGL2DrawCall;
    // private tex3DVsSource: string;
    // private tex3DFsSource: string;
    // private vsSource: string;
    // private fsSource: string;
    // private tex3DProgram: WebGL2Program;
    // 
    // 
    // private startTime: number = 0;

    private angleX: number = 0;
    private angleY: number = 0;


    private modelMatrix: Float32Array = mat4.create();
    private rotateXMatrix: Float32Array = mat4.create();
    private rotateYMatrix: Float32Array = mat4.create();


    private sceneUniformBuffer: WebGL2UniformBuffer;

    private vsSource: string;
    private fsSource: string;
    private program: WebGL2Program;
    private image: HTMLImageElement;
    //
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
        const engine = this.engine;
        const utils = engine;
        const app = engine;
        const PicoGL = GL;
        const canvas = engine.canvas;
        //utils.addTimerElement();

        // let canvas = document.getElementById("gl-canvas");
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;

        //let app = PicoGL.createApp(canvas)
        app
            .clearColor(0.5, 0.5, 0.5, 1.0)
            .depthTest();

        // let timer = app.createTimer();

        // SET UP PROGRAM
        // let vsSource =  document.getElementById("vertex-draw").text.trim();
        // let fsSource =  document.getElementById("fragment-draw").text.trim();

        // SET UP GEOMETRY
        let box = utils.createBox({ dimensions: [1.0, 1.0, 1.0] })
        let positions = app.createVertexBuffer(PicoGL.FLOAT, 3, box.positions);
        let uv = app.createVertexBuffer(PicoGL.FLOAT, 2, box.uvs);
        let normals = app.createVertexBuffer(PicoGL.FLOAT, 3, box.normals);

        let boxArray = app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)

        // SET UP UNIFORM BUFFER
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, canvas.width / canvas.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        let lightPosition = vec3.fromValues(1, 1, 0.5);

        this.sceneUniformBuffer = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4
        ])
            .set(0, this.viewProjMatrix)
            .set(1, eyePosition)
            .set(2, lightPosition)
            .update();

        // let modelMatrix = mat4.create();
        // let rotateXMatrix = mat4.create();
        // let rotateYMatrix = mat4.create();

        // let angleX = 0;
        // let angleY = 0;


        let texture = app.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: app.capbility('MAX_TEXTURE_ANISOTROPY')/*PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY */
        });

        // SET UP DRAW CALL
        this.drawCall = app.createDrawCall(this.program, boxArray)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .texture("tex", texture);
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-cube/cube.vs.glsl',
                'resource/assets/shader-cube/cube.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.vsSource = txts[0];
            this.fsSource = txts[1];

            // this.tex3DVsSource = txts[0];
            // this.tex3DFsSource = txts[1];
            // this.vsSource = txts[2];
            // this.fsSource = txts[3];
            //
            const programs = await this.engine.createPrograms(
                [this.vsSource, this.fsSource],
                // [this.vsSource, this.fsSource]
            );
            //
            // this.tex3DProgram = programs[0];
            this.program = programs[0];
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
        // this.drawCall.uniform("uTime", (performance.now() - this.startTime) / 1000);
        // this.engine.clear();
        // this.drawCall.draw();

        const app = this.engine;

        this.angleX += 0.01;
        this.angleY += 0.02;

        mat4.fromXRotation(this.rotateXMatrix, this.angleX);
        mat4.fromYRotation(this.rotateYMatrix, this.angleY);
        mat4.multiply(this.modelMatrix, this.rotateXMatrix, this.rotateYMatrix);

        this.drawCall.uniform("uModel", this.modelMatrix);

        app.clear();
        this.drawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        // this.drawCall.delete();
        // this.tex3DProgram.delete();
        // this.program.delete();
        // //
        // const engine = this.engine;
        // engine.noBlend().noCullBackfaces()



        this.drawCall.delete();
        // private tex3DVsSource: string;
        // private tex3DFsSource: string;
        // private vsSource: string;
        // private fsSource: string;
        // private tex3DProgram: WebGL2Program;
        // 
        // 
        // private startTime: number = 0;



        this.sceneUniformBuffer.delete();
        this.program.delete();
        const engine = this.engine;
        engine.noDepthTest();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        // mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        // mat4.multiply(this.mvpMatrix, this.projMatrix, this.viewMatrix);
        //const app = this.engine;

        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        return this;
    }
}