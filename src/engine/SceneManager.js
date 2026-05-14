import * as THREE from 'three';

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, 20, 100);
    this.gameObjects = [];
  }

  addGameObject(gameObject) {
    this.gameObjects.push(gameObject);
    this.scene.add(gameObject.mesh);
  }

  removeGameObject(gameObject) {
    const index = this.gameObjects.indexOf(gameObject);
    if (index > -1) {
      this.gameObjects.splice(index, 1);
      this.scene.remove(gameObject.mesh);
    }
  }

  update(deltaTime) {
    for (let i = 0; i < this.gameObjects.length; i++) {
      this.gameObjects[i].update(deltaTime);
    }
  }
}
