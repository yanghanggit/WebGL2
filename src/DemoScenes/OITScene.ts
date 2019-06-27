
class OITScene extends WebGL2DemoScene {


    private accumVsSource: string;// = txts[0];
    private accumFsSource: string;// = txts[1];
    private blendVsSource: string;// = txts[2];
    private blendFsSource: string;// = txts[3];
    private accumBuffer: WebGL2Framebuffer;

    private viewProjMatrix: Float32Array;
    private projMatrix: Float32Array;
    private viewMatrix: Float32Array;
    private sceneUniforms: WebGL2UniformBuffer;
    private image: HTMLImageElement;
    private accumProgram: WebGL2Program;
    private blendProgram: WebGL2Program;


    private accumDrawCall: WebGL2DrawCall;
    private blendDrawCall: WebGL2DrawCall;
    private rotationMatrix: Float32Array;
    private spheres;
    private modelMatrixData;
    private modelMatrices;

    private ready: boolean = false;

    
    public enter(): OITScene {
        const engine = this.engine;
        if (!engine.getExtension('EXT_color_buffer_float')) {
            console.error("OITScene: This example requires extension <b>EXT_color_buffer_float</b> which is not supported on this system.");
            return this;
        }
        this.start().catch(e => {
            console.log(e);
        });
        return this;
    }

    private async start(): Promise<void> {
        await this.loadResource();
        console.log('OITScene load finish');
        this.createScene();
        console.log('OITScene createScene');
        this.ready = true;
    }

    private createScene(): void {
        // import { PicoGL } from "../src/picogl.js";

        // utils.addTimerElement();

        // if (!testExtension("EXT_color_buffer_float")) {
        //     document.body.innerHTML = "This example requires extension <b>EXT_color_buffer_float</b> which is not supported on this system."
        // }

        const NEAR = 0.1;
        const FAR = 10.0;
        const NUM_SPHERES = 32;
        const NUM_PER_ROW = 8;
        const RADIUS = 0.6;

        // let canvas = document.getElementById("gl-canvas");
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;
        let app = this.engine;
        const PicoGL = GL;
        const utils = app;
        const canvas = app.canvas;

        //let app = PicoGL.createApp(canvas)
        app.clearColor(0.5, 0.5, 0.5, 1.0)
            .blend()
            .depthMask(false);

        //let timer = app.createTimer();

        let spheres = new Array(NUM_SPHERES);
        let sphereColorData = new Uint8Array(NUM_SPHERES * 4);
        let modelMatrixData = new Float32Array(NUM_SPHERES * 16);

        for (let i = 0; i < NUM_SPHERES; ++i) {
            let angle = 2 * Math.PI * (i % NUM_PER_ROW) / NUM_PER_ROW;
            let x = Math.sin(angle) * RADIUS;
            let y = Math.floor(i / NUM_PER_ROW) / (NUM_PER_ROW / 4) - 0.75;
            let z = Math.cos(angle) * RADIUS;
            spheres[i] = {
                scale: [0.8, 0.8, 0.8],
                rotate: [0, 0, 0], // Will be used for global rotation
                translate: [x, y, z],
                modelMatrix: mat4.create()
            };

            sphereColorData.set(vec4.fromValues(
                Math.floor(Math.sqrt(Math.random()) * 256),
                Math.floor(Math.sqrt(Math.random()) * 256),
                Math.floor(Math.sqrt(Math.random()) * 256),
                128
            ), i * 4);
        }

        // ACCUMULATION PROGRAM
        // let accumVsSource = document.getElementById("vertex-accum").text.trim();
        // let accumFsSource = document.getElementById("fragment-accum").text.trim();

        let accumulateTarget = app.createTexture2D(app.width, app.height, {
            internalFormat: PicoGL.RGBA16F
        });
        let accumulateAlphaTarget = app.createTexture2D(app.width, app.height, {
            internalFormat: PicoGL.RGBA16F
        });
        let accumBuffer = app.createFramebuffer()
            .colorTarget(0, accumulateTarget)
            .colorTarget(1, accumulateAlphaTarget);

        // BLEND PROGRAM
        // let blendVsSource = document.getElementById("vertex-quad").text.trim();
        // let blendFsSource = document.getElementById("fragment-blend").text.trim();

        // INSTANCED SPHERE GEOMETRY
        let sphere = utils.createSphere({ radius: 0.5 });
        let positions = app.createVertexBuffer(PicoGL.FLOAT, 3, sphere.positions);
        let uv = app.createVertexBuffer(PicoGL.FLOAT, 2, sphere.uvs);
        let normals = app.createVertexBuffer(PicoGL.FLOAT, 3, sphere.normals);
        let indices = app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, sphere.indices);

        // PER-INSTANCE COLORS AND MODEL MATRICES
        let colors = app.createVertexBuffer(PicoGL.UNSIGNED_BYTE, 4, sphereColorData);
        let modelMatrices = app.createMatrixBuffer(PicoGL.FLOAT_MAT4, modelMatrixData);

