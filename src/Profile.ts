

const NUM_TIMING_SAMPLES = 10;
let cpuTimeSum = 0;
let gpuTimeSum = 0;
let timeSampleCount = NUM_TIMING_SAMPLES - 1;

class Profile implements System {

    private _timer: WebGL2Timer = null;
    constructor(timer: WebGL2Timer) {
        this._timer = timer;
    }

    public profileStart(): Profile {
        if (this._timer.ready()) {
            this.show().updateTimer();
        }
        this._timer.start();
        return this;
    }

    public profileEnd(): Profile {
        this._timer.end();
        return this;
    }

    public dispose(): Profile {
        this._timer.delete();
        this._timer = null;
        return this;
    }

    //
    private timerDiv: HTMLDivElement;
    private cpuTimeElement: HTMLDivElement;
    private gpuTimeElement: HTMLDivElement;
    public show(): Profile {
        if (!this.timerDiv) {
            this.timerDiv = document.createElement("div")
            this.timerDiv.id = "timer";
            this.cpuTimeElement = document.createElement("div");
            this.gpuTimeElement = document.createElement("div");
            this.timerDiv.appendChild(this.cpuTimeElement);
            this.timerDiv.appendChild(this.gpuTimeElement);
            document.body.appendChild(this.timerDiv);
        }
        return this;
    }

    public updateTimer(): Profile {
        const timer = this._timer;
        return this._updateTimer(timer.cpuTime, timer.gpuTime);
    }

    private _updateTimer(cpuTime: number, gpuTime: number): Profile {
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
            }
            cpuTimeSum = 0;
            gpuTimeSum = 0;
            timeSampleCount = 0;
        }
        return this;
    }

    public start(): Profile {
        return this;
    }

    public stop(): Profile {
        return this;
    }

    public pause(): Profile {
        return this;

    }

    public resume(): Profile {
        return this;
    }

    public exit(): Profile {
        return this;
    }

    public update(): Profile {
        return this;
    }
}