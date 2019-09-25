

const zeros = vec3.fromValues(0, 0, 0);
const ones = vec3.fromValues(1, 1, 1);
const translateMat = mat4.create();
const rotateXMat = mat4.create();
const rotateYMat = mat4.create();
const rotateZMat = mat4.create();
const scaleMat = mat4.create();



interface TextureArrayData {
   data: HTMLImageElement;
   width: number;
   height: number;
   length: number;
}

interface BlitFramebufferOptions {
   srcStartX?: number,
   srcStartY?: number,
   srcEndX?: number,
   srcEndY?: number,
   dstStartX?: number,
   dstStartY?: number,
   dstEndX?: number,
   dstEndY?: number,
   filter?: number,
};





class WebGL2State {

   private readonly engine: WebGL2Engine = null;
   public program: any = null;
   public vertexArray: any = null;
   public transformFeedback: any = null;
   public activeTexture: number = -1;
   public readonly textures: WebGL2Texture[] = [];
   public readonly uniformBuffers: any[] = [];
   public readonly freeUniformBufferBases;
   public drawFramebuffer: WebGL2Framebuffer = null;
   public readFramebuffer: WebGL2Framebuffer = null;
   public readonly extensions: any = {};

   constructor(engine: WebGL2Engine) {
      this.engine = engine;
      this.textures = new Array(this.engine.capbility('MAX_TEXTURE_UNITS'));
      this.uniformBuffers = new Array(this.engine.capbility('MAX_UNIFORM_BUFFERS'));
   }
}

class WebGL2Engine implements System {

   private _application: Application = null;
   private readonly _canvas: HTMLCanvasElement = null;
   private readonly _webgl2Context: WebGLRenderingContext = null;
   private readonly _webGL2Capability: WebGL2Capability = null;
   private readonly _webGL2State: WebGL2State = null;
   public width: number = 0;
   public height: number = 0;
   private viewportX: number = 0;
   private viewportY: number = 0;
   private viewportWidth: number = 0;
   private viewportHeight: number = 0;
   private currentDrawCalls = null;
   private emptyFragmentShader = null;
   private clearBits: number = 0;
   private contextLostExt: any = null;
   private contextRestoredHandler: Function = null;
   public drawCalls: number;

   constructor(canvas: HTMLCanvasElement, contextAttributes: any) {
      //
      this._canvas = canvas;
      this._webgl2Context = canvas.getContext("webgl2", contextAttributes) as WebGLRenderingContext;
      this._webGL2Capability = new WebGL2Capability(this);
      this._webGL2State = new WebGL2State(this);
      //
      this.width = this.gl.drawingBufferWidth;
      this.height = this.gl.drawingBufferHeight;
      this.clearBits = this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT;
      this.viewport(0, 0, this.width, this.height);
      //
      this.initExtensions();
      //
      this._canvas.addEventListener("webglcontextlost", (e) => {
         e.preventDefault();
      });
      //
      this._canvas.addEventListener("webglcontextrestored", () => {
         this.initExtensions();
         if (this.contextRestoredHandler) {
            this.contextRestoredHandler();
         }
      });
   }

   public get canvas(): HTMLCanvasElement {
      return this._canvas;
   }

   public stop(): WebGL2Engine {
      return this;
   }

   public dispose(): WebGL2Engine {
      return this;
   }

