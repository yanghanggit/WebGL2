
class WebGL2Query extends WebGL2Object {

    private query: WebGLQuery;
    private readonly target: number;
    public active: boolean;
    public result: number;

    constructor(engine: WebGL2Engine, target: number) {
        super(engine);
        this.target = target;
        this.restore();
    }

    public restore(): WebGL2Query {
        this.query = this.gl.createQuery();
        this.active = false;
        this.result = null;
        return this;
    }

    public begin(): WebGL2Query {
        if (!this.active) {
            this.gl.beginQuery(this.target, this.query);
            this.result = null;
        }
        return this;
    }

    public end(): WebGL2Query {
        if (!this.active) {
            this.gl.endQuery(this.target);
            this.active = true;
        }
        return this;
    }

    public ready(): boolean {
        if (this.active && this.gl.getQueryParameter(this.query, GL.QUERY_RESULT_AVAILABLE)) {
            this.active = false;
            this.result = Number(this.gl.getQueryParameter(this.query, GL.QUERY_RESULT));
            return true;
        }
        return false;
    }

    public delete(): WebGL2Query {
        if (this.query) {
            this.gl.deleteQuery(this.query);
            this.query = null;
        }
        return this;
    }
}
