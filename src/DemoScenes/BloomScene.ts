
class BloomScene extends WebGL2DemoScene {
    ///
    // private shadowVsSource: string;
    // private shadowFsSource: string;
    // private lightVsSource: string;
    // private lightFsSource: string;
    // private vsSource: string;
    // private fsSource: string;
    // private lightViewMatrixNegX: Float32Array = mat4.create();
    // private lightViewMatrixPosX: Float32Array = mat4.create();
    // private lightViewMatrixNegY: Float32Array = mat4.create();
    // private lightViewMatrixPosY: Float32Array = mat4.create();
    // private lightViewMatrixNegZ: Float32Array = mat4.create();
    // private lightViewMatrixPosZ: Float32Array = mat4.create();
    // private projMatrix: Float32Array;
    // private viewMatrix: Float32Array;
    // private viewProjMatrix: Float32Array;
    // private boxes: any[];
    // private webglImage: HTMLImageElement;
    // private cobblesImage: HTMLImageElement;
    // ///
    // private shadowProgram: WebGL2Program;
    // private lightProgram: WebGL2Program;
    // private mainProgram: WebGL2Program;
    // private shadowBuffer: WebGL2Framebuffer;
    // private shadowTarget: WebGL2Cubemap;
    // private lightDrawcall: WebGL2DrawCall;

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
        
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-omni-shadow/shadow.vs.glsl',
                'resource/assets/shader-omni-shadow/shadow.fs.glsl',
                'resource/assets/shader-omni-shadow/light.vs.glsl',
                'resource/assets/shader-omni-shadow/light.fs.glsl',
                'resource/assets/shader-omni-shadow/main.vs.glsl',
                'resource/assets/shader-omni-shadow/main.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            // this.shadowVsSource = txts[0];
            // this.shadowFsSource = txts[1];
            // this.lightVsSource = txts[2];
            // this.lightFsSource = txts[3];
            // this.vsSource = txts[4];
            // this.fsSource = txts[5];
            //
            const programs = await this.engine.createPrograms(
                // [this.shadowVsSource, this.shadowFsSource],
                // [this.lightVsSource, this.lightFsSource],
                // [this.vsSource, this.fsSource]
            );
            // this.shadowProgram = programs[0];
            // this.lightProgram = programs[1];
            // this.mainProgram = programs[2];
            //
            const texarrays: string[] = [
                'resource/assets/bg.jpg',
                'resource/assets/concrete.jpg',
            ];
            const loadImages = await this.engine.loadImages(texarrays);
            // this.webglImage = loadImages[0];
            // this.cobblesImage = loadImages[1];
        }
        catch (e) {
            console.error(e);
        }
    }

    public update(): WebGL2DemoScene {
        if (!this._ready) {
            return;
        }
        
        return this;
    }

    public leave(): WebGL2DemoScene {
        // this.shadowProgram.delete();
        // this.lightProgram.delete();
        // this.mainProgram.delete();
        // this.shadowBuffer.delete();
        // this.shadowTarget.delete();
        // this.lightDrawcall.delete();
        const engine = this.engine;
        //engine.noDepthTest();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        // const NEAR = 0.1;
        // const FAR = 20.0
        // mat4.perspective(this.projMatrix, Math.PI / 2, width / height, NEAR, FAR);
        // mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        return this;
    }
}