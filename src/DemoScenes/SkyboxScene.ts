/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

class SkyboxScene extends WebGL2DemoScene {
    //
    private cubemapDrawCall: WebGL2DrawCall;
    private cubeDrawCall: WebGL2DrawCall;
    private skyboxDrawcall: WebGL2DrawCall;
    private angleX: number = 0;
    private angleY: number = 0;
    private cubemapBuffer: WebGL2Framebuffer;
    private program: WebGL2Program;
    private cubemapProgram: WebGL2Program;
    private skyboxProgram: WebGL2Program;
    private webglImage: HTMLImageElement;
    private readonly cubemapImages: HTMLImageElement[] = [];
    private skyboxViewMatrix: Float32Array;
    private skyboxViewProjMatrix: Float32Array;
    private sceneUniformBuffer: WebGL2UniformBuffer;
    private skyboxSceneUniforms: WebGL2UniformBuffer;
    private viewMatrix: Float32Array;
    private viewProjMatrix: Float32Array;
    private projMatrix: Float32Array;
    private modelMatrix: Float32Array = mat4.create();
    private rotateXMatrix: Float32Array = mat4.create();
    private rotateYMatrix: Float32Array = mat4.create();
    private readonly cubemapDim: number = 2048;
    private debugColorEnableDiv: HTMLDivElement;
    private debugColorEnabled: boolean = false;

    //
    public enter(): WebGL2DemoScene {
        this.application.profile.setTitle(Utils.getClassName(this));
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
        engine.clearColor(1.0, 1.0, 1.0, 1.0)
            .depthTest();
        //
        const colorTarget = engine.createCubemap({
            width: this.cubemapDim,
            height: this.cubemapDim
        });
        const depthTarget = engine.createRenderbuffer(this.cubemapDim, this.cubemapDim, GL.DEPTH_COMPONENT16);
        this.cubemapBuffer = engine.createFramebuffer()
            .colorTarget(0, colorTarget, GL.TEXTURE_CUBE_MAP_NEGATIVE_X)
            .colorTarget(1, colorTarget, GL.TEXTURE_CUBE_MAP_POSITIVE_X)
            .colorTarget(2, colorTarget, GL.TEXTURE_CUBE_MAP_NEGATIVE_Y)
            .colorTarget(3, colorTarget, GL.TEXTURE_CUBE_MAP_POSITIVE_Y)
            .colorTarget(4, colorTarget, GL.TEXTURE_CUBE_MAP_NEGATIVE_Z)
            .colorTarget(5, colorTarget, GL.TEXTURE_CUBE_MAP_POSITIVE_Z)
            .depthTarget(depthTarget);

        const box = Utils.createCube({ dimensions: [1.0, 1.0, 1.0] })
        const positions = engine.createVertexBuffer(GL.FLOAT, 3, box.positions);
        const uv = engine.createVertexBuffer(GL.FLOAT, 2, box.uvs);
        const normals = engine.createVertexBuffer(GL.FLOAT, 3, box.normals);
        const boxArray = engine.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, uv)
            .vertexAttributeBuffer(2, normals);

        const cubemapProjMatrix = mat4.create();
        mat4.perspective(cubemapProjMatrix, Math.PI / 2, 1, 0.1, 10.0);

        const cubemapViewMatrix = mat4.create();
        const cubemapEyePosition = vec3.fromValues(1.2, 0, 1.2);
        mat4.lookAt(cubemapViewMatrix, cubemapEyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        const cubemapViewProjMatrix = mat4.create();
        mat4.multiply(cubemapViewProjMatrix, cubemapProjMatrix, cubemapViewMatrix);

        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, Math.PI / 2, engine.canvas.width / engine.canvas.height, 0.1, 10.0);

        this.viewMatrix = mat4.create();
        const eyePosition = vec3.fromValues(1.2, -1.3, 1.3);
        mat4.lookAt(this.viewMatrix, eyePosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.viewProjMatrix = mat4.create();
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);

        this.skyboxViewMatrix = mat4.create();
        this.skyboxViewMatrix.set(this.viewMatrix);
        this.skyboxViewMatrix[12] = 0;
        this.skyboxViewMatrix[13] = 0;
        this.skyboxViewMatrix[14] = 0;

        this.skyboxViewProjMatrix = mat4.create();
        mat4.multiply(this.skyboxViewProjMatrix, this.projMatrix, this.skyboxViewMatrix);

