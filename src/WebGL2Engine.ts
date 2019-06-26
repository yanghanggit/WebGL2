

function loadShaderFromFile(url: string, onLoadShader: Function, onLoadShaderFailed: Function): void {
   // const request = new XMLHttpRequest();
   // request.onreadystatechange = function () {
   //    if (request.readyState === 4 && request.status === 200) {
   //       onLoadShader && onLoadShader(request.responseText);
   //    }
   //    else {
   //       //onLoadShaderFailed && onLoadShaderFailed(filename);
   //    }
   // };
   // request.open("GET", filename, true);
   // request.send();
   const http = new XMLHttpRequest();
   http.open("GET", url, true);
   //http.responseType = "blob";
   http.onload = function (e) {
      if (this["status"] == 200 || this["status"] === 0) {
         onLoadShader && onLoadShader(http.responseText);
      }
   };
   http.onerror = function (e) {
      console.log(url + ':' + e);
      onLoadShaderFailed && onLoadShaderFailed(url);
   }
   http.send();
}

/*
this.state = {
   program: null,
   vertexArray: null,
   transformFeedback: null,
   activeTexture: -1,
   textures: new Array(WEBGL_INFO.MAX_TEXTURE_UNITS),
   uniformBuffers: new Array(WEBGL_INFO.MAX_UNIFORM_BUFFERS),
   freeUniformBufferBases: [],
   drawFramebuffer: null,
   readFramebuffer: null,
   extensions: {}
};
*/

class WebGL2State {

   private readonly _engine: WebGL2Engine;
   public program: any = null;
   public vertexArray: any = null;
   public transformFeedback: any = null;
   public activeTexture: number = -1;
   public readonly textures: any[] = [];//new Array(WEBGL_INFO.MAX_TEXTURE_UNITS),
   public readonly uniformBuffers: any[] = [];//new Array(WEBGL_INFO.MAX_UNIFORM_BUFFERS),
   public readonly freeUniformBufferBases: any[] = [];
   public drawFramebuffer: any[] = null;
   public readFramebuffer: any[] = null;
   public readonly extensions: any = {};

   constructor(_engine: WebGL2Engine) {
      this._engine = _engine;
      this.textures = new Array(this._engine.capbility('MAX_TEXTURE_UNITS'));
      this.uniformBuffers = new Array(this._engine.capbility('MAX_UNIFORM_BUFFERS'));
   }
}

class WebGL2Engine implements System {

   private _application: Application = null;
   private readonly _canvas: HTMLCanvasElement = null;
   private readonly _webgl2Context: WebGLRenderingContext = null;
   private readonly _webGL2Capability: WebGL2Capability = null;
   private readonly _webGL2State: WebGL2State = null;

   constructor(canvas: HTMLCanvasElement, contextAttributes: any) {
      //
      this._canvas = canvas;
      this._webgl2Context = canvas.getContext("webgl2", contextAttributes) as WebGLRenderingContext;
      this._webGL2Capability = new WebGL2Capability(this);
      this._webGL2State = new WebGL2State(this);
      // loadShaderFromFile(fsFile, function (content: string) {
      //    console.log(vsFile + ' => ' + content);
      // });
   }

   public get application(): Application {
      return this._application;
   }

   public attachApplication(_application: Application): WebGL2Engine {
      this._application = _application;
      return this;
   }

   public get gl(): WebGLRenderingContext {
      return this._webgl2Context;
   }

   public capbility(name: string): any {
      return this._webGL2Capability.cap[name];
   }

   public getExtension(ext: string): any {
      return this.gl.getExtension(ext);
   }
   /*
   var dummyGL = document.createElement("canvas").getContext("webgl2");
   if (!dummyGL) {
       console.error("WebGL 2 not available");
       window.onload = function() {
           document.open();
           document.write("<!DOCTYPE html><html><body>This example requires WebGL 2 which is unavailable on this system.</body></html>");
           document.close();
       }
   }

   window.testExtension = function(ext) {
       return Boolean(dummyGL.getExtension(ext));
   };
   */

   public get state(): WebGL2State {
      return this._webGL2State;
   }

