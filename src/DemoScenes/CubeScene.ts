
class CubeScene extends WebGL2DemoScene {
    
    //
    private projMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private drawCall: WebGL2DrawCall;
    private angleX: number = 0;
    private angleY: number = 0;
    private modelMatrix: Float32Array = mat4.create();
    private rotateXMatrix: Float32Array = mat4.create();
    private rotateYMatrix: Float32Array = mat4.create();
    private sceneUniformBuffer: WebGL2UniformBuffer;
    private vsSource: string;
    private fsSource: string;
    private program: WebGL2Program;
    private image: HTMLImageElement;

    //
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
        engine.clearColor(0.5, 0.5, 0.5, 1.0).depthTest();

        const box = engine.createBox({ dimensions: [1.0, 1.0, 1.0] });
        const positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);
        const normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);
        const boxArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals);

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        const lightPosition = vec3.fromValues(1, 1, 0.5);
        this.sceneUniformBuffer = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ]).set(0, this.viewProjMatrix)
            .set(1, eyePosition)
            .set(2, lightPosition)
            .update();
        
        const texture = engine.createTexture2DByImage(this.image, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });
        this.drawCall = engine.createDrawCall(this.program, boxArray)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .texture("tex", texture);
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-cube/cube.vs.glsl',
                'resource/assets/shader-cube/cube.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.vsSource = txts[0];
            this.fsSource = txts[1];
            //
            const programs = await this.engine.createPrograms(
                [this.vsSource, this.fsSource],
            );
            //
            this.program = programs[0];
            //
            const texarrays: string[] = [
                'resource/assets/bg.png',
            ];
            const loadImages = await this.engine.loadImages(texarrays);
            this.image = loadImages[0];
        }
        catch (e) {
            console.error(e);
        }
    }

    public update(): WebGL2DemoScene {
        if (!this._ready) {
            return;
        }
        this.angleX += 0.01;
        this.angleY += 0.02;
        mat4.fromXRotation(this.rotateXMatrix, this.angleX);
        mat4.fromYRotation(this.rotateYMatrix, this.angleY);
        mat4.multiply(this.modelMatrix, this.rotateXMatrix, this.rotateYMatrix);
        this.drawCall.uniform("uModel", this.modelMatrix);
        this.engine.clear();
        this.drawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.drawCall.delete();
        this.sceneUniformBuffer.delete();
        this.program.delete();
        const engine = this.engine;
        engine.noDepthTest();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        return this;
    }
}