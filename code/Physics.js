import { vec3, mat4 } from '../lib/gl-matrix-module.js';

export class Physics {

    constructor(scene) {
        this.scene = scene;
    }

    update(dt) {
        this.scene.traverse(node => {
            if (node.velocity && !node.velocity.every(item => item === 0)) {
                let velocity = node.velocity;
                vec3.scaleAndAdd(node.translation, node.translation, velocity, dt);
                node.updateMatrix();
                node.parent?.updateMatrix();

                // false if not proven true
                node.onGround = false;
                this.scene.traverse(other => {
                    // check if node is moving (only check for nodes that are moving)
                    // check for collisions and if on ground
                    if (node !== other && !other.camera && node.boundry && other.boundry) {
                        this.resolveCollision(node, other);
                    }
                });
            }
            else if (node.camera) {
                node.updateMatrix(); 
                node.parent.updateMatrix();
            }

            // reset Y velocity if on ground
            if (node.onGround) {
                node.velocity[1] = 0;
            }
        });
    }

    intersection(mina, maxa, minb, maxb) {
        return (mina[0] <= maxb[0] && maxa[0] >= minb[0]) &&
               (mina[1] <= maxb[1] && maxa[1] >= minb[1]) &&
               (mina[2] <= maxb[2] && maxa[2] >= minb[2]);
    }

    resolveCollision(a, b) {
        // console.log(a.boundry);
        // console.log(b.boundry);
        // console.log("*******************************");
        // Update bounding boxes with global translation.
        const posa = [...a.boundry.center];
        const posb = [...b.boundry.center];
        
        if (a.camera) {
            posa[1] += 1;
        }

        const mina = vec3.add(vec3.create(), posa, a.boundry.min());
        const maxa = vec3.add(vec3.create(), posa, a.boundry.max());
        const minb = vec3.add(vec3.create(), posb, b.boundry.min());
        const maxb = vec3.add(vec3.create(), posb, b.boundry.max());

        /// CHECK IF NODE IS ON GROUND
        // check if on top of other and if touching
        if (a.translation[0] > minb[0] && a.translation[0] < maxb[0] &&
            a.translation[2] > minb[2] && a.translation[2] < maxb[2] &&
            mina[1] - 0.1 < maxb[1] && maxa[1] > minb[1]) {
                // check if touching
                a.onGround = true;
            }
            
            // Check if there is collision.
            const isColliding = this.intersection(mina, maxa, minb, maxb);
            
            
            if (!isColliding) {
                return;
            }

            

        // Move node A minimally to avoid collision.
        const diffa = vec3.sub(vec3.create(), maxb, mina);
        const diffb = vec3.sub(vec3.create(), maxa, minb);

        let minDiff = 5;
        let minDirection = [0, 0, 0];
        if (diffa[0] >= 0 && diffa[0] < minDiff) {
            minDiff = diffa[0];
            minDirection = [minDiff, 0, 0];
        }
        if (diffa[1] >= 0 && diffa[1] < minDiff) {
            minDiff = diffa[1];
            minDirection = [0, minDiff, 0];
        }
        if (diffa[2] >= 0 && diffa[2] < minDiff) {
            minDiff = diffa[2];
            minDirection = [0, 0, minDiff];
        }
        if (diffb[0] >= 0 && diffb[0] < minDiff) {
            minDiff = diffb[0];
            minDirection = [-minDiff, 0, 0];
        }
        if (diffb[1] >= 0 && diffb[1] < minDiff) {
            minDiff = diffb[1];
            minDirection = [0, -minDiff, 0];
        }
        if (diffb[2] >= 0 && diffb[2] < minDiff) {
            minDiff = diffb[2];
            minDirection = [0, 0, -minDiff];
        }

        vec3.add(a.translation, a.translation, minDirection);
        a.updateMatrix();
    }

    static acceleration(force, mass) {
        return force / mass;
    }
}
