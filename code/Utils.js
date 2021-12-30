export class Utils {

    static init(object, defaults, options) {
        let filtered = Utils.clone(options || {});
        let defaulted = Utils.clone(defaults || {});
        for (let key in filtered) {
            if (!defaulted.hasOwnProperty(key)) {
                delete filtered[key];
            }
        }
        Object.assign(object, defaulted, filtered);
    }

    static clone(object) {
        return JSON.parse(JSON.stringify(object));
    }

    static quaternion_to_euler(q){
        let w = q[0];
        let x = q[0];
        let y = q[0];
        let z = q[0];

        // roll
        let t0 = 2 * (w * x + y * z);
        let t1 = 1 - 2 * (x * x + y * y);
        let roll = Math.atan2(t0, t1);
        
        // pitch
        let t2 = 2 * (w * y - z * x);
        if (t2 > 1) {
            t2 = 1;
        }
        if (t2 < -1) {
            t2 = -1;
        }
        let pitch = Math.asin(t2);

        // yaw
        let t3 = 2 * (w * z + x * y);
        let t4 = 1 - 2 * (y * y + z * z);
        let yaw = Math.atan2(t3, t4);
        
        console.log([roll, pitch, yaw]);
        return [roll, pitch, yaw]
    }
}