        const cubemapSceneUniformBuffer = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4,
        ]).set(0, cubemapViewProjMatrix)
            .set(1, cubemapEyePosition)
            .update();

        this.sceneUniformBuffer = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4
        ]).set(0, this.viewProjMatrix)
            .set(1, eyePosition)
            .update();

        this.skyboxSceneUniforms = engine.createUniformBuffer([
            GL.FLOAT_MAT4,
            GL.FLOAT_VEC4, 
            GL.BOOL
        ]).set(0, this.skyboxViewProjMatrix)
            .set(1, eyePosition)
            .set(2, this.debugColorEnabled)
            .update();

        const texture = engine.createTexture2DByImage(this.webglImage, {
            flipY: true,
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        const skyCubemap = engine.createCubemap({
            negX: this.cubemapImages[0],
            posX: this.cubemapImages[1],
            negY: this.cubemapImages[2],
            posY: this.cubemapImages[3],
            negZ: this.cubemapImages[4],
            posZ: this.cubemapImages[5],
            maxAnisotropy: engine.capbility('MAX_TEXTURE_ANISOTROPY')
        });

        this.cubemapDrawCall = engine.createDrawCall(this.cubemapProgram, boxArray)
            .texture("tex", texture)
            .uniformBlock("SceneUniforms", cubemapSceneUniformBuffer);

        this.cubeDrawCall = engine.createDrawCall(this.program, boxArray)
            .texture("renderCubemap", colorTarget)
            .texture("skyCubemap", skyCubemap)
            .uniformBlock("SceneUniforms", this.sceneUniformBuffer);

        this.skyboxDrawcall = engine.createDrawCall(this.skyboxProgram, boxArray)
            .texture("renderCubemap", colorTarget)
            .texture("skyCubemap", skyCubemap)
            .uniformBlock("SceneUniforms", this.skyboxSceneUniforms);


        this.openUI();
    }

    private async loadResource(): Promise<void> {
        try {
            ///
            const ress: string[] = [
                'resource/assets/shader-rtt-cubemap/cube.vs.glsl',
                'resource/assets/shader-rtt-cubemap/cube.fs.glsl',
                'resource/assets/shader-rtt-cubemap/cubemap.fs.glsl',
                'resource/assets/shader-rtt-cubemap/skybox.vs.glsl',
                'resource/assets/shader-rtt-cubemap/skybox.fs.glsl',
            ];
            const txts = await this.engine.loadText(ress);
            const vsSource = txts[0];
            const fsSource = txts[1];
            const cubemapFsSource = txts[2];
            const skyboxVsSource = txts[3];
            const skyboxFsSource = txts[4];
            //
            const programs = await this.engine.createPrograms(
                [vsSource, fsSource],
                [vsSource, cubemapFsSource],
                [skyboxVsSource, skyboxFsSource]
            );
            //
            this.program = programs[0];
            this.cubemapProgram = programs[1];
            this.skyboxProgram = programs[2];
            //
            const texarrays: string[] = [
                'resource/assets/bg.png',
                'resource/assets/sky-negx.png',
                'resource/assets/sky-posx.png',
                'resource/assets/sky-negy.png',
                'resource/assets/sky-posy.png',
                'resource/assets/sky-negz.png',
                'resource/assets/sky-posz.png'
            ];
            const loadImages = await this.engine.loadImages(texarrays);
            this.webglImage = loadImages[0];
            for (let i = 0; i < 6; ++i) {
                this.cubemapImages[i] = loadImages[1 + i];
            }
        }
        catch (e) {
            console.error(e);
        }
    }

    public update(): WebGL2DemoScene {
        if (!this._ready) {
            return;
        }
        const engine = this.engine;
        this.angleX += 0.01;
        this.angleY += 0.02;
        mat4.fromXRotation(this.rotateXMatrix, this.angleX);
        mat4.fromYRotation(this.rotateYMatrix, this.angleY);
        mat4.multiply(this.modelMatrix, this.rotateXMatrix, this.rotateYMatrix);
        this.cubemapDrawCall.uniform("uModel", this.modelMatrix);
        this.cubeDrawCall.uniform("uModel", this.modelMatrix);
        //
        engine.drawFramebuffer(this.cubemapBuffer)
            .viewport(0, 0, this.cubemapDim, this.cubemapDim)
            .clear();
        this.cubemapDrawCall.draw();
        //
        engine.defaultDrawFramebuffer().defaultViewport().clear();
        this.skyboxDrawcall.draw();
        this.cubeDrawCall.draw();
        return this;
    }

    public leave(): WebGL2DemoScene {
        this.cubemapDrawCall.delete();
        this.cubeDrawCall.delete();
        this.skyboxDrawcall.delete();
        this.cubemapBuffer.delete();
        this.program.delete();
        this.cubemapProgram.delete();
        this.skyboxProgram.delete();
        this.sceneUniformBuffer.delete();
        this.skyboxSceneUniforms.delete();
        const engine = this.engine;
        engine.noDepthTest();
        this.closeUI();
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        mat4.perspective(this.projMatrix, Math.PI / 2, width / height, 0.1, 10.0);
        mat4.multiply(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
        mat4.multiply(this.skyboxViewProjMatrix, this.projMatrix, this.skyboxViewMatrix);
        this.sceneUniformBuffer.set(0, this.viewProjMatrix).update();
        this.skyboxSceneUniforms.set(0, this.skyboxViewProjMatrix).update();
        return this;
    }

    private openUI(): HTMLDivElement {
        if (this.debugColorEnableDiv) {
            return this.debugColorEnableDiv;
        }
        ///
        this.debugColorEnableDiv = document.createElement("div");
        document.body.appendChild(this.debugColorEnableDiv);
        const style = this.debugColorEnableDiv.style; //置顶，必须显示在最上面
        style.setProperty('position', 'absolute');
        style.setProperty('bottom', '20px');
        style.setProperty('right', '20px');
        style.setProperty('color', 'white');
        style.setProperty('z-index', '999');
        style.setProperty('top', '0');
        this.debugColorEnableDiv.innerText = 'debug-color';
        ////
        const input = document.createElement("input"); 
        this.debugColorEnableDiv.appendChild(input); 
        input.setAttribute("type","checkbox");  
        input.setAttribute("id","inputid");  
        input.setAttribute("name","inputname");  
        input.setAttribute("value","inputvalue");  
        if (this.debugColorEnabled) {
            input.setAttribute("checked", "checked");  
        }
        ///
        const self = this;
        input.addEventListener("change", function() {
            self.debugColorEnabled = this.checked;
            self.skyboxSceneUniforms.set(2, self.debugColorEnabled).update();
        });
        return this.debugColorEnableDiv;
    }

    private closeUI(): void {
        if (this.debugColorEnableDiv) {
            document.body.removeChild(this.debugColorEnableDiv);
            this.debugColorEnableDiv = null;
        }
    }
}