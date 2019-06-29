
class WebGL2Capability extends WebGL2Object {
   
   public readonly cap: { [index: string]: any } = {};
   private initialized: boolean = false;
   constructor(engine: WebGL2Engine) {
      super(engine);
      this.initialize();
   }

   public initialize(): WebGL2Capability {
      if (this.initialized) {
         return this;
      }
      this.initialized = true;

      const gl = this.gl;
      const cap = this.cap;

      cap.MAX_TEXTURE_UNITS = gl.getParameter(GL.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
      cap.MAX_UNIFORM_BUFFERS = gl.getParameter(GL.MAX_UNIFORM_BUFFER_BINDINGS);
      cap.MAX_UNIFORMS = Math.min(
         gl.getParameter(GL.MAX_VERTEX_UNIFORM_VECTORS),
         gl.getParameter(GL.MAX_FRAGMENT_UNIFORM_VECTORS)
      );
      cap.SAMPLES = gl.getParameter(GL.SAMPLES);
      cap.VENDOR = "(Unknown)";
      cap.RENDERER = "(Unknown)";

      // Extensions
      cap.FLOAT_RENDER_TARGETS = Boolean(gl.getExtension("EXT_color_buffer_float"));
      cap.LINEAR_FLOAT_TEXTURES = Boolean(gl.getExtension("OES_texture_float_linear"));
      cap.S3TC_TEXTURES = Boolean(gl.getExtension("WEBGL_compressed_texture_s3tc"));
      cap.S3TC_SRGB_TEXTURES = Boolean(gl.getExtension("WEBGL_compressed_texture_s3tc_srgb"));
      cap.ETC_TEXTURES = Boolean(gl.getExtension("WEBGL_compressed_texture_etc"));
      cap.ASTC_TEXTURES = Boolean(gl.getExtension("WEBGL_compressed_texture_astc"));
      cap.PVRTC_TEXTURES = Boolean(gl.getExtension("WEBGL_compressed_texture_pvrtc"));
      cap.LOSE_CONTEXT = Boolean(gl.getExtension("WEBGL_lose_context"));
      cap.DEBUG_SHADERS = Boolean(gl.getExtension("WEBGL_debug_shaders"));
      cap.GPU_TIMER = Boolean(gl.getExtension("EXT_disjoint_timer_query_webgl2") || gl.getExtension("EXT_disjoint_timer_query"));

      cap.TEXTURE_ANISOTROPY = Boolean(gl.getExtension("EXT_texture_filter_anisotropic"));
      cap.MAX_TEXTURE_ANISOTROPY = cap.TEXTURE_ANISOTROPY ? gl.getParameter(GL.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;

      cap.DEBUG_RENDERER_INFO = Boolean(gl.getExtension("WEBGL_debug_renderer_info"));
      if (cap.DEBUG_RENDERER_INFO) {
         cap.VENDOR = gl.getParameter(GL.UNMASKED_VENDOR_WEBGL);
         cap.RENDERER = gl.getParameter(GL.UNMASKED_RENDERER_WEBGL);
      }

      // Draft extensions
      cap.PARALLEL_SHADER_COMPILE = Boolean(gl.getExtension("KHR_parallel_shader_compile"));
      cap.MULTI_DRAW_INSTANCED = Boolean(gl.getExtension("WEBGL_multi_draw_instanced"));

      //做兼容
      for (const pro in cap) {
         WEBGL_INFO[pro] = cap[pro];
      }
      return this;
   }
}