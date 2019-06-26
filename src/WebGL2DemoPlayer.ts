

class WebGL2DemoPlayer extends Player {

    private _application: Application = null;
    private readonly _engine: WebGL2Engine = null;
    private _currentScene: Scene = null;

    constructor(_engine: WebGL2Engine) {
        super();
        this._engine = _engine;
    }

    public get engine(): WebGL2Engine {
        return this._engine;
    }

    public get application(): Application {
        return this._application;
    }

    public attachApplication(_application: Application): WebGL2DemoPlayer {
        this._application = _application;
        return this;
    }

    public changeScene(targetScene: Scene): WebGL2DemoPlayer {
        if (this._currentScene) {
            this._currentScene.leave();
            this._currentScene = null;
        }
        this._currentScene = targetScene;
        this._currentScene.enter();
        return this;
    }

    public update(): WebGL2DemoPlayer {
        this.updateCurrentScene();
        return this;
    }

    private updateCurrentScene(): WebGL2DemoPlayer {
        if (this._currentScene) {
            this._currentScene.update();
        }
        return this;
    }
}
