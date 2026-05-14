import * as THREE from 'three';
import { GameObject } from '../engine/GameObject.js';
import { TextureGenerator } from '../materials/TextureGenerator.js';

export class EducationalPropsBuilder {
  static createTextTexture(lines, options = {}) {
    const {
      width = 512,
      height = 256,
      background = '#f7e6bd',
      color = '#2a1d12',
      titleColor = '#285f2f',
      font = '28px Segoe UI',
      titleFont = 'bold 38px Segoe UI'
    } = options;

    const { canvas, ctx } = TextureGenerator.createCanvas(width, height);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(80, 46, 21, 0.55)';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    lines.forEach((line, index) => {
      ctx.font = index === 0 ? titleFont : font;
      ctx.fillStyle = index === 0 ? titleColor : color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(line, width / 2, 48 + index * 44);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  static createLabel(text, width = 1.4, height = 0.38) {
    const texture = this.createTextTexture([text], {
      width: 512,
      height: 160,
      background: '#fff4cf',
      font: 'bold 52px Segoe UI',
      titleFont: 'bold 52px Segoe UI'
    });
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  }

  static buildMeasurementPole(position = new THREE.Vector3(-2.8, 0, 1.4)) {
    const object = new GameObject('MeasurementPole');
    object.setPosition(position.x, position.y, position.z);

    const woodTexture = TextureGenerator.createWoodTexture();
    const woodMaterial = new THREE.MeshLambertMaterial({ map: woodTexture });
    const markerMaterial = new THREE.MeshLambertMaterial({ color: 0xf8f0d5 });
    const darkMarkerMaterial = new THREE.MeshLambertMaterial({ color: 0x2b2419 });

    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 6.2, 0.12), woodMaterial);
    pole.position.y = 3.1;
    pole.castShadow = true;
    pole.receiveShadow = true;
    object.add(pole);

    for (let meter = 0; meter <= 6; meter++) {
      const isMajor = meter % 1 === 0;
      const marker = new THREE.Mesh(
        new THREE.BoxGeometry(isMajor ? 0.65 : 0.4, 0.035, 0.035),
        markerMaterial
      );
      marker.position.set(0.34, meter, 0.02);
      marker.castShadow = true;
      object.add(marker);

      const label = this.createLabel(`${meter} m`, 0.72, 0.24);
      label.position.set(0.92, Math.max(0.18, meter), 0.03);
      object.add(label);
    }

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 0.16, 16), darkMarkerMaterial);
    base.position.y = 0.08;
    base.castShadow = true;
    base.receiveShadow = true;
    object.add(base);

    return object;
  }

  static buildFormulaBoard(position = new THREE.Vector3(2.9, 0, 1.2)) {
    const object = new GameObject('NewtonFormulaBoard');
    object.setPosition(position.x, position.y, position.z);

    const woodMaterial = new THREE.MeshLambertMaterial({ map: TextureGenerator.createWoodTexture() });
    const boardTexture = this.createTextTexture([
      'Hukum Jatuh Bebas',
      's = 1/2 g t^2',
      'v = g t',
      'g = percepatan gravitasi'
    ], {
      width: 768,
      height: 384,
      background: '#ead39f',
      font: '34px Segoe UI',
      titleFont: 'bold 44px Segoe UI'
    });
    const boardMaterial = new THREE.MeshLambertMaterial({ map: boardTexture });

    const board = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.45, 0.12), boardMaterial);
    board.position.y = 1.8;
    board.rotation.y = -Math.PI / 8;
    board.castShadow = true;
    board.receiveShadow = true;
    object.add(board);

    [-1.05, 1.05].forEach((x) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 1.8, 10), woodMaterial);
      post.position.set(x, 0.9, 0.08);
      post.castShadow = true;
      object.add(post);
    });

    return object;
  }

  static buildBasket(position = new THREE.Vector3(0.85, 0, 0.85)) {
    const object = new GameObject('AppleBasket');
    object.setPosition(position.x, position.y, position.z);

    const basketMaterial = new THREE.MeshLambertMaterial({
      color: 0x9a6328,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const rimMaterial = new THREE.MeshLambertMaterial({ color: 0x6f431b });

    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.55, 0.55, 32, 1, true),
      basketMaterial
    );
    basket.position.y = 0.28;
    basket.castShadow = true;
    basket.receiveShadow = true;
    object.add(basket);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.045, 8, 32), rimMaterial);
    rim.position.y = 0.57;
    rim.rotation.x = Math.PI / 2;
    rim.castShadow = true;
    object.add(rim);

    const label = this.createLabel('Target Apel', 1.35, 0.32);
    label.position.set(0, 1.05, 0);
    object.add(label);

    return {
      object,
      target: {
        position: position.clone(),
        radius: 0.8,
        height: 0.75,
        mesh: object.mesh
      }
    };
  }

  static buildGravityZones() {
    const zoneConfigs = [
      { name: 'Bulan', gravity: 1.6, color: 0x8b9097, position: new THREE.Vector3(-3.2, 0.03, -2.2) },
      { name: 'Bumi', gravity: 9.8, color: 0x3f8f52, position: new THREE.Vector3(0, 0.035, -2.6) },
      { name: 'Jupiter', gravity: 24.8, color: 0xd29354, position: new THREE.Vector3(3.2, 0.04, -2.2) }
    ];

    return zoneConfigs.map((config) => {
      const object = new GameObject(`GravityZone-${config.name}`);
      object.setPosition(config.position.x, config.position.y, config.position.z);

      const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 1.18, 0.08, 36),
        new THREE.MeshLambertMaterial({ color: config.color })
      );
      platform.receiveShadow = true;
      platform.castShadow = true;
      object.add(platform);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.05, 0.035, 8, 36),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      ring.position.y = 0.08;
      ring.rotation.x = Math.PI / 2;
      object.add(ring);

      const label = this.createLabel(`${config.name} ${config.gravity} m/s^2`, 1.65, 0.32);
      label.position.set(0, 0.38, -0.15);
      label.rotation.x = -Math.PI / 5;
      object.add(label);

      return {
        object,
        zone: {
          name: config.name,
          gravity: config.gravity,
          position: config.position.clone(),
          radius: 1.15
        }
      };
    });
  }

  static build(sceneManager) {
    const measurementPole = this.buildMeasurementPole();
    const formulaBoard = this.buildFormulaBoard();
    const basket = this.buildBasket();
    const gravityZones = this.buildGravityZones();

    sceneManager.addGameObject(measurementPole);
    sceneManager.addGameObject(formulaBoard);
    sceneManager.addGameObject(basket.object);
    gravityZones.forEach(({ object }) => sceneManager.addGameObject(object));

    return {
      basketTarget: basket.target,
      gravityZones: gravityZones.map(({ zone }) => zone)
    };
  }
}
