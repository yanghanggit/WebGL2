
/**
 * 简单封装一个摄像机类
 */
class Camera {
    /**
     * 
     */
    public readonly viewMatrix: Float32Array = mat4.create();
    /**
     * 
     */
    public readonly projMatrix: Float32Array = mat4.create();
    private _fovy: number = Math.PI / 2;
    private _aspect: number = 16.0 / 9 / 0;
    private _near: number = 0.1;
    private _far: number = 10.0;
    /**
     * 
     */
    public readonly viewProjMatrix: Float32Array = mat4.create();
    /**
     * 
     */
    public readonly eyePosition: Float32Array = vec3.fromValues(0, 0, 0);
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
        this.perspective(fovy, aspect, near, far);
        this.eye(1, 1, 1);
        this.lookAt(0, 0, 0);
        this.update();
    }
    /**
     * 
     */
    public set aspect(val: number) {
        this.dirty = true;
        this._aspect = val;
        mat4.perspective(this.projMatrix, this._fovy, this._aspect, this._near, this._far);
    }
    /**
     * 
     * @param fovy 
     * @param aspect 
     * @param near 
     * @param far 
     */
    public perspective(fovy: number, aspect: number, near: number, far: number): Camera {
        this.dirty = true;
        this._fovy = fovy;
        this._aspect = aspect;
        this._near = near;
        this._far = far;
        mat4.perspective(this.projMatrix, fovy, aspect, near, far);
        return this;
    }
    /**
     * 
     * @param x 
     * @param y 
     * @param z 
     */
    public lookAt(x: number, y: number, z: number): Camera {
        this.dirty = true;
        this.center[0] = x;
        this.center[1] = y;
        this.center[2] = z;
        return this;
    }
    /**
     * 
     * @param x 
     * @param y 
     * @param z 
     */
    public eye(x: number, y: number, z: number): Camera {
        this.dirty = true;
        this.eyePosition[0] = x;
        this.eyePosition[1] = y;
        this.eyePosition[2] = z;
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
