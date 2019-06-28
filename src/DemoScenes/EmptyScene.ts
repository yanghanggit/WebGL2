
class EmptyScene extends WebGL2DemoScene {
    
    public enter(): WebGL2DemoScene {
        //console.log('-----------EmptyScene-----------');
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