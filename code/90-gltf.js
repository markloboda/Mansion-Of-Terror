import { Application } from "../common/engine/Application.js";
import { GUI } from "../lib/dat.gui.module.js";
import { GLTFLoader } from "./GLTFLoader.js";
import { Renderer } from "./Renderer.js";
import { Camera } from "./Camera.js";
import { Node } from "./Node.js";
import { Physics } from "./Physics.js";
import { PerspectiveCamera } from './PerspectiveCamera.js';
import { scenes } from './scene_def/scenes.js';
import { vec3 } from "../lib/gl-matrix-module.js";


class App extends Application {
  async start() {
    this.level = 0;
    this.loader = new GLTFLoader();

    await this.loadNextLevel();
    this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
    document.addEventListener(
      "pointerlockchange",
      this.pointerlockchangeHandler
    );
    document.addEventListener("setConditions", this.handleSetConditions.bind(this))
    this.addSoundTrack();
  }

  handleSetConditions(e) {
    for (const condition in e.detail) {
      this.scene.gameState[condition] = e.detail[condition];
    }
  }

  async loadNextLevel() {
    this.level++;
    await this.loader.load(scenes[`Room${this.level}`]);
    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    this.scene.gameState = {};
    Object.keys(this.scene.animations).map(animation => {
      //this.scene.animations[animation].activate();
      this.scene.animations[animation].loop = false;
      this.scene.animations[animation].gameState = this.scene.gameState;}) // how to activate an animation (activates all animations)
    this.camera = await this.loader.loadNode("Camera_Orientation");
    this.scene.interactables.map(interactable => {
      interactable.master = this.camera;
      interactable.gameState = this.scene.gameState;
    });
    this.scene.flashlight = await this.loader.loadNode("Flashlight");
    this.scene.interactables = this.scene.interactables.filter(interactable => interactable.name !== "Flashlight")

    this.scene.addNode(this.camera);
    if (!this.scene || !this.camera) {
      throw new Error("Scene or Camera not present in glTF");
    }
    
    if (!this.camera.camera) {
      throw new Error("Camera node does not contain a camera reference");
    }
    this.physics = new Physics(this.scene);
    this.renderer = new Renderer(this.gl);
    this.renderer.prepareScene(this.scene);
    this.resize();
    console.log(this.scene);
  }

  addSoundTrack() {
    let soundtrackElement = document.createElement("audio");
    soundtrackElement.src = "../common/sounds/main_sound_track.mp3"
    // soundtrackElement.play();
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
    if (this.scene?.levelComplete && !this.loading) {
      this.loading = this.loadNextLevel().then(res => {this.loading = false});
    }
    const t = (this.time = Date.now());
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;
    if (this.camera) {
      this.camera.update(dt);
    }
    
    if (this.physics) {
      this.physics.update(dt);
    }
    if (this.scene) {
      this.scene.flashlight._updateTransform();
      this.scene.flashlight.direction = vec3.transformQuat(this.scene.flashlight.direction, [0, 0, -1], this.scene.flashlight.rotation)
      if (this.scene.animations) {
        for (const animation in this.scene.animations) {
          if (this.scene.animations[animation].isActive) {
            this.scene.animations[animation].update();
          }
        }
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
  