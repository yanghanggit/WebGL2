
class WebGL2Timer extends WebGL2Object {

    private readonly _cpuTimer: Performance | DateConstructor = null;
    public gpuTimerQuery: WebGL2Query = null;
    public cpuStartTime: number = 0;
    public cpuTime: number = 0;
    public gpuTime: number = 0;
    private _gpuTimerEnable: boolean = false;

    constructor(engine: WebGL2Engine) {
        super(engine);
        this._cpuTimer = window.performance || Date;
        this._gpuTimerEnable = this.engine.capbility('GPU_TIMER');
        this.restore();
    }

    public restore(): WebGL2Timer {
        if (this._gpuTimerEnable) {
            if (this.gpuTimerQuery) {
                this.gpuTimerQuery.restore();
            } else {
                this.gpuTimerQuery = new WebGL2Query(this.engine, GL.TIME_ELAPSED_EXT);
            }
        }
        this.cpuStartTime = 0;
        this.cpuTime = 0;
        this.gpuTime = 0;
        return this;
    }

    public start(): WebGL2Timer {
        if (this._gpuTimerEnable) {
            if (!this.gpuTimerQuery.active) {
                this.gpuTimerQuery.begin();
                this.cpuStartTime = this._cpuTimer.now();
            }
        } else {
            this.cpuStartTime = this._cpuTimer.now();
        }
        return this;
    }

    public end(): WebGL2Timer {
        if (this._gpuTimerEnable) {
            if (!this.gpuTimerQuery.active) {
                this.gpuTimerQuery.end();
                this.cpuTime = this._cpuTimer.now() - this.cpuStartTime;
            }
        } else {
            this.cpuTime = this._cpuTimer.now() - this.cpuStartTime;
        }
        return this;
    }

    public ready(): boolean {
        if (this._gpuTimerEnable) {
            if (!this.gpuTimerQuery.active) {
                return false;
            }
            const gpuTimerAvailable = this.gpuTimerQuery.ready();
            const gpuTimerDisjoint = this.gl.getParameter(GL.GPU_DISJOINT_EXT);
            if (gpuTimerAvailable && !gpuTimerDisjoint) {
                this.gpuTime = this.gpuTimerQuery.result / 1000000;
                return true;
            } else {
                return false;
            }
        }
        return Boolean(this.cpuStartTime);
    }

    public delete(): WebGL2Timer {
        if (this.gpuTimerQuery) {
            this.gpuTimerQuery.delete();
            this.gpuTimerQuery = null;
        }
        return this;
    }
}
