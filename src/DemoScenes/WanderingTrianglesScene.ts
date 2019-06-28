
class WanderingTrianglesScene extends WebGL2DemoScene {
    
    public enter(): WebGL2DemoScene {
        this.application.profile.setTitle(egret.getQualifiedClassName(this));
        return this;
    }

    public update(): WebGL2DemoScene {
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