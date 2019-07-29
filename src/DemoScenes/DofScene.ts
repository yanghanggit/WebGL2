
class DofScene extends WebGL2DemoScene {

    // private projMatrix: Float32Array;
    // private viewMatrix: Float32Array;
    // private mvpMatrix: Float32Array;
    // private vsSource: string;
    // private fsSource: string;
    // private startTime: number = 0;
    // private program: WebGL2Program;
    // private drawCall: WebGL2DrawCall;

    private boxVsSource: string;
    private boxFsSource: string;
    private quadVsSource: string;
    private blurFsSource: string;
    private boxProgram: WebGL2Program;
    private blurProgram: WebGL2Program;
    private image: HTMLImageElement;

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
                'resource/assets/shader-dof/boxes.vs.glsl',
                'resource/assets/shader-dof/boxes.fs.glsl',
                'resource/assets/shader-dof/quad.vs.glsl',
                'resource/assets/shader-dof/blur.fs.glsl'
            ];
            const txts = await this.engine.loadText(ress);
            this.boxVsSource = txts[0];
            this.boxFsSource = txts[1];
            this.quadVsSource = txts[2];
            this.blurFsSource = txts[3];
            //
            const programs = await this.engine.createPrograms(
                [this.boxVsSource, this.boxFsSource], [this.quadVsSource, this.blurFsSource]
            );
            this.boxProgram = programs[0];
            this.blurProgram = programs[1];

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
        // this.drawCall.uniform("uTime", (performance.now() - this.startTime) / 1000);
        // this.engine.clear();
        // this.drawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        // this.program.delete();
        // this.drawCall.delete();
         const engine = this.engine;
        // engine.noBlend();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        // mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        // mat4.multiply(this.mvpMatrix, this.projMatrix, this.viewMatrix);
        return this;
    }
}