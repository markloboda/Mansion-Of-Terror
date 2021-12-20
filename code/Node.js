import { vec3, mat4, quat } from '../lib/gl-matrix-module.js';

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
        this.euler = [0, 0, 0]

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
        const degVertical = this.euler.map(angle => angle*180/Math.PI);
        this.rotation = quat.fromEuler(quat.create(), ...degVertical);
        const degHorizontal = this.parent.euler.map(angle => angle*180/Math.PI);
        this.parent.rotation = quat.fromEuler(quat.create(), ...degHorizontal)
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
