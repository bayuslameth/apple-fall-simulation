import * as THREE from 'three';
import { Engine } from './engine/Engine.js';
import { SceneManager } from './engine/SceneManager.js';
import { InputManager } from './engine/InputManager.js';
import { CollisionSystem } from './engine/CollisionSystem.js';
import { PlayerController } from './player/PlayerController.js';
import { EnvironmentBuilder } from './scene/EnvironmentBuilder.js';
import { TreeBuilder } from './scene/TreeBuilder.js';
import { NewtonBuilder } from './scene/NewtonBuilder.js';
import { EducationalPropsBuilder } from './scene/EducationalPropsBuilder.js';
import { PhysicsEngine } from './simulation/PhysicsEngine.js';
import { AppleSystem } from './simulation/AppleSystem.js';
import { GameObject } from './engine/GameObject.js';
import { TextureGenerator } from './materials/TextureGenerator.js';

// Initialization
const engine = new Engine('canvas-container');
const sceneManager = new SceneManager();
engine.setSceneManager(sceneManager);

const inputManager = new InputManager('canvas-container');

// Setup Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Start position slightly away from tree
camera.position.set(4, 1.7, 8);

// Collision System
const collisionSystem = new CollisionSystem();
// Tree trunk collision
collisionSystem.addCylinderCollider(0, 0, 1.0);
// Newton collision
collisionSystem.addBoxCollider(1.0, 2.0, 1.0, 2.0);

// Setup Held Branch (Ranting yang dipegang user)
const heldBranch = new GameObject("HeldBranch");
const woodTex = TextureGenerator.createWoodTexture();
const leafTex = TextureGenerator.createLeafTexture();
const branchMat = new THREE.MeshLambertMaterial({ map: woodTex });
const leafMat = new THREE.MeshLambertMaterial({ map: leafTex, color: 0x32cd32 });

const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 2.5, 8), branchMat);
stick.position.set(0, 1.25, 0);
stick.castShadow = true;
heldBranch.add(stick);

const bLeaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), leafMat);
bLeaf1.position.set(0, 2.5, 0);
bLeaf1.castShadow = true;
heldBranch.add(bLeaf1);

const bLeaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), leafMat);
bLeaf2.position.set(0.15, 2.2, 0);
bLeaf2.castShadow = true;
heldBranch.add(bLeaf2);

sceneManager.addGameObject(heldBranch);

const playerController = new PlayerController(camera, inputManager, collisionSystem, heldBranch);
playerController.yaw = Math.PI / 6; // Look at tree initially
engine.setCamera(camera);

// Add PlayerController as a GameObject to update it every frame
class PlayerObject {
  constructor(controller) {
    this.controller = controller;
  }
  update(deltaTime) {
    this.controller.update(deltaTime);
  }
}
sceneManager.gameObjects.push(new PlayerObject(playerController));

// Build Environment
const envBuilder = new EnvironmentBuilder(sceneManager);
envBuilder.buildEnvironment();

// Build Tree
const { treeObj, appleSpawnPoints } = TreeBuilder.buildTree(0, 0, 0);
sceneManager.addGameObject(treeObj);

// Build educational props and interactive targets
const educationalProps = EducationalPropsBuilder.build(sceneManager);

// Setup Physics & Apple System
const physicsEngine = new PhysicsEngine();
const appleSystem = new AppleSystem(sceneManager, physicsEngine);
appleSystem.setSpawnPoints(appleSpawnPoints);
appleSystem.setBasketTarget(educationalProps.basketTarget);
appleSystem.setGravityZones(educationalProps.gravityZones);
appleSystem.populateInitialApples();

// Wrapper for AppleSystem to be updated by SceneManager
class AppleSystemUpdater {
  constructor(system) {
    this.system = system;
  }
  update(deltaTime) {
    this.system.update(deltaTime);
  }
}
sceneManager.gameObjects.push(new AppleSystemUpdater(appleSystem));

// Build Newton and pass camera to him
const newton = NewtonBuilder.buildNewton(1.5, 0, 1.5, camera);
newton.mesh.lookAt(0, 0, 0);
sceneManager.addGameObject(newton);

// Start Engine Loop
engine.start();

// ===== SPEED CONTROL PANEL =====
// Initialize speed tracking
let currentMaxSpeed = 0;
let applesFallenCount = 0;
let simulationElapsedTime = 0;
let speedMultiplier = 1.0;
let lastAppleCount = appleSystem.apples.length;
let lastSimulationWasRunning = false;
let simulationStartTime = 0;

const ui = {
  settingsToggle: document.getElementById('settings-toggle'),
  infoToggle: document.getElementById('info-toggle'),
  topPanels: document.getElementById('top-panels'),
  settingsPanel: document.getElementById('settings-panel'),
  helpPanel: document.getElementById('help-panel'),
  toggleSimulation: document.getElementById('toggle-simulation'),
  resetSimulation: document.getElementById('reset-simulation'),
  gravityInput: document.getElementById('gravity-input'),
  gravityValue: document.getElementById('gravity-val'),
  speedMultiplierSlider: document.getElementById('speed-multiplier'),
  multiplierDisplay: document.getElementById('multiplier-val')
};

function isTypingInControl(event) {
  const tagName = event.target?.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || event.target?.isContentEditable;
}

function resetSpeedStats() {
  applesFallenCount = 0;
  currentMaxSpeed = 0;
  simulationElapsedTime = 0;
  lastSimulationWasRunning = false;
  simulationStartTime = 0;
  appleSystem.apples.forEach(apple => {
    apple._counted = false;
  });
}

function updateSimulationButton() {
  if (!ui.toggleSimulation) return;
  ui.toggleSimulation.innerText = appleSystem.isSimulationRunning ? 'Jeda' : 'Mulai';
}

