import * as THREE from 'three';

export class PlayerController {
  constructor(camera, inputManager, collisionSystem, heldBranch = null) {
    this.camera = camera;
    this.inputManager = inputManager;
    this.collisionSystem = collisionSystem;
    this.heldBranch = heldBranch;
    
    this.walkSpeed = 4.0;
    this.sprintSpeed = 8.0;
    this.lookSpeed = 0.002;
    this.playerRadius = 0.5;
    
    this.yaw = 0;
    this.pitch = 0;
    
    this.bobTimer = 0;
    this.baseHeight = 1.7; // Eye level
    this.camera.position.y = this.baseHeight;
  }

  update(deltaTime) {
    // 1. Right mouse drag and arrow keys rotate the camera without pointer lock.
    if (this.inputManager.isRightMouseDown) {
      const mouseDelta = this.inputManager.getMouseDelta();
      this.yaw -= mouseDelta.x * this.lookSpeed;
      this.pitch -= mouseDelta.y * this.lookSpeed;
    }

    const keyboardLookSpeed = 1.8;
    if (this.inputManager.isKeyPressed('ArrowLeft')) this.yaw += keyboardLookSpeed * deltaTime;
    if (this.inputManager.isKeyPressed('ArrowRight')) this.yaw -= keyboardLookSpeed * deltaTime;
    if (this.inputManager.isKeyPressed('ArrowUp')) this.pitch += keyboardLookSpeed * deltaTime;
    if (this.inputManager.isKeyPressed('ArrowDown')) this.pitch -= keyboardLookSpeed * deltaTime;

    const PI_2 = Math.PI / 2;
    this.pitch = Math.max(-PI_2 + 0.1, Math.min(PI_2 - 0.1, this.pitch));

    // Calculate rotation
    const qx = new THREE.Quaternion();
    qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const qy = new THREE.Quaternion();
    qy.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
    
    const q = new THREE.Quaternion();
    q.multiplyQuaternions(qx, qy);
    this.camera.quaternion.copy(q);

    // 2. Movement
    // Forward calculation independent of camera pitch (no slow down when looking up/down)
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const moveVector = new THREE.Vector3(0, 0, 0);

    if (this.inputManager.isKeyPressed('KeyW')) moveVector.add(forward);
    if (this.inputManager.isKeyPressed('KeyS')) moveVector.sub(forward);
    if (this.inputManager.isKeyPressed('KeyD')) moveVector.add(right);
    if (this.inputManager.isKeyPressed('KeyA')) moveVector.sub(right);

    let speed = this.walkSpeed;
    if (this.inputManager.isKeyPressed('ShiftLeft')) {
      speed = this.sprintSpeed;
    }

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      
      const moveAmount = moveVector.multiplyScalar(speed * deltaTime);
      
      // Collision check logic: Try moving X and Z separately to slide along walls
      const proposedX = this.camera.position.clone();
      proposedX.x += moveAmount.x;
      if (!this.collisionSystem.checkCollision(proposedX, this.playerRadius)) {
        this.camera.position.x += moveAmount.x;
      }
      
      const proposedZ = this.camera.position.clone();
      proposedZ.z += moveAmount.z;
      if (!this.collisionSystem.checkCollision(proposedZ, this.playerRadius)) {
        this.camera.position.z += moveAmount.z;
      }

      // Camera Bobbing
      this.bobTimer += deltaTime * (speed === this.sprintSpeed ? 15 : 10);
      const bobOffset = Math.sin(this.bobTimer) * 0.05;
      this.camera.position.y = this.baseHeight + bobOffset;
    } else {
      // Smooth return to base height
      this.bobTimer += deltaTime * 2; // Idle bobbing time progress
      this.camera.position.y += (this.baseHeight - this.camera.position.y) * 10 * deltaTime;
    }

    // Sync Held Branch (Senjata/Ranting yang dipegang)
    if (this.heldBranch) {
       // Lebih ke tengah layar, menjorok jauh ke depan
       const offset = new THREE.Vector3(0.25, -0.6, -0.7);
       
       // Tambahkan sedikit goyangan natural (sway)
       offset.x += Math.sin(this.bobTimer * 0.5) * 0.015;
       offset.y += Math.sin(this.bobTimer) * 0.03;

       // Ubah offset ke kordinat dunia
       offset.applyQuaternion(this.camera.quaternion);
       this.heldBranch.mesh.position.copy(this.camera.position).add(offset);
       
       // Samakan rotasi dengan kamera, lalu miringkan lurus ke depan
       const tilt = new THREE.Quaternion();
       tilt.setFromEuler(new THREE.Euler(Math.PI / 2.1, -Math.PI / 16, -Math.PI / 16));
       
       this.heldBranch.mesh.quaternion.copy(this.camera.quaternion).multiply(tilt);
    }
  }
}
