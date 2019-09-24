
class TriangleScene extends WebGL2DemoScene {

    private program: WebGL2Program;
    private drawCall: WebGL2DrawCall;

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
        //清除屏幕
        engine.clearColor(0.5, 0.5, 0.5, 1.0);
        //opengl 默认的窗口坐标是从 [-1,+1]的，所以设置的坐标值超过这个范围时将无法显示
        const length = 1.0;
        const positions = engine.createVertexBuffer(GL.FLOAT, 2, new Float32Array([
            -1.0 * length, -1.0 * length,
            1.0 * length, -1.0 * length,
            0.0 * length, 1.0 * length,
        ]));
        const colors = engine.createVertexBuffer(GL.UNSIGNED_BYTE, 3, new Uint8Array([
            255, 0, 0,
            0, 255, 0,
            0, 0, 255
        ]));
        const triangleArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, colors, { normalized: true });
        this.drawCall = engine.createDrawCall(this.program, triangleArray);
    }

    private async loadResource(): Promise<void> {
        try {
            ////
            const ress: string[] = [
                'resource/assets/shader-triangle/triangle.vs.glsl',
                'resource/assets/shader-triangle/triangle.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            const vssource = txts[0];
            const fssource = txts[1];
            /////
            const programs = await this.engine.createPrograms(
                [vssource, fssource]
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
}