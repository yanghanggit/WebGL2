

interface Bounds {
    min: Float32Array;
    max: Float32Array;
}
function bounds(array: Float32Array): Bounds {
    const min = new Float32Array(3);
    const max = new Float32Array(3);
    min[0] = min[1] = min[2] = Number.MAX_VALUE;
    max[0] = max[1] = max[2] = -Number.MAX_VALUE;
    for (let i = 0; i < array.length; i += 3) {
        min[0] = Math.min(min[0], array[i + 0]);
        min[1] = Math.min(min[1], array[i + 1]);
        min[2] = Math.min(min[2], array[i + 2]);
        max[0] = Math.max(max[0], array[i + 0]);
        max[1] = Math.max(max[1], array[i + 1]);
        max[2] = Math.max(max[2], array[i + 2]);
    }
    return {
        min: min,
        max: max
    };
}

interface Quantize {
    quantized: Uint16Array;
    decode: Float32Array;
}
function quantize(array: Float32Array, min: Float32Array, max: Float32Array): Quantize {
    const quantized = new Uint16Array(array.length);
    const multiplier = new Float32Array([
        max[0] !== min[0] ? 65535 / (max[0] - min[0]) : 0,
        max[1] !== min[1] ? 65535 / (max[1] - min[1]) : 0,
        max[2] !== min[2] ? 65535 / (max[2] - min[2]) : 0
    ]);
    for (let i = 0; i < array.length; i += 3) {
        quantized[i] = Math.floor((array[i] - min[0]) * multiplier[0]);
        quantized[i + 1] = Math.floor((array[i + 1] - min[1]) * multiplier[1]);
        quantized[i + 2] = Math.floor((array[i + 2] - min[2]) * multiplier[2]);
    }

    const decodeMat = new Float32Array(16);
    const translate = mat4.create();
    const scale = mat4.create();
    mat4.identity(translate);
    mat4.identity(scale);
    mat4.translate(translate, translate, min);
    mat4.scale(scale, scale, new Float32Array([
        (max[0] - min[0]) / 65535,
        (max[1] - min[1]) / 65535,
        (max[2] - min[2]) / 65535
    ]));
    mat4.multiply(decodeMat, translate, scale);
    return {
        quantized: quantized,
        decode: decodeMat
    };
}

function octEncode(array: Float32Array): Int8Array {
    const encoded = new Int8Array(array.length * 2 / 3);
    let oct: Int8Array, dec:number[], best: Int8Array, currentCos: number, bestCos: number;
    let i: number, ei: number;
    for (i = 0, ei = 0; i < array.length; i += 3, ei += 2) {
        best = oct = octEncodeVec3(array, i, "floor", "floor");
        dec = octDecodeVec2(oct);
        currentCos = bestCos = dot(array, i, dec);
        oct = octEncodeVec3(array, i, "ceil", "floor");
        dec = octDecodeVec2(oct);
        currentCos = dot(array, i, dec);
        if (currentCos > bestCos) {
            best = oct;
            bestCos = currentCos;
        }
        oct = octEncodeVec3(array, i, "floor", "ceil");
        dec = octDecodeVec2(oct);
        currentCos = dot(array, i, dec);
        if (currentCos > bestCos) {
            best = oct;
            bestCos = currentCos;
        }
        oct = octEncodeVec3(array, i, "ceil", "ceil");
        dec = octDecodeVec2(oct);
        currentCos = dot(array, i, dec);
        if (currentCos > bestCos) {
            best = oct;
            bestCos = currentCos;
        }
        encoded[ei] = best[0];
        encoded[ei + 1] = best[1];
    }

    return encoded;
}

function octEncodeVec3(array: Float32Array, i: number, xfunc: string, yfunc: string): Int8Array {
    let x = array[i] / (Math.abs(array[i]) + Math.abs(array[i + 1]) + Math.abs(array[i + 2]));
    let y = array[i + 1] / (Math.abs(array[i]) + Math.abs(array[i + 1]) + Math.abs(array[i + 2]));
    if (array[i + 2] < 0) {
        let tempx = x;
        let tempy = y;
        tempx = (1 - Math.abs(y)) * (x >= 0 ? 1 : -1);
        tempy = (1 - Math.abs(x)) * (y >= 0 ? 1 : -1);
        x = tempx;
        y = tempy;
    }
    return new Int8Array([
        Math[xfunc](x * 127),
        Math[yfunc](y * 127)
    ]);

}

