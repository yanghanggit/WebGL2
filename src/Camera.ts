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