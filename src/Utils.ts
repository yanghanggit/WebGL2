
/**
 * 工具合集
 */
namespace Utils {
    /**
    * 
    */
    interface CubeModel {
        positions?: Float32Array;
        normals?: Float32Array;
        uvs?: Float32Array;
    }
    /**
     * 
     */
    interface CreateCubeOptions {
        dimensions?: Float32Array | number[],
        position?: Float32Array,
    };
    /**
    * 创建盒子模型
    * @param options 
    */
    export function createCube(options?: CreateCubeOptions): CubeModel {
        options = options || {};

        let dimensions = options.dimensions || [1, 1, 1];
        let position = options.position || [-dimensions[0] / 2, -dimensions[1] / 2, -dimensions[2] / 2];
        let x = position[0];
        let y = position[1];
        let z = position[2];
        let width = dimensions[0];
        let height = dimensions[1];
        let depth = dimensions[2];

        let fbl = { x: x, y: y, z: z + depth };
        let fbr = { x: x + width, y: y, z: z + depth };
        let ftl = { x: x, y: y + height, z: z + depth };
        let ftr = { x: x + width, y: y + height, z: z + depth };
        let bbl = { x: x, y: y, z: z };
        let bbr = { x: x + width, y: y, z: z };
        let btl = { x: x, y: y + height, z: z };
        let btr = { x: x + width, y: y + height, z: z };

        let positions = new Float32Array([
            //front
            fbl.x, fbl.y, fbl.z,
            fbr.x, fbr.y, fbr.z,
            ftl.x, ftl.y, ftl.z,
            ftl.x, ftl.y, ftl.z,
            fbr.x, fbr.y, fbr.z,
            ftr.x, ftr.y, ftr.z,

            //right
            fbr.x, fbr.y, fbr.z,
            bbr.x, bbr.y, bbr.z,
            ftr.x, ftr.y, ftr.z,
            ftr.x, ftr.y, ftr.z,
            bbr.x, bbr.y, bbr.z,
            btr.x, btr.y, btr.z,

            //back
            fbr.x, bbr.y, bbr.z,
            bbl.x, bbl.y, bbl.z,
            btr.x, btr.y, btr.z,
            btr.x, btr.y, btr.z,
            bbl.x, bbl.y, bbl.z,
            btl.x, btl.y, btl.z,

            //left
            bbl.x, bbl.y, bbl.z,
            fbl.x, fbl.y, fbl.z,
            btl.x, btl.y, btl.z,
            btl.x, btl.y, btl.z,
            fbl.x, fbl.y, fbl.z,
            ftl.x, ftl.y, ftl.z,

            //top
            ftl.x, ftl.y, ftl.z,
            ftr.x, ftr.y, ftr.z,
            btl.x, btl.y, btl.z,
            btl.x, btl.y, btl.z,
            ftr.x, ftr.y, ftr.z,
            btr.x, btr.y, btr.z,

            //bottom
            bbl.x, bbl.y, bbl.z,
            bbr.x, bbr.y, bbr.z,
            fbl.x, fbl.y, fbl.z,
            fbl.x, fbl.y, fbl.z,
            bbr.x, bbr.y, bbr.z,
            fbr.x, fbr.y, fbr.z
        ]);

        let uvs = new Float32Array([
            //front
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,

            //right
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,

            //back
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,

            //left
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,

            //top
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,

            //bottom
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1
        ]);

        let normals = new Float32Array([
            // front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // right
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // left
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            // top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0
        ]);

        return {
            positions: positions,
            normals: normals,
            uvs: uvs
        };
    }
    /**
     * 
     */
    interface SphereModel {
        positions: Float32Array,
        normals: Float32Array,
        uvs: Float32Array,
        indices: Uint16Array
    }
    /**
    * 
    */
    interface CreateSphereOptions {
        longBands?: number,
        latBands?: number,
        radius: number,
    }
    /**
    * 
    * @param options 
    */
    export function createSphere(options?: CreateSphereOptions): SphereModel {
        options = options || {} as CreateSphereOptions;
        let longBands = options.longBands || 32;
        let latBands = options.latBands || 32;
        let radius = options.radius || 1;
        let lat_step = Math.PI / latBands;
        let long_step = 2 * Math.PI / longBands;
        let num_positions = longBands * latBands * 4;
        let num_indices = longBands * latBands * 6;
        let lat_angle: number, long_angle: number;
        let positions = new Float32Array(num_positions * 3);
        let normals = new Float32Array(num_positions * 3);
        let uvs = new Float32Array(num_positions * 2);
        let indices = new Uint16Array(num_indices);
        let x1: number, x2: number, x3: number, x4: number,
            y1: number, y2: number,
            z1: number, z2: number, z3: number, z4: number,
            u1: number, u2: number,
            v1: number, v2: number;
        let i: number, j: number;
        let k = 0, l = 0;
        let vi: number, ti: number;
        for (i = 0; i < latBands; i++) {
            lat_angle = i * lat_step;
            y1 = Math.cos(lat_angle);
            y2 = Math.cos(lat_angle + lat_step);
            for (j = 0; j < longBands; j++) {
                long_angle = j * long_step;
                x1 = Math.sin(lat_angle) * Math.cos(long_angle);
                x2 = Math.sin(lat_angle) * Math.cos(long_angle + long_step);
                x3 = Math.sin(lat_angle + lat_step) * Math.cos(long_angle);
                x4 = Math.sin(lat_angle + lat_step) * Math.cos(long_angle + long_step);
                z1 = Math.sin(lat_angle) * Math.sin(long_angle);
                z2 = Math.sin(lat_angle) * Math.sin(long_angle + long_step);
                z3 = Math.sin(lat_angle + lat_step) * Math.sin(long_angle);
                z4 = Math.sin(lat_angle + lat_step) * Math.sin(long_angle + long_step);
                u1 = 1 - j / longBands;
                u2 = 1 - (j + 1) / longBands;
                v1 = 1 - i / latBands;
                v2 = 1 - (i + 1) / latBands;
                vi = k * 3;
                ti = k * 2;

                positions[vi] = x1 * radius;
                positions[vi + 1] = y1 * radius;
                positions[vi + 2] = z1 * radius; //v0

                positions[vi + 3] = x2 * radius;
                positions[vi + 4] = y1 * radius;
                positions[vi + 5] = z2 * radius; //v1

                positions[vi + 6] = x3 * radius;
                positions[vi + 7] = y2 * radius;
                positions[vi + 8] = z3 * radius; // v2


                positions[vi + 9] = x4 * radius;
                positions[vi + 10] = y2 * radius;
                positions[vi + 11] = z4 * radius; // v3

                normals[vi] = x1;
                normals[vi + 1] = y1;
                normals[vi + 2] = z1;

                normals[vi + 3] = x2;
                normals[vi + 4] = y1;
                normals[vi + 5] = z2;

                normals[vi + 6] = x3;
                normals[vi + 7] = y2;
                normals[vi + 8] = z3;

                normals[vi + 9] = x4;
                normals[vi + 10] = y2;
                normals[vi + 11] = z4;

                uvs[ti] = u1;
                uvs[ti + 1] = v1;

                uvs[ti + 2] = u2;
                uvs[ti + 3] = v1;

                uvs[ti + 4] = u1;
                uvs[ti + 5] = v2;

                uvs[ti + 6] = u2;
                uvs[ti + 7] = v2;

                indices[l] = k;
                indices[l + 1] = k + 1;
                indices[l + 2] = k + 2;
                indices[l + 3] = k + 2;
                indices[l + 4] = k + 1;
                indices[l + 5] = k + 3;

                k += 4;
                l += 6;
            }
        }
        return {
            positions: positions,
            normals: normals,
            uvs: uvs,
            indices: indices
        } as SphereModel;
    }

}

