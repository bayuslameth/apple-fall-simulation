import * as THREE from 'three';
import { GameObject } from '../engine/GameObject.js';
import { TextureGenerator } from '../materials/TextureGenerator.js';

export class NewtonBuilder {
  static buildNewton(x = 0, y = 0, z = 0, camera) {
    const newton = new GameObject("IsaacNewton");
    newton.setPosition(x, y, z);

    // Textures & Materials
    const skinTex = TextureGenerator.createSkinTexture();
    const coatTex = TextureGenerator.createClothTexture('#2c3e50'); // Dark blue coat
    const pantsTex = TextureGenerator.createClothTexture('#5d4037'); // Brown pants
    const shirtTex = TextureGenerator.createClothTexture('#ecf0f1'); // White shirt
    
    const skinMat = new THREE.MeshLambertMaterial({ map: skinTex });
    const coatMat = new THREE.MeshLambertMaterial({ map: coatTex });
    const pantsMat = new THREE.MeshLambertMaterial({ map: pantsTex });
    const shirtMat = new THREE.MeshLambertMaterial({ map: shirtTex });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0xdddddd }); // Wig

    // Torso (Box)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.7, 0);

    const chestGeom = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    const chest = new THREE.Mesh(chestGeom, coatMat);
    chest.castShadow = true;
    torsoGroup.add(chest);

    // Shirt collar (small box in front)
    const collarGeom = new THREE.BoxGeometry(0.3, 0.3, 0.45);
    const collar = new THREE.Mesh(collarGeom, shirtMat);
    collar.position.set(0, 0.3, 0.05);
    torsoGroup.add(collar);

    newton.add(torsoGroup);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.4, 0);
    
    const headGeom = new THREE.SphereGeometry(0.28, 16, 16);
    const head = new THREE.Mesh(headGeom, skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Wig
    const hairGeom = new THREE.SphereGeometry(0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.5);
    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.rotation.x = -Math.PI / 8;
    hair.position.y = 0.05;
    hair.castShadow = true;
    headGroup.add(hair);

    newton.add(headGroup);

    // Arms
    const armGeom = new THREE.CylinderGeometry(0.12, 0.1, 0.8);
    
    // Left Arm
    const leftArm = new THREE.Mesh(armGeom, coatMat);
    leftArm.position.set(-0.45, 0.9, 0.2);
    leftArm.rotation.x = Math.PI / 3; 
    leftArm.rotation.z = Math.PI / 12;
    leftArm.castShadow = true;
    newton.add(leftArm);

    // Right Arm
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.45, 1.0, 0);
    const rightArm = new THREE.Mesh(armGeom, coatMat);
    rightArm.position.set(0, -0.3, 0.2); 
    rightArm.rotation.x = Math.PI / 4; 
    rightArm.rotation.z = -Math.PI / 8;
    rightArm.castShadow = true;
    rightArmGroup.add(rightArm);
    newton.add(rightArmGroup);

    // Legs
    const thighGeom = new THREE.CylinderGeometry(0.15, 0.12, 0.7);
    const calfGeom = new THREE.CylinderGeometry(0.12, 0.1, 0.7);

    // Left Leg
    const leftThigh = new THREE.Mesh(thighGeom, pantsMat);
    leftThigh.position.set(-0.2, 0.3, 0.3);
    leftThigh.rotation.x = Math.PI / 2;
    leftThigh.castShadow = true;
    newton.add(leftThigh);

    const leftCalf = new THREE.Mesh(calfGeom, pantsMat);
    leftCalf.position.set(-0.2, -0.05, 0.6);
    leftCalf.castShadow = true;
    newton.add(leftCalf);

    // Right Leg
    const rightThigh = new THREE.Mesh(thighGeom, pantsMat);
    rightThigh.position.set(0.2, 0.3, 0.3);
    rightThigh.rotation.x = Math.PI / 2;
    rightThigh.castShadow = true;
    newton.add(rightThigh);

    const rightCalf = new THREE.Mesh(calfGeom, pantsMat);
    rightCalf.position.set(0.2, -0.05, 0.6);
    rightCalf.castShadow = true;
    newton.add(rightCalf);

    newton.time = 0;
    newton.headGroup = headGroup;
    newton.rightArmGroup = rightArmGroup;
    newton.camera = camera;
    
    newton.update = function(deltaTime) {
      this.time += deltaTime;
      
      // Make head slowly look at the player
      if (this.camera) {
        // We calculate target direction based on camera position
        const targetPos = this.camera.position.clone();
        // Prevent Newton from looking too high or breaking neck
        targetPos.y = Math.min(Math.max(targetPos.y, 1.0), 3.0); 
        
        const dummy = new THREE.Object3D();
        dummy.position.copy(this.mesh.position);
        dummy.position.y += 1.4; // head height
        dummy.lookAt(targetPos);
        
        // Slerp for smooth tracking
        this.headGroup.quaternion.slerp(dummy.quaternion, 5.0 * deltaTime);
      }

      // Idle body animations
      this.rightArmGroup.rotation.x = Math.sin(this.time * 0.8) * 0.05 + Math.PI / 4;
      
      // Slight chest breathing
      this.mesh.scale.y = 1.0 + Math.sin(this.time * 2.0) * 0.02;
    };

    return newton;
  }
}