   public resize(width: number, height: number): WebGL2Engine {
      this.canvas.width = width;
      this.canvas.height = height;
      this.width = this.gl.drawingBufferWidth;
      this.height = this.gl.drawingBufferHeight;
      this.viewport(0, 0, this.width, this.height);
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

   public viewport(x: number, y: number, width: number, height: number): WebGL2Engine {
      if (this.viewportWidth !== width || this.viewportHeight !== height ||
         this.viewportX !== x || this.viewportY !== y) {
         this.viewportX = x;
         this.viewportY = y;
         this.viewportWidth = width;
         this.viewportHeight = height;
         this.gl.viewport(x, y, this.viewportWidth, this.viewportHeight);
      }
      return this;
   }

   public clearColor(r: number, g: number, b: number, a: number): WebGL2Engine {
      this.gl.clearColor(r, g, b, a);
      return this;
   }

   public blend(): WebGL2Engine {
      this.gl.enable(this.gl.BLEND);
      return this;
   }

   public noBlend(): WebGL2Engine {
      this.gl.disable(this.gl.BLEND);
      return this;
   }

   public depthMask(mask: boolean): WebGL2Engine {
      this.gl.depthMask(mask);
      return this;
   }

   private initExtensions(): WebGL2Engine {
      const gl = this.gl;
      gl.getExtension("EXT_color_buffer_float");
      gl.getExtension("OES_texture_float_linear");
      gl.getExtension("WEBGL_compressed_texture_s3tc");
      gl.getExtension("WEBGL_compressed_texture_s3tc_srgb");
      gl.getExtension("WEBGL_compressed_texture_etc");
      gl.getExtension("WEBGL_compressed_texture_astc");
      gl.getExtension("WEBGL_compressed_texture_pvrtc");
      gl.getExtension("EXT_disjoint_timer_query_webgl2");
      gl.getExtension("EXT_disjoint_timer_query");
      gl.getExtension("EXT_texture_filter_anisotropic");
      //
      this.contextLostExt = gl.getExtension("WEBGL_lose_context");
      //
      const stateExtensions = this.state.extensions;
      stateExtensions.debugShaders = gl.getExtension("WEBGL_debug_shaders");
      // Draft extensions
      gl.getExtension("KHR_parallel_shader_compile");
      stateExtensions.multiDrawInstanced = gl.getExtension("WEBGL_multi_draw_instanced");
      return this;
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

   public get state(): WebGL2State {
      return this._webGL2State;
   }

   public render(): WebGL2Engine {
      //目前就是空跑，后续主要是运行DrawCall的list
      return this;
   }

   public update(): WebGL2Engine {
      return this;
   }

   public createTimer(): WebGL2Timer {
      return new WebGL2Timer(this);
   }
   /**
    * 资源组
    * @param sources 
    */
   public createPrograms(...sources: any[]): Promise<Array<WebGL2Program>> {
      return new Promise((resolve, reject) => {
         const numPrograms = sources.length;
         const programs = new Array<WebGL2Program>(numPrograms);
         const pendingPrograms = new Array<WebGL2Program>(numPrograms);
         let numPending = numPrograms;
         //创建
         for (let i = 0; i < numPrograms; ++i) {
            const sourceGroup = sources[i];
            const vsSource = sourceGroup[0];
            const fsSource = sourceGroup[1];
            const transformFeedback = sourceGroup[2];
            programs[i] = new WebGL2Program(this, vsSource, fsSource, transformFeedback);
            pendingPrograms[i] = programs[i];
         }
         //连接
         for (let i = 0; i < numPrograms; ++i) {
            programs[i].link();
         }
         //每帧检查
         const poll = () => {
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
                  //
                  pendingPrograms[i - linked] = pendingPrograms[i];
               }
            }
            numPending -= linked;
            if (numPending === 0) {
               resolve(programs);
            } else {
               this.application.callbackLater(poll);
            }
         };
         poll();
      });
   }

