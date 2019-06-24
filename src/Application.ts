
class Application {

    private _exit: boolean = false;
    private _started: boolean = false;
    private _paused: boolean = false;
    private readonly _engine: WebGL2Engine = null;
    private readonly _gamePlay: GamePlay = null;
    private _timer: WebGL2Timer = null;

    constructor(engine: WebGL2Engine, gamePlay: GamePlay) {
        this._engine = engine;
        this._gamePlay = gamePlay;
    }

    public get started(): boolean {
        return this._started;
    }

    public get paused(): boolean {
        return this._paused;
    }

    public get exit(): boolean {
        return this._exit;
    }

    public get engine(): WebGL2Engine {
        return this._engine;
    }

    public start(): void {
        this._started = true;
        this._exit = false;
        this._paused = false;

        this._timer = this.engine.createTimer();


    }

    public run(): void {
        this.onBegin();
        this._gamePlay.play();
        this._engine.render();
        this.onEnd();
    }

    private onBegin(): void {
        if (this._timer.ready()) {
            //utils.updateTimerElement(timer.cpuTime, timer.gpuTime);
        }
        this._timer.start();
    }

    private onEnd(): void {
        this._timer.end();
    }
    
    public stop(): void {
        this._gamePlay.stop();
        this._engine.stop();
    }

    public destroy(): void {
        this._gamePlay.destroy();
        this._engine.destroy();
    }

    public resize(width: number, height: number): void {
        this._engine.resize(width, height);
    }
}

