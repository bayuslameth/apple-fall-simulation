import * as THREE from 'three';

export class CameraController {
  constructor(camera, inputManager) {
    this.camera = camera;
    this.inputManager = inputManager;
    
    this.moveSpeed = 10;
    this.lookSpeed = 0.003;
    
    // Default angles (yaw & pitch)
    this.yaw = 0;
    this.pitch = 0;
  }

  update(deltaTime) {
    // 1. Calculate Rotation
    const mouseDelta = this.inputManager.getMouseDelta();
    this.yaw -= mouseDelta.x * this.lookSpeed;
    this.pitch -= mouseDelta.y * this.lookSpeed;

    // Clamp pitch to avoid flipping over
    this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch));

    // Create quaternion for rotation from Yaw and Pitch
    const qx = new THREE.Quaternion();
    qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const qy = new THREE.Quaternion();
    qy.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
    
    const q = new THREE.Quaternion();
    q.multiplyQuaternions(qx, qy);
    this.camera.quaternion.copy(q);

    // 2. Calculate Movement vectors
    // Forward vector is based on rotation, pointing out from camera (-Z in local)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    forward.y = 0; 
    forward.normalize();

    // Right vector is cross product of forward and Up vector
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const moveVector = new THREE.Vector3(0, 0, 0);

    // W = Forward, S = Backward
    if (this.inputManager.isKeyPressed('KeyW')) moveVector.add(forward);
    if (this.inputManager.isKeyPressed('KeyS')) moveVector.sub(forward);
    
    // D = Right, A = Left (Corrected mapping)
    if (this.inputManager.isKeyPressed('KeyD')) moveVector.add(right);
    if (this.inputManager.isKeyPressed('KeyA')) moveVector.sub(right);

    // Optional vertical movement
    if (this.inputManager.isKeyPressed('Space')) moveVector.y += 1;
    if (this.inputManager.isKeyPressed('ShiftLeft')) moveVector.y -= 1;

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      this.camera.position.add(moveVector.multiplyScalar(this.moveSpeed * deltaTime));
    }
  }
}
