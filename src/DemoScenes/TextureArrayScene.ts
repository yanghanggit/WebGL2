
class TextureArrayScene extends WebGL2DemoScene {

    private vsSource: string;
    private fsSource: string;
    private program: WebGL2Program;
    private drawCall: WebGL2DrawCall;
    private boxes: Object[];
    private imageArray: TextureArrayData;
    private modelMatrixData: Float32Array;
    private modelMatrices: WebGL2VertexBuffer;
    private viewProjMatrix: Float32Array;
    private projMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private sceneUniformBuffer: WebGL2UniformBuffer;

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
        //
        const engine = this.engine;
        engine.clearColor(0.5, 0.5, 0.5, 1.0).depthTest();

        // SET UP GEOMETRY
        let box = engine.createBox({ dimensions: [1.0, 1.0, 1.0] });
        this.modelMatrixData = new Float32Array(8 * 16);
        let textureIndexData = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);

        let positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        let uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);
        let normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);
        let textureIndices = engine.createVertexBuffer(GL.UNSIGNED_BYTE, 1, textureIndexData);
        this.modelMatrices = engine.createMatrixBuffer(GL.FLOAT_MAT4, this.modelMatrixData.length);

        let boxArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .instanceAttributeBuffer(3, textureIndices)
            .instanceAttributeBuffer(4, this.modelMatrices);

        // SET UP UNIFORM BUFFER
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(0, 0, 6);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        let lightPosition = vec3.fromValues(0, 0, 2);

        this.sceneUniformBuffer = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4,
            GL.FLOAT_VEC4
        ])
            .set(0, this.viewProjMatrix)
            .set(1, eyePosition)
            .set(2, lightPosition)
            .update();

        this.boxes = [
            {
                rotation: vec3.fromValues(Math.random(), Math.random(), Math.random()),
                rv: vec3.fromValues(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02),
                translation: vec3.fromValues(-3, 1, 0),
                modelMatrix: new Float32Array(this.modelMatrixData.buffer, 0, 16),
            },
            {
                rotation: vec3.fromValues(Math.random(), Math.random(), Math.random()),
                rv: vec3.fromValues(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02),
                translation: vec3.fromValues(-1, 1, 0),
                modelMatrix: new Float32Array(this.modelMatrixData.buffer, 16 * 4, 16),
            },
            {
                rotation: vec3.fromValues(Math.random(), Math.random(), Math.random()),
                rv: vec3.fromValues(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02),
                translation: vec3.fromValues(1, 1, 0),
                modelMatrix: new Float32Array(this.modelMatrixData.buffer, 32 * 4, 16),
            },
            {
                rotation: vec3.fromValues(Math.random(), Math.random(), Math.random()),
                rv: vec3.fromValues(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02),
                translation: vec3.fromValues(3, 1, 0),
                modelMatrix: new Float32Array(this.modelMatrixData.buffer, 48 * 4, 16),
            },
            {
                rotation: vec3.fromValues(Math.random(), Math.random(), Math.random()),
                rv: vec3.fromValues(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02),
                translation: vec3.fromValues(-3, -1, 0),
                modelMatrix: new Float32Array(this.modelMatrixData.buffer, 64 * 4, 16),
            },
            {
                rotation: vec3.fromValues(Math.random(), Math.random(), Math.random()),
                rv: vec3.fromValues(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02),
                translation: vec3.fromValues(-1, -1, 0),
                modelMatrix: new Float32Array(this.modelMatrixData.buffer, 80 * 4, 16),
            },
            {
                rotation: vec3.fromValues(Math.random(), Math.random(), Math.random()),
                rv: vec3.fromValues(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02),
                translation: vec3.fromValues(1, -1, 0),
                modelMatrix: new Float32Array(this.modelMatrixData.buffer, 96 * 4, 16),
            },
            {
                rotation: vec3.fromValues(Math.random(), Math.random(), Math.random()),
                rv: vec3.fromValues(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02),
                translation: vec3.fromValues(3, -1, 0),
                modelMatrix: new Float32Array(this.modelMatrixData.buffer, 112 * 4, 16),
            }
        ];

        let texture = engine.createTextureArray(this.imageArray.data, this.imageArray.width, this.imageArray.height, this.imageArray.length, { maxAnisotropy: WEBGL_INFO.MAX_TEXTURE_ANISOTROPY });

        // SET UP DRAW CALL
        this.drawCall = engine.createDrawCall(this.program, boxArray)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer)
            .texture("tex", texture);
    }

    private async loadResource(): Promise<void> {
        try {
            ////
            const ress: string[] = [
                'resource/assets/vs-texarray.vertex.glsl',
                'resource/assets/fs-texarray.fragment.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.vsSource = txts[0];
            this.fsSource = txts[1];
            /////
            const programs = await this.engine.createPrograms(
                [this.vsSource, this.fsSource]
            );
            this.program = programs[0];

            //
            const texarrays: string[] = [
                "resource/assets/webgl-logo.png",
                "resource/assets/carpet.jpg",
                "resource/assets/grass.png",
                "resource/assets/pavement.jpg",
                "resource/assets/brick.png",
                "resource/assets/concrete.jpg",
                "resource/assets/marble.png",
                "resource/assets/tile.png",
            ];
            this.imageArray = await this.engine.loadImageArray(texarrays);
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
        const boxes = this.boxes as any[];
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].rotation[0] += boxes[i].rv[0];
            boxes[i].rotation[1] += boxes[i].rv[1];
            boxes[i].rotation[2] += boxes[i].rv[2];
            engine.xformMatrix(boxes[i].modelMatrix, boxes[i].translation, boxes[i].rotation, null);
            this.modelMatrices.data(this.modelMatrixData);
        }
        this.drawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.program.delete();
        this.drawCall.delete();
        this.modelMatrices.delete();
        this.sceneUniformBuffer.delete();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        return this;
    }
}