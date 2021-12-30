export class BoundryBox {
    constructor(center, x, y, z) {
        this.center = center;
        this.extents = [x, y, z];
    }

    min() {
        return [
            this.center[0] - this.extents[0] / 2,
            this.center[1] - this.extents[1] / 2,
            this.center[2] - this.extents[2] / 2
        ]
    }

    max() {
        return [
            this.center[0] + this.extents[0] / 2,
            this.center[1] + this.extents[1] / 2,
            this.center[2] + this.extents[2] / 2
        ]
    }
}