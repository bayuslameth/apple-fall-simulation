import * as THREE from 'three';

export class TextureGenerator {
  static createCanvas(width = 256, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return { canvas, ctx: canvas.getContext('2d') };
  }

  static createGrassTexture() {
    const { canvas, ctx } = this.createCanvas(512, 512);
    // Base soil/grass color
    ctx.fillStyle = '#4a7c59';
    ctx.fillRect(0, 0, 512, 512);
    // Noise for grass blades
    for (let i = 0; i < 8000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#3b6947' : '#5c946e';
      const w = 2 + Math.random() * 3;
      const h = 10 + Math.random() * 15;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, w, h);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(15, 15);
    return tex;
  }
  
  static createWoodTexture() {
    const { canvas, ctx } = this.createCanvas(256, 512);
    ctx.fillStyle = '#4a3018'; // Base brown
    ctx.fillRect(0, 0, 256, 512);
    // Bark lines
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#362110' : '#5e3c1d';
      ctx.fillRect(Math.random() * 256, Math.random() * 512, 2 + Math.random() * 3, 20 + Math.random() * 50);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  static createLeafTexture() {
    const { canvas, ctx } = this.createCanvas(256, 256);
    ctx.fillStyle = '#2d5a27'; // Dark green base
    ctx.fillRect(0, 0, 256, 256);
    // Leaf patterns
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#1e4019' : '#3a7832';
      ctx.beginPath();
      ctx.arc(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  static createClothTexture(color = '#4169E1') {
    const { canvas, ctx } = this.createCanvas(128, 128);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 128, 128);
    // Fabric weave
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for(let i = 0; i < 128; i += 2) {
      ctx.fillRect(0, i, 128, 1);
      ctx.fillRect(i, 0, 1, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }

  static createAppleMaterial() {
    const { canvas, ctx } = this.createCanvas(128, 128);
    ctx.fillStyle = '#d32f2f'; // Red apple
    ctx.fillRect(0, 0, 128, 128);
    // Apple spots
    ctx.fillStyle = '#b71c1c';
    for(let i = 0; i < 300; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 128, Math.random() * 128, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    // Use standard material for shiny specular highlights
    return new THREE.MeshStandardMaterial({ 
      map: tex, 
      roughness: 0.3, 
      metalness: 0.1,
      color: 0xffffff 
    });
  }

  static createSkinTexture() {
    const { canvas, ctx } = this.createCanvas(64, 64);
    ctx.fillStyle = '#f1c27d'; // Warm skin tone
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }
}
