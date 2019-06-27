

const NUM_TIMING_SAMPLES = 10;
let cpuTimeSum = 0;
let gpuTimeSum = 0;
let timeSampleCount = NUM_TIMING_SAMPLES - 1;

class WebGL2Profile implements System {

    private _timer: WebGL2Timer = null;
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

    //
    private timerDiv: HTMLDivElement;
    private cpuTimeElement: HTMLDivElement;
    private gpuTimeElement: HTMLDivElement;
    private fpsElement: HTMLDivElement;
    public show(): WebGL2Profile {
        if (!this.timerDiv) {
            const timerDiv = this.timerDiv = document.createElement("div");
            timerDiv.id = "timer";
            const style = timerDiv.style;
            //置顶，必须显示在最上面
            style.setProperty('position', 'fixed');
            style.setProperty('z-index', '999');
            style.setProperty('top', '0');
            this.cpuTimeElement = document.createElement("div");
            timerDiv.appendChild(this.cpuTimeElement);
            this.gpuTimeElement = document.createElement("div");
            timerDiv.appendChild(this.gpuTimeElement);
            this.fpsElement = document.createElement("div");
            timerDiv.appendChild(this.fpsElement);
            document.body.appendChild(this.timerDiv);
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
            if (this.timerDiv) {
                this.cpuTimeElement.innerText = "CPU time: " + cpuTimeAve.toFixed(3) + "ms";
                if (gpuTimeAve > 0) {
                    this.gpuTimeElement.innerText = "GPU time: " + gpuTimeAve.toFixed(3) + "ms";
                } else {
                    this.gpuTimeElement.innerText = "GPU time: (Unavailable)";
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
}