   public render(): WebGL2Engine {
      return this;
   }

   public update(): WebGL2Engine {
      return this;
   }

   public stop(): WebGL2Engine {
      return this;
   }

   public dispose(): WebGL2Engine {
      return this;
   }

   public resize(width: number, height: number): WebGL2Engine {
      return this;
   }

   public start(): WebGL2Engine {
      return this;
   }

   public pause(): WebGL2Engine {
      return this;
   }

   public resume(): WebGL2Engine {
      return this;
   }

   public exit(): WebGL2Engine {
      return this;
   }

   public createTimer(): WebGL2Timer {
      return new WebGL2Timer(this);
   }

   createPrograms(...sources) {
      return new Promise((resolve, reject) => {
         let numPrograms = sources.length;
         let programs = new Array(numPrograms);
         let pendingPrograms = new Array(numPrograms);
         let numPending = numPrograms;

         for (let i = 0; i < numPrograms; ++i) {
            let source = sources[i];
            let vsSource = source[0];
            let fsSource = source[1];
            let xformFeedbackVars = source[2];
            programs[i] = new WebGL2Program(/*this.gl, this.state,*/this, vsSource, fsSource, xformFeedbackVars);
            pendingPrograms[i] = programs[i];
         }

         for (let i = 0; i < numPrograms; ++i) {
            programs[i].link();
         }

         let poll = () => {
            let linked = 0;
            for (let i = 0; i < numPending; ++i) {
               if (pendingPrograms[i].checkCompletion()) {
                  pendingPrograms[i].checkLinkage();
                  if (pendingPrograms[i].linked) {
                     ++linked;
                  } else {
                     reject(new Error("Program linkage failed"));
                     return;
                  }
               } else {
                  pendingPrograms[i - linked] = pendingPrograms[i];
               }
            }

            numPending -= linked;

            if (numPending === 0) {
               resolve(programs);
            } else {
               this.application.addCallbackLater(poll);
               //requestAnimationFrame(poll);
            }
         };

         poll();
      });
   }

   public loadImages(urls: string[]): Promise<any> {
      return new Promise(
         (resolve) => {
            let numImages = urls.length;
            let images = new Array(numImages);
            function onload() {
               if (--numImages === 0) {
                  resolve(images);
               }
            }
            for (let i = 0; i < numImages; ++i) {
               images[i] = new Image();
               images[i].onload = onload;
               images[i].src = urls[i];
            }
         }
      );
   }

   public loadText(urls: string[]): Promise<any> {
      return new Promise(
         (resolve) => {
            let loadcount = urls.length;
            let texts = new Array(loadcount);
            function onload() {
               if ((--loadcount) === 0) {
                  resolve(texts);
               }
            }
            function onerror() {
               if ((--loadcount) === 0) {
                  resolve(texts);
               }
            }
            for (let i = 0; i < loadcount; ++i) {
               const http = new XMLHttpRequest();
               http.open('GET', urls[i], true);
               http.onload = function (e) {
                  if (this["status"] == 200 || this["status"] === 0) {
                     texts[i] = http.responseText;
                     onload();
                  }
               };
               http.onerror = function (e) {
                  onerror();
               }
               http.send();
            }
         }
      );


      // const request = new XMLHttpRequest();
      // request.onreadystatechange = function () {
      //    if (request.readyState === 4 && request.status === 200) {
      //       onLoadShader && onLoadShader(request.responseText);
      //    }
      //    else {
      //       //onLoadShaderFailed && onLoadShaderFailed(filename);
      //    }
      // };
      // request.open("GET", filename, true);
      // request.send();
      // const http = new XMLHttpRequest();
      // http.open("GET", url, true);
      // //http.responseType = "blob";
      // http.onload = function (e) {
      //    if (this["status"] == 200 || this["status"] === 0) {
      //       onLoadShader && onLoadShader(http.responseText);
      //    }
      // };
      // http.onerror = function (e) {
      //    console.log(url + ':' + e);
      //    onLoadShaderFailed && onLoadShaderFailed(url);
      // }
      // http.send();
   }






}

