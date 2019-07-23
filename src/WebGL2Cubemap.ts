
class WebGL2Cubemap extends WebGL2Object {

    public readonly is3D: boolean = false;
    public texture: WebGLTexture;
    private readonly compressed: boolean;
    private readonly internalFormat: number = 0;
    private readonly format: number = 0;
    private readonly type: number = 0;
    private currentUnit: number = -1;
    public readonly width: number = 0;
    public readonly height: number = 0;
    private readonly flipY: boolean;
    private readonly premultiplyAlpha: boolean;
    private readonly minFilter: number = 0;
    private readonly magFilter: number = 0;
    private readonly wrapS: number = 0;
    private readonly wrapT: number = 0;
    private readonly compareMode: number = 0;
    private readonly compareFunc: number = 0;
    private readonly minLOD: number = 0;
    private readonly maxLOD: number = 0;
    private readonly baseLevel: number = 0;
    private readonly maxLevel: number = 0;
    private readonly maxAnisotropy: number = 0;
    private readonly mipmaps: boolean;
    private readonly miplevelsProvided: boolean;
    private readonly levels: number = 0;

    constructor(engine: WebGL2Engine, options: CreateTextureOptions) {
        super(engine);
        this.compressed = COMPRESSED_TEXTURE_TYPES[options.internalFormat];
        if (options.format) {
            this.compressed = Boolean(COMPRESSED_TEXTURE_TYPES[options.format]);
            if (!options.type) {
                options.type = options.format === GL.DEPTH_COMPONENT ? GL.UNSIGNED_SHORT : GL.UNSIGNED_BYTE;
            }
            if (!options.internalFormat) {
                if (this.compressed) {
                    options.internalFormat = options.format;
                } else {
                    options.internalFormat = TEXTURE_FORMAT_DEFAULTS[options.type][options.format];
                }
            }
        }
        if (this.compressed) {
            this.internalFormat = options.internalFormat;
            this.format = options.internalFormat;
            this.type = GL.UNSIGNED_BYTE;
        } else {
            this.internalFormat = options.internalFormat ? options.internalFormat : GL.RGBA8;
            const formatInfo = TEXTURE_FORMATS[this.internalFormat];
            this.format = formatInfo[0];
            this.type = options.type ? options.type : formatInfo[1];
        }
        const arrayData = Array.isArray(options.negX);
        const negX = arrayData ? options.negX[0] : options.negX;
        const {
            width = negX.width,
            height = negX.height,
            flipY = false,
            premultiplyAlpha = false,
            minFilter = negX ? GL.LINEAR_MIPMAP_NEAREST : GL.NEAREST,
            magFilter = negX ? GL.LINEAR : GL.NEAREST,
            wrapS = GL.REPEAT,
            wrapT = GL.REPEAT,
            compareMode = GL.NONE,
            compareFunc = GL.LEQUAL,
            minLOD = null,
            maxLOD = null,
            baseLevel = null,
            maxLevel = null,
            maxAnisotropy = 1
        } = options;
        this.width = width;
        this.height = height;
        this.flipY = flipY;
        this.premultiplyAlpha = premultiplyAlpha;
        this.minFilter = minFilter;
        this.magFilter = magFilter;
        this.wrapS = wrapS;
        this.wrapT = wrapT;
        this.compareMode = compareMode;
        this.compareFunc = compareFunc;
        this.minLOD = minLOD;
        this.maxLOD = maxLOD;
        this.baseLevel = baseLevel;
        this.maxLevel = maxLevel;
        this.maxAnisotropy = Math.min(maxAnisotropy, WEBGL_INFO.MAX_TEXTURE_ANISOTROPY);
        this.mipmaps = (minFilter === GL.LINEAR_MIPMAP_NEAREST || minFilter === GL.LINEAR_MIPMAP_LINEAR);
        this.miplevelsProvided = arrayData && (Array.isArray(options.negX) && options.negX.length > 1);
        this.levels = this.mipmaps ? Math.floor(Math.log2(Math.min(this.width, this.height))) + 1 : 1;
        this.restore(options);
    }

