import * as THREE from 'three';
import { GameObject } from '../engine/GameObject.js';
import { TextureGenerator } from '../materials/TextureGenerator.js';

export class EnvironmentBuilder {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
  }

  createSunLight() {
    const dirLight = new THREE.DirectionalLight(0xfffaee, 1.2);
    // Sun position - warm morning/afternoon angle
    dirLight.position.set(30, 40, -10);
    dirLight.castShadow = true;
    
    // Soft shadows & high res
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    
    const d = 35;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.radius = 2; // Soft edges

    return dirLight;
  }

  createAmbientEnvironment() {
    // Ambient Light (soft, base illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.sceneManager.scene.add(ambientLight);

    // Hemisphere Light (sky color + ground bounce color)
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x4a7c59, 0.4);
    hemiLight.position.set(0, 50, 0);
    this.sceneManager.scene.add(hemiLight);
  }

  buildGround() {
    const groundGeom = new THREE.PlaneGeometry(300, 300);
    const grassTex = TextureGenerator.createGrassTexture();
    const groundMat = new THREE.MeshLambertMaterial({ map: grassTex });
    const groundMesh = new THREE.Mesh(groundGeom, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    
    const groundObj = new GameObject("Ground");
    groundObj.add(groundMesh);
    
    this.sceneManager.addGameObject(groundObj);
    return groundObj;
  }

  buildDecorations() {
    const decorObj = new GameObject("Decorations");
    const rockGeom = new THREE.DodecahedronGeometry(0.3, 0);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x888888 });

    // Procedurally scatter some rocks
    for (let i = 0; i < 30; i++) {
      const rock = new THREE.Mesh(rockGeom, rockMat);
      // Random position around tree but not exactly at (0,0)
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 20;
      rock.position.set(Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.scale.set(Math.random()*2+0.5, Math.random()*0.5+0.2, Math.random()*2+0.5);
      rock.castShadow = true;
      rock.receiveShadow = true;
      decorObj.add(rock);
    }

    // Flowers (Simple colored spheres on tiny stems)
    const flowerColors = [0xffeb3b, 0xff9800, 0x03a9f4, 0xe91e63];
    for (let i = 0; i < 50; i++) {
      const col = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      const fMat = new THREE.MeshLambertMaterial({ color: col });
      const fGeom = new THREE.SphereGeometry(0.1, 8, 8);
      const flower = new THREE.Mesh(fGeom, fMat);
      
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 25;
      flower.position.set(Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius);
      flower.castShadow = true;
      decorObj.add(flower);
    }

    this.sceneManager.addGameObject(decorObj);
  }

  buildEnvironment() {
    // Warm natural sky
    this.sceneManager.scene.background = new THREE.Color(0x87ceeb); // Sky blue
    this.sceneManager.scene.fog = new THREE.FogExp2(0x87ceeb, 0.012); // Depth fog

    this.buildGround();
    this.createAmbientEnvironment();
    this.sceneManager.scene.add(this.createSunLight());
    this.buildDecorations();
  }
}
