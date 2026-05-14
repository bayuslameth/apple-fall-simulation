export class PhysicsEngine {
  constructor() {
    this.gravity = 9.8; // m/s^2
    this.speedMultiplier = 1.0; // Speed control multiplier
  }

  setGravity(g) {
    this.gravity = Math.max(0, Number(g) || 0);
  }

  setSpeedMultiplier(multiplier) {
    this.speedMultiplier = Math.max(0.1, Number(multiplier) || 1);
  }

  // Pure function to calculate free fall
  calculateFall(positionY, velocityY, deltaTime, gravity = this.gravity) {
    const effectiveGravity = gravity * this.speedMultiplier;
    const newVelocityY = velocityY - (effectiveGravity * deltaTime);
    const newPositionY = positionY + (newVelocityY * deltaTime);

    return {
      positionY: newPositionY,
      velocityY: newVelocityY
    };
  }
}