    private restore(options: CreateTextureOptions): WebGL2Cubemap {
        this.texture = this.gl.createTexture();
        if (this.currentUnit !== -1) {
            this.state.textures[this.currentUnit] = null;
        }
        this.bind(0);
        this.gl.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, this.flipY);
        this.gl.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);
        this.gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAG_FILTER, this.magFilter);
        this.gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, this.minFilter);
        this.gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_S, this.wrapS);
        this.gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_T, this.wrapT);
        this.gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_COMPARE_FUNC, this.compareFunc);
        this.gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_COMPARE_MODE, this.compareMode);
        if (this.baseLevel) {
            this.gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_BASE_LEVEL, this.baseLevel);
        }
        if (this.maxLevel) {
            this.gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAX_LEVEL, this.maxLevel);
        }
        if (this.minLOD) {
            this.gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_LOD, this.minLOD);
        }
        if (this.maxLOD) {
            this.gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAX_LOD, this.maxLOD);
        }
        if (this.maxAnisotropy > 1) {
            this.gl.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAX_ANISOTROPY_EXT, this.maxAnisotropy);
        }
        this.gl.texStorage2D(GL.TEXTURE_CUBE_MAP, this.levels, this.internalFormat, this.width, this.height);
        const { negX, posX, negY, posY, negZ, posZ } = options as CreateTextureOptions;
        if (negX) {
            this.faceData(GL.TEXTURE_CUBE_MAP_NEGATIVE_X, negX);
            this.faceData(GL.TEXTURE_CUBE_MAP_POSITIVE_X, posX);
            this.faceData(GL.TEXTURE_CUBE_MAP_NEGATIVE_Y, negY);
            this.faceData(GL.TEXTURE_CUBE_MAP_POSITIVE_Y, posY);
            this.faceData(GL.TEXTURE_CUBE_MAP_NEGATIVE_Z, negZ);
            this.faceData(GL.TEXTURE_CUBE_MAP_POSITIVE_Z, posZ);
        }
        if (this.mipmaps && !this.miplevelsProvided) {
            this.gl.generateMipmap(GL.TEXTURE_CUBE_MAP);
        }
        return this;
    }

    public delete(): WebGL2Cubemap {
        if (this.texture) {
            this.gl.deleteTexture(this.texture);
            this.texture = null;
            this.state.textures[this.currentUnit] = null;
            this.currentUnit = -1;
        }
        return this;
    }

    private faceData(face: number, data: HTMLImageElement[] | HTMLImageElement | Array<any>): WebGL2Cubemap {
        if (!Array.isArray(data)) {
            DUMMY_UNIT_ARRAY[0] = data;
            data = DUMMY_UNIT_ARRAY;
        }
        const numLevels = this.mipmaps ? data.length : 1;
        let width = this.width;
        let height = this.height;
        if (this.compressed) {
            for (let i = 0; i < numLevels; ++i) {
                this.gl.compressedTexSubImage2D(face, i, 0, 0, width, height, this.format, data[i]);
                width = Math.max(width >> 1, 1);
                height = Math.max(height >> 1, 1);
            }
        } else {
            for (let i = 0; i < numLevels; ++i) {
                this.gl.texSubImage2D(face, i, 0, 0, width, height, this.format, this.type, data[i]);
                width = Math.max(width >> 1, 1);
                height = Math.max(height >> 1, 1);
            }
        }
        return this;
    }

    public bind(unit: number): any {
        const currentTexture = this.state.textures[unit] as any;
        if (currentTexture !== this) {
            if (currentTexture) {
                currentTexture.currentUnit = -1;
            }
            if (this.currentUnit !== -1) {
                this.state.textures[this.currentUnit] = null;
            }
            this.gl.activeTexture(GL.TEXTURE0 + unit);
            this.gl.bindTexture(GL.TEXTURE_CUBE_MAP, this.texture);
            this.state.textures[unit] = (this) as any;
            this.currentUnit = unit;
        }
        return this;
    }

    public resize(width: number, height: number): WebGL2Cubemap {
        return this;
    }
}
