
class OITScene extends WebGL2DemoScene {

    public enter(): OITScene {
        const engine = this.engine;
        if (!engine.getExtension('EXT_color_buffer_float')) {
            console.error("OITScene: This example requires extension <b>EXT_color_buffer_float</b> which is not supported on this system.");
            return this;
        }
        this.loadResource();
        return this;
    }

    private async loadResource(): Promise<void> {
        try {
            const ress: string[] = [
                'resource/assets/vertex-accum.vertex',
                'resource/assets/fragment-accum.fragment',
                'resource/assets/vertex-quad.vertex',
                'resource/assets/fragment-blend.fragment'
            ];
            const txts = await this.engine.loadText(ress);
            let accumVsSource = txts[0];
            let accumFsSource = txts[1];
            let blendVsSource = txts[2];
            let blendFsSource = txts[3];
            const programs = await this.engine.createPrograms([accumVsSource, accumFsSource], [blendVsSource, blendFsSource]);
            const images = await this.engine.loadImages(["resource/assets/webgl-logo.png"]);
            console.log('load finish');
        }
        catch (e) {
            console.error(e);
        }
    }

    public update(): OITScene {
        return this;
    }

    public leave(): OITScene {
        return this;
    }

    public resize(width: number, height: number): OITScene {
        return this;
    }
}