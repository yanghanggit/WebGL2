
class OmniShadowScene extends WebGL2DemoScene {

    ///
    private shadowVsSource: string;
    private shadowFsSource: string;
    private lightVsSource: string;
    private lightFsSource: string;
    private vsSource: string;
    private fsSource: string;

    ///
    private shadowProgram: WebGL2Program;
    private lightProgram: WebGL2Program;
    private mainProgram: WebGL2Program;

    //
    private webglImage: HTMLImageElement;
    private cobblesImage: HTMLImageElement;

    private projMatrix: Float32Array;

    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;

    private boxes: any[];

    private shadowBuffer: WebGL2Framebuffer;
    private shadowTarget: WebGL2Cubemap;

    // private drawCall1: WebGL2DrawCall;
    // private drawCall2: WebGL2DrawCall;
    // private currentDrawCall: WebGL2DrawCall;


    private lightViewMatrixNegX: Float32Array = mat4.create();
    private lightViewMatrixPosX: Float32Array = mat4.create();
    private lightViewMatrixNegY: Float32Array = mat4.create();
    private lightViewMatrixPosY: Float32Array = mat4.create();
    private lightViewMatrixNegZ: Float32Array = mat4.create();
    private lightViewMatrixPosZ: Float32Array = mat4.create();


    private lightDrawcall: WebGL2DrawCall;

    public enter(): WebGL2DemoScene {
        this.application.profile.setTitle(egret.getQualifiedClassName(this));
        this.start().catch(e => {
            console.error(e);
        });
        return this;
    }

    private async start(): Promise<void> {
        await this.loadResource();
        this.createScene();
        this._ready = true;
    }

    private createScene(): void {
        const engine = this.engine;
        const app = this.engine;
        const utils = this.engine;
        const PicoGL = GL;
        const canvas = engine.canvas;

        //
        // utils.addTimerElement();

        // let canvas = document.getElementById("gl-canvas");
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;

        const CUBEMAP_DIM = 1024;
        const NEAR = 0.1;
        const FAR = 20.0

        //let app = PicoGL.createApp(canvas)
        app
            .clearColor(0.0, 0.0, 0.0, 1.0)
            .depthTest();

        // let timer = app.createTimer();

        // // SET UP SHADOW PROGRAM
        // let shadowVsSource =  document.getElementById("shadow-vs").text.trim();
        // let shadowFsSource =  document.getElementById("shadow-fs").text.trim();

        this.shadowTarget = app.createCubemap({
            internalFormat: PicoGL.R16F,
            width: CUBEMAP_DIM,
            height: CUBEMAP_DIM
        });
        let depthTarget = app.createRenderbuffer(CUBEMAP_DIM, CUBEMAP_DIM, PicoGL.DEPTH_COMPONENT16);
        this.shadowBuffer = app.createFramebuffer()
            .colorTarget(0, this.shadowTarget, PicoGL.TEXTURE_CUBE_MAP_NEGATIVE_X)
            .depthTarget(depthTarget);

        // SET UP LIGHT PROGRAM
        // let lightVsSource =  document.getElementById("sphere-vs").text.trim();
        // let lightFsSource =  document.getElementById("sphere-fs").text.trim();

        // // SET UP MAIN PROGRAM
        // let vsSource =  document.getElementById("main-vs").text.trim();
        // let fsSource =  document.getElementById("main-fs").text.trim();

        // GEOMETRY
        let positions, normals, uv, indices;

        let box = utils.createBox({ dimensions: [1.0, 1.0, 1.0] })
        positions = app.createVertexBuffer(PicoGL.FLOAT, 3, box.positions);
        normals = app.createVertexBuffer(PicoGL.FLOAT, 3, box.normals);
        uv = app.createVertexBuffer(PicoGL.FLOAT, 2, box.uvs);

        let boxArray = app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, normals)
            .vertexAttributeBuffer(2, uv);

