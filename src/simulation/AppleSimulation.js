import * as THREE from 'three';
import { GameObject } from '../engine/GameObject.js';

export class AppleSimulation extends GameObject {
  constructor(physicsEngine, startY = 10, groundY = 0) {
    super("Apple");
    this.physicsEngine = physicsEngine;
    
    this.startY = startY;
    this.groundY = groundY;
    
    this.isFalling = false;
    this.timeFalling = 0;
    this.velocityY = 0;
    
    this.createMesh();
    this.setPosition(0, startY, 0);

    // UI elements
    this.uiTime = document.getElementById('info-time');
    this.uiPos = document.getElementById('info-pos');
    this.uiVel = document.getElementById('info-vel');
  }

  createMesh() {
    // Apple Body
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color: 0xcc0000 });
    const appleMesh = new THREE.Mesh(geometry, material);
    appleMesh.castShadow = true;
    this.add(appleMesh);

    // Apple Stem
    const stemGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.y = 0.35;
    this.add(stem);

    // Apple Leaf
    const leafGeom = new THREE.ConeGeometry(0.1, 0.2, 3);
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const leaf = new THREE.Mesh(leafGeom, leafMat);
    leaf.position.set(0.1, 0.35, 0);
    leaf.rotation.z = -Math.PI / 4;
    this.add(leaf);
  }

  startSimulation() {
    this.isFalling = true;
  }

  pauseSimulation() {
    this.isFalling = false;
  }

  resetSimulation() {
    this.isFalling = false;
    this.timeFalling = 0;
    this.velocityY = 0;
    this.setPosition(this.mesh.position.x, this.startY, this.mesh.position.z);
    this.updateUI();
  }

  setGravity(g) {
    this.physicsEngine.setGravity(g);
  }

  update(deltaTime) {
    if (this.isFalling) {
      this.timeFalling += deltaTime;
      
      const currentY = this.mesh.position.y;
      
      const result = this.physicsEngine.calculateFall(currentY, this.velocityY, deltaTime);
      
      // Check collision with ground
      // Apple sphere radius is 0.3, so bottom is at currentY - 0.3
      if (result.positionY - 0.3 <= this.groundY) {
        this.setPosition(this.mesh.position.x, this.groundY + 0.3, this.mesh.position.z);
        this.velocityY = 0;
        this.isFalling = false;
      } else {
        this.setPosition(this.mesh.position.x, result.positionY, this.mesh.position.z);
        this.velocityY = result.velocityY;
      }
      
      this.updateUI();
    }
  }

  updateUI() {
    if (this.uiTime) this.uiTime.innerText = this.timeFalling.toFixed(2);
    if (this.uiPos) this.uiPos.innerText = this.mesh.position.y.toFixed(2);
    if (this.uiVel) this.uiVel.innerText = Math.abs(this.velocityY).toFixed(2);
  }
}
