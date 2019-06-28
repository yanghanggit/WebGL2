
class EmptyScene extends WebGL2DemoScene {
    
    public enter(): WebGL2DemoScene {
        console.warn('enter => ' + egret.getQualifiedClassName(this));
        this.application.profile.setTitle(egret.getQualifiedClassName(this));
        this.start().catch(e => {
            console.error(e);
        });
        return this;
    }

    private async start(): Promise<void> {
        console.warn('start => ' + egret.getQualifiedClassName(this));
        await this.loadResource();
        this.createScene();
        this._ready = true; 
    }

    private createScene(): void {
        console.warn('createScene => ' + egret.getQualifiedClassName(this));
    }

    private async loadResource(): Promise<void> {
        try {
            console.warn('loadResource => ' + egret.getQualifiedClassName(this));
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
        console.warn('leave => ' + egret.getQualifiedClassName(this));
        return this;
    }

    public resize(width: number, height: number): WebGL2DemoScene {
        console.warn('resize => ' + egret.getQualifiedClassName(this));
        return this;
    }
}