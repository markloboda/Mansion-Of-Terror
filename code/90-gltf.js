import { Application } from "../common/engine/Application.js";
import { GUI } from "../lib/dat.gui.module.js";
import { GLTFLoader } from "./GLTFLoader.js";
import { Renderer } from "./Renderer.js";
import { Camera } from "./Camera.js";
import { Node } from "./Node.js";
import { Physics } from "./Physics.js";
import { PerspectiveCamera } from './PerspectiveCamera.js';


class App extends Application {
  async start() {
    let ext = this.gl.getExtension('OES_texture_float_linear');
    if (!ext) {
      console.log("gg")
    }
    this.loader = new GLTFLoader();
    // await this.loader.load('../../common/models/flat_surface/flat_surface.gltf');
    // await this.loader.load('../../common/models/test_stairs/test_stairs.gltf');
    await this.loader.load('../../common/models/ventilator/ventilator.gltf');
    // await this.loader.load('../../common/models/empty_room/empty_room.gltf');
    // await this.loader.load('../../common/models/cottage/cottage_blender.gltf');
    // await this.loader.load('../../common/models/room/room.gltf');
    // await this.loader.load('../../common/models/croc/croc.gltf');
    // await this.loader.load("../../common/models/example_cube/AnimatedCube.gltf");
    // await this.loader.load("../../common/models/step/InterpolationTest.gltf");
    // await this.loader.load('https://webglfundamentals.org/webgl/resources/models/killer_whale/whale.CYCLES.gltf');
    // await this.loader.load('../../common/models/RiggedFigure/RiggedFigure.gltf')

    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    Object.keys(this.scene.animations).map(animation => this.scene.animations[animation].activate()) // how to activate an animation (activates all animations)
    this.camera = await this.loader.loadNode("Camera_Orientation");
    // const node = new Node({
    //   children: [
    //     new Node({
    //       camera: new PerspectiveCamera({
    //         aspect: 1.77,
    //         fov: 1,
    //         near: 0.1,
    //         far: 1000,
    //       }),
    //     }),
    //   ],
    // });
    // this.camera = node.children[0];
    this.scene.addNode(this.camera);
    if (!this.scene || !this.camera) {
      throw new Error("Scene or Camera not present in glTF");
    }
    
    if (!this.camera.camera) {
      throw new Error("Camera node does not contain a camera reference");
    }
    this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
    document.addEventListener(
      "pointerlockchange",
      this.pointerlockchangeHandler
      );
      this.physics = new Physics(this.scene);
      this.renderer = new Renderer(this.gl);
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
    
    enableCamera() {
      this.canvas.requestPointerLock();
    }
    
    pointerlockchangeHandler() {
      if (!this.camera) {
        return;
      }
      
      if (document.pointerLockElement === this.canvas) {
        this.camera.enableMovement();
      } else {
        this.camera.disableMovement();
      }
    }
    update() {
      const t = (this.time = Date.now());
      const dt = (this.time - this.startTime) * 0.001;
      this.startTime = this.time;
      if (this.camera) {
        this.camera.update(dt);
      }
      
      if (this.physics) {
        this.physics.update(dt);
      }
      if (this.scene && this.scene.animations) {
        for (const animation in this.scene.animations) {
          if (!this.scene.animations[animation].isActive) {
            continue;
          }
          this.scene.animations[animation].update();
        }
      }
    }
    resize() {
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;
      this.aspect = w / h;
      if (this.camera) {
        this.camera.camera.updateCameraMatrix();
      }
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector("canvas");
    const app = new App(canvas);
    const gui = new GUI();
    gui.add(app, "enableCamera");
  });
  