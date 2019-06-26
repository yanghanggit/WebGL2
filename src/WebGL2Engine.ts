

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

   public get gl(): WebGLRenderingContext {
      return this._webgl2Context;
   }

   public capbility(name: string): any {
      return this._webGL2Capability.cap[name];
   }

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
}

