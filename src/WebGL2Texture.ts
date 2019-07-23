

interface CreateTextureOptions {
    minFilter?: number;
    magFilter?: number;
    wrapS?: number;
    wrapT?: number;
    wrapR?: number;
    compareMode?: number;
    compareFunc?: number;
    minLOD?: number;
    maxLOD?: number;
    baseLevel?: number;
    maxLevel?: number;
    maxAnisotropy?: number;
    flipY?: boolean;
    premultiplyAlpha?: boolean;
    internalFormat?: number;
    format?: number;
    type?: number;
    width?: number;
    height?: number;
    generateMipmaps?: boolean;
    negX?: HTMLImageElement[] | HTMLImageElement;
    posX?: HTMLImageElement[] | HTMLImageElement;
    negY?: HTMLImageElement[] | HTMLImageElement;
    posY?: HTMLImageElement[] | HTMLImageElement;
    negZ?: HTMLImageElement[] | HTMLImageElement;
    posZ?: HTMLImageElement[] | HTMLImageElement;
};

class WebGL2Texture extends WebGL2Object {

    private readonly binding: number;
    public texture: WebGLTexture;
    public width: number;
    public height: number;
    private depth: number;
    public readonly is3D: boolean;
    private readonly compressed: boolean;
    private readonly internalFormat: number;
    private readonly format: number;
    private readonly type: number;
    private currentUnit: number;
    private readonly minFilter: number;
    private readonly magFilter: number;
    private readonly wrapS: number;
    private readonly wrapT: number;
    private readonly wrapR: number;
    private readonly compareMode: number;
    private readonly compareFunc: number;
    private readonly minLOD: number;
    private readonly maxLOD: number;
    private readonly baseLevel: number;
    private readonly maxLevel: number;
    private readonly maxAnisotropy: number;
    private readonly flipY: boolean;
    private readonly premultiplyAlpha: boolean;
    private readonly mipmaps: boolean;

    constructor(_engine: WebGL2Engine, binding: number, image: number | HTMLImageElement | Float32Array, width: number, height: number, depth: number, is3D: boolean, options: CreateTextureOptions = DUMMY_OBJECT as CreateTextureOptions) {
        super(_engine);
        //
        this.binding = binding;
        this.texture = null;
        this.width = width || 0;
        this.height = height || 0;
        this.depth = depth || 0;
        this.is3D = is3D;
        this.compressed = Boolean(COMPRESSED_TEXTURE_TYPES[options.internalFormat]);
        //
        if (options.format !== undefined) {
            this.compressed = Boolean(COMPRESSED_TEXTURE_TYPES[options.format]);
            if (options.type === undefined) {
                options.type = options.format === GL.DEPTH_COMPONENT ? GL.UNSIGNED_SHORT : GL.UNSIGNED_BYTE;
            }
            if (options.internalFormat === undefined) {
                if (this.compressed) {
                    options.internalFormat = options.format;
                } else {
                    options.internalFormat = TEXTURE_FORMAT_DEFAULTS[options.type][options.format];
                }
            }
        }
        if (this.compressed) {
            this.internalFormat = options.internalFormat;
            this.format = this.internalFormat;
            this.type = GL.UNSIGNED_BYTE;
        } else {
            this.internalFormat = options.internalFormat !== undefined ? options.internalFormat : GL.RGBA8;
            let formatInfo = TEXTURE_FORMATS[this.internalFormat];
            this.format = formatInfo[0];
            this.type = options.type !== undefined ? options.type : formatInfo[1];
        }

        this.currentUnit = -1;

        const {
            minFilter = image ? GL.LINEAR_MIPMAP_NEAREST : GL.NEAREST,
            magFilter = image ? GL.LINEAR : GL.NEAREST,
            wrapS = GL.REPEAT,
            wrapT = GL.REPEAT,
            wrapR = GL.REPEAT,
            compareMode = GL.NONE,
            compareFunc = GL.LEQUAL,
            minLOD = null,
            maxLOD = null,
            baseLevel = null,
            maxLevel = null,
            maxAnisotropy = 1,
            flipY = false,
            premultiplyAlpha = false
        } = options;

        this.minFilter = minFilter;
        this.magFilter = magFilter;
        this.wrapS = wrapS;
        this.wrapT = wrapT;
        this.wrapR = wrapR;
        this.compareMode = compareMode;
        this.compareFunc = compareFunc;
        this.minLOD = minLOD;
        this.maxLOD = maxLOD;
        this.baseLevel = baseLevel;
        this.maxLevel = maxLevel;
        this.maxAnisotropy = Math.min(maxAnisotropy, /*WEBGL_INFO.MAX_TEXTURE_ANISOTROPY*/this.engine.capbility('MAX_TEXTURE_ANISOTROPY'));
        this.flipY = flipY;
        this.premultiplyAlpha = premultiplyAlpha;
        this.mipmaps = (minFilter === GL.LINEAR_MIPMAP_NEAREST || minFilter === GL.LINEAR_MIPMAP_LINEAR);
        this.restore(image);
    }

    public restore(image: HTMLImageElement | number | Float32Array): WebGL2Texture {
        this.texture = null;
        this.resize(this.width, this.height, this.depth);
        if (image) {
            this.data(image);
        }
        return this;
    }

