import { vec3, mat3, vec4, mat4, quat } from '../lib/gl-matrix-module.js';

export class OrinatedBoundingBox {
    constructor(center, halfAxes, rotation) {
        this.center = vec3.fromValues(...center);
        this.halfSize = vec3.fromValues(...halfAxes);
        this.rotation = vec4.fromValues(...rotation);
    }

    set( center, halfSize, rotation ) {
		this.center = center;
		this.scale = halfSize;
		this.rotation = rotation;
		return this;
    }

    intersectOBB(obb) {
        let R = [[], [], []];
        let t = [];
        const AbsR = [[], [], []];

        let aC = this.center;
        let aE = [];
        aE[0] = this.halfSize[0];
        aE[1] = this.halfSize[1];
        aE[2] = this.halfSize[2];
        const au = vec3.create();
        quat.getAxisAngle(au, this.rotation);

        let bC = obb.center;
        let bE = [];
        bE[0] = obb.halfSize[0];
        bE[1] = obb.halfSize[1];
        bE[2] = obb.halfSize[2];
        const bu = vec3.create();
        quat.getAxisAngle(bu, this.rotation);

        for ( let i = 0; i < 3; i ++ ) {
            for ( let j = 0; j < 3; j ++ ) {
                R[ i ][ j ] = vec3.dot(au[i], bu[j])
            }
        } // compute translation vector

        // bring translation into a's coordinate frame
        let v1 = vec3.create();
        for (let i = 0; i < 3; i++) {
            v1[i] = bC[i] - aC[i];
        }

        for (let i = 0; i < 3; i++) {
            t[i] = vec3.dot(v1, au[i]);
        }
        // compute common subexpressions. Add in an epsilon term to
        // counteract arithmetic errors when two edges are parallel and
        // their cross product is (near) null

        for ( let i = 0; i < 3; i ++ ) {
            for ( let j = 0; j < 3; j ++ ) {
                AbsR[ i ][ j ] = Math.abs( R[ i ][ j ] );
            }

        }

        let ra, rb; // test axes L = A0, L = A1, L = A2

        for ( let i = 0; i < 3; i ++ ) {
            ra = aE[i];
            rb = bE[0] * AbsR[i][0] + bE[1] * AbsR[i][1] + bE[2] * AbsR[i][2];
            if (Math.abs(t[i]) > ra + rb) return false;

        } // test axes L = B0, L = B1, L = B2


        for ( let i = 0; i < 3; i ++ ) {
            ra = aE[0] * AbsR[ 0 ][ i ] + aE[ 1 ] * AbsR[ 1 ][ i ] + aE[ 2 ] * AbsR[ 2 ][ i ];
            rb = bE[i];
            if ( Math.abs( t[ 0 ] * R[ 0 ][ i ] + t[ 1 ] * R[ 1 ][ i ] + t[ 2 ] * R[ 2 ][ i ] ) > ra + rb ) return false;

        } // test axis L = A0 x B0


        ra = aE[ 1 ] * AbsR[ 2 ][ 0 ] + aE[ 2 ] * AbsR[ 1 ][ 0 ];
        rb = bE[ 1 ] * AbsR[ 0 ][ 2 ] + bE[ 2 ] * AbsR[ 0 ][ 1 ];
        if ( Math.abs( t[ 2 ] * R[ 1 ][ 0 ] - t[ 1 ] * R[ 2 ][ 0 ] ) > ra + rb ) return false; // test axis L = A0 x B1

        ra = aE[ 1 ] * AbsR[ 2 ][ 1 ] + aE[ 2 ] * AbsR[ 1 ][ 1 ];
        rb = bE[ 0 ] * AbsR[ 0 ][ 2 ] + bE[ 2 ] * AbsR[ 0 ][ 0 ];
        if ( Math.abs( t[ 2 ] * R[ 1 ][ 1 ] - t[ 1 ] * R[ 2 ][ 1 ] ) > ra + rb ) return false; // test axis L = A0 x B2

        ra = aE[ 1 ] * AbsR[ 2 ][ 2 ] + aE[ 2 ] * AbsR[ 1 ][ 2 ];
        rb = bE[ 0 ] * AbsR[ 0 ][ 1 ] + bE[ 1 ] * AbsR[ 0 ][ 0 ];
        if ( Math.abs( t[ 2 ] * R[ 1 ][ 2 ] - t[ 1 ] * R[ 2 ][ 2 ] ) > ra + rb ) return false; // test axis L = A1 x B0

        ra = aE[ 0 ] * AbsR[ 2 ][ 0 ] + aE[ 2 ] * AbsR[ 0 ][ 0 ];
        rb = bE[ 1 ] * AbsR[ 1 ][ 2 ] + bE[ 2 ] * AbsR[ 1 ][ 1 ];
        if ( Math.abs( t[ 0 ] * R[ 2 ][ 0 ] - t[ 2 ] * R[ 0 ][ 0 ] ) > ra + rb ) return false; // test axis L = A1 x B1

        ra = aE[ 0 ] * AbsR[ 2 ][ 1 ] + aE[ 2 ] * AbsR[ 0 ][ 1 ];
        rb = bE[ 0 ] * AbsR[ 1 ][ 2 ] + bE[ 2 ] * AbsR[ 1 ][ 0 ];
        if ( Math.abs( t[ 0 ] * R[ 2 ][ 1 ] - t[ 2 ] * R[ 0 ][ 1 ] ) > ra + rb ) return false; // test axis L = A1 x B2

        ra = aE[ 0 ] * AbsR[ 2 ][ 2 ] + aE[ 2 ] * AbsR[ 0 ][ 2 ];
        rb = bE[ 0 ] * AbsR[ 1 ][ 1 ] + bE[ 1 ] * AbsR[ 1 ][ 0 ];
        if ( Math.abs( t[ 0 ] * R[ 2 ][ 2 ] - t[ 2 ] * R[ 0 ][ 2 ] ) > ra + rb ) return false; // test axis L = A2 x B0

        ra = aE[ 0 ] * AbsR[ 1 ][ 0 ] + aE[ 1 ] * AbsR[ 0 ][ 0 ];
        rb = bE[ 1 ] * AbsR[ 2 ][ 2 ] + bE[ 2 ] * AbsR[ 2 ][ 1 ];
        if ( Math.abs( t[ 1 ] * R[ 0 ][ 0 ] - t[ 0 ] * R[ 1 ][ 0 ] ) > ra + rb ) return false; // test axis L = A2 x B1

        ra = aE[ 0 ] * AbsR[ 1 ][ 1 ] + aE[ 1 ] * AbsR[ 0 ][ 1 ];
        rb = bE[ 0 ] * AbsR[ 2 ][ 2 ] + bE[ 2 ] * AbsR[ 2 ][ 0 ];
        if ( Math.abs( t[ 1 ] * R[ 0 ][ 1 ] - t[ 0 ] * R[ 1 ][ 1 ] ) > ra + rb ) return false; // test axis L = A2 x B2

        ra = aE[ 0 ] * AbsR[ 1 ][ 2 ] + aE[ 1 ] * AbsR[ 0 ][ 2 ];
        rb = bE[ 0 ] * AbsR[ 2 ][ 1 ] + bE[ 1 ] * AbsR[ 2 ][ 0 ];
        if ( Math.abs( t[ 1 ] * R[ 0 ][ 2 ] - t[ 0 ] * R[ 1 ][ 2 ] ) > ra + rb ) return false; // since no separating axis is found, the OBBs must be intersecting

        return true;

    }
}