

class WebGL2DemoPlayer implements System {

    private _application: Application = null;
    private readonly _engine: WebGL2Engine = null;
    private _currentScene: WebGL2DemoScene = null;

    constructor(_engine: WebGL2Engine) {
        //super();
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

    public changeScene(targetScene: WebGL2DemoScene): WebGL2DemoPlayer {
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

    public resize(width: number, height: number): WebGL2DemoPlayer {
        if (this._currentScene) {
            this._currentScene.resize(width, height);
        }
        return this;
    }

    public start(): WebGL2DemoPlayer {
        return this;
    }

    public stop(): WebGL2DemoPlayer {
        return this;
    }

    public pause(): WebGL2DemoPlayer {
        return this;
    }

    public resume(): WebGL2DemoPlayer {
        return this;
    }

    public dispose(): WebGL2DemoPlayer {
        return this;
    }

    public exit(): WebGL2DemoPlayer {
        return this;
    }
}
