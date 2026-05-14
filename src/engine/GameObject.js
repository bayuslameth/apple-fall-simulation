import * as THREE from 'three';

export class GameObject {
  constructor(name = "GameObject") {
    this.name = name;
    this.mesh = new THREE.Group();
    this.components = [];
  }

  // Adding a Three.js Object3D (Mesh, Light, Group)
  add(object3D) {
    this.mesh.add(object3D);
  }

  // Set local position
  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }

  // Set local rotation
  setRotation(x, y, z) {
    this.mesh.rotation.set(x, y, z);
  }

  // Set local scale
  setScale(x, y, z) {
    this.mesh.scale.set(x, y, z);
  }

  // Get current position
  getPosition() {
    return this.mesh.position;
  }

  update(deltaTime) {
    // Override this in subclasses to provide custom behavior
  }
}