function toggleSimulation() {
  if (appleSystem.isSimulationRunning) {
    appleSystem.pauseSimulation();
  } else {
    appleSystem.startSimulation();
  }
  updateSimulationButton();
}

function resetSimulation() {
  appleSystem.resetSimulation();
  resetSpeedStats();
  updateSimulationButton();
}

function setActivePanel(panelName) {
  const showSettings = panelName === 'settings';
  const showHelp = panelName === 'help';

  ui.settingsPanel?.classList.toggle('hidden', !showSettings);
  ui.helpPanel?.classList.toggle('hidden', !showHelp);
  ui.topPanels?.classList.toggle('hidden', !showSettings && !showHelp);
  ui.settingsToggle?.setAttribute('aria-expanded', String(showSettings));
  ui.infoToggle?.setAttribute('aria-expanded', String(showHelp));
}

function bindUiControls() {
  ui.settingsToggle?.addEventListener('click', () => {
    const isOpen = ui.settingsToggle.getAttribute('aria-expanded') === 'true';
    setActivePanel(isOpen ? null : 'settings');
  });

  ui.infoToggle?.addEventListener('click', () => {
    const isOpen = ui.infoToggle.getAttribute('aria-expanded') === 'true';
    setActivePanel(isOpen ? null : 'help');
  });

  ui.toggleSimulation?.addEventListener('click', toggleSimulation);
  ui.resetSimulation?.addEventListener('click', resetSimulation);

  ui.gravityInput?.addEventListener('input', (event) => {
    const newGravity = parseFloat(event.target.value);
    physicsEngine.setGravity(newGravity);
    appleSystem.setDefaultGravity(newGravity);
    if (ui.gravityValue) ui.gravityValue.innerText = newGravity.toFixed(1);
    appleSystem.updateUI(0, appleSystem.spawnPoints[0]?.y || 0, 0, physicsEngine.gravity);
  });

  ui.speedMultiplierSlider?.addEventListener('input', (event) => {
    speedMultiplier = parseFloat(event.target.value);
    physicsEngine.setSpeedMultiplier(speedMultiplier);
    if (ui.multiplierDisplay) ui.multiplierDisplay.innerText = `${speedMultiplier.toFixed(1)}x`;
  });

  setActivePanel(null);
  updateSimulationButton();
}

bindUiControls();

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  if (isTypingInControl(e)) return;

  if (e.code === 'Space') {
    toggleSimulation();
    e.preventDefault();
  } else if (e.code === 'KeyR') {
    resetSimulation();
  }
});

// Create update function for speed panel
function updateSpeedPanel() {
  // Find the fastest falling apple
  let maxCurrentSpeed = 0;
  appleSystem.apples.forEach(apple => {
    if (apple.isFalling) {
      const absVel = Math.abs(apple.velocityY);
      maxCurrentSpeed = Math.max(maxCurrentSpeed, absVel);
      currentMaxSpeed = Math.max(currentMaxSpeed, absVel);
    }
  });

  // Update current speed display
  const speedDisplay = document.getElementById('current-speed');
  if (speedDisplay) {
    speedDisplay.innerText = maxCurrentSpeed.toFixed(2);
  }

  // Track apples that have fallen to ground
  const currentAppleCount = appleSystem.apples.length;
  appleSystem.apples.forEach(apple => {
    if (apple.isResting && !apple._counted) {
      applesFallenCount++;
      apple._counted = true;
    }
  });

  // Track simulation time
  if (appleSystem.isSimulationRunning) {
    if (!lastSimulationWasRunning) {
      simulationStartTime = performance.now();
    }
    simulationElapsedTime = (performance.now() - simulationStartTime) / 1000;
    lastSimulationWasRunning = true;
  } else {
    lastSimulationWasRunning = false;
  }

  // Reset counter when simulation resets (apple count decreased)
  if (currentAppleCount < lastAppleCount) {
    applesFallenCount = 0;
    currentMaxSpeed = 0;
    simulationElapsedTime = 0;
    appleSystem.apples.forEach(apple => {
      apple._counted = false;
    });
  }
  lastAppleCount = currentAppleCount;

  // Update max speed display
  const maxSpeedDisplay = document.getElementById('max-speed');
  if (maxSpeedDisplay) {
    maxSpeedDisplay.innerText = currentMaxSpeed.toFixed(2);
  }

  // Update apples fallen display
  const applesFallenDisplay = document.getElementById('apples-fallen');
  if (applesFallenDisplay) {
    applesFallenDisplay.innerText = applesFallenCount;
  }

  // Update simulation time display
  const simTimeDisplay = document.getElementById('sim-time');
  if (simTimeDisplay) {
    simTimeDisplay.innerText = simulationElapsedTime.toFixed(1) + 's';
  }

  const basketScoreDisplay = document.getElementById('basket-score');
  if (basketScoreDisplay) {
    basketScoreDisplay.innerText = appleSystem.basketScore;
  }

  const gravityZoneDisplay = document.getElementById('gravity-zone');
  if (gravityZoneDisplay) {
    gravityZoneDisplay.innerText = appleSystem.activeGravityZoneName;
  }

  if (ui.gravityValue) {
    ui.gravityValue.innerText = physicsEngine.gravity.toFixed(1);
  }
  if (ui.gravityInput && document.activeElement !== ui.gravityInput) {
    ui.gravityInput.value = physicsEngine.gravity.toFixed(1);
  }

  updateSimulationButton();
}

// Hook into the animation loop - use requestAnimationFrame
function animationLoop() {
  updateSpeedPanel();
  requestAnimationFrame(animationLoop);
}
animationLoop();
