import { vec3, mat4, quat } from '../lib/gl-matrix-module.js';
import { Physics } from './Physics.js';

export class Node {

    constructor(options = {}) {
        this.translation = options.translation
            ? vec3.clone(options.translation)
            : vec3.fromValues(0, 0, 0);
        this.rotation = options.rotation
            ? quat.clone(options.rotation)
            : quat.fromValues(0, 0, 0, 1);
        this.scale = options.scale
            ? vec3.clone(options.scale)
            : vec3.fromValues(1, 1, 1);
        this.matrix = options.matrix
            ? mat4.clone(options.matrix)
            : mat4.create();
        this.euler = [0, 0, 0];

        if (options.matrix) {
            this.updateTransform();
        } else if (options.translation || options.rotation || options.scale) {
            this.updateMatrix();
        }

        this.camera = options.camera || null;
        if (this.camera) {
            this.keys = {}
            this.mouseSensitivity = 0.001;
            this.velocity = [0, 0, 0];
            this.mouseSensitivity = 0.002;
            this.maxSpeed = 3;
            this.friction = 0.2;
            this.acceleration = 20;
            this.mousemoveHandler = this.mousemoveHandler.bind(this);
            this.keydownHandler = this.keydownHandler.bind(this);
            this.keyupHandler = this.keyupHandler.bind(this);
        }
        this.mesh = options.mesh || null;

        this.children = [...(options.children || [])];
        for (const child of this.children) {
            child.parent = this;
        }
        this.parent = null;
        
        this.mass = 1;
        this.forceSumDown = this.mass * 10;  // gravitational acceletarion = 10 // current vector of summed forces for up and down, where positive is when its up
        this.inAir = false;  
        this.startDate = new Date();

        this.createAABB();
    }

    createAABB() {
        let position = mat4.getTranslation(vec3.create(), this.matrix);
        if (this.camera) {
            // define AABB for camera
            this.aabb = {
                min: [position[0] - 0.2, position[1] - 0.2, position[2] - 0.2],
                max: [position[0] - 0.2, position[1] + 3, position[2] + 0.2]
            }
        } else if (this.mesh) {
            // define AABB for other nodes
            let min = [];
            let max = [];
            for (let i = 0; i < 3; i++) {
                this.mesh.primitives.forEach(primitive => {
                    if (!min[i] || min[i] > primitive.attributes.POSITION.min[i]) {
                        min[i] = primitive.attributes.POSITION.min[i];
                    }
                })
                this.mesh.primitives.forEach(primitive => {
                    if (!max[i] || max[i] < primitive.attributes.POSITION.max[i]) {
                        max[i] = primitive.attributes.POSITION.max[i];
                    }
                })
            };
            this.aabb = {
                min: min,
                max: max
            };
        } else {
            //
        }
    }

    getGlobalTransform() {
        return this.matrix;
    }

    mousemoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;

        this.euler[0] -= dy * this.mouseSensitivity;
        this.euler[1] -= dx * this.mouseSensitivity;
        
        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;
        
        if (this.euler[0] > halfpi) {
            this.euler[0] = halfpi;
        }
        if (this.euler[0] < -halfpi) {
            this.euler[0] = -halfpi;
        }
        

        this.euler[1] = ((this.euler[1] % twopi) + twopi) % twopi;
        const degVertical = this.euler.map(angle => angle * 180 / Math.PI);
        this.rotation = quat.fromEuler(quat.create(), ...degVertical);
        const degHorizontal = this.parent.euler.map(angle => angle * 180 / Math.PI);
        // this.parent.rotation = quat.fromEuler(quat.create(), ...degHorizontal);              // this line not necessary
    }


    update(dt) {
        const c = this;
        
        let endDate = new Date();
        let timeDiff = (endDate.getTime() - c.startDate.getTime()) / 1000;
        let accY = Physics.acceleration(c.forceSumDown, c.mass)
        c.velocity[1] = (c.velocity[1] + accY * timeDiff);

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.euler[1]), 0, -Math.cos(c.euler[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.euler[1]), 0, -Math.sin(c.euler[1]));
        const up = vec3.set(vec3.create(),
            0, 1, 0);


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
        if (this.keys['Space']) {
            vec3.add(acc, acc, up);
        }

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction on ground
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

        // CHECK IF NODE IS STOPPED
        for (let i = 0; i < this.velocity.length; i++) {
            if (Math.abs(this.velocity[i]) <= 0.1 * Math.pow(10, -4)) {
                this.velocity[i] = 0;
            }
        }
        
        c.startDate = new Date();
    }

    enableMovement() {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disableMovement() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }
    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

    updateTransform() {
        mat4.getRotation(this.rotation, this.matrix);
        mat4.getTranslation(this.translation, this.matrix);
        mat4.getScaling(this.scale, this.matrix);
    }


    updateMatrix() {
        mat4.fromRotationTranslationScale(
            this.matrix,
            this.rotation,
            this.translation,
            this.scale);
    }

    addChild(node) {
        this.children.push(node);
        node.parent = this;
    }

    removeChild(node) {
        const index = this.children.indexOf(node);
        if (index >= 0) {
            this.children.splice(index, 1);
            node.parent = null;
        }
    }

    clone() {
        return new Node({
            ...this,
            children: this.children.map(child => child.clone()),
        });
    }
}
