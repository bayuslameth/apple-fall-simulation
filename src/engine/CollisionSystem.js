import * as THREE from 'three';

export class CollisionSystem {
  constructor() {
    this.colliders = [];
  }

  // Add a bounding cylinder (x, z, radius)
  addCylinderCollider(x, z, radius) {
    this.colliders.push({ type: 'cylinder', x, z, radius });
  }

  // Add a bounding box (minX, maxX, minZ, maxZ)
  addBoxCollider(minX, maxX, minZ, maxZ) {
    this.colliders.push({ type: 'box', minX, maxX, minZ, maxZ });
  }

  checkCollision(position, playerRadius) {
    for (const col of this.colliders) {
      if (col.type === 'cylinder') {
        const dx = position.x - col.x;
        const dz = position.z - col.z;
        const distSq = dx * dx + dz * dz;
        const minRadius = col.radius + playerRadius;
        if (distSq < minRadius * minRadius) {
          return true; // Collision detected
        }
      } else if (col.type === 'box') {
        if (position.x + playerRadius > col.minX && position.x - playerRadius < col.maxX &&
            position.z + playerRadius > col.minZ && position.z - playerRadius < col.maxZ) {
          return true;
        }
      }
    }
    return false;
  }
}
