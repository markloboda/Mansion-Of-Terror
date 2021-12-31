import { quat } from '../../lib/gl-matrix-module.js';

export class Force {
    constructor(forceAmount = 0, angleQuat = quat.create()) {
        this.forceAmount = forceAmount;
        this.angleQuat = angleQuat;
    }

    setForce(amount = 0) {
        this.forceAmount = amount;
    }

    setAngleQuat(angle = vec3.create()) {
        this.angleQuat = angle;
    }

    componentsXYZ() {
        let forceX;
        let forceY;
        let forceZ;
        let axisAngle = [[1,0,0], [0,1,0], [0,0,1]];

        // get Axis Angle
        for (let i = 0; i < 3; i++) {
            axisAngle[i] = quat.getAxisAngle(axisAngle[i], this.angleQuat);
        }

        forceX = this.forceAmount * Math.cos(axisAngle[0]);
        forceY = this.forceAmount * Math.cos(axisAngle[1]);
        forceZ = this.forceAmount * Math.cos(axisAngle[2]);

        return [forceX, forceY, forceZ];
    }
}