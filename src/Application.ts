
class Application {

    private _exit: boolean = false;
    private _started: boolean = false;
    private _paused: boolean = false;
    private _engine: WebGL2Engine = null;
    private _gamePlay: GamePlay = null;

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

    public start(): void {
        this._started = true;
        this._exit = false;
        this._paused = false;
    }

    public run(): void {
        this._gamePlay.play();
        this._engine.render();
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

