


class OcclusionScene extends WebGL2DemoScene {

    // private uncompressedVsSource: string;
    // private compressedVsSource: string;
    // private fShaderSource: string;
    // private uncompressedProgram: WebGL2Program;
    // private compressedProgram: WebGL2Program;
    // private uncompressedDrawCall: WebGL2DrawCall;
    // private compressedDrawCall: WebGL2DrawCall;

    private drawVsSource: string;
    private drawFsSource: string;
    private boundingBoxVSource: string;
    private boundingBoxFSource: string;
    private hudVSSource: string;
    private hudFSSource: string;
    private image: HTMLImageElement;

    private drawProgram: WebGL2Program;
    private boundingBoxProgram: WebGL2Program;
    private hudProgram: WebGL2Program;

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
        // engine.clearColor(0.0, 0.0, 0.0, 1.0);
        // ///
        // const sphere = engine.createSphere({ radius: 0.48 });
        // const uncompressedPositions = engine.createVertexBuffer(GL.FLOAT, 3, sphere.positions);
        // const uncompressedNormals = engine.createVertexBuffer(GL.FLOAT, 3, sphere.normals);
        // const indices = engine.createIndexBuffer(GL.UNSIGNED_SHORT, 3, sphere.indices);

        // const uncompressedVertexArray = engine.createVertexArray()
        //     .vertexAttributeBuffer(0, uncompressedPositions)
        //     .vertexAttributeBuffer(1, uncompressedNormals)
        //     .indexBuffer(indices);

        // const b = bounds(sphere.positions);
        // const q = quantize(sphere.positions, b.min, b.max);
        // const encodedNormals = octEncode(sphere.normals);

        // const compressedPositions = engine.createVertexBuffer(GL.UNSIGNED_SHORT, 3, q.quantized);
        // const compressedNormals = engine.createVertexBuffer(GL.BYTE, 2, encodedNormals);

        // const compressedVertexArray = engine.createVertexArray()
        //     .vertexAttributeBuffer(0, compressedPositions)
        //     .vertexAttributeBuffer(1, compressedNormals, { normalized: true })
        //     .indexBuffer(indices);

        // const uncompressedTransform = mat4.create();
        // mat4.fromTranslation(uncompressedTransform, vec3.fromValues(-0.5, 0.0, 0.0));

        // const compressedTransform = mat4.create();
        // mat4.fromTranslation(compressedTransform, vec3.fromValues(0.5, 0.0, 0.0));


        // this.uncompressedDrawCall = engine.createDrawCall(this.uncompressedProgram, uncompressedVertexArray)
        //     .uniform("model", uncompressedTransform);

        // this.compressedDrawCall = engine.createDrawCall(this.compressedProgram, compressedVertexArray)
        //     .uniform("decode", q.decode)
        //     .uniform("model", compressedTransform);
    }

    private async loadResource(): Promise<void> {

        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-occlusion/draw.vs.glsl',
                'resource/assets/shader-occlusion/draw.fs.glsl',
                'resource/assets/shader-occlusion/boundingBox.vs.glsl',
                'resource/assets/shader-occlusion/boundingBox.fs.glsl',
                'resource/assets/shader-occlusion/hud.vs.glsl',
                'resource/assets/shader-occlusion/hud.fs.glsl',

            ];
            const txts = await this.engine.loadText(ress);
            this.drawVsSource = txts[0];
            this.drawFsSource = txts[1];
            this.boundingBoxVSource = txts[2];
            this.boundingBoxFSource = txts[3];
            this.hudVSSource = txts[4];
            this.hudFSSource = txts[5];
            //
            const programs = await this.engine.createPrograms(
                [this.drawVsSource, this.drawFsSource],
                [this.boundingBoxVSource, this.boundingBoxFSource],
                [this.hudVSSource, this.hudFSSource]
            );
            this.drawProgram = programs[0];
            this.boundingBoxProgram = programs[1];
            this.hudProgram = programs[2];
            //
            const texarrays: string[] = [
                'resource/assets/bg.jpg',
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
        // const engine = this.engine;
        // engine.clear();
        // this.uncompressedDrawCall.draw();
        // this.compressedDrawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        // this.uncompressedProgram.delete();
        // this.compressedProgram.delete();
        // this.uncompressedDrawCall.delete();
        // this.compressedDrawCall.delete();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        return this;
    }
}