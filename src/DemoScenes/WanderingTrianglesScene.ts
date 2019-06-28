
class WanderingTrianglesScene extends WebGL2DemoScene {
    
    public enter(): WebGL2DemoScene {
        this.application.profile.setTitle(egret.getQualifiedClassName(this));
        this.start().catch(e => {
            console.error(e);
        });
        this._ready = true; 
        return this;
    }

    private async start(): Promise<void> {
        await this.loadResource();
        this.createScene();
    }

    private createScene(): void {

        /*
        utils.addTimerElement();

        let canvas = document.getElementById("gl-canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        let app = PicoGL.createApp(canvas)
        .clearColor(0.0, 0.0, 0.0, 1.0);

        let timer = app.createTimer();

        window.onresize = function() {
            app.resize(window.innerWidth, window.innerHeight);
        }

        // TRANSFORM FEEDBACK PROGRAM
        let updateVsSource =  document.getElementById("vs-update").text.trim();
        let updateFsSource =  document.getElementById("fs-update").text.trim();
              
        // DRAW PROGRAM
        let drawVsSource =  document.getElementById("vs-draw").text.trim();
        let drawFsSource =  document.getElementById("fs-draw").text.trim();

        // GEO DATA
        const NUM_INSTANCES = 50000;

        let offsetData = new Float32Array(NUM_INSTANCES * 2);
        let rotationData = new Float32Array(NUM_INSTANCES);
        let colorData = new Uint8Array(NUM_INSTANCES * 3);
        let positionData = new Float32Array([
            0.012, 0.0, 
            -0.008, 0.008, 
            -0.008, -0.008,
        ]);

        for (let i = 0; i < NUM_INSTANCES; ++i) {
            let oi = i * 2;
            let ri = i;
            let ci = i * 3;

            offsetData[oi] = Math.random() * 2.0 - 1.0;
            offsetData[oi + 1] = Math.random() * 2.0 - 1.0;

            rotationData[i] = Math.random() * 2 * Math.PI;

            colorData[ci]     = Math.floor(Math.random() * 256);
            colorData[ci + 1] = Math.floor(Math.random() * 256);
            colorData[ci + 2] = Math.floor(Math.random() * 256);
        }

        // INPUT AND OUTPUT VERTEX BUFFERS
        let offsetsA = app.createVertexBuffer(PicoGL.FLOAT, 2, offsetData);
        let offsetsB = app.createVertexBuffer(PicoGL.FLOAT, 2, offsetData.length);

        let rotationsA = app.createVertexBuffer(PicoGL.FLOAT, 1, rotationData);
        let rotationsB = app.createVertexBuffer(PicoGL.FLOAT, 1, rotationData.length);


        // ATTRIBUTES FOR DRAWING
        let positions = app.createVertexBuffer(PicoGL.FLOAT, 2, positionData);
        let colors = app.createVertexBuffer(PicoGL.UNSIGNED_BYTE, 3, colorData);

        
        // COMBINE VERTEX BUFFERS INTO INPUT AND OUTPUT VERTEX ARRAYS
        let updateArrayA = app.createVertexArray()
        .vertexAttributeBuffer(0, offsetsA)
        .vertexAttributeBuffer(1, rotationsA);

        let updateArrayB = app.createVertexArray()
        .vertexAttributeBuffer(0, offsetsB)
        .vertexAttributeBuffer(1, rotationsB);

        // CREATE TRANSFORM FEEDBACK FROM INPUT AND OUTPUT VERTEX ARRAYS
        let transformFeedbackA = app.createTransformFeedback()
        .feedbackBuffer(0, offsetsA)
        .feedbackBuffer(1, rotationsA);

        let transformFeedbackB = app.createTransformFeedback()
        .feedbackBuffer(0, offsetsB)
        .feedbackBuffer(1, rotationsB);

        // VERTEX ARRAYS FOR DRAWING
        let drawArrayA = app.createVertexArray()
        .vertexAttributeBuffer(0, positions)
        .instanceAttributeBuffer(1, colors, { normalized: true })
        .instanceAttributeBuffer(2, offsetsA)
        .instanceAttributeBuffer(3, rotationsA);

        let drawArrayB = app.createVertexArray()
        .vertexAttributeBuffer(0, positions)
        .instanceAttributeBuffer(1, colors, { normalized: true })
        .instanceAttributeBuffer(2, offsetsB)
        .instanceAttributeBuffer(3, rotationsB);
        */
    }

    private drawVsSource: string;
    private drawFsSource: string;
    private updateVsSource: string;
    private updateFsSource: string;
    private drawProgram: WebGL2Program;
    private updateProgram: WebGL2Program;
    private async loadResource(): Promise<void> {
        try {

            const ress: string[] = [
                'resource/assets/vs-draw.vertex.glsl',
                'resource/assets/fs-draw.fragment.glsl',
                'resource/assets/vs-update.vertex.glsl',
                'resource/assets/fs-update.fragment.glsl'
            ];

            //
            const txts = await this.engine.loadText(ress);
            this.drawVsSource = txts[0];
            this.drawFsSource = txts[1];
            this.updateVsSource = txts[2];
            this.updateFsSource = txts[3];
            //
            const programs = await this.engine.createPrograms([this.drawVsSource, this.drawFsSource], 
                [this.updateVsSource, this.updateFsSource, ["vOffset", "vRotation"]]);
            this.drawProgram = programs[0];
            this.updateProgram = programs[1];
        }
        catch (e) {
            console.error(e);
        }
    }

    public update(): WebGL2DemoScene {
        if (!this._ready) {
            return;
        }
        this.engine.clear();
        return this;
    }

    public leave(): WebGL2DemoScene {
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        return this;
    }
}