
class ParticlesScene extends WebGL2DemoScene {

    ///
    private vsSource: string;
    private fsSource: string;
    ///
    private program: WebGL2Program;
    private drawCall1: WebGL2DrawCall;
    private drawCall2: WebGL2DrawCall;
    private currentDrawCall: WebGL2DrawCall;

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
        const app = this.engine;
        const utils = this.engine;
        const PicoGL = GL;
        const canvas = this.engine.canvas;


        // utils.addTimerElement();

        // let canvas = document.getElementById("gl-canvas");
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;

        //let app = PicoGL.createApp(canvas)
        app
            .clearColor(0.0, 0.0, 0.0, 1.0)
            .blend()
            .blendFunc(PicoGL.ONE, PicoGL.ONE_MINUS_SRC_ALPHA);

        // let timer = app.createTimer();

        // // PROGRAM
        // let vsSource = document.getElementById("main-vs").text.trim();
        // let fsSource = document.getElementById("main-fs").text.trim();

        // GEOMETRY DATA
        const NUM_PARTICLES = 200000;
        let positionData = new Float32Array(NUM_PARTICLES * 3);
        let colorData = new Uint8Array(NUM_PARTICLES * 3);

        for (let i = 0; i < NUM_PARTICLES; ++i) {
            let vec3i = i * 3;

            positionData[vec3i] = Math.random() * 2 - 1;
            positionData[vec3i + 1] = Math.random() * 2 - 1;
            positionData[vec3i + 2] = Math.random() * 2 - 1;

            colorData[vec3i] = Math.floor(Math.random() * 256);
            colorData[vec3i + 1] = Math.floor(Math.random() * 256);
            colorData[vec3i + 2] = Math.floor(Math.random() * 256);
        }

        // INPUT AND OUTPUT POSITION AND VELOCITY BUFFERS
        let positions1 = app.createVertexBuffer(PicoGL.FLOAT, 3, positionData);
        let velocities1 = app.createVertexBuffer(PicoGL.FLOAT, 3, positionData.length);
        let positions2 = app.createVertexBuffer(PicoGL.FLOAT, 3, positionData);
        let velocities2 = app.createVertexBuffer(PicoGL.FLOAT, 3, positionData.length);

        // COLOR BUFFER NOT INVOLVED IN TRANSFORM FEEDBACK
        let colors = app.createVertexBuffer(PicoGL.UNSIGNED_BYTE, 3, colorData);

        // INPUT AND OUTPUT VERTEX ARRAYS
        let vertexArray1 = app.createVertexArray()
            .vertexAttributeBuffer(0, positions1)
            .vertexAttributeBuffer(1, velocities1)
            .vertexAttributeBuffer(2, colors, { normalized: true });

        let vertexArray2 = app.createVertexArray()
            .vertexAttributeBuffer(0, positions2)
            .vertexAttributeBuffer(1, velocities2)
            .vertexAttributeBuffer(2, colors, { normalized: true });

        // TRANSFORM FEEDBACK OBJECTS
        let transformFeedback1 = app.createTransformFeedback()
            .feedbackBuffer(0, positions1)
            .feedbackBuffer(1, velocities1);

        let transformFeedback2 = app.createTransformFeedback()
            .feedbackBuffer(0, positions2)
            .feedbackBuffer(1, velocities2);

        // UNIFORM BUFFER FOR SIMULATION PARAMETERS
        let massUniforms = app.createUniformBuffer([
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT,
            PicoGL.FLOAT,
            PicoGL.FLOAT
        ]).set(0, vec3.fromValues(
            Math.random() * 2.0 - 1.0,
            Math.random() * 2.0 - 1.0,
            Math.random() * 2.0 - 1.0
        )).set(1, vec3.fromValues(
            Math.random() * 2.0 - 1.0,
            Math.random() * 2.0 - 1.0,
            Math.random() * 2.0 - 1.0
        )).set(2, vec3.fromValues(
            Math.random() * 2.0 - 1.0,
            Math.random() * 2.0 - 1.0,
            Math.random() * 2.0 - 1.0
        ))
            .set(3, Math.random() / 30000)
            .set(4, Math.random() / 30000)
            .set(5, Math.random() / 30000)
            .update();


        this.drawCall1 = app.createDrawCall(this.program, vertexArray1)
            .primitive(PicoGL.POINTS)
            .transformFeedback(transformFeedback2)
            .uniformBlock("Mass", massUniforms)
            .drawRanges([0, 50000]);

        this.drawCall2 = app.createDrawCall(this.program, vertexArray2)
            .primitive(PicoGL.POINTS)
            .transformFeedback(transformFeedback1)
            .uniformBlock("Mass", massUniforms)
            .drawRanges([0, 50000]);

        this.currentDrawCall = this.drawCall1;
    }

    private async loadResource(): Promise<void> {

        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-particles/main.vs.glsl',
                'resource/assets/shader-particles/main.fs.glsl'
            ];
            const txts = await this.engine.loadText(ress);
            this.vsSource = txts[0];
            this.fsSource = txts[1];
            //
            const programs = await this.engine.createPrograms(
                [this.vsSource, this.fsSource, ["vPosition", "vVelocity"]]
            );
            this.program = programs[0];
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
        app.clear();
        this.currentDrawCall.draw();
        this.currentDrawCall = this.currentDrawCall === this.drawCall1 ? this.drawCall2 : this.drawCall1;
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.program.delete();
        this.drawCall1.delete();
        this.drawCall2.delete();
        this.currentDrawCall = null;
        const engine = this.engine;
        engine.noBlend();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        return this;
    }
}