        let sphereArray = app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals)
            .instanceAttributeBuffer(3, colors, { normalized: true })
            .instanceAttributeBuffer(4, modelMatrices)
            .indexBuffer(indices);

        // QUAD GEOMETRY
        let quadPositions = app.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            -1, 1,
            -1, -1,
            1, -1,
            -1, 1,
            1, -1,
            1, 1,
        ]));

        let quadArray = app.createVertexArray()
            .vertexAttributeBuffer(0, quadPositions);

        // UNIFORM DATA
        let projMatrix = mat4.create();
        mat4.perspective(projMatrix, Math.PI / 2, canvas.width / canvas.height, NEAR, FAR);

        let viewMatrix = mat4.create();
        let eyePosition = vec3.fromValues(0, 0.8, 2);
        mat4.lookAt(viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        let viewProjMatrix = mat4.create();
        mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);

        let lightPosition = vec3.fromValues(0.5, 1, 2);

        // UNIFORM BUFFER
        let sceneUniforms = app.createUniformBuffer([
            PicoGL.FLOAT_MAT4,
            PicoGL.FLOAT_VEC4,
            PicoGL.FLOAT_VEC4
        ]).set(0, viewProjMatrix)
            .set(1, eyePosition)
            .set(2, lightPosition)
            .update();


        //////////
        this.accumBuffer = accumBuffer;
        this.viewProjMatrix = viewProjMatrix;
        this.projMatrix = projMatrix;
        this.viewMatrix = viewMatrix;
        this.sceneUniforms = sceneUniforms;
        this.spheres = spheres;
        this.modelMatrixData = modelMatrixData;
        this.modelMatrices = modelMatrices;
        const image = this.image;
        const MAX_TEXTURE_ANISOTROPY = app.capbility('MAX_TEXTURE_ANISOTROPY');
        const accumProgram = this.accumProgram;
        const blendProgram = this.blendProgram;
        /////////

        /////
        let texture = app.createTexture2D(image, {
            flipY: true,
            maxAnisotropy: MAX_TEXTURE_ANISOTROPY/*PicoGL.WEBGL_INFO.MAX_TEXTURE_ANISOTROPY*/
        });

        let accumDrawCall = app.createDrawCall(accumProgram, sphereArray)
            .uniformBlock("SceneUniforms", sceneUniforms)
            .texture("uTexture", texture);

        let blendDrawCall = app.createDrawCall(blendProgram, quadArray)
            .texture("uAccumulate", accumBuffer.colorAttachments[0])
            .texture("uAccumulateAlpha", accumBuffer.colorAttachments[1]);

        let rotationMatrix = mat4.create();


        /////
        this.accumDrawCall = accumDrawCall;
        this.blendDrawCall = blendDrawCall;
        this.rotationMatrix = rotationMatrix;
        /////
    }

    private async loadResource(): Promise<void> {
        try {
            const ress: string[] = [
                'resource/assets/vertex-accum.vertex',
                'resource/assets/fragment-accum.fragment',
                'resource/assets/vertex-quad.vertex',
                'resource/assets/fragment-blend.fragment'
            ];
            const txts = await this.engine.loadText(ress);
            this.accumVsSource = txts[0];
            this.accumFsSource = txts[1];
            this.blendVsSource = txts[2];
            this.blendFsSource = txts[3];
            const programs = await this.engine.createPrograms([this.accumVsSource, this.accumFsSource], [this.blendVsSource, this.blendFsSource]);
            this.accumProgram = programs[0];
            this.blendProgram = programs[1];
            const images = await this.engine.loadImages(["resource/assets/webgl-logo.png"]);
            this.image = images[0];
            //console.log('load finish');
        }
        catch (e) {
            console.error(e);
        }
    }

    public update(): OITScene {
        //return;
        if (!this.ready) {
            return this;
        }

        const spheres = this.spheres;
        const utils = this.engine;
        const app = this.engine;
        const rotationMatrix = this.rotationMatrix;
        const modelMatrixData = this.modelMatrixData;
        const modelMatrices = this.modelMatrices;
        const PicoGL = GL;
        const accumBuffer = this.accumBuffer;
        const accumDrawCall = this.accumDrawCall;
        const blendDrawCall = this.blendDrawCall;
        /////////
        // if (timer.ready()) {
        //     utils.updateTimerElement(timer.cpuTime, timer.gpuTime);
        // }

        // timer.start();

        for (let i = 0, len = spheres.length; i < len; ++i) {
            spheres[i].rotate[1] += 0.002;

            utils.xformMatrix(spheres[i].modelMatrix, spheres[i].translate, null, spheres[i].scale);
            mat4.fromYRotation(rotationMatrix, spheres[i].rotate[1]);
            mat4.multiply(spheres[i].modelMatrix, rotationMatrix, spheres[i].modelMatrix)

            modelMatrixData.set(spheres[i].modelMatrix, i * 16);
        }
        modelMatrices.data(modelMatrixData);

        // ACCUMULATION
        app.drawFramebuffer(accumBuffer)
        .blendFuncSeparate(PicoGL.ONE, PicoGL.ONE, PicoGL.ZERO, PicoGL.ONE_MINUS_SRC_ALPHA)
        .clear();
        accumDrawCall.draw()
        
        // BLEND
        app.defaultDrawFramebuffer()
        .blendFunc(PicoGL.ONE, PicoGL.ONE_MINUS_SRC_ALPHA)
        .clear();
        blendDrawCall.draw();
        
        //timer.end(); 
        return this;
    }

    public leave(): OITScene {
        return this;
    }

    public resize(width: number, height: number): OITScene {
        const app = this.engine;
        const accumBuffer = this.accumBuffer;
        const viewProjMatrix = this.viewProjMatrix;
        const projMatrix = this.projMatrix;
        const viewMatrix = this.viewMatrix;
        const sceneUniforms = this.sceneUniforms;

        app.resize(window.innerWidth, window.innerHeight);
        accumBuffer.resize();

        mat4.perspective(projMatrix, Math.PI / 2, app.width / app.height, 0.1, 10.0);
        mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);
        sceneUniforms.set(0, viewProjMatrix).update();
        return this;
    }
}