function octDecodeVec2(oct: Int8Array): number[] {
    let x = oct[0];
    let y = oct[1];
    x /= 127;
    y /= 127;
    const z = 1 - Math.abs(x) - Math.abs(y);
    if (z < 0) {
        x = (1 - Math.abs(y)) * (x >= 0 ? 1 : -1);
        y = (1 - Math.abs(x)) * (y >= 0 ? 1 : -1);
    }
    const length = Math.sqrt(x * x + y * y + z * z);
    return [
        x / length,
        y / length,
        z / length
    ];
}

function dot(array: Float32Array, i: number, vec3: number[]): number {
    return array[i] * vec3[0] + array[i + 1] * vec3[1] + array[i + 2] * vec3[2];
}

class MeshCompressionScene extends WebGL2DemoScene {

    private uncompressedVsSource: string;
    private compressedVsSource: string;
    private fShaderSource: string;
    private uncompressedProgram: WebGL2Program;
    private compressedProgram: WebGL2Program;
    private uncompressedDrawCall: WebGL2DrawCall;
    private compressedDrawCall: WebGL2DrawCall;

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
        ///
        const engine = this.engine;
        engine.clearColor(0.0, 0.0, 0.0, 1.0);
        ///
        const sphere = Utils.createSphere({ radius: 0.48 });
        const uncompressedPositions = engine.createVertexBuffer(GL.FLOAT, 3, sphere.positions);
        const uncompressedNormals = engine.createVertexBuffer(GL.FLOAT, 3, sphere.normals);
        const indices = engine.createIndexBuffer(GL.UNSIGNED_SHORT, 3, sphere.indices);

        const uncompressedVertexArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, uncompressedPositions)
            .vertexAttributeBuffer(1, uncompressedNormals)
            .indexBuffer(indices);

        const b = bounds(sphere.positions);
        const q = quantize(sphere.positions, b.min, b.max);
        const encodedNormals = octEncode(sphere.normals);

        const compressedPositions = engine.createVertexBuffer(GL.UNSIGNED_SHORT, 3, q.quantized);
        const compressedNormals = engine.createVertexBuffer(GL.BYTE, 2, encodedNormals);

        const compressedVertexArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, compressedPositions)
            .vertexAttributeBuffer(1, compressedNormals, { normalized: true })
            .indexBuffer(indices);

        const uncompressedTransform = mat4.create();
        mat4.fromTranslation(uncompressedTransform, vec3.fromValues(-0.5, 0.0, 0.0));

        const compressedTransform = mat4.create();
        mat4.fromTranslation(compressedTransform, vec3.fromValues(0.5, 0.0, 0.0));


        this.uncompressedDrawCall = engine.createDrawCall(this.uncompressedProgram, uncompressedVertexArray)
            .uniform("model", uncompressedTransform);

        this.compressedDrawCall = engine.createDrawCall(this.compressedProgram, compressedVertexArray)
            .uniform("decode", q.decode)
            .uniform("model", compressedTransform);
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-mesh-compression/uncompressed.vs.glsl',
                'resource/assets/shader-mesh-compression/compressed.vs.glsl',
                'resource/assets/shader-mesh-compression/main.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.uncompressedVsSource = txts[0];
            this.compressedVsSource = txts[1];
            this.fShaderSource = txts[2];
            //
            const programs = await this.engine.createPrograms(
                [this.uncompressedVsSource, this.fShaderSource],
                [this.compressedVsSource, this.fShaderSource],
            );
            this.uncompressedProgram = programs[0];
            this.compressedProgram = programs[1];
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
        this.uncompressedDrawCall.draw();
        this.compressedDrawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.uncompressedProgram.delete();
        this.compressedProgram.delete();
        this.uncompressedDrawCall.delete();
        this.compressedDrawCall.delete();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        return this;
    }
}