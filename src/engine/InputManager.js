export class InputManager {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    this.keys = {};
    this.mouseDelta = { x: 0, y: 0 };
    this.isPointerLocked = false;
    this.isRightMouseDown = false;

    // Keyboard
    window.addEventListener('keydown', (e) => this.keys[e.code] = true);
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);

    window.addEventListener('mousedown', (event) => {
      if (event.button === 2 && this.isCanvasEvent(event)) {
        this.isRightMouseDown = true;
      }
    });

    window.addEventListener('mouseup', (event) => {
      if (event.button === 2) {
        this.isRightMouseDown = false;
      }
    });

    window.addEventListener('blur', () => {
      this.isRightMouseDown = false;
    });

    window.addEventListener('contextmenu', (event) => {
      if (this.isCanvasEvent(event)) {
        event.preventDefault();
      }
    });

    window.addEventListener('mousemove', (event) => {
      if (!this.isRightMouseDown) return;
      this.mouseDelta.x += event.movementX;
      this.mouseDelta.y += event.movementY;
    });

    // Keep the browser cursor visible. Pointer lock is intentionally disabled.
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = (document.pointerLockElement === document.body);
      if (this.isPointerLocked) {
        document.exitPointerLock();
      }
    });

    document.addEventListener('pointerlockerror', () => {
      console.error('Terjadi kesalahan saat mengaktifkan Pointer Lock.');
    });
  }

  isKeyPressed(keyCode) {
    return !!this.keys[keyCode];
  }

  getMouseDelta() {
    const delta = { x: this.mouseDelta.x, y: this.mouseDelta.y };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return delta;
  }

  isCanvasEvent(event) {
    return event.target === this.container || this.container?.contains(event.target);
  }
}
