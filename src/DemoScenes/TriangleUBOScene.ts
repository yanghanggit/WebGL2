/**
 * UniformBufferObject demo
 */
class TriangleUBOScene extends WebGL2DemoScene {
    /**
     * 
     */
    private program: WebGL2Program;
    /**
    * 
    */
    private drawCall1: WebGL2DrawCall;
    /**
    * 
    */
    private drawCall2: WebGL2DrawCall;
    /**
    * 
    */
    private positions: WebGL2VertexBuffer;
    /**
    * 
    */
    private triangleArray: WebGL2VertexArray;
    /**
    * 
    */
    private uniformBuffer1: WebGL2UniformBuffer;
    /**
    * 
    */
    private uniformBuffer2: WebGL2UniformBuffer;
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
        //
        this.positions = engine.createVertexBuffer(GL.FLOAT, 2, new Float32Array([
            -0.5, -0.5,
            0.5, -0.5,
            0.0, 0.5
        ]));
        //
        this.triangleArray = engine.createVertexArray().vertexAttributeBuffer(0, this.positions);
        //
        this.uniformBuffer1 = engine.createUniformBuffer([
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC2
        ])
            .set(0, new Float32Array([1.0, 0.0, 0.0, 1.0])) //color
            .set(1, new Float32Array([-0.5, 0.0])) //offset
            .update();
        //
        this.uniformBuffer2 = engine.createUniformBuffer([
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC2
        ])
            .set(0, new Float32Array([0.0, 0.0, 1.0, 1.0])) //color
            .set(1, new Float32Array([0.5, 0.0])) //offset
            .update();
        //
        this.drawCall1 = engine.createDrawCall(this.program, this.triangleArray).uniformBlock("TriangleUniforms", this.uniformBuffer1);
        this.drawCall2 = engine.createDrawCall(this.program, this.triangleArray).uniformBlock("TriangleUniforms", this.uniformBuffer2);
    }
    /**
     * 
     */
    private async loadResource(): Promise<void> {
        try {
            ////
            const ress: string[] = [
                'resource/assets/shader-ubo/ubo.vs.glsl',
                'resource/assets/shader-ubo/ubo.fs.glsl',
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
        this.engine.clear();
        this.drawCall1.draw();
        this.drawCall2.draw();
        return this;
    }
    /**
     * 
     */
    public leave(): WebGL2DemoScene {
        this.program.delete();
        this.drawCall1.delete();
        this.drawCall2.delete();
        this.positions.delete();
        this.triangleArray.delete();
        this.uniformBuffer1.delete();
        this.uniformBuffer2.delete();
        return this;
    }
    /**
     * 
     */
    public resize(width: number, height: number): WebGL2DemoScene {
        return this;
    }
}