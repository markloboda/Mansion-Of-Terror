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
                if (node.camera) {
                    for (const interactable of this.scene.interactables) {
                        const bool = this.checkProximity(node, interactable)
                        if (interactable.type == "carry") {
                            if (bool) {
                                interactable.action();
                                const prompt = document.getElementById('carry_prompt');
                                prompt.style.visibility = "visible";
                            } else {
                                const prompt = document.getElementById('carry_prompt');
                                prompt.style.visibility = "hidden";
                            }
                            
                        }
                        if (interactable.type == "interact") {
                            if (bool) {
                            interactable.action();
                            const prompt = document.getElementById('interact_prompt');
                                prompt.style.visibility = "visible";
                            } else {
                                const prompt = document.getElementById('interact_prompt');
                                prompt.style.visibility = "hidden";
                            }
                            
                        }
                    }
                }

                // false if not proven true
                node.onGround = false;
                this.scene.traverse(other => {
                    // check if node is moving (only check for nodes that are moving)
                    // check for collisions and if on ground
                    if (node !== other && !other.camera && node.aabbEnabled && other.aabbEnabled && node.aabb && other.aabb) {
                        this.resolveCollision(node, other);
                    }
                });
            }
            else if (node.camera) {
                node.updateMatrix();
                for (const interactable of this.scene.interactables) {
                    interactable.action();
                }
            }

            // reset Y velocity if on ground
            if (node.onGround) {
                node.velocity[1] = 0;
            }
        });
    }

    checkProximity(a, b) {
        // use aabb for proximity border of camera
        const ta = a.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);

        const mina = vec3.sub(vec3.create(), vec3.add(vec3.create(), posa, a.aabb.min), vec3.fromValues(1, 2, 1));
        const maxa = vec3.add(vec3.create(), vec3.add(vec3.create(), posa, a.aabb.max), vec3.fromValues(1, 2, 1));

        if (posb[0] > mina[0] && posb[1] > mina[1] && posb[2] > mina[2] &&
            posb[0] < maxa[0] && posb[1] < maxa[1] && posb[2] < maxa[2]) {
                return true;
            }
        return false;
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    resolveCollision(a, b) {
        // Update bounding boxes with global translation.
        const ta = a.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);

        const mina = vec3.add(vec3.create(), posa, a.aabb.min);
        const maxa = vec3.add(vec3.create(), posa, a.aabb.max);
        const minb = vec3.add(vec3.create(), posb, b.aabb.min);
        const maxb = vec3.add(vec3.create(), posb, b.aabb.max);

        /// CHECK IF NODE IS ON GROUND
        // check if on top of other and if touching
        if (a.translation[0] > minb[0] && a.translation[0] < maxb[0] &&
            a.translation[2] > minb[2] && a.translation[2] < maxb[2] &&
            mina[1] - 0.1 < maxb[1] && maxa[1] > minb[1]) {
            // check if touching
            a.onGround = true;
        }

        // Check if there is collision.
        const isColliding = this.aabbIntersection({
            min: mina,
            max: maxa
        }, {
            min: minb,
            max: maxb
        });


        if (!isColliding) {
            return;
        }

        if ( a.levelCompletePlane || b.levelCompletePlane) {
            this.scene.levelComplete = true;
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

        // test if stairs
        // if standing near:
        if ((a.translation[0] + 0.2 > minb[0] || a.translation[0] - 0.2 < maxb[0]) &&
            (a.translation[2] + 0.2 > minb[2] || a.translation[2] - 0.2 < maxb[0]) &&
            (maxb[1] - 0.5 < mina[1])) {
                minDirection[1] += 0.08;
            }



        vec3.add(a.translation, a.translation, minDirection);
        a.updateMatrix();
    }

    static acceleration(force, mass) {
        return force / mass;
    }

}
