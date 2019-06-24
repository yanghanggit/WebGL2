///////////////////////////////////////////////////////////////////////////////////
// The MIT License (MIT)
//
// Copyright (c) 2017 Tarek Sherif
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
///////////////////////////////////////////////////////////////////////////////////

class Timer {
    constructor() {
    }

    public restore(): Timer {
        return this;
    }

    public start(): Timer {
        return this;
    }

    public end(): Timer {
        return this;
    }

    public ready(): boolean {
        return false;
    }

    public delete(): Timer {
        return this;
    }
}

class WebGL2Timer extends Timer {

    private readonly _engine: WebGL2Engine = null;
    private readonly gl: WebGLRenderingContext = null;
    private cpuTimer: Performance | DateConstructor = null;
    private gpuTimerQuery: WebGL2Query = null;
    private cpuStartTime: number = 0;
    private cpuTime: number = 0;
    private gpuTime: number = 0;

    constructor(engine: WebGL2Engine) {
        super();
        this._engine = engine;
        this.gl = engine.gl;
        this.cpuTimer = window.performance || Date;
        // this.gpuTimerQuery = null;
        // this.cpuStartTime = 0;
        // this.cpuTime = 0;
        // this.gpuTime = 0;
        this.restore();
    }

    public restore(): WebGL2Timer {
        /*
        if (WEBGL_INFO.GPU_TIMER) {
            if (this.gpuTimerQuery) {
                this.gpuTimerQuery.restore();
            } else {
                this.gpuTimerQuery = new Query(this.gl, GL.TIME_ELAPSED_EXT);
            }
        }

        this.cpuStartTime = 0;
        this.cpuTime = 0;
        this.gpuTime = 0;
        */

        return this;
    }

    public start(): WebGL2Timer {
        /*
        if (WEBGL_INFO.GPU_TIMER) {
            if (!this.gpuTimerQuery.active) {
                this.gpuTimerQuery.begin();
                this.cpuStartTime = this.cpuTimer.now();
            }
        } else {
            this.cpuStartTime = this.cpuTimer.now();
        }
        */
        return this;
    }

    public end(): WebGL2Timer {
        /*
        if (WEBGL_INFO.GPU_TIMER) {
            if (!this.gpuTimerQuery.active) {
                this.gpuTimerQuery.end();
                this.cpuTime = this.cpuTimer.now() - this.cpuStartTime;
            }
        } else {
            this.cpuTime = this.cpuTimer.now() - this.cpuStartTime;
        }
        */
        return this;
    }

    public ready(): boolean {
        /*
        if (WEBGL_INFO.GPU_TIMER) {
            if (!this.gpuTimerQuery.active) {
                return false;
            }

            var gpuTimerAvailable = this.gpuTimerQuery.ready();
            var gpuTimerDisjoint = this.gl.getParameter(GL.GPU_DISJOINT_EXT);

            if (gpuTimerAvailable && !gpuTimerDisjoint) {
                this.gpuTime = this.gpuTimerQuery.result  / 1000000;
                return true;
            } else {
                return false;
            }
        } else {
            return Boolean(this.cpuStartTime);
        }
        */
        return true;
    }

    public delete(): WebGL2Timer {
        /*
        if (this.gpuTimerQuery) {
            this.gpuTimerQuery.delete();
            this.gpuTimerQuery = null;
        }
        */
        return this;
    }

}
