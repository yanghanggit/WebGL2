
class _3DTextureScene extends WebGL2DemoScene {

    private projMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private mvpMatrix: Float32Array;
    private vsSource: string;
    private fsSource: string;
    private startTime: number = 0;
    private program: WebGL2Program;
    private drawCall: WebGL2DrawCall;

    public enter(): WebGL2DemoScene {
        this.application.profile.setTitle(Utils.getClassName(this));
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
        engine.clearColor(0.0, 0.0, 0.0, 1.0)
            .blend()
            .blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);

        const DIMENSIONS = 128;
        const INCREMENT = 1 / DIMENSIONS;
        const positionData = new Float32Array(DIMENSIONS * DIMENSIONS * DIMENSIONS * 3);
        let positionIndex = 0;
        let x = -0.5;
        for (let i = 0; i < DIMENSIONS; ++i) {
            let y = -0.5;
            for (let j = 0; j < DIMENSIONS; ++j) {
                let z = -0.5;
                for (let k = 0; k < DIMENSIONS; ++k) {
                    positionData[positionIndex++] = x;
                    positionData[positionIndex++] = y;
                    positionData[positionIndex++] = z;
                    z += INCREMENT;
                }
                y += INCREMENT;
            }
            x += INCREMENT;
        }

        const positions = engine.createVertexBuffer(GL.FLOAT, 3, positionData)
        const pointArray = engine.createVertexArray().vertexAttributeBuffer(0, positions);
        const TEXTURE_DIMENSIONS = 16;
        const textureData = new Uint8Array(TEXTURE_DIMENSIONS * TEXTURE_DIMENSIONS * TEXTURE_DIMENSIONS);
        let textureIndex = 0;
        for (let i = 0; i < TEXTURE_DIMENSIONS; ++i) {
            for (let j = 0; j < TEXTURE_DIMENSIONS; ++j) {
                for (let k = 0; k < TEXTURE_DIMENSIONS; ++k) {
                    let val = snoise(new Float32Array([i, j, k])) * 255
                    textureData[textureIndex++] = val;
                }
            }
        }
        const texture = engine.createTexture3DByData(textureData, TEXTURE_DIMENSIONS, TEXTURE_DIMENSIONS, TEXTURE_DIMENSIONS, {
            internalFormat: GL.R8,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.mvpMatrix = mat4.create();
        mat4.multiply(this.mvpMatrix, this.projMatrix, this.viewMatrix);

        this.drawCall = engine.createDrawCall(this.program, pointArray)
            .primitive(GL.POINTS)
            .texture("tex", texture)
            .uniform("uMVP", this.mvpMatrix);

        this.startTime = performance.now();
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-3dtexture/draw.vs.glsl',
                'resource/assets/shader-3dtexture/draw.fs.glsl'
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
        this.drawCall.uniform("uTime", (performance.now() - this.startTime) / 1000);
        this.engine.clear();
        this.drawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.program.delete();
        this.drawCall.delete();
        const engine = this.engine;
        engine.noBlend();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.mvpMatrix, this.projMatrix, this.viewMatrix);
        return this;
    }
}