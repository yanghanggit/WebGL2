
class OITScene extends WebGL2DemoScene {

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

        //let app = PicoGL.createApp(canvas)
        app.clearColor(0.0, 0.0, 0.0, 1.0)
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
        let sphere = utils.createSphere({radius: 0.5});
        let positions = app.createVertexBuffer(PicoGL.FLOAT, 3, sphere.positions);
        let uv = app.createVertexBuffer(PicoGL.FLOAT, 2, sphere.uvs);
        let normals = app.createVertexBuffer(PicoGL.FLOAT, 3, sphere.normals);
        let indices = app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, sphere.indices);

        // PER-INSTANCE COLORS AND MODEL MATRICES
        let colors = app.createVertexBuffer(PicoGL.UNSIGNED_BYTE, 4, sphereColorData);
        /*let modelMatrices = app.createMatrixBuffer(PicoGL.FLOAT_MAT4, modelMatrixData);

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
        ])
        .set(0, viewProjMatrix)
        .set(1, eyePosition)
        .set(2, lightPosition)
        .update();
        */
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
            let accumVsSource = txts[0];
            let accumFsSource = txts[1];
            let blendVsSource = txts[2];
            let blendFsSource = txts[3];
            const programs = await this.engine.createPrograms([accumVsSource, accumFsSource], [blendVsSource, blendFsSource]);
            const images = await this.engine.loadImages(["resource/assets/webgl-logo.png"]);
            //console.log('load finish');
        }
        catch (e) {
            console.error(e);
        }
    }

    public update(): OITScene {
        return this;
    }

    public leave(): OITScene {
        return this;
    }

    public resize(width: number, height: number): OITScene {
        return this;
    }
}