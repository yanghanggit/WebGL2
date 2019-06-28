

const zeros = vec3.fromValues(0, 0, 0);
const ones = vec3.fromValues(1, 1, 1);
const translateMat = mat4.create();
const rotateXMat = mat4.create();
const rotateYMat = mat4.create();
const rotateZMat = mat4.create();
const scaleMat = mat4.create();

interface SphereModel {
   positions: Float32Array,
   normals: Float32Array,
   uvs: Float32Array,
   indices: Uint16Array
}

interface CreateSphereModelOptions {
   longBands: number,
   latBands: number,
   radius: number,
}

class WebGL2State {

   private readonly _engine: WebGL2Engine = null;
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

   public createPrograms(...sources: any[]): Promise<any> {
      return new Promise((resolve, reject) => {
         const numPrograms = sources.length;
         const programs = new Array(numPrograms);
         const pendingPrograms = new Array(numPrograms);
         let numPending = numPrograms;
         for (let i = 0; i < numPrograms; ++i) {
            const source = sources[i];
            const vsSource = source[0];
            const fsSource = source[1];
            const xformFeedbackVars = source[2];
            programs[i] = new WebGL2Program(this, vsSource, fsSource, xformFeedbackVars);
            pendingPrograms[i] = programs[i];
         }
         for (let i = 0; i < numPrograms; ++i) {
            programs[i].link();
         }
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

   public createTexture2D(image: number | HTMLImageElement, width: number | Object, height?: number | Object, options?: Object): WebGL2Texture {
      if (typeof image === "number") {
         options = height;
         height = width;
         width = image;
         image = null;
      } else if (height === undefined) {
         options = width;
         width = image.width;
         height = image.height;
      }
      return new WebGL2Texture(this, this.gl.TEXTURE_2D, image, width, height, undefined, false, options);
   }

   public createFramebuffer(): WebGL2Framebuffer {
      return new WebGL2Framebuffer(this);
   }

   public createSphere(options: CreateSphereModelOptions): SphereModel {
      options = options || {} as CreateSphereModelOptions;
      let longBands = options.longBands || 32;
      let latBands = options.latBands || 32;
      let radius = options.radius || 1;
      let lat_step = Math.PI / latBands;
      let long_step = 2 * Math.PI / longBands;
      let num_positions = longBands * latBands * 4;
      let num_indices = longBands * latBands * 6;
      let lat_angle: number, long_angle: number;
      let positions = new Float32Array(num_positions * 3);
      let normals = new Float32Array(num_positions * 3);
      let uvs = new Float32Array(num_positions * 2);
      let indices = new Uint16Array(num_indices);
      let x1: number, x2: number, x3: number, x4: number,
         y1: number, y2: number,
         z1: number, z2: number, z3: number, z4: number,
         u1: number, u2: number,
         v1: number, v2: number;
      let i: number, j: number;
      let k = 0, l = 0;
      let vi: number, ti: number;
      for (i = 0; i < latBands; i++) {
         lat_angle = i * lat_step;
         y1 = Math.cos(lat_angle);
         y2 = Math.cos(lat_angle + lat_step);
         for (j = 0; j < longBands; j++) {
            long_angle = j * long_step;
            x1 = Math.sin(lat_angle) * Math.cos(long_angle);
            x2 = Math.sin(lat_angle) * Math.cos(long_angle + long_step);
            x3 = Math.sin(lat_angle + lat_step) * Math.cos(long_angle);
            x4 = Math.sin(lat_angle + lat_step) * Math.cos(long_angle + long_step);
            z1 = Math.sin(lat_angle) * Math.sin(long_angle);
            z2 = Math.sin(lat_angle) * Math.sin(long_angle + long_step);
            z3 = Math.sin(lat_angle + lat_step) * Math.sin(long_angle);
            z4 = Math.sin(lat_angle + lat_step) * Math.sin(long_angle + long_step);
            u1 = 1 - j / longBands;
            u2 = 1 - (j + 1) / longBands;
            v1 = 1 - i / latBands;
            v2 = 1 - (i + 1) / latBands;
            vi = k * 3;
            ti = k * 2;

            positions[vi] = x1 * radius;
            positions[vi + 1] = y1 * radius;
            positions[vi + 2] = z1 * radius; //v0

            positions[vi + 3] = x2 * radius;
            positions[vi + 4] = y1 * radius;
            positions[vi + 5] = z2 * radius; //v1

            positions[vi + 6] = x3 * radius;
            positions[vi + 7] = y2 * radius;
            positions[vi + 8] = z3 * radius; // v2


            positions[vi + 9] = x4 * radius;
            positions[vi + 10] = y2 * radius;
            positions[vi + 11] = z4 * radius; // v3

            normals[vi] = x1;
            normals[vi + 1] = y1;
            normals[vi + 2] = z1;

            normals[vi + 3] = x2;
            normals[vi + 4] = y1;
            normals[vi + 5] = z2;

            normals[vi + 6] = x3;
            normals[vi + 7] = y2;
            normals[vi + 8] = z3;

            normals[vi + 9] = x4;
            normals[vi + 10] = y2;
            normals[vi + 11] = z4;

            uvs[ti] = u1;
            uvs[ti + 1] = v1;

            uvs[ti + 2] = u2;
            uvs[ti + 3] = v1;

            uvs[ti + 4] = u1;
            uvs[ti + 5] = v2;

            uvs[ti + 6] = u2;
            uvs[ti + 7] = v2;

            indices[l] = k;
            indices[l + 1] = k + 1;
            indices[l + 2] = k + 2;
            indices[l + 3] = k + 2;
            indices[l + 4] = k + 1;
            indices[l + 5] = k + 3;

            k += 4;
            l += 6;
         }
      }
      return {
         positions: positions,
         normals: normals,
         uvs: uvs,
         indices: indices
      } as SphereModel;
   }

   public createVertexBuffer(type: number, itemSize: number, data: Float32Array | Uint8Array, usage?: number): WebGL2VertexBuffer {
      return new WebGL2VertexBuffer(this, type, itemSize, data, usage);
   }

   public createIndexBuffer(type: number, itemSize: number, data: Uint16Array, usage?: number): WebGL2VertexBuffer {
      return new WebGL2VertexBuffer(this, type, itemSize, data, usage, true);
   }

   public createMatrixBuffer(type: number, data: Float32Array, usage?: number): WebGL2VertexBuffer {
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

   public xformMatrix(xform: Float32Array, translate: Float32Array, rotate: Float32Array, scale: Float32Array): Float32Array {
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
}

