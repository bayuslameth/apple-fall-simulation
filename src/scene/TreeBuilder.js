import * as THREE from 'three';
import { GameObject } from '../engine/GameObject.js';
import { TextureGenerator } from '../materials/TextureGenerator.js';

export class TreeBuilder {
  static buildTree(x = 0, y = 0, z = 0) {
    const treeGroup = new GameObject("Tree");
    treeGroup.setPosition(x, y, z);

    const woodTex = TextureGenerator.createWoodTexture();
    const leafTex = TextureGenerator.createLeafTexture();
    
    const trunkMat = new THREE.MeshLambertMaterial({ map: woodTex });
    const leafMat = new THREE.MeshLambertMaterial({ map: leafTex, color: 0x32cd32 }); // Clean lime green

    const appleSpawnPoints = [];

    // 1. Main Trunk
    const trunkGeom = new THREE.CylinderGeometry(0.5, 0.8, 6.0, 12);
    trunkGeom.translate(0, 3.0, 0); // Base at 0
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // 2. Main Top Canopy (Large smooth sphere)
    const mainCanopyGeom = new THREE.SphereGeometry(3.0, 32, 32);
    const mainCanopy = new THREE.Mesh(mainCanopyGeom, leafMat);
    mainCanopy.position.set(0, 6.5, 0);
    mainCanopy.castShadow = true;
    mainCanopy.receiveShadow = true;
    treeGroup.add(mainCanopy);

    // Spawn points around the main canopy
    for(let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const radius = 1.8; // Lebih rapat ke tengah
        appleSpawnPoints.push(new THREE.Vector3(
            x + Math.cos(angle) * radius,
            y + 4.0 + Math.random() * 0.8, // Pas di batas bawah bola daun utama
            z + Math.sin(angle) * radius
        ));
    }

    // 3. Side Branches (Menambahkan 2 daun lagi menjadi 6)
    const numBranches = 6;
    for (let i = 0; i < numBranches; i++) {
      const branchHeight = 2.5 + (i * 0.5); // Staggered heights
      const angleY = (Math.PI * 2 / numBranches) * i + (Math.random() * 0.3);
      const angleX = Math.PI / 3.0; // Angle upwards
      
      const branchGroup = new THREE.Group();
      branchGroup.position.set(0, branchHeight, 0);
      branchGroup.rotation.set(angleX, angleY, 0, 'YXZ');
      
      // Branch cylinder
      const branchLen = 2.8;
      const branchGeom = new THREE.CylinderGeometry(0.25, 0.4, branchLen, 8);
      branchGeom.translate(0, branchLen / 2, 0);
      const branch = new THREE.Mesh(branchGeom, trunkMat);
      branch.castShadow = true;
      branch.receiveShadow = true;
      branchGroup.add(branch);
      
      // Branch Canopy (Smaller smooth sphere)
      const canopyGeom = new THREE.SphereGeometry(1.8, 32, 32);
      const canopy = new THREE.Mesh(canopyGeom, leafMat);
      canopy.position.set(0, branchLen + 0.2, 0);
      canopy.castShadow = true;
      canopy.receiveShadow = true;
      branchGroup.add(canopy);
      
      treeGroup.add(branchGroup);

      // Branch apple spawn points
      for(let j = 0; j < 2; j++) {
         const localAngle = Math.random() * Math.PI * 2;
         const localPos = new THREE.Vector3(
             Math.cos(localAngle) * 1.0, // Lebih rapat ke batang
             branchLen - 0.4, // Menempel di pangkal bola daun
             Math.sin(localAngle) * 1.0
         );
         
         // Transform local position to world position using dummy object
         const dummy = new THREE.Object3D();
         dummy.position.copy(localPos);
         branchGroup.add(dummy);
         
         // Temporarily add to scene to compute world matrix properly
         treeGroup.mesh.add(branchGroup);
         dummy.updateMatrixWorld(true);
         
         const worldPos = new THREE.Vector3();
         dummy.getWorldPosition(worldPos);
         // Tidak ada pengurangan Y lagi, karena localPos sudah pas di bawah daun
         appleSpawnPoints.push(worldPos);
      }
    }

    return {
      treeObj: treeGroup,
      appleSpawnPoints
    };
  }
}
