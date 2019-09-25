
/**
 * 一个demo场景的基类
 */
class WebGL2DemoScene {
    /**
     * WebGL2DemoPlayer
     */
    private readonly _player: WebGL2DemoPlayer;
    /**
    * Application
    */
    private readonly _application: Application;
    /**
    * WebGL2Engine
    */
    private readonly _engine: WebGL2Engine;
    /**
     * 可以心跳
     */
    protected _ready: boolean;
    /**
     * 
     */
    protected _resizeDirty: boolean;
    /**
     * constructor
     * @param player 
     */
    constructor(player: WebGL2DemoPlayer) {
        this._player = player;
        this._application = player.application;
        this._engine = player.engine;
    }
    public ready(): WebGL2DemoScene {
        this._ready = true;
        return this;
    }
    /**
     * 进入场景
     */
    public enter(): WebGL2DemoScene {
        return this;
    }
    /**
     * 更新
     */
    public update(): WebGL2DemoScene {
        if (!this._ready) {
            return this;
        }
        if (this._resizeDirty) {
            this._resizeDirty = false;
            this.onResize();
        }
        this.onUpdate();
        return this;
    }
    /**
     * 核心执行
     */
    protected onUpdate(): WebGL2DemoScene {
        return this;
    }
    /**
     * 核心执行
     */
    protected onResize(): WebGL2DemoScene {
        return this;
    }
    /**
     * 离开
     */
    public leave(): WebGL2DemoScene {
        return this;
    }
    /**
     * getter
     */
    public get player(): WebGL2DemoPlayer {
        return this._player;
    }
    /**
     * getter
     */
    public get engine(): WebGL2Engine {
        return this._engine;
    }
    /**
     * getter
     */
    public get application(): Application {
        return this._application;
    }
    /**
     * 监听窗口重制
     * @param width 窗口width
     * @param height 窗口height
     */
    public resize(width: number, height: number): WebGL2DemoScene {
        this._resizeDirty = true;
        return this;
    }
}