        let sphere = utils.createSphere({ radius: 0.1 });
        positions = app.createVertexBuffer(PicoGL.FLOAT, 3, sphere.positions);
        indices = app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, sphere.indices);

        let sphereArray = app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .indexBuffer(indices);

        // UNIFORMS
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, canvas.width / canvas.height, NEAR, FAR);

        this.viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(1, 1, 1);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        let lightPosition = vec3.fromValues(0, 0, 0);
        let lightProjMatrix = mat4.create();
        let lightViewMatrix = mat4.create();
        this.lightViewMatrixNegX = mat4.create();
        this.lightViewMatrixPosX = mat4.create();
        this.lightViewMatrixNegY = mat4.create();
        this.lightViewMatrixPosY = mat4.create();
        this.lightViewMatrixNegZ = mat4.create();
        this.lightViewMatrixPosZ = mat4.create();

        mat4.perspective(lightProjMatrix, Math.PI / 2, 1, NEAR, FAR);

        mat4.lookAt(this.lightViewMatrixNegX, lightPosition, vec3.fromValues(-1, 0, 0), vec3.fromValues(0, -1, 0));
        mat4.lookAt(this.lightViewMatrixPosX, lightPosition, vec3.fromValues(1, 0, 0), vec3.fromValues(0, -1, 0));
        mat4.lookAt(this.lightViewMatrixNegY, lightPosition, vec3.fromValues(0, -1, 0), vec3.fromValues(0, 0, -1));
        mat4.lookAt(this.lightViewMatrixPosY, lightPosition, vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 1));
        mat4.lookAt(this.lightViewMatrixNegZ, lightPosition, vec3.fromValues(0, 0, -1), vec3.fromValues(0, -1, 0));
        mat4.lookAt(this.lightViewMatrixPosZ, lightPosition, vec3.fromValues(0, 0, 1), vec3.fromValues(0, -1, 0));

        ///////////////////////////////////////
        // CONTINUE HERE FOR OTHER FACES
        ///////////////////////////////////////

        // OBJECT DESCRIPTIONS
        const boxes = this.boxes = [
            {
                translate: [0, 0, 0],
                rotate: [Math.random(), Math.random(), Math.random()],
                scale: [6, 6, 6],
                rotateVx: Math.random() * 0.01 - 0.005,
                rotateVy: Math.random() * 0.01 - 0.005,
                mvpMatrix: mat4.create(),
                modelMatrix: mat4.create(),
                mainDrawCall: null,
                shadowDrawCall: null
            },
            {
                translate: [-1, -1, 0.5],
                rotate: [Math.random(), Math.random(), Math.random()],
                scale: [0.5, 0.5, 0.5],
                rotateVx: Math.random() * 0.06 - 0.03,
                rotateVy: Math.random() * 0.06 - 0.03,
                mvpMatrix: mat4.create(),
                modelMatrix: mat4.create(),
                mainDrawCall: null,
                shadowDrawCall: null
            },
            {
                translate: [-1, 0.5, -1],
                rotate: [Math.random(), Math.random(), Math.random()],
                scale: [0.3, 0.3, 0.3],
                rotateVx: Math.random() * 0.06 - 0.03,
                rotateVy: Math.random() * 0.06 - 0.03,
                mvpMatrix: mat4.create(),
                modelMatrix: mat4.create(),
                mainDrawCall: null,
                shadowDrawCall: null
            },
            {
                translate: [0, 0, -2],
                rotate: [Math.random(), Math.random(), Math.random()],
                scale: [0.4, 0.4, 0.4],
                rotateVx: Math.random() * 0.06 - 0.03,
                rotateVy: Math.random() * 0.06 - 0.03,
                mvpMatrix: mat4.create(),
                modelMatrix: mat4.create(),
                mainDrawCall: null,
                shadowDrawCall: null
            }
        ];

        let webglTexture = app.createTexture2DByImage(this.webglImage, {
            flipY: true,
            maxAnisotropy: app.capbility('MAX_TEXTURE_ANISOTROPY')//PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY 
        });
        let cobblesTexture = app.createTexture2DByImage(this.cobblesImage, {
            flipY: true,
            maxAnisotropy: app.capbility('MAX_TEXTURE_ANISOTROPY')//PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY 
        });

        // DRAW CALLS

        this.lightDrawcall = app.createDrawCall(this.lightProgram, sphereArray)
            .uniform("uMVP", this.viewProjMatrix);

        boxes[0].shadowDrawCall = app.createDrawCall(this.shadowProgram, boxArray)

        boxes[0].mainDrawCall = app.createDrawCall(this.mainProgram, boxArray)
            .uniform("uLightPosition", lightPosition)
            .uniform("uEyePosition", eyePosition)
            .texture("uTextureMap", cobblesTexture)
            .texture("uShadowMap", this.shadowTarget);

        for (let i = 1, len = boxes.length; i < len; ++i) {
            boxes[i].shadowDrawCall = app.createDrawCall(this.shadowProgram, boxArray)
                .uniform("uProjection", lightProjMatrix);

            boxes[i].mainDrawCall = app.createDrawCall(this.mainProgram, boxArray)
                .uniform("uLightPosition", lightPosition)
                .uniform("uEyePosition", eyePosition)
                .texture("uTextureMap", webglTexture)
                .texture("uShadowMap", this.shadowTarget);
        }

    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-omni-shadow/shadow.vs.glsl',
                'resource/assets/shader-omni-shadow/shadow.fs.glsl',
                'resource/assets/shader-omni-shadow/light.vs.glsl',
                'resource/assets/shader-omni-shadow/light.fs.glsl',
                'resource/assets/shader-omni-shadow/main.vs.glsl',
                'resource/assets/shader-omni-shadow/main.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            this.shadowVsSource = txts[0];
            this.shadowFsSource = txts[1];
            this.lightVsSource = txts[2];
            this.lightFsSource = txts[3];
            this.vsSource = txts[4];
            this.fsSource = txts[5];
            //
            const programs = await this.engine.createPrograms(
                [this.shadowVsSource, this.shadowFsSource],
                [this.lightVsSource, this.lightFsSource],
                [this.vsSource, this.fsSource]
            );
            this.shadowProgram = programs[0];
            this.lightProgram = programs[1];
            this.mainProgram = programs[2];
            //
            const texarrays: string[] = [
                'resource/assets/bg.jpg',
                'resource/assets/concrete.jpg',
            ];
            const loadImages = await this.engine.loadImages(texarrays);
            this.webglImage = loadImages[0];
            this.cobblesImage = loadImages[1];
        }
        catch (e) {
            console.error(e);
        }
    }

    public update(): WebGL2DemoScene {
        if (!this._ready) {
            return;
        }
        // this.engine.clear();
        // this.currentDrawCall.draw();
        // this.currentDrawCall = this.currentDrawCall === this.drawCall1 ? this.drawCall2 : this.drawCall1;
        const CUBEMAP_DIM = 1024;
        const utils = this.engine;
        const app = this.engine;

        // UPDATE TRANSFORMS
        const boxes = this.boxes;
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].rotate[0] += boxes[i].rotateVx;
            boxes[i].rotate[1] += boxes[i].rotateVy;

            utils.xformMatrix(boxes[i].modelMatrix, boxes[i].translate, boxes[i].rotate, boxes[i].scale);
            mat4.multiply(boxes[i].mvpMatrix, this.viewProjMatrix, boxes[i].modelMatrix);

            boxes[i].shadowDrawCall.uniform("uModelMatrix", boxes[i].modelMatrix);

            boxes[i].mainDrawCall.uniform("uMVP", boxes[i].mvpMatrix)
                .uniform("uModelMatrix", boxes[i].modelMatrix);
        }

        // DRAW TO SHADOW BUFFER
        const shadowBuffer = this.shadowBuffer;
        const shadowTarget = this.shadowTarget;

        app.drawFramebuffer(shadowBuffer).viewport(0, 0, CUBEMAP_DIM, CUBEMAP_DIM);

        shadowBuffer.colorTarget(0, shadowTarget, GL.TEXTURE_CUBE_MAP_NEGATIVE_X);
        app.clear();
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].shadowDrawCall.uniform("uViewMatrix", this.lightViewMatrixNegX);
            boxes[i].shadowDrawCall.draw();
        }

        shadowBuffer.colorTarget(0, shadowTarget, GL.TEXTURE_CUBE_MAP_POSITIVE_X);
        app.clear();
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].shadowDrawCall.uniform("uViewMatrix", this.lightViewMatrixPosX);
            boxes[i].shadowDrawCall.draw();
        }

        shadowBuffer.colorTarget(0, shadowTarget, GL.TEXTURE_CUBE_MAP_NEGATIVE_Y);
        app.clear();
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].shadowDrawCall.uniform("uViewMatrix", this.lightViewMatrixNegY);
            boxes[i].shadowDrawCall.draw();
        }

        shadowBuffer.colorTarget(0, shadowTarget, GL.TEXTURE_CUBE_MAP_POSITIVE_Y);
        app.clear();
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].shadowDrawCall.uniform("uViewMatrix", this.lightViewMatrixPosY);
            boxes[i].shadowDrawCall.draw();
        }

        shadowBuffer.colorTarget(0, shadowTarget, GL.TEXTURE_CUBE_MAP_NEGATIVE_Z);
        app.clear();
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].shadowDrawCall.uniform("uViewMatrix", this.lightViewMatrixNegZ);
            boxes[i].shadowDrawCall.draw();
        }

        shadowBuffer.colorTarget(0, shadowTarget, GL.TEXTURE_CUBE_MAP_POSITIVE_Z);
        app.clear();
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].shadowDrawCall.uniform("uViewMatrix", this.lightViewMatrixPosZ);
            boxes[i].shadowDrawCall.draw();
        }

        // DRAW TO SCREEN     
        app.defaultDrawFramebuffer().defaultViewport().clear()
        for (let i = 0, len = boxes.length; i < len; ++i) {
            boxes[i].mainDrawCall.draw();
        }
        this.lightDrawcall.draw();


        return this;
    }

    public leave(): WebGL2DemoScene {
        // this.program.delete();
        // this.drawCall1.delete();
        // this.drawCall2.delete();
        // this.currentDrawCall = null;
        const engine = this.engine;
        //engine.noBlend();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        //????
        const NEAR = 0.1;
        const FAR = 20.0
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, NEAR, FAR);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        return this;
    }
}