    public resize(width: number, height: number, depth?: number): WebGL2Texture {
        depth = depth || 0;

        if (this.texture && width === this.width && height === this.height && depth === this.depth) {
            return this;
        }

        this.gl.deleteTexture(this.texture);
        if (this.currentUnit !== -1) {
            this.state.textures[this.currentUnit] = null;
        }

        this.texture = this.gl.createTexture();
        this.bind(Math.max(this.currentUnit, 0));

        this.width = width;
        this.height = height;
        this.depth = depth;

        this.gl.texParameteri(this.binding, GL.TEXTURE_MIN_FILTER, this.minFilter);
        this.gl.texParameteri(this.binding, GL.TEXTURE_MAG_FILTER, this.magFilter);
        this.gl.texParameteri(this.binding, GL.TEXTURE_WRAP_S, this.wrapS);
        this.gl.texParameteri(this.binding, GL.TEXTURE_WRAP_T, this.wrapT);
        this.gl.texParameteri(this.binding, GL.TEXTURE_WRAP_R, this.wrapR);
        this.gl.texParameteri(this.binding, GL.TEXTURE_COMPARE_FUNC, this.compareFunc);
        this.gl.texParameteri(this.binding, GL.TEXTURE_COMPARE_MODE, this.compareMode);
        this.gl.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, this.flipY);
        this.gl.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);

        if (this.minLOD !== null) {
            this.gl.texParameterf(this.binding, GL.TEXTURE_MIN_LOD, this.minLOD);
        }

        if (this.maxLOD !== null) {
            this.gl.texParameterf(this.binding, GL.TEXTURE_MAX_LOD, this.maxLOD);
        }

        if (this.baseLevel !== null) {
            this.gl.texParameteri(this.binding, GL.TEXTURE_BASE_LEVEL, this.baseLevel);
        }

        if (this.maxLevel !== null) {
            this.gl.texParameteri(this.binding, GL.TEXTURE_MAX_LEVEL, this.maxLevel);
        }

        if (this.maxAnisotropy > 1) {
            this.gl.texParameteri(this.binding, GL.TEXTURE_MAX_ANISOTROPY_EXT, this.maxAnisotropy);
        }

        let levels: number;
        if (this.is3D) {
            if (this.mipmaps) {
                levels = Math.floor(Math.log2(Math.max(Math.max(this.width, this.height), this.depth))) + 1;
            } else {
                levels = 1;
            }
            this.gl.texStorage3D(this.binding, levels, this.internalFormat, this.width, this.height, this.depth);
        } else {
            if (this.mipmaps) {
                levels = Math.floor(Math.log2(Math.max(this.width, this.height))) + 1;
            } else {
                levels = 1;
            }
            this.gl.texStorage2D(this.binding, levels, this.internalFormat, this.width, this.height);
        }

        return this;
    }

    public data(data: HTMLImageElement | number | any[] | Float32Array): WebGL2Texture {
        if (!Array.isArray(data)) {
            DUMMY_UNIT_ARRAY[0] = data;
            data = DUMMY_UNIT_ARRAY;
        }
        let numLevels = this.mipmaps ? data.length : 1;
        let width = this.width;
        let height = this.height;
        let depth = this.depth;
        let generateMipmaps = this.mipmaps && data.length === 1;
        let i: number;
        this.bind(Math.max(this.currentUnit, 0));
        if (this.compressed) {
            if (this.is3D) {
                for (i = 0; i < numLevels; ++i) {
                    this.gl.compressedTexSubImage3D(this.binding, i, 0, 0, 0, width, height, depth, this.format, data[i]);
                    width = Math.max(width >> 1, 1);
                    height = Math.max(height >> 1, 1);
                    depth = Math.max(depth >> 1, 1);
                }
            } else {
                for (i = 0; i < numLevels; ++i) {
                    this.gl.compressedTexSubImage2D(this.binding, i, 0, 0, width, height, this.format, data[i]);
                    width = Math.max(width >> 1, 1);
                    height = Math.max(height >> 1, 1);
                }
            }
        } else if (this.is3D) {
            for (i = 0; i < numLevels; ++i) {
                this.gl.texSubImage3D(this.binding, i, 0, 0, 0, width, height, depth, this.format, this.type, data[i]);
                width = Math.max(width >> 1, 1);
                height = Math.max(height >> 1, 1);
                depth = Math.max(depth >> 1, 1);
            }
        } else {
            for (i = 0; i < numLevels; ++i) {
                this.gl.texSubImage2D(this.binding, i, 0, 0, width, height, this.format, this.type, data[i]);
                width = Math.max(width >> 1, 1);
                height = Math.max(height >> 1, 1);
            }
        }
        if (generateMipmaps) {
            this.gl.generateMipmap(this.binding);
        }
        return this;
    }

    public delete(): WebGL2Texture {
        if (this.texture) {
            this.gl.deleteTexture(this.texture);
            this.texture = null;
            if (this.currentUnit !== -1 && this.state.textures[this.currentUnit] === this) {
                this.state.textures[this.currentUnit] = null;
                this.currentUnit = -1;
            }
        }
        return this;
    }

    public bind(unit: number): any {
        let currentTexture = this.state.textures[unit];
        if (currentTexture !== this) {
            if (currentTexture) {
                currentTexture.currentUnit = -1;
            }
            if (this.currentUnit !== -1) {
                this.state.textures[this.currentUnit] = null;
            }
            this.gl.activeTexture(GL.TEXTURE0 + unit);
            this.gl.bindTexture(this.binding, this.texture);
            this.state.textures[unit] = this;
            this.currentUnit = unit;
        }
        return this;
    }

}
