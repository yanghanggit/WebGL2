
/**
 * 实例化的测试简单测试场景
 */
class TriangleInstancedScene extends WebGL2DemoScene {
    /**
     * 
     */
    private drawCall: WebGL2DrawCall;
    /**
     * 
     */
    private program: WebGL2Program;
    /**
     * 
     */
    private drawCount: number = 0;
    /**
     * 
     */
    public enter(): WebGL2DemoScene {
        this.application.profile.setTitle(Utils.getClassName(this));
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
        ///
        const engine = this.engine;
        engine.clearColor(0.5, 0.5, 0.5, 1.0);
        //自身位置
        const positions = engine.createVertexBuffer(GL.FLOAT, 2, new Float32Array([
            -0.3, -0.3,
            0.3, -0.3,
            0.0, 0.3
        ]));
        //画4个，四个坐标, 4个items
        /*
        out vec4 vColor;
        void main() {
            vColor = color;
            gl_Position = position;
            gl_Position.xy += offset; <==== 这句是关键在用下面的位置
        }
        */
        const offsets = engine.createVertexBuffer(GL.FLOAT, 2, new Float32Array([
            -0.5, -0.5, //item[0]
            0.5, -0.5,  //item[1]
            -0.5, 0.5,  //item[2]
            0.5, 0.5    //item[3]
        ]));
        //颜色4个items
        const colors = engine.createVertexBuffer(GL.UNSIGNED_BYTE, 3, new Uint8Array([
            255, 0, 0,  //item[0]
            0, 255, 0,  //item[1]
            0, 0, 255,  //item[2]
            0, 255, 255 //item[3]
        ]));
        //测试的颜色
        const colorMask = engine.createVertexBuffer(GL.FLOAT, 3, new Float32Array([
            Math.random(), Math.random(), Math.random(),  //item[0]
            Math.random(), Math.random(), Math.random(),  //item[1]
            Math.random(), Math.random(), Math.random(),  //item[2]
            Math.random(), Math.random(), Math.random(),   //item[3]
        ]));
        //
        const vao = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .instanceAttributeBuffer(1, offsets)
            .instanceAttributeBuffer(2, colors, { normalized: true })
            .instanceAttributeBuffer(3, colorMask, { normalized: false });
        //
        this.drawCall = engine.createDrawCall(this.program, vao);
    }
    /**
    * 
    */
    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-instanced/instanced.vs.glsl',
                'resource/assets/shader-instanced/instanced.fs.glsl'
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
    public onUpdate(): WebGL2DemoScene {
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
        this.drawCall.delete();
        this.program.delete();
        return this;
    }
}