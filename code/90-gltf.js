import { Application } from '../../common/engine/Application.js';
import { GUI } from '../lib/dat.gui.module.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';

class App extends Application {

    async start() {
        this.loader = new GLTFLoader();
        await this.loader.load('../../common/models/monkey/monkey.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        this.camera = await this.loader.loadNode('Camera');
        if (!this.scene || !this.camera) {
            throw new Error('Scene or Camera not present in glTF');
        }

        if (!this.camera.camera) {
            throw new Error('Camera node does not contain a camera reference');
        }
        console.log(this.camera)

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);
        this.renderer = new Renderer(this.gl);
        this.camera.camera.aspect = this.aspect;
        this.camera.camera.updateProjection();
        this.renderer.prepareScene(this.scene);
        this.resize();
    }

    enableCamera() {
        this.canvas.requestPointerLock();
    }

    render() {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspectRatio = w / h;

        if (this.camera) {
            this.camera.camera.aspect = aspectRatio;
            this.camera.camera.updateMatrix();
        }
    }
    enableCamera() {
        this.canvas.requestPointerLock();
    }

    pointerlockchangeHandler() {
        if (!this.camera) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.camera.camera.enable();
        } else {
            this.camera.camera.disable();
        }
    }
    update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if (this.camera) {
            this.camera.camera.update(dt);
        }

        if (this.physics) {
            this.physics.update(dt);
        }
    }
    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.camera.aspect = this.aspect;
            this.camera.camera.updateProjection();
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new GUI();
    gui.add(app, 'enableCamera');
});
