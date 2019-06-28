
class WanderingTrianglesScene extends WebGL2DemoScene {

    private updateDrawCallA: WebGL2DrawCall;
    private updateDrawCallB: WebGL2DrawCall;
    private drawCallA: WebGL2DrawCall;
    private drawCallB: WebGL2DrawCall;
    private updateDrawCall: WebGL2DrawCall;
    private mainDrawCall: WebGL2DrawCall;
    private drawVsSource: string;
    private drawFsSource: string;
    private updateVsSource: string;
    private updateFsSource: string;
    private drawProgram: WebGL2Program;
    private updateProgram: WebGL2Program;

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
        engine.clearColor(0.5, 0.5, 0.5, 1.0);
        //
        const NUM_INSTANCES = 50000;
        const offsetData = new Float32Array(NUM_INSTANCES * 2);
        const rotationData = new Float32Array(NUM_INSTANCES);
        const colorData = new Uint8Array(NUM_INSTANCES * 3);
        const positionData = new Float32Array([
            0.012, 0.0,
            -0.008, 0.008,
            -0.008, -0.008,
        ]);
        for (let i = 0; i < NUM_INSTANCES; ++i) {
            const oi = i * 2;
            const ri = i;
            const ci = i * 3;
            offsetData[oi] = Math.random() * 2.0 - 1.0;
            offsetData[oi + 1] = Math.random() * 2.0 - 1.0;
            rotationData[i] = Math.random() * 2 * Math.PI;
            colorData[ci] = Math.floor(Math.random() * 256);
            colorData[ci + 1] = Math.floor(Math.random() * 256);
            colorData[ci + 2] = Math.floor(Math.random() * 256);
        }
        //
        const offsetsA = engine.createVertexBuffer(GL.FLOAT, 2, offsetData);
        const offsetsB = engine.createVertexBuffer(GL.FLOAT, 2, offsetData.length);
        const rotationsA = engine.createVertexBuffer(GL.FLOAT, 1, rotationData);
        const rotationsB = engine.createVertexBuffer(GL.FLOAT, 1, rotationData.length);
        const positions = engine.createVertexBuffer(GL.FLOAT, 2, positionData);
        const colors = engine.createVertexBuffer(GL.UNSIGNED_BYTE, 3, colorData);
        //
        const updateArrayA = engine.createVertexArray()
            .vertexAttributeBuffer(0, offsetsA)
            .vertexAttributeBuffer(1, rotationsA);

        const updateArrayB = engine.createVertexArray()
            .vertexAttributeBuffer(0, offsetsB)
            .vertexAttributeBuffer(1, rotationsB);

        const transformFeedbackA = engine.createTransformFeedback()
            .feedbackBuffer(0, offsetsA)
            .feedbackBuffer(1, rotationsA);

        const transformFeedbackB = engine.createTransformFeedback()
            .feedbackBuffer(0, offsetsB)
            .feedbackBuffer(1, rotationsB);

        ///
        const drawArrayA = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .instanceAttributeBuffer(1, colors, { normalized: true })
            .instanceAttributeBuffer(2, offsetsA)
            .instanceAttributeBuffer(3, rotationsA);

        const drawArrayB = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .instanceAttributeBuffer(1, colors, { normalized: true })
            .instanceAttributeBuffer(2, offsetsB)
            .instanceAttributeBuffer(3, rotationsB);

        //
        this.updateDrawCallA = engine.createDrawCall(this.updateProgram, updateArrayA)
            .primitive(GL.POINTS)
            .transformFeedback(transformFeedbackB);

        //
        this.updateDrawCallB = engine.createDrawCall(this.updateProgram, updateArrayB)
            .primitive(GL.POINTS)
            .transformFeedback(transformFeedbackA);

        //
        this.drawCallA = engine.createDrawCall(this.drawProgram, drawArrayA);
        this.drawCallB = engine.createDrawCall(this.drawProgram, drawArrayB);
        this.updateDrawCall = this.updateDrawCallA;
        this.mainDrawCall = this.drawCallB;
    }

    private async loadResource(): Promise<void> {
        try {
            ///
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
            const programs = await this.engine.createPrograms(
                [this.drawVsSource, this.drawFsSource],
                [this.updateVsSource, this.updateFsSource, ["vOffset", "vRotation"]]
            );
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
        const engine = this.engine;
        engine.noRasterize();
        this.updateDrawCall.draw();
        engine.rasterize().clear();
        this.mainDrawCall.draw();
        ///
        this.updateDrawCall = this.updateDrawCall === this.updateDrawCallA ? this.updateDrawCallB : this.updateDrawCallA;
        this.mainDrawCall = this.mainDrawCall === this.drawCallA ? this.drawCallB : this.drawCallA;
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.drawProgram.delete();
        this.updateProgram.delete();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        return this;
    }
}