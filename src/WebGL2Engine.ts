

const zeros = [0, 0, 0];
const ones = [1, 1, 1];

const translateMat = mat4.create();
const rotateXMat = mat4.create();
const rotateYMat = mat4.create();
const rotateZMat = mat4.create();
const scaleMat = mat4.create();

// function loadShaderFromFile(url: string, onLoadShader: Function, onLoadShaderFailed: Function): void {
//    // const request = new XMLHttpRequest();
//    // request.onreadystatechange = function () {
//    //    if (request.readyState === 4 && request.status === 200) {
//    //       onLoadShader && onLoadShader(request.responseText);
//    //    }
//    //    else {
//    //       //onLoadShaderFailed && onLoadShaderFailed(filename);
//    //    }
//    // };
//    // request.open("GET", filename, true);
//    // request.send();
//    const http = new XMLHttpRequest();
//    http.open("GET", url, true);
//    //http.responseType = "blob";
//    http.onload = function (e) {
//       if (this["status"] == 200 || this["status"] === 0) {
//          onLoadShader && onLoadShader(http.responseText);
//       }
//    };
//    http.onerror = function (e) {
//       console.log(url + ':' + e);
//       onLoadShaderFailed && onLoadShaderFailed(url);
//    }
//    http.send();
// }

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
   public readonly freeUniformBufferBases;//: any[] = [];
   public drawFramebuffer: WebGL2Framebuffer;//: any[] = null;
   public readFramebuffer: WebGL2Framebuffer;//: any[] = null;
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
   public width: number = 0;//this.gl.drawingBufferWidth;
   public height: number = 0;//this.gl.drawingBufferHeight;
   private viewportX: number = 0;
   private viewportY: number = 0;
   private viewportWidth: number = 0;
   private viewportHeight: number = 0;
   private currentDrawCalls = null;
   private emptyFragmentShader = null;
   private clearBits: number = 0;
   private contextLostExt = null;
   private contextRestoredHandler = null;

   constructor(canvas: HTMLCanvasElement, contextAttributes: any) {
      //
      this._canvas = canvas;
      this._webgl2Context = canvas.getContext("webgl2", contextAttributes) as WebGLRenderingContext;
      this._webGL2Capability = new WebGL2Capability(this);
      this._webGL2State = new WebGL2State(this);
      // loadShaderFromFile(fsFile, function (content: string) {
      //    console.log(vsFile + ' => ' + content);
      // });
      this.width = this.gl.drawingBufferWidth;
      this.height = this.gl.drawingBufferHeight;
      // this.viewportX = 0;
      // this.viewportY = 0;
      // this.viewportWidth = 0;
      // this.viewportHeight = 0;
      // this.currentDrawCalls = null;
      // this.emptyFragmentShader = null;

      this.clearBits = this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT;

      //   this.cpuTime = 0;
      //   this.gpuTime = 0;

      this.viewport(0, 0, this.width, this.height);

      this.contextLostExt = null;
      this.contextRestoredHandler = null;

      // this.initExtensions();

      this._canvas.addEventListener("webglcontextlost", (e) => {
         e.preventDefault();
      });

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

   viewport(x, y, width, height) {

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

   clearColor(r, g, b, a) {
      this.gl.clearColor(r, g, b, a);
      return this;
   }

   blend() {
      this.gl.enable(this.gl.BLEND);

      return this;
   }

   depthMask(mask) {
      this.gl.depthMask(mask);

      return this;
   }



   // Enable extensions
   initExtensions() {
      this.gl.getExtension("EXT_color_buffer_float");
      this.gl.getExtension("OES_texture_float_linear");
      this.gl.getExtension("WEBGL_compressed_texture_s3tc");
      this.gl.getExtension("WEBGL_compressed_texture_s3tc_srgb");
      this.gl.getExtension("WEBGL_compressed_texture_etc");
      this.gl.getExtension("WEBGL_compressed_texture_astc");
      this.gl.getExtension("WEBGL_compressed_texture_pvrtc");
      this.gl.getExtension("EXT_disjoint_timer_query_webgl2");
      this.gl.getExtension("EXT_disjoint_timer_query");
      this.gl.getExtension("EXT_texture_filter_anisotropic");

      this.state.extensions.debugShaders = this.gl.getExtension("WEBGL_debug_shaders");
      this.contextLostExt = this.gl.getExtension("WEBGL_lose_context");

      // Draft extensions
      this.gl.getExtension("KHR_parallel_shader_compile");
      this.state.extensions.multiDrawInstanced = this.gl.getExtension("WEBGL_multi_draw_instanced");
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
      return this;
   }

   public update(): WebGL2Engine {
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
   }

   createTexture2D(image, width, height?, options?) {
      if (typeof image === "number") {
         // Create empty texture just give width/height.
         options = height;
         height = width;
         width = image;
         image = null;
      } else if (height === undefined) {
         // Passing in a DOM element. Height/width not required.
         options = width;
         width = image.width;
         height = image.height;
      }

      return new WebGL2Texture(/*this.gl, this.state,*/this, this.gl.TEXTURE_2D, image, width, height, undefined, false, options);
   }

   /**
         Create a framebuffer.
 
         @method
         @return {Framebuffer} New Framebuffer object.
     */
   createFramebuffer() {
      return new WebGL2Framebuffer(/*this.gl, this.state*/this);
   }

   createSphere(options) {
      options = options || {};

      let longBands = options.longBands || 32;
      let latBands = options.latBands || 32;
      let radius = options.radius || 1;
      let lat_step = Math.PI / latBands;
      let long_step = 2 * Math.PI / longBands;
      let num_positions = longBands * latBands * 4;
      let num_indices = longBands * latBands * 6;
      let lat_angle, long_angle;
      let positions = new Float32Array(num_positions * 3);
      let normals = new Float32Array(num_positions * 3);
      let uvs = new Float32Array(num_positions * 2);
      let indices = new Uint16Array(num_indices);
      let x1, x2, x3, x4,
         y1, y2,
         z1, z2, z3, z4,
         u1, u2,
         v1, v2;
      let i, j;
      let k = 0, l = 0;
      let vi, ti;

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
      };
   }

   createVertexBuffer(type, itemSize, data, usage?: number) {
      return new WebGL2VertexBuffer(/*this.gl, this.state,*/this, type, itemSize, data, usage);
   }

   createIndexBuffer(type, itemSize, data, usage?: number) {
      return new WebGL2VertexBuffer(/*this.gl, this.state,*/this, type, itemSize, data, usage, true);
   }

   createMatrixBuffer(type, data, usage?: number) {
      return new WebGL2VertexBuffer(/*this.gl, this.state,*/this, type, 0, data, usage);
   }

   createVertexArray() {
      return new WebGL2VertexArray(/*this.gl, this.state,*/this);
   }

   createUniformBuffer(layout, usage?: number) {
      return new WebGL2UniformBuffer(/*this.gl, this.state,*/this, layout, usage);
   }

   createDrawCall(program, vertexArray, primitive?) {
      return new WebGL2DrawCall(/*this.gl, this.state,*/this, program, vertexArray, primitive);
   }

   xformMatrix(xform, translate, rotate, scale) {
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
   }

   drawFramebuffer(framebuffer) {
      framebuffer.bindForDraw();
      return this;
   }

   blendFuncSeparate(csrc, cdest, asrc, adest) {
      this.gl.blendFuncSeparate(csrc, cdest, asrc, adest);

      return this;
   }

   clear() {
      this.gl.clear(this.clearBits);

      return this;
   }

   defaultDrawFramebuffer() {
      if (this.state.drawFramebuffer !== null) {
         this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null);
         this.state.drawFramebuffer = null;
      }

      return this;
   }

   blendFunc(src, dest) {
      this.gl.blendFunc(src, dest);

      return this;
   }

}

