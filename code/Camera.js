// import { mat4 } from '../../lib/gl-matrix-module.js';

// export class Camera {

//     constructor(options = {}) {
//         this.node = options.node || null;
//         this.matrix = options.matrix
//             ? mat4.clone(options.matrix)
//             : mat4.create();
//     }

// }


import { vec3, mat4, quat } from '../lib/gl-matrix-module.js';

import { Utils } from './Utils.js';
import { Node } from './Node.js';

export class Camera extends Node {

    constructor(options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);
        // this.mousemoveHandler = this.mousemoveHandler.bind(this);
        // this.keydownHandler = this.keydownHandler.bind(this);
        // this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
    }

    update(dt) {
        const c = this;

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.euler[1]), 0, -Math.cos(c.euler[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.euler[1]), 0, -Math.sin(c.euler[1]));


        // 1: add movement acceleration
        let acc = vec3.create();
        if (this.keys["ShiftLeft"]) {
            c.maxSpeed = 20;
            c.acceleration = 60;
        }
        else {
            c.maxSpeed = 3;
            c.acceleration = 20;
        }
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);
        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA']) {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }
    }

    enable() {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    mousemoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this;

        c.euler[0] -= dy * c.mouseSensitivity;
        c.euler[1] -= dx * c.mouseSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        if (c.euler[0] > halfpi) {
            c.euler[0] = halfpi;
        }
        if (c.euler[0] < -halfpi) {
            c.euler[0] = -halfpi;
        }

        c.euler[1] = ((c.euler[1] % twopi) + twopi) % twopi;
        const deg = c.euler.map(angle => angle*180/Math.PI);
        c.rotation = quat.fromEuler(quat.create(), ...deg);
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }



}

Camera.defaults = {
    velocity: [0, 0, 0],
    mouseSensitivity: 0.002,
    maxSpeed: 3,
    friction: 0.2,
    acceleration: 20
}; 
