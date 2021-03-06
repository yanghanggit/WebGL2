
class RunEvent {
    public callback: Function = null;
}

class Application implements System {

    private _exited: boolean = false;
    private _started: boolean = false;
    private _paused: boolean = false;
    private _engine: WebGL2Engine = null;
    private _player: WebGL2DemoPlayer = null;
    private _profile: WebGL2Profile = null;
    private readonly subsystems: System[] = [];
    private readonly _events: RunEvent[] = [];
    private readonly webTouchHandler: WebTouchHandler = null;

    constructor(engine: WebGL2Engine, _player: WebGL2DemoPlayer) {
        //
        this._engine = engine;
        this._engine.attachApplication(this);
        //
        this._player = _player;
        this._player.attachApplication(this);
        //
        this._profile = new WebGL2Profile(engine);
        //
        this.addSystem(this._player);
        this.addSystem(this._engine);
        this.addSystem(this._profile);

        this.webTouchHandler = new WebTouchHandler(null, engine.canvas);
    }

    private addSystem(sys: System): boolean {
        if (this.subsystems.indexOf(sys) >= 0) {
            return false;
        }
        this.subsystems.push(sys);
        return true;
    }

    public get started(): boolean {
        return this._started;
    }

    public get paused(): boolean {
        return this._paused;
    }

    public get exited(): boolean {
        return this._exited;
    }

    public get engine(): WebGL2Engine {
        return this._engine;
    }

    public get profile(): WebGL2Profile {
        return this._profile;
    }

    public start(): Application {
        this._started = true;
        this._exited = false;
        this._paused = false;
        for (const sys of this.subsystems) {
            sys.start();
        }
        return this;
    }

    public exit(): Application {
        this._exited = true;
        for (const sys of this.subsystems) {
            sys.exit();
        }
        return this;
    }

    public pause(): Application {
        this._paused = true;
        for (const sys of this.subsystems) {
            sys.pause();
        }
        return this;
    }

    public resume(): Application {
        this._paused = false;
        for (const sys of this.subsystems) {
            sys.resume();
        }
        return this;
    }

    public update(): Application {
        this._profile.profileStart();
        this._engine.drawCalls = 0;
        ////////////////////////////
        for (const sys of this.subsystems) {
            sys.update();
        }
        this._engine.render();
        this.flushCallbackLater();
        ////////////////////////////
        this._profile.profileEnd();
        return this;
    }

    private flushCallbackLater(): Application {
        if (this._events.length > 0) {
            for (const v of this._events) {
                v.callback && v.callback();
            }
            this._events.length = 0;
        }
        return this;
    }

    public callbackLater(callback: Function): Application {
        const v = new RunEvent;
        v.callback = callback;
        this._events.push(v);
        return this;
    }

    public stop(): Application {
        for (const sys of this.subsystems) {
            sys.stop();
        }
        return this;
    }

    public dispose(): Application {
        for (const sys of this.subsystems) {
            sys.dispose();
        }
        this.subsystems.length = 0;
        return this;
    }

    public resize(width: number, height: number): Application {
        this._player.resize(width, height);
        this._engine.resize(width, height);
        return this;
    }
}

