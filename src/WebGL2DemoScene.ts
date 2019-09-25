
/**
 * camera
 */
class Camera {
    /**
     * 
     */
    private readonly viewMatrix: Float32Array = mat4.create();
    private readonly projMatrix: Float32Array = mat4.create();
    private readonly viewProjMatrix: Float32Array = mat4.create();
    /**
     * 
     */
    private readonly eyePosition: Float32Array = vec3.fromValues(0, 0, 0);
    /**
     * 
     */
    private readonly center: Float32Array = vec3.fromValues(0, 0, 0);
    /**
     * 
     */
    private readonly up: Float32Array = vec3.fromValues(0, 1, 0);
    /**
     * 
     */
    private dirty: boolean;
    /**
     * 
     * @param fovy 
     * @param aspect 
     * @param near 
     * @param far 
     */
    constructor(fovy: number, aspect: number, near: number, far: number) {
        //
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, fovy, aspect, near, far); 
        //
        this.eye(1, 1, 1);
        this.lookAt(0, 0, 0);
        this.update();
    }
    /**
     * 
     * @param x 
     * @param y 
     * @param z 
     */
    public lookAt(x: number, y: number, z: number): Camera {
        this.center[0] = x;
        this.center[1] = y;
        this.center[2] = z;
        this.dirty = true;
        return this;
    }
    /**
     * 
     * @param x 
     * @param y 
     * @param z 
     */
    public eye(x: number, y: number, z: number): Camera {
        this.eyePosition[0] = x;
        this.eyePosition[1] = y;
        this.eyePosition[2] = z;
        this.dirty = true;
        return this;
    }
    /**
     * 
     */
    public update(): Camera {
        if (!this.dirty) {
            return this;
        }
        this.dirty = false;
        mat4.lookAt(this.viewMatrix, this.eyePosition, this.center, this.up);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        return this;
    }
}
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
        if (this._ready) {
            this._update();
        }
        return this;
    }
    /**
     * 核心执行
     */
    protected _update(): WebGL2DemoScene {
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
        return this;
    }
}
