/**
 * 一个简单三角形场景
 */
class TriangleScene extends WebGL2DemoScene {
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
        //清除屏幕
        engine.clearColor(0.5, 0.5, 0.5, 1.0);
        //opengl 默认的窗口坐标是从 [-1,+1]的，所以设置的坐标值超过这个范围时将无法显示
        const length = 1.0;
        const positions = engine.createVertexBuffer(GL.FLOAT, 2, new Float32Array([
            -1.0 * length, -1.0 * length,
            0.0 * length, -1.0 * length,
            -0.0 * length, 0.0 * length,
            0.0 * length, 0.0 * length,
            1.0 * length, 1.0 * length,
            0.0 * length, 1.0 * length,
        ]));
        /**
         * 这里选择0～255之间UNSIGNED_BYTE，需要配合后续{ normalized: true }， 在vertexAttribPointer
         * 的时候，做归一化
         */
        const colors = engine.createVertexBuffer(GL.UNSIGNED_BYTE, 3, new Uint8Array([
            255, 0, 0,
            0, 255, 0,
            0, 0, 255,
            255, 0, 0,
            0, 255, 0,
            0, 0, 255,
        ]));
        /*
        那其实VAO主要是将一个绘制物体的各种顶点缓冲（VBO)包装一个整体。
        顶点缓冲可以有顶点坐标，纹理坐标等。优点就在于能提高开发效率，它将所有顶点绘制过程中的这些顶点的设置和绑定过程集中存储在一起.
        当我们需要时，只需要使用相应的VAO即可。
        VAO的这种方式有点像一个中介，把所有繁琐的绑定和顶点设置工作都集中起来处理，我们需要绘制时，直接找这个中介就好了。
         */
        const vao = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)//layout = 0: 位置
            .vertexAttributeBuffer(1, colors, { normalized: true }); //layout = 1: 颜色,需要归一化
        /*
        对于绘制行为一次封装
        */
        this.drawCall = engine.createDrawCall(this.program, vao);
    }
    /**
    *
    */
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
        //必须删除对象
        this.program.delete();
        this.drawCall.delete();
        return this;
    }
}