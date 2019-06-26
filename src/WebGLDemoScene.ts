
class WebGLDemoScene extends Scene {

    private readonly _player: WebGL2DemoPlayer = null;
    constructor(player: WebGL2DemoPlayer) {
        super();
        this._player = player;
    }

    public enter(): Scene {
        return this;
    }

    public update(): Scene {
        return this;
    }

    public leave(): Scene {
        return this;
    }

    public get player(): WebGL2DemoPlayer {
        return this._player;
    }
}
