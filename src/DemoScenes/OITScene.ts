
class OITScene extends WebGL2DemoScene {

    public enter(): OITScene {
        const engine = this.engine;
        if (!engine.capbility("EXT_color_buffer_float")) {
            console.error("OITScene: This example requires extension <b>EXT_color_buffer_float</b> which is not supported on this system.");
            return this;
        }
        return this;
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