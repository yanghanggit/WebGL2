/**
 * 用同一个buffer存position 和 color来画三角形
 */
class TriangleInterleavedVertexBufferScene extends WebGL2DemoScene {
    /**
     * 
     */
    private program: WebGL2Program;
    /**
     * 
     */
    private drawCall: WebGL2DrawCall;
    /**
     * 
     */
    private drawCount: number = 0;
    /**
     * 
     */
    public enter(): WebGL2DemoScene {
        this.application.profile.setTitle(egret.getQualifiedClassName(this));
        this.start().catch(e => {
            console.error(e);
        });
        return this;
    }
    /**
     * 
     */
    private async start(): Promise<void> {
        await this.loadResource();
        this.createScene();
        this.ready();
    }
    /**
     * 
     */
    private createScene(): void {
        const engine = this.engine;
        engine.clearColor(0.5, 0.5, 0.5, 1.0);
        const interleavedData = new Float32Array([
            -0.5, -0.5,
            0, //offset = 8 颜色
            0.5, -0.5,
            0, //offset = 20 颜色
            0.0, 0.5,
            0  //offset = 32 颜色
        ]);
        //设置颜色
        const interleavedDataUByte = new Uint8Array(interleavedData.buffer);
        interleavedDataUByte.set([255, 0, 0, 255], 8);
        interleavedDataUByte.set([0, 255, 0, 255], 20);
        interleavedDataUByte.set([0, 0, 255, 255], 32);
        //间距12的buffer
        const interleavedBuffer = engine.createInterleavedBuffer(12, interleavedData);
        //创建vao
        const vao = engine.createVertexArray()
            .vertexAttributeBuffer(0, interleavedBuffer, {
                type: GL.FLOAT,
                size: 2,
                stride: 12
            })
            .vertexAttributeBuffer(1, interleavedBuffer, {
                type: GL.UNSIGNED_BYTE,
                size: 3,
                offset: 8,  //2个GL.FLOAT
                stride: 12, //2个GL.FLOAT + 3 * UNSIGNED_BYTE + 补充UNSIGNED_BYTE =  2 * 4 + 3 * 1 + 1 = 12
                normalized: true
            });
        this.drawCall = engine.createDrawCall(this.program, vao);
    }
    /**
     * 
     */
    private async loadResource(): Promise<void> {
        try {
            const ress: string[] = [
                'resource/assets/shader-interleaved-triangle/draw.vs.glsl',
                'resource/assets/shader-interleaved-triangle/draw.fs.glsl'
            ];
            const txts = await this.engine.loadText(ress);
            const vsSource = txts[0];
            const fsSource = txts[1];
            //
            const programs = await this.engine.createPrograms(
                [vsSource, fsSource]
            );
            this.program = programs[0];
        }
        catch (e) {
            console.error(e);
        }
    }
    /**
     * 
     */
    public _update(): WebGL2DemoScene {
        if (this.drawCount < 1) {
            //只画一次就好了
            this.engine.clear();
            this.drawCall.draw();
        }
        ++this.drawCount;
        return this;
    }
    /**
     * 
     */
    public leave(): WebGL2DemoScene {
        this.program.delete();
        this.drawCall.delete();
        return this;
    }
}