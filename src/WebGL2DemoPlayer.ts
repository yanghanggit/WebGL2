

class WebGL2DemoPlayer extends WebGL2Object implements System {

    //
    private _application: Application = null;
    private _currentScene: WebGL2DemoScene = null;
    private _nextScene: WebGL2DemoScene = null;
    //
    constructor(_engine: WebGL2Engine) {
        super(_engine);
    }

    public get application(): Application {
        return this._application;
    }

    public attachApplication(_application: Application): WebGL2DemoPlayer {
        this._application = _application;
        return this;
    }

    public changeScene(targetScene: WebGL2DemoScene): WebGL2DemoPlayer {
        if (this._currentScene === targetScene) {
            return this;
        }
        this._nextScene = targetScene;
        return this;
    }

    public update(): WebGL2DemoPlayer {
        if (this._nextScene) {
            if (this._currentScene) {
                this._currentScene.leave();
                this._currentScene = null;
            }
            this._currentScene = this._nextScene;
            this._currentScene.enter();
            this._nextScene = null;
        }
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
