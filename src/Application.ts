

class Profile {

    private _timer: WebGL2Timer = null;
    constructor(timer: WebGL2Timer) {
        this._timer = timer;
    }

    public start(): Profile {
        if (this._timer.ready()) {
            //utils.updateTimerElement(timer.cpuTime, timer.gpuTime);
        }
        this._timer.start();
        return this;
    }

    public end(): Profile {
        this._timer.end();
        return this;
    }

    public dispose(): Profile {
        this._timer.delete();
        this._timer = null;
        return this;
    }
}



class Application {

    private _exited: boolean = false;
    private _started: boolean = false;
    private _paused: boolean = false;
    private _engine: WebGL2Engine = null;
    private _player: Player = null;
    private _profile: Profile = null;

    constructor(engine: WebGL2Engine, _player: Player) {
        this._engine = engine;
        this._player = _player;
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
        this._profile = new Profile(this.engine.createTimer());
        return this;
    }

    public update(): Application {
        this._profile.start();
        ////////////////////////////
        this._player.play();
        this._engine.render();
        ////////////////////////////
        this._profile.end();
        return this;
    }

    public stop(): Application {
        this._player.stop();
        this._engine.stop();
        return this;
    }

    public dispose(): Application {

        this._player.dispose();
        this._player = null;

        this._engine.dispose();
        this._engine = null;

        this._profile.dispose();
        this._profile = null;
        return this;
    }

    public resize(width: number, height: number): Application {
        this._engine.resize(width, height);
        return this;
    }
}

