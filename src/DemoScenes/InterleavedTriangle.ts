
class InterleavedTriangleScene extends WebGL2DemoScene {
    ///
    private vsSource: string;
    private fsSource: string;
    private program: WebGL2Program;
    private drawCall: WebGL2DrawCall;
    ///
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
        const interleavedData = new Float32Array([
            -0.5, -0.5,
            0,
            0.5, -0.5,
            0,
            0.0, 0.5,
            0
        ]);
        const interleavedDataUByte = new Uint8Array(interleavedData.buffer);
        interleavedDataUByte.set([255, 0, 0, 255], 8);
        interleavedDataUByte.set([0, 255, 0, 255], 20);
        interleavedDataUByte.set([0, 0, 255, 255], 32);
        const interleavedBuffer = engine.createInterleavedBuffer(12, interleavedData);
        const triangleArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, interleavedBuffer, {
                type: GL.FLOAT,
                size: 2,
                stride: 12
            })
            .vertexAttributeBuffer(1, interleavedBuffer, {
                type: GL.UNSIGNED_BYTE,
                size: 3,
                offset: 8,
                stride: 12,
                normalized: true
            });

        this.drawCall = engine.createDrawCall(this.program, triangleArray);
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-interleaved-triangle/draw.vs.glsl',
                'resource/assets/shader-interleaved-triangle/draw.fs.glsl'
            ];
            const txts = await this.engine.loadText(ress);
            this.vsSource = txts[0];
            this.fsSource = txts[1];
            //
            const programs = await this.engine.createPrograms(
                [this.vsSource, this.fsSource]
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
        this.engine.clear();
        this.drawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.program.delete();
        this.drawCall.delete();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        return this;
    }
}