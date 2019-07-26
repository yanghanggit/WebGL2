
class _3DTextureScene extends WebGL2DemoScene {

    private projMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private mvpMatrix: Float32Array;
    private drawCall: WebGL2DrawCall;
    private tex3DVsSource: string;
    private tex3DFsSource: string;
    private vsSource: string;
    private fsSource: string;
    private tex3DProgram: WebGL2Program;
    private program: WebGL2Program;
    private image: HTMLImageElement;
    private startTime: number = 0;

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
        const app = engine;//this.engine;
        const PicoGL = GL;


        //let app = PicoGL.createApp(canvas)
        app.clearColor(0.0, 0.0, 0.0, 1.0)
        .blend()
        .blendFunc(PicoGL.ONE, PicoGL.ONE_MINUS_SRC_ALPHA);

        //let timer = app.createTimer();

        // SET UP PROGRAM
        // let vsSource =  document.getElementById("vertex-draw").text.trim();
        // let fsSource =  document.getElementById("fragment-draw").text.trim();

        // CREATE POINT CLOUD
        const DIMENSIONS = 128;
        const INCREMENT = 1 / DIMENSIONS;

        let positionData = new Float32Array(DIMENSIONS * DIMENSIONS * DIMENSIONS * 3);

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

        let positions = app.createVertexBuffer(PicoGL.FLOAT, 3, positionData)

        let pointArray = app.createVertexArray()
        .vertexAttributeBuffer(0, positions);

        
        // CREATE 3D TEXTURE
         /*const TEXTURE_DIMENSIONS = 16;
        let textureData = new Uint8Array(TEXTURE_DIMENSIONS * TEXTURE_DIMENSIONS * TEXTURE_DIMENSIONS);
        let textureIndex = 0;
        for (let i = 0; i < TEXTURE_DIMENSIONS; ++i) {
            for (let j = 0; j < TEXTURE_DIMENSIONS; ++j) {
                for (let k = 0; k < TEXTURE_DIMENSIONS; ++k) {
                    let val = snoise([i, j, k]) * 255
                    textureData[textureIndex++] = val;
                }
            }
        }
       
        let texture = app.createTexture3D(textureData, TEXTURE_DIMENSIONS, TEXTURE_DIMENSIONS, TEXTURE_DIMENSIONS, { 
            internalFormat: PicoGL.R8, 
            maxAnisotropy: PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY 
        });

        // UNIFORM DATA
        let projMatrix = mat4.create();
        mat4.perspective(projMatrix, Math.PI / 2, canvas.width / canvas.height, 0.1, 10.0);

        let viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        let mvpMatrix = mat4.create();
        mat4.multiply(mvpMatrix, projMatrix, viewMatrix);
        */
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-3dtexture/draw.vs.glsl',
                'resource/assets/shader-3dtexture/draw.fs.glsl'
            ];
            const txts = await this.engine.loadText(ress);
            // this.tex3DVsSource = txts[0];
            // this.tex3DFsSource = txts[1];
            this.vsSource = txts[0];
            this.fsSource = txts[1];
            //
            const programs = await this.engine.createPrograms(
                //[this.tex3DVsSource, this.tex3DFsSource],
                [this.vsSource, this.fsSource]
            );
            //
            //this.tex3DProgram = programs[0];
            this.program = programs[0];
            //
            // const texarrays: string[] = [
            //     'resource/assets/bg.jpg',
            // ];
            // const loadImages = await this.engine.loadImages(texarrays);
            // this.image = loadImages[0];
        }
        catch (e) {
            console.error(e);
        }
    }

    public update(): WebGL2DemoScene {
        if (!this._ready) {
            return;
        }
        // this.drawCall.uniform("uTime", (performance.now() - this.startTime) / 1000);
        // this.engine.clear();
        // this.drawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        // this.drawCall.delete();
        // this.tex3DProgram.delete();
        // this.program.delete();
        // //
         const engine = this.engine;
        engine.noBlend();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        // mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        // mat4.multiply(this.mvpMatrix, this.projMatrix, this.viewMatrix);
        return this;
    }
}