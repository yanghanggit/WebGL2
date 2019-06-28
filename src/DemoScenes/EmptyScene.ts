
class EmptyScene extends WebGL2DemoScene {
    
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

    }

    private async loadResource(): Promise<void> {
        try {
        }
        catch (e) {
            console.error(e);
        }
    }

    public update(): WebGL2DemoScene {
        if (!this._ready) {
            return;
        }
        this.engine.clear();
        return this;
    }

    public leave(): WebGL2DemoScene {
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        return this;
    }
}