
class Application implements System {

    private _exited: boolean = false;
    private _started: boolean = false;
    private _paused: boolean = false;
    private _engine: WebGL2Engine = null;
    private _player: Player = null;
    private _profile: Profile = null;
    private readonly subsystems: System[] = [];

    constructor(engine: WebGL2Engine, _player: Player) {
        //
        this._engine = engine;
        this._player = _player;
        this._profile = new Profile(this.engine.createTimer());
        //

        this.addSystem(this._player);
        this.addSystem(this._engine);
        this.addSystem(this._profile);
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
        ////////////////////////////
        for (const sys of this.subsystems) {
            sys.update();
        }
        this._engine.render();
        ////////////////////////////
        this._profile.profileEnd();
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
        this._engine.resize(width, height);
        return this;
    }
}

