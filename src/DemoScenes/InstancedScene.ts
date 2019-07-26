
class InstancedScene extends WebGL2DemoScene {

    private vsSource: string;
    private fsSource: string;
    private drawCall: WebGL2DrawCall;
    private program: WebGL2Program;

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
        engine.clearColor(0.0, 0.0, 0.0, 1.0);

        const positions = engine.createVertexBuffer(GL.FLOAT, 2, new Float32Array([
            -0.3, -0.3,
            0.3, -0.3,
            0.0, 0.3
        ]));
        const offsets = engine.createVertexBuffer(GL.FLOAT, 2, new Float32Array([
            -0.4, -0.4,
            0.4, -0.4,
            -0.4, 0.4,
            0.4, 0.4
        ]));
        const colors = engine.createVertexBuffer(GL.UNSIGNED_BYTE, 3, new Uint8Array([
            255, 0, 0,
            0, 255, 0,
            0, 0, 255,
            0, 255, 255
        ]));
        const triangleArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .instanceAttributeBuffer(1, offsets)
            .instanceAttributeBuffer(2, colors, { normalized: true });
        //
        this.drawCall = engine.createDrawCall(this.program, triangleArray);
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-instanced/instanced.vs.glsl',
                'resource/assets/shader-instanced/instanced.fs.glsl'
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
        this.drawCall.delete();
        this.program.delete();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        return this;
    }
}