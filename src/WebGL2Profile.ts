

const NUM_TIMING_SAMPLES = 10;
let cpuTimeSum = 0;
let gpuTimeSum = 0;
let timeSampleCount = NUM_TIMING_SAMPLES - 1;

class WebGL2Profile implements System {

    private _timer: WebGL2Timer = null;
    private _timerDiv: HTMLDivElement = null;
    private _cpuTimeElement: HTMLDivElement = null;
    private _gpuTimeElement: HTMLDivElement = null;
    private _fpsElement: HTMLDivElement = null;
    private _titleElement: HTMLDivElement = null;

    constructor(timer: WebGL2Timer) {
        this._timer = timer;
    }

    public profileStart(): WebGL2Profile {
        if (this._timer.ready()) {
            this.show().updateTimer();
        }
        this._timer.start();
        return this;
    }

    public profileEnd(): WebGL2Profile {
        this._timer.end();
        return this;
    }

    public dispose(): WebGL2Profile {
        this._timer.delete();
        this._timer = null;
        return this;
    }

    public show(): WebGL2Profile {
        if (!this._timerDiv) {
            const timerDiv = this._timerDiv = document.createElement("div");
            timerDiv.id = "timer";
            const style = timerDiv.style;
            //置顶，必须显示在最上面
            style.setProperty('position', 'fixed');
            style.setProperty('z-index', '999');
            style.setProperty('top', '0');
            this._cpuTimeElement = document.createElement("div");
            timerDiv.appendChild(this._cpuTimeElement);
            this._gpuTimeElement = document.createElement("div");
            timerDiv.appendChild(this._gpuTimeElement);
            this._fpsElement = document.createElement("div");
            timerDiv.appendChild(this._fpsElement);
            this._titleElement = document.createElement("div");
            timerDiv.appendChild(this._titleElement);
            document.body.appendChild(this._timerDiv);
        }
        return this;
    }

    public updateTimer(): WebGL2Profile {
        const timer = this._timer;
        return this._updateTimer(timer.cpuTime, timer.gpuTime);
    }

    private _updateTimer(cpuTime: number, gpuTime: number): WebGL2Profile {
        cpuTimeSum += cpuTime;
        gpuTimeSum += gpuTime;
        ++timeSampleCount;
        if (timeSampleCount === NUM_TIMING_SAMPLES) {
            let cpuTimeAve = cpuTimeSum / NUM_TIMING_SAMPLES;
            let gpuTimeAve = gpuTimeSum / NUM_TIMING_SAMPLES;
            if (this._timerDiv) {
                this._cpuTimeElement.innerText = "CPU time: " + cpuTimeAve.toFixed(3) + "ms";
                if (gpuTimeAve > 0) {
                    this._gpuTimeElement.innerText = "GPU time: " + gpuTimeAve.toFixed(3) + "ms";
                } else {
                    this._gpuTimeElement.innerText = "GPU time: (Unavailable)";
                }
                // const fps = 1000 / cpuTimeAve;
                // this.fpsElement.innerText = "FPS: " + (fps).toFixed(3);
            }
            cpuTimeSum = 0;
            gpuTimeSum = 0;
            timeSampleCount = 0;
        }
        return this;
    }

    public start(): WebGL2Profile {
        return this;
    }

    public stop(): WebGL2Profile {
        return this;
    }

    public pause(): WebGL2Profile {
        return this;

    }

    public resume(): WebGL2Profile {
        return this;
    }

    public exit(): WebGL2Profile {
        return this;
    }

    public update(): WebGL2Profile {
        return this;
    }

    public setTitle(title: string): WebGL2Profile {
        this.show();
        if (this._titleElement) {
            this._titleElement.innerText = title;
        }
        return this;
    }
}