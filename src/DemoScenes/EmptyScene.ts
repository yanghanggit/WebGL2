
class EmptyScene extends WebGL2DemoScene {
    
    public enter(): WebGL2DemoScene {
        console.warn('enter => ' + Utils.getClassName(this));
        this.application.profile.setTitle(Utils.getClassName(this));
        this.start().catch(e => {
            console.error(e);
        });
        return this;
    }

    private async start(): Promise<void> {
        console.warn('start => ' + Utils.getClassName(this));
        await this.loadResource();
        this.createScene();
        this._ready = true; 
    }

    private createScene(): void {
        console.warn('createScene => ' + Utils.getClassName(this));
    }

    private async loadResource(): Promise<void> {
        try {
            console.warn('loadResource => ' + Utils.getClassName(this));
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
        console.warn('leave => ' + Utils.getClassName(this));
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        console.warn('resize => ' + Utils.getClassName(this));
        return this;
    }
}