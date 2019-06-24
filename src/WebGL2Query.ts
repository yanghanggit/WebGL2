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

// class Query {

//     constructor() {
//     }

//     public restore(): Query {
//         return this;
//     }

//     public begin(): Query {
//         return this;
//     }

//     public end(): Query {
//         return this;
//     }

//     public ready(): boolean {
//         return false;
//     }

//     public delete(): Query {
//         return this;
//     }
// }


// class WebGL2Query extends Query {

//     private readonly _engine: WebGL2Engine = null;
//     private readonly gl: WebGLRenderingContext = null;
//     private readonly target: number = 0;
//     private query: WebGLQuery = null;
//     private active: boolean = false;
//     private result: number = 0;

//     constructor(engine: WebGL2Engine, target: number) {
//         super();
//         this._engine = engine;
//         this.gl = engine.gl;
//         this.target = target;
//         this.restore();
//     }

//     public restore(): WebGL2Query {
//         this.query = this.gl.createQuery();
//         this.active = false;
//         this.result = null;
//         return this;
//     }

//     public begin(): WebGL2Query {
//         if (!this.active) {
//             this.gl.beginQuery(this.target, this.query);
//             this.result = 0;
//         }
//         return this;
//     }

//     public end(): WebGL2Query {
//         if (!this.active) {
//             this.gl.endQuery(this.target);
//             this.active = true;
//         }
//         return this;
//     }

//     public ready(): boolean {
        
//         if (this.active && this.gl.getQueryParameter(this.query, GL.QUERY_RESULT_AVAILABLE)) {
//             this.active = false;
//             // Note(Tarek): Casting because FF incorrectly returns booleans.
//             // https://bugzilla.mozilla.org/show_bug.cgi?id=1422714 
//             this.result = Number(this.gl.getQueryParameter(this.query, GL.QUERY_RESULT));
//             return true;
//         }
//         return false;
//     }

//     public delete(): WebGL2Query {
//         if (this.query) {
//             this.gl.deleteQuery(this.query);
//             this.query = null;
//         }
//         return this;
//     }

// }
