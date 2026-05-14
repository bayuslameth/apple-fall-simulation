import * as THREE from 'three';

export class Engine {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) throw new Error(`Container ${canvasContainerId} not found`);

    // Setup Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    // Setup basic timing
    this.clock = new THREE.Clock();
    this.deltaTime = 0;
    this.isRunning = true;

    // Handle Resize
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  setCamera(camera) {
    this.camera = camera;
  }

  setSceneManager(sceneManager) {
    this.sceneManager = sceneManager;
  }

  start() {
    this.clock.start();
    this.renderer.setAnimationLoop(this.loop.bind(this));
  }

  loop() {
    if (!this.isRunning) {
      this.clock.getDelta(); // clear delta buffer
      return;
    }

    this.deltaTime = this.clock.getDelta();

    if (this.sceneManager) {
      this.sceneManager.update(this.deltaTime);
    }

    if (this.sceneManager && this.camera) {
      this.renderer.render(this.sceneManager.scene, this.camera);
    }
  }

  onWindowResize() {
    if (this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
