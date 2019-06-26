

function loadShaderFromFile(filename: string, onLoadShader: Function): void {
   const request = new XMLHttpRequest();
   request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
         onLoadShader(request.responseText);
      }
   };
   request.open("GET", filename, true);
   request.send();
}

class WebGL2Engine implements System {

   private readonly _canvas: HTMLCanvasElement = null;
   private readonly _webgl2Context: WebGLRenderingContext = null;

   constructor(canvas: HTMLCanvasElement, contextAttributes: any) {
      this._canvas = canvas;
      this._webgl2Context = canvas.getContext("webgl2", contextAttributes) as WebGLRenderingContext;


      // loadShaderFromFile(fsFile, function (content: string) {
      //    console.log(vsFile + ' => ' + content);
      // });
   }

   public get gl(): WebGLRenderingContext {
      return this._webgl2Context;
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
}

