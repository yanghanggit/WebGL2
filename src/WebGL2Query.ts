
//import { GL } from "./constants.js";

/**
    Generic query object.

    @class
    @prop {WebGLRenderingContext} gl The WebGL context.
    @prop {WebGLQuery} query Query object.
    @prop {GLEnum} target The type of information being queried.
    @prop {boolean} active Whether or not a query is currently in progress.
    @prop {Any} result The result of the query (only available after a call to ready() returns true). 
*/
class WebGL2Query {

    private readonly _engine: WebGL2Engine;
    private readonly gl: WebGLRenderingContext;
    private query: WebGLQuery;
    private readonly target: number;
    public active: boolean;
    public result: number;

    constructor(engine: WebGL2Engine, /*gl: WebGLRenderingContext,*/ target: number) {
        this._engine = engine;
        this.gl = engine.gl;
        this.query = null;
        this.target = target;
        this.active = false;
        this.result = null;

        this.restore();
    }

    /**
        Restore query after context loss.

        @method
        @return {Query} The Query object.
    */
    restore() {
        this.query = this.gl.createQuery();
        this.active = false;
        this.result = null;

        return this;
    }

    /**
        Begin a query.

        @method
        @return {Query} The Query object.
    */
    begin() {
        if (!this.active) {
            this.gl.beginQuery(this.target, this.query);
            this.result = null;
        }

        return this;
    }

    /**
        End a query.

        @method
        @return {Query} The Query object.
    */
    end() {
        if (!this.active) {
            this.gl.endQuery(this.target);
            this.active = true;
        }

        return this;
    }

    /**
        Check if query result is available.

        @method
        @return {boolean} If results are available.
    */
    ready() {
        if (this.active && this.gl.getQueryParameter(this.query, GL.QUERY_RESULT_AVAILABLE)) {
            this.active = false;
            // Note(Tarek): Casting because FF incorrectly returns booleans.
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1422714 
            this.result = Number(this.gl.getQueryParameter(this.query, GL.QUERY_RESULT));
            return true;
        }

        return false;
    }

    /**
        Delete this query.

        @method
        @return {Query} The Query object.
    */
    delete() {
        if (this.query) {
            this.gl.deleteQuery(this.query);
            this.query = null;
        }

        return this;
    }

}
