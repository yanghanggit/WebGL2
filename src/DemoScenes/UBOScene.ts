
class UBOScene extends WebGL2DemoScene {

    private vsSource: string;
    private fsSource: string;
    private program: WebGL2Program;
    private drawCall1: WebGL2DrawCall;
    private drawCall2: WebGL2DrawCall;
    private positions: WebGL2VertexBuffer;
    private triangleArray: WebGL2VertexArray;
    private uniformBuffer1: WebGL2UniformBuffer;
    private uniformBuffer2: WebGL2UniformBuffer;

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
        this.positions = engine.createVertexBuffer(GL.FLOAT, 2, new Float32Array([
            -0.4, -0.5,
            0.4, -0.5,
            0.0, 0.5
        ]));
        //
        this.triangleArray = engine.createVertexArray().vertexAttributeBuffer(0, this.positions);
        //
        this.uniformBuffer1 = engine.createUniformBuffer([
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC2
        ]).set(0, new Float32Array([1.0, 0.0, 0.0, 1.0])).set(1, new Float32Array([-0.5, 0.0])).update();
        //
        this.uniformBuffer2 = engine.createUniformBuffer([
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC2
        ]).set(0, new Float32Array([0.0, 0.0, 1.0, 1.0])).set(1, new Float32Array([0.5, 0.0])).update();
        //
        this.drawCall1 = engine.createDrawCall(this.program, this.triangleArray).uniformBlock("TriangleUniforms", this.uniformBuffer1);
        this.drawCall2 = engine.createDrawCall(this.program, this.triangleArray).uniformBlock("TriangleUniforms", this.uniformBuffer2);
    }

    private async loadResource(): Promise<void> {
        try {
            ////
            const ress: string[] = [
                'resource/assets/vs-ubo.vertex.glsl',
                'resource/assets/fs-ubo.fragment.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.vsSource = txts[0];
            this.fsSource = txts[1];
            /////
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
        const engine = this.engine;
        engine.clear();
        this.drawCall1.draw();
        this.drawCall2.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.program.delete();
        this.positions.delete();
        this.triangleArray.delete();
        this.uniformBuffer1.delete();
        this.uniformBuffer2.delete();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        return this;
    }
}