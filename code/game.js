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
    this.volume = document.getElementById("options-volume").value / 100;

    await this.loadNextLevel();
    this.pointerunlockHandler = this.pointerunlockHandler.bind(this);
    document.addEventListener("pointerlockchange", this.pointerunlockHandler);
    document.addEventListener("setConditions", this.handleSetConditions.bind(this))
    this.pointerlock();
    this.loadSound();
  }

  handleSetConditions(e) {
    for (const condition in e.detail) {
      this.scene.gameState[condition] = e.detail[condition];
    }
  }
  

  async loadNextLevel() {
    this.level++;
    await this.loader.load(scenes.Room4);
    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    this.scene.gameState = {};
    Object.keys(this.scene.animations).map(animation => {
      //this.scene.animations[animation].activate();
      this.scene.animations[animation].loop = false;
      this.scene.animations[animation].gameState = this.scene.gameState;
    }) // how to activate an animation (activates all animations)
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
  }

  addSoundTrack() {
    let soundtrackElement = document.createElement("audio");
    soundtrackElement.setAttribute("id", "main-soundtrack");
    soundtrackElement.className = "audio";
    soundtrackElement.src = "../common/sound/horror-atmosphere-background.mp3"
    soundtrackElement.volume = this.volume;
    soundtrackElement.loop = true;
    soundtrackElement.play();
    document.getElementById("audio-div").appendChild(soundtrackElement);
  }

  enableCamera() {
    console.log("easter egg");
    this.canvas.requestPointerLock();
  }

  render() {
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  pointerunlockHandler() {
    if (!this.camera) {
      return;
    }
    if (document.pointerLockElement !== this.canvas) {
      this.camera.disableMovement();
      // open menu
      mainCanvas.style.display = "none";
      fullscreen.style.display = "none";

      showMainMenu();
    }
  }

  pointerlock() {
    if (!this.camera) {
      return;
    }
    this.camera.enableMovement();
    this.canvas.requestFullscreen();
  }

  update() {
    if (this.scene?.levelComplete && !this.loading) {
      this.loading = this.loadNextLevel().then(res => { this.loading = false });
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

  loadSound() {
    // add sounds here
    const footsteps = document.createElement("audio");
    footsteps.setAttribute("id", "footsteps-sound")
    footsteps.src = "../common/sound/footsteps.mp3";
    footsteps.loop = true;
    document.getElementById("audio-div").appendChild(footsteps);
    
    //
    this.updateVolume();
  }

  updateVolume() {
    document.querySelectorAll("audio").forEach(element => element.volume = this.volume);
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

function hideMainMenu() {
  document.getElementById("main-menu").style.visibility = "hidden";
  const mainMenuContents = document.getElementsByClassName("main-menu-contents");
  for (let i = 0; i < mainMenuContents.length; i++) {
    mainMenuContents[i].style.display = "none";
  }
}

function showMainMenu() {
  document.getElementById("main-menu").style.visibility = "visible";
  const mainMenuContents = document.getElementsByClassName("main-menu-contents");
  for (let i = 0; i < mainMenuContents.length; i++) {
    mainMenuContents[i].style.display = "block";
  }
}

function hideOptionsMenu() {
  const optionsMenu = document.getElementById("options-menu");
  optionsMenu.style.display = "none";
  const optionsContents = document.getElementsByClassName("options-contents");
  for (let i = 0; i < optionsContents.length; i++) {
    optionsContents[i].style.display = "none";
  }
}

function showOptionsMenu() {
  const optionsMenu = document.getElementById("options-menu");
  optionsMenu.style.display = "block";
  const optionsContents = document.getElementsByClassName("options-contents");
  for (let i = 0; i < optionsContents.length; i++) {
    optionsContents[i].style.display = "block";
  }
}


let loaded = false;
const canvas = document.querySelector("canvas");
const app = new App(canvas);

const mainCanvas = document.getElementById("main-canvas");
const fullscreen = document.getElementById("fullscreen");

fullscreen.style.display = "hidden";
canvas.style.display = "hidden";

const playButton = document.getElementById("play-button");

playButton.addEventListener("click", () => {
  hideMainMenu();
  if (!loaded) {
    loaded = true;
    app.play();
  } else {
    fullscreen.style.display = "block";
    canvas.style.display = "block";
  }
  app.pointerlock();
  app.enableCamera();
  app.addSoundTrack();
});

const optionsButton = document.getElementById("options-button");

optionsButton.addEventListener("click", () => {
  hideMainMenu();
  showOptionsMenu();
});

document.getElementById("options-back").addEventListener("click", () => {
  hideOptionsMenu();
  showMainMenu();
});

document.getElementById("options-volume").addEventListener("change", event => {
  app.volume = event.target.value / 100;
  app.updateVolume();
});

const quitButton = document.getElementById("quit-button");

quitButton.addEventListener("click", () => {
  window.close();
});