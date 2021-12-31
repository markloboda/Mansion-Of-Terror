import { Force } from "./Force.js";

export class ForceEngine {
    constructor(forces = new Array()) {
        this.forces = forces;
        this.forceComponents = [0,0,0];
        this.calculateForcesXYZ();
    }

    addForce(force = new Force()) {
        this.forces.append(force);
        // update forceComponents
        const components = force.componentsXYZ();
        for (let i = 0; i < 3; i++) {
            this.forceComponents[i] += components[i];
        }
    }

    calculateForcesXYZ() {        
        this.forces.forEach(force => {
            let components = force.componentsXYZ();
            for (let i = 0; i < 3; i++) {
                this.forceComponents[i] += components[i];
            } 
        });
        return this.forceComponents;
    }

    acceleration(mass) {
        let accel = [];
        
        for (let i = 0; i < 3; i++) {
            accel += this.forceComponents[i] / mass;
        }
        return accel;
    }
}