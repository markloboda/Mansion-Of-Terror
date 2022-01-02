import { mat3 } from "../lib/gl-matrix-module";

export class ObjectBoundryBox {
    constructor(aabb) {
        this.points = [];
        aabb.forEach(point => {
            this.points.append(point);
        });
        calculatePoints(aabb);
    }

    calculatePoints(aabb) {
        const dif = [aabb.min[0] - aabb.max[0], aabb.min[1] - aabb.max[1], aabb.min[2] - aabb.max[2]];
        // calculate the points
        for (const key in aabb) {
            for (let i = 0; i < 3; i++) {
                let point = aabb[key];
                point[i] += dif[i];
                aabb.append(point);
            }
        }
    }

    intersect(obb1, obb2) {

    }

    rotateByAngle(axis, fi) {
        if (axis.equals("x")) {
            
        }
    }
}