   public loadImages(urls: string[]): Promise<any> {
      return new Promise(
         (resolve) => {
            let numImages = urls.length;
            const images = new Array(numImages);
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
            const texts = new Array(loadcount);
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
                     texts[i] = http.responseText.trim();
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
   }

   public createTexture2DByData(data: Float32Array | Uint8Array, width: number, height: number, options: CreateTextureOptions): WebGL2Texture {
      return new WebGL2Texture(this, this.gl.TEXTURE_2D, data, width, height, undefined, false, options);
   }

   public createTexture2DByImage(image: HTMLImageElement, options: CreateTextureOptions): WebGL2Texture {
      return new WebGL2Texture(this, this.gl.TEXTURE_2D, image, image.width, image.height, undefined, false, options);
   }

   public createTexture2DBySize(width: number, height: number, options: CreateTextureOptions): WebGL2Texture {
      return new WebGL2Texture(this, this.gl.TEXTURE_2D, null, width, height, undefined, false, options);
   }

   public createFramebuffer(): WebGL2Framebuffer {
      return new WebGL2Framebuffer(this);
   }
   

   public createVertexBuffer(type: number, itemSize: number, data: number | Float32Array | Uint16Array | Uint8Array | Int8Array | Uint16Array | Int16Array, usage?: number): WebGL2VertexBuffer {
      return new WebGL2VertexBuffer(this, type, itemSize, data, usage);
   }

   public createIndexBuffer(type: number, itemSize: number, data: number | Float32Array | Uint16Array | Uint8Array | Int8Array | Uint16Array, usage?: number): WebGL2VertexBuffer {
      return new WebGL2VertexBuffer(this, type, itemSize, data, usage, true);
   }

   public createMatrixBuffer(type: number, data: number | Float32Array | Uint16Array | Uint8Array | Int8Array | Uint16Array, usage?: number): WebGL2VertexBuffer {
      return new WebGL2VertexBuffer(this, type, 0, data, usage);
   }

   public createVertexArray(): WebGL2VertexArray {
      return new WebGL2VertexArray(this);
   }

   public createUniformBuffer(layout: number[], usage?: number): WebGL2UniformBuffer {
      return new WebGL2UniformBuffer(this, layout, usage);
   }

   public createDrawCall(program: WebGL2Program, vertexArray: WebGL2VertexArray, primitive?: any): WebGL2DrawCall {
      return new WebGL2DrawCall(this, program, vertexArray, primitive);
   }

   public xformMatrix(xform: Float32Array, translate: Float32Array, rotate?: Float32Array, scale?: Float32Array): Float32Array {
      translate = translate || zeros;
      rotate = rotate || zeros;
      scale = scale || ones;
      mat4.fromTranslation(translateMat, translate);
      mat4.fromXRotation(rotateXMat, rotate[0]);
      mat4.fromYRotation(rotateYMat, rotate[1]);
      mat4.fromZRotation(rotateZMat, rotate[2]);
      mat4.fromScaling(scaleMat, scale);
      mat4.multiply(xform, rotateXMat, scaleMat);
      mat4.multiply(xform, rotateYMat, xform);
      mat4.multiply(xform, rotateZMat, xform);
      mat4.multiply(xform, translateMat, xform);
      return xform;
   }

   public drawFramebuffer(framebuffer: WebGL2Framebuffer): WebGL2Engine {
      framebuffer.bindForDraw();
      return this;
   }

   public blendFuncSeparate(csrc: number, cdest: number, asrc: number, adest: number): WebGL2Engine {
      this.gl.blendFuncSeparate(csrc, cdest, asrc, adest);
      return this;
   }

   public clear(): WebGL2Engine {
      this.gl.clear(this.clearBits);
      return this;
   }

   public defaultDrawFramebuffer(): WebGL2Engine {
      if (this.state.drawFramebuffer) {
         this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null);
         this.state.drawFramebuffer = null;
      }
      return this;
   }

   public blendFunc(src: number, dest: number): WebGL2Engine {
      this.gl.blendFunc(src, dest);
      return this;
   }

   public createTransformFeedback(): WebGL2TransformFeedback {
      return new WebGL2TransformFeedback(this);
   }

   public noRasterize(): WebGL2Engine {
      this.gl.enable(this.gl.RASTERIZER_DISCARD);
      return this;
   }

   public rasterize(): WebGL2Engine {
      this.gl.disable(this.gl.RASTERIZER_DISCARD);
      return this;
   }

   public async loadImageArray(urls: string[]): Promise<any> {
      const images = await this.loadImages(urls);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const width = images[0].width;
      const height = images[0].height;
      canvas.width = width;
      canvas.height = height * images.length;
      for (let i = 0, len = images.length; i < len; ++i) {
         ctx.drawImage(images[i], 0, i * height);
      }
      return new Promise((resolve) => {
         const image = new Image();
         image.onload = () => {
            resolve(({
               data: image,
               width: width,
               height: height,
               length: images.length
            } as TextureArrayData));
         };
         image.src = canvas.toDataURL();
      });
   }

   public depthTest(): WebGL2Engine {
      this.gl.enable(this.gl.DEPTH_TEST);
      return this;
   }

   public noDepthTest(): WebGL2Engine {
      this.gl.disable(this.gl.DEPTH_TEST);
      return this;
   }
   
   public createTextureArrayByImage(image: HTMLImageElement, width: number, height: number, depth: number, options: CreateTextureOptions): WebGL2Texture {
      return new WebGL2Texture(this, this.gl.TEXTURE_2D_ARRAY, image, width, height, depth, true, options);
   }

   public cullBackfaces(): WebGL2Engine {
      this.gl.enable(this.gl.CULL_FACE);
      return this;
   }

   public noCullBackfaces(): WebGL2Engine {
      this.gl.disable(this.gl.CULL_FACE);
      return this;
   }

   public depthFunc(func: number): WebGL2Engine {
      this.gl.depthFunc(func);
      return this;
   }

   public createRenderbuffer(width: number, height: number, internalFormat: number, samples: number = 0): WebGL2Renderbuffer {
      return new WebGL2Renderbuffer(this, width, height, internalFormat, samples);
   }

   public createShader(type: number, source: string): WebGL2Shader {
      return new WebGL2Shader(this, type, source);
   }

   public readFramebuffer(framebuffer: WebGL2Framebuffer): WebGL2Engine {
      framebuffer.bindForRead();
      return this;
   }

   public blitFramebuffer(mask: number, options: BlitFramebufferOptions = {}): WebGL2Engine {
      const readFramebuffer = this.state.readFramebuffer;
      const drawFramebuffer = this.state.drawFramebuffer;
      const defaultReadWidth = readFramebuffer ? readFramebuffer.width : this.width;
      const defaultReadHeight = readFramebuffer ? readFramebuffer.height : this.height;
      const defaultDrawWidth = drawFramebuffer ? drawFramebuffer.width : this.width;
      const defaultDrawHeight = drawFramebuffer ? drawFramebuffer.height : this.height;
      const {
         srcStartX = 0,
         srcStartY = 0,
         srcEndX = defaultReadWidth,
         srcEndY = defaultReadHeight,
         dstStartX = 0,
         dstStartY = 0,
         dstEndX = defaultDrawWidth,
         dstEndY = defaultDrawHeight,
         filter = GL.NEAREST
      } = options;
      this.gl.blitFramebuffer(srcStartX, srcStartY, srcEndX, srcEndY, dstStartX, dstStartY, dstEndX, dstEndY, mask, filter);
      return this;
   }

   public createCubemap(options: CreateTextureOptions): WebGL2Cubemap {
      return new WebGL2Cubemap(this, options);
   }

   public defaultViewport(): WebGL2Engine {
      this.viewport(0, 0, this.width, this.height);
      return this;
   }

   public createTexture3DBySize(width: number, height: number, depth: number, options: CreateTextureOptions): WebGL2Texture {
      return new WebGL2Texture(this, this.gl.TEXTURE_3D, null, width, height, depth, true, options);
   }

   public createTexture3DByData(data: Uint8Array, width: number, height: number, depth: number, options: CreateTextureOptions): WebGL2Texture {
      return new WebGL2Texture(this, this.gl.TEXTURE_3D, data, width, height, depth, true, options);
   }

   public createInterleavedBuffer(bytesPerVertex: number, data: number | Float32Array | Uint16Array | Uint8Array | Int8Array | Uint16Array, usage?: number): WebGL2VertexBuffer {
      return new WebGL2VertexBuffer(this, null, bytesPerVertex, data, usage);
   }

   public readPixel(x: number, y: number, outColor: Uint8Array, options: any = DUMMY_OBJECT): WebGL2Engine {
      const {
         format = GL.RGBA,
         type = GL.UNSIGNED_BYTE
      } = options as any;
      this.gl.readPixels(x, y, 1, 1, format, type, outColor);
      return this;
   }

   public clearMask(mask: number): WebGL2Engine {
      this.clearBits = mask;
      return this;
   }

   public stencilTest(): WebGL2Engine {
      this.gl.enable(this.gl.STENCIL_TEST);
      return this;
   }

   public noStencilTest(): WebGL2Engine {
      this.gl.disable(this.gl.STENCIL_TEST);
      return this;
   }

   public stencilOp(stencilFail: number, depthFail: number, pass: number): WebGL2Engine {
      this.gl.stencilOp(stencilFail, depthFail, pass);
      return this;
   }

   public stencilFunc(func: number, ref: number, mask: number): WebGL2Engine {
      this.gl.stencilFunc(func, ref, mask);
      return this;
   }

   public stencilMask(mask: number): WebGL2Engine {
      this.gl.stencilMask(mask);
      return this;
   }

   public scissor(x: number, y: number, width: number, height: number): WebGL2Engine {
      this.gl.scissor(x, y, width, height);
      return this;
   }

   public computeBoundingBox(position, options) {
      options = options || {};
      let buildGeometry = options.buildGeometry || false;

      let boundary = {
         min: vec3.create(),
         max: vec3.create(),
         geometry: null
      };
      vec3.set(boundary.min, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
      vec3.set(boundary.max, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
      for (let i = 0, len = position.length; i < len; i += 3) {
         boundary.min[0] = Math.min(position[i], boundary.min[0]);
         boundary.max[0] = Math.max(position[i], boundary.max[0]);
         boundary.min[1] = Math.min(position[i + 1], boundary.min[1]);
         boundary.max[1] = Math.max(position[i + 1], boundary.max[1]);
         boundary.min[2] = Math.min(position[i + 2], boundary.min[2]);
         boundary.max[2] = Math.max(position[i + 2], boundary.max[2]);
      }

      if (buildGeometry) {
         let size = vec3.create();
         vec3.subtract(size, boundary.max, boundary.min);
         boundary.geometry = Utils.createCube({
            position: boundary.min,
            dimensions: size
         });
      }

      return boundary;
   }

   public createQuery(target: number): WebGL2Query {
      return new WebGL2Query(this, target);
   }

   public colorMask(r: boolean, g: boolean, b: boolean, a: boolean): WebGL2Engine {
      this.gl.colorMask(r, g, b, a);
      return this;
   }


   public scissorTest(): WebGL2Engine {
      this.gl.enable(this.gl.SCISSOR_TEST);
      return this;
   }

   public noScissorTest(): WebGL2Engine {
      this.gl.disable(this.gl.SCISSOR_TEST);
      return this;
   }
}

