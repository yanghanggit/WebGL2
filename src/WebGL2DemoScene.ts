
class WebGL2DemoScene {

    private readonly _player: WebGL2DemoPlayer = null;
    constructor(player: WebGL2DemoPlayer) {
        //super();
        this._player = player;
    }

    public enter(): WebGL2DemoScene {
        return this;
    }

    public update(): WebGL2DemoScene {
        return this;
    }

    public leave(): WebGL2DemoScene {
        return this;
    }

    public get player(): WebGL2DemoPlayer {
        return this._player;
    }

    public get engine(): WebGL2Engine {
        return this._player.engine;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        return this;
    }
}
