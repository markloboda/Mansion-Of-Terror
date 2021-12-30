import { vec3, mat4, quat, mat3 } from '../lib/gl-matrix-module.js';
import { BoundryBox } from './BoundryBox.js';
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

        this.velocity = [0, 0, 0];

        this.camera = options.camera || null;
        if (this.camera) {
            this.keys = {}
            this.mouseSensitivity = 0.001;
            this.mouseSensitivity = 0.002;
            this.maxSpeed = 3;
            this.groundFriction = 0.2;
            this.acceleration = 20;
            this.mousemoveHandler = this.mousemoveHandler.bind(this);
            this.keydownHandler = this.keydownHandler.bind(this);
            this.keyupHandler = this.keyupHandler.bind(this);
        }
        this.g = 10;
        this.maxFallingSpeed = 20;
        this.onGround = true;
        this.mass = 70;
        this.forces = {gravity: -this.g * this.mass};      
        
        this.mesh = options.mesh || null;
        
        this.children = [...(options.children || [])];
        for (const child of this.children) {
            child.parent = this;
        }
        this.parent = null;

        this.createBB()
    }

    createBB() {
        let position = mat4.getTranslation(vec3.create(), this.matrix);
        if (this.camera) {
            position[1] = 1;
            this.boundry = new BoundryBox(position, 0.4, 2, 0.4)
        } else if (this.mesh) {
            let extents = [];
            let center = [];

            // define AABB
            let min = [];
            let max = [];
            for (let i = 0; i < 3; i++) {
            this.mesh.primitives.forEach(primitive => {
                    if (!min[i] || min[i] > primitive.attributes.POSITION.min[i]) {
                        min[i] = primitive.attributes.POSITION.min[i] * this.scale[i];
                    }
                })
                this.mesh.primitives.forEach(primitive => {
                    if (!max[i] || max[i] < primitive.attributes.POSITION.max[i]) {
                        max[i] = primitive.attributes.POSITION.max[i] * this.scale[i];
                    }
                })
            };

            for (let i = 0; i < 3; i++) {
                center = position;
                extents[i] = max[i] - min[i]; 
            }

            this.boundry = new BoundryBox(center, ...extents);

            
            // adjust for rotation
            let newBoundry = new BoundryBox(position, 0, 0, 0);
            let rotationMat = mat3.fromQuat(mat3.create(), mat4.getRotation(quat.create(), this.matrix));
            for (let i = 0; i < 9; i++) {
                let a = rotationMat[i] * this.boundry.min()[i % 3];
                let b = rotationMat[i] * this.boundry.max()[i % 3];
            }
        }
        console.log(this.boundry);
        
        
        if (this.camera) {
            // define AABB for camera
            this.aabb = {
                min: [position[0] - 0.2, position[1] - 0, position[2] - 0.2],
                max: [position[0] + 0.2, position[1] + 2, position[2] + 0.2]
            }
        } else if (this.mesh) {
            // define AABB for other nodes
            let min = [];
            let max = [];
            for (let i = 0; i < 3; i++) {
                this.mesh.primitives.forEach(primitive => {
                    if (!min[i] || min[i] > primitive.attributes.POSITION.min[i]) {
                        min[i] = primitive.attributes.POSITION.min[i] * this.scale[i];
                    }
                })
                this.mesh.primitives.forEach(primitive => {
                    if (!max[i] || max[i] < primitive.attributes.POSITION.max[i]) {
                        max[i] = primitive.attributes.POSITION.max[i] * this.scale[i];
                    }
                })
        };
        this.aabb = {
            min: min,
            max: max
        };
    }
    console.log(this.aabb);
    
    console.log("-------------");
}

updateBB() {
    if (this.camera) {
            let temp = vec3.copy(vec3.create(), this.translation);
            this.boundry.center = temp;
        } else {
            this.boundry.center = this.translation;
        }
    }
    
    getGlobalTransform() {
        return this.matrix;
    }

    mousemoveHandler(e) {
        let dx = e.movementX;
        let dy = e.movementY;


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
    }


    update(dt) {
        const c = this;

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.euler[1]), 0, -Math.cos(c.euler[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.euler[1]), 0, -Math.sin(c.euler[1]));
        const up = vec3.set(vec3.create(),
        0, -1, 0);


        // 1: add movement acceleration
        let acc = vec3.create();
        let accY = vec3.create();
        if (this.keys["ShiftLeft"] && this.onGround) {
            c.maxSpeed = 5;
            c.acceleration = 20;
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

        if (this.keys['Space'] && this.onGround) {
            this.velocity[1] = 10;
        } else {
            vec3.sub(accY, accY, up)
        }

        // calculate Y acceleration
        let forceSum = 0;
        if (this.onGround) {
            forceSum = 0;
        } else {
            for (let [key, value] of Object.entries(this.forces)) {
                forceSum += value;
        }

        }
        let accelerationY = Physics.acceleration(forceSum, c.mass);
        

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);
        vec3.scaleAndAdd(c.velocity, c.velocity, accY, dt * accelerationY);        
        
        
        // 3: if no movement, apply friction for x an z
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'] &&
            this.onGround) {
            const ySpeed = c.velocity[1];
            vec3.scale(c.velocity, c.velocity, 1 - c.groundFriction);
            c.velocity[1] = ySpeed;
        }


        // 4: limit speed for x and z
        const ySpeed = c.velocity[1];               // save prev velocity
        c.velocity[1] = 0;                          // so you dont measure count in y speed in vector lentgth
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }
        c.velocity[1] = ySpeed;

        // 5: limit speed for y
        const xSpeed = c.velocity[0];
        const zSpeed = c.velocity[2];
        if (c.velocity[1] > c.maxFallingSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxFallingSpeed / c.velocity);
        }
        c.velocity[0] = xSpeed;
        c.velocity[2] = zSpeed;

        // CHECK IF NODE IS STOPPED
        for (let i = 0; i < this.velocity.length; i++) {
            if (Math.abs(this.velocity[i]) <= 0.1 * Math.pow(10, -4)) {
                this.velocity[i] = 0;
            }
        }

        this.updateBB();
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