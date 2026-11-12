import * as THREE from 'three';

// -------------------------------------------------------------
// PROCEDURAL HIGH-FIDELITY TEXTURES FOR REALISTIC EVA SUIT
// -------------------------------------------------------------

/**
 * High-detail Beta-cloth / Ortho-fabric spacesuit texture
 * Micro-weave, soft pressure folds, seams, and fabric grain
 */
function createSpacesuitFabricTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base off-white pressurized Beta-cloth tone
  ctx.fillStyle = '#e6e8ec';
  ctx.fillRect(0, 0, 512, 512);

  // Micro-weave cross-hatch pattern
  ctx.fillStyle = 'rgba(205, 209, 216, 0.4)';
  for (let x = 0; x < 512; x += 4) {
    ctx.fillRect(x, 0, 2, 512);
  }
  for (let y = 0; y < 512; y += 4) {
    ctx.fillRect(0, y, 512, 2);
  }

  // Soft horizontal pressurized fabric creases
  for (let y = 0; y < 512; y += 32) {
    const grad = ctx.createLinearGradient(0, y - 10, 0, y + 10);
    grad.addColorStop(0, 'rgba(180, 185, 195, 0)');
    grad.addColorStop(0.5, 'rgba(155, 160, 172, 0.45)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y - 8, 512, 16);
  }

  // Fine noise / lunar regolith dust speckling
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 16;
    data[i] = Math.min(255, Math.max(0, data[i] + n));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * PLSS Backpack Quilted Thermal Blanket Texture (Matches back view of image)
 * Horizontal thermal quilting ribs, stitched baffles, and central relief port
 */
function createPLSSQuiltedBlanketTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#e2e4e8';
  ctx.fillRect(0, 0, 512, 512);

  // Horizontal quilted insulation baffles
  for (let y = 20; y < 500; y += 44) {
    const grad = ctx.createLinearGradient(0, y, 0, y + 40);
    grad.addColorStop(0, '#f2f3f5');
    grad.addColorStop(0.5, '#e4e6ea');
    grad.addColorStop(1, '#c8ccd4');
    ctx.fillStyle = grad;
    ctx.fillRect(20, y, 472, 38);

    // Double-stitched borders
    ctx.strokeStyle = 'rgba(120, 125, 138, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(22, y + 2, 468, 34);

    // Small quilted stitch marks
    ctx.fillStyle = 'rgba(100, 105, 118, 0.5)';
    for (let x = 36; x < 480; x += 36) {
      ctx.fillRect(x, y + 16, 8, 4);
    }
  }

  // Central circular pressure vent port (as seen in image)
  ctx.fillStyle = '#2d333b';
  ctx.beginPath();
  ctx.ellipse(256, 256, 28, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#8a929e';
  ctx.lineWidth = 4;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Heavy Corrugated Overboot Sole Tread Texture
 */
function createOverbootSoleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1c2024';
  ctx.fillRect(0, 0, 256, 256);

  // Deep horizontal rubber tread grooves
  for (let y = 0; y < 256; y += 16) {
    ctx.fillStyle = '#2f353d';
    ctx.fillRect(0, y, 256, 9);
    ctx.fillStyle = '#0f1215';
    ctx.fillRect(0, y + 9, 256, 7);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2);
  return texture;
}

// -------------------------------------------------------------
// 1. HIGH-FIDELITY ARTICULATED ASTRONAUT MODEL
// -------------------------------------------------------------
export interface AstronautInstance {
  group: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  leftShinPivot: THREE.Group;
  rightShinPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  headGroup: THREE.Group;
  flashlight: THREE.SpotLight;
  flashlightTarget: THREE.Object3D;
  updateAnimation: (delta: number, speed: number, isJumping: boolean) => void;
  toggleFlashlight: () => boolean;
}

export function createAstronautModel(): AstronautInstance {
  const root = new THREE.Group();

  // Procedural suit textures
  const suitFabricTex = createSpacesuitFabricTexture();
  const plssBlanketTex = createPLSSQuiltedBlanketTexture();
  const bootSoleTex = createOverbootSoleTexture();

  // PBR Materials faithfully matching reference sculpt
  const suitMat = new THREE.MeshStandardMaterial({
    map: suitFabricTex,
    color: 0xefeff2,
    roughness: 0.72,
    metalness: 0.08
  });

  const suitFoldMat = new THREE.MeshStandardMaterial({
    map: suitFabricTex,
    color: 0xe0e2e8,
    roughness: 0.8,
    metalness: 0.05
  });

  const plssBlanketMat = new THREE.MeshStandardMaterial({
    map: plssBlanketTex,
    roughness: 0.75,
    metalness: 0.12
  });

  // Mirror reflective silver/gold chrome visor
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0xf0f3f6,
    metalness: 0.98,
    roughness: 0.04,
    envMapIntensity: 2.2
  });

  const visorRimMat = new THREE.MeshStandardMaterial({
    color: 0xc4c7cc,
    metalness: 0.85,
    roughness: 0.25
  });

  const hardwareMetalMat = new THREE.MeshStandardMaterial({
    color: 0x8e949e,
    metalness: 0.9,
    roughness: 0.2
  });

  const ringBlueMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb, // Left wrist disconnect ring
    metalness: 0.85,
    roughness: 0.2
  });

  const ringRedMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Right wrist disconnect ring
    metalness: 0.85,
    roughness: 0.2
  });

  const darkRubberMat = new THREE.MeshStandardMaterial({
    color: 0x24282e,
    roughness: 0.88,
    metalness: 0.15
  });

  const corrugatedSoleMat = new THREE.MeshStandardMaterial({
    map: bootSoleTex,
    roughness: 0.92,
    metalness: 0.1
  });

  const hoseRibbedMat = new THREE.MeshStandardMaterial({
    color: 0xcfd3da,
    roughness: 0.65,
    metalness: 0.25
  });

  // =============================================================
  // PELVIS & LOWER TORSO (Height Y = 0.96m)
  // =============================================================
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.96;
  root.add(pelvis);

  // Sculpted pressurized briefs / hip block with natural creases
  const pelvisGeo = new THREE.CylinderGeometry(0.24, 0.21, 0.22, 16);
  const pelvisMesh = new THREE.Mesh(pelvisGeo, suitFoldMat);
  pelvisMesh.castShadow = true;
  pelvis.add(pelvisMesh);

  // Lower waist seal ring
  const waistRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.23, 0.024, 10, 24),
    suitMat
  );
  waistRing.rotation.x = Math.PI / 2;
  waistRing.position.y = 0.1;
  pelvis.add(waistRing);

  // =============================================================
  // UPPER TORSO (Hard Upper Torso HUT + Soft Lower Torso)
  // =============================================================
  const torso = new THREE.Group();
  torso.position.y = 0.22;
  pelvis.add(torso);

  // Pressurized chest & abdominal barrel
  const torsoMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.25, 0.44, 20),
    suitMat
  );
  torsoMesh.position.y = 0.14;
  torsoMesh.scale.set(1.15, 1.0, 0.95);
  torsoMesh.castShadow = true;
  torso.add(torsoMesh);

  // Shoulder yoke / padded cowl
  const shoulderYoke = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.18, 0.36),
    suitMat
  );
  shoulderYoke.position.set(0, 0.32, -0.02);
  shoulderYoke.castShadow = true;
  torso.add(shoulderYoke);

  // =============================================================
  // CHEST DISPLAY & CONTROL MODULE (DCM) - Exactly matching photo!
  // =============================================================
  const dcmGroup = new THREE.Group();
  dcmGroup.position.set(0.04, 0.18, 0.18);
  torso.add(dcmGroup);

  // Main DCM box with beveled edge profile
  const dcmBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.25, 0.12),
    suitMat
  );
  dcmBox.castShadow = true;
  dcmGroup.add(dcmBox);

  // Optical sensor / camera cylinder mounted on upper left/center DCM
  const opticalSensor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.038, 0.12, 16),
    hardwareMetalMat
  );
  opticalSensor.rotation.x = Math.PI / 2;
  opticalSensor.position.set(0.06, 0.14, 0.08);
  dcmGroup.add(opticalSensor);

  const opticalLens = new THREE.Mesh(
    new THREE.CircleGeometry(0.032, 16),
    visorMat
  );
  opticalLens.position.set(0.06, 0.14, 0.142);
  dcmGroup.add(opticalLens);

  // Dials & switches on DCM front face
  const dial1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 12), hardwareMetalMat);
  dial1.rotation.x = Math.PI / 2;
  dial1.position.set(-0.06, 0.04, 0.07);
  dcmGroup.add(dial1);

  const dial2 = dial1.clone();
  dial2.position.set(0.04, 0.04, 0.07);
  dcmGroup.add(dial2);

  const dial3 = dial1.clone();
  dial3.position.set(-0.06, -0.05, 0.07);
  dcmGroup.add(dial3);

  // Anodized quick-disconnect umbilical coupling ports (red & blue)
  const portBlue = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 12), ringBlueMat);
  portBlue.rotation.x = Math.PI / 2;
  portBlue.position.set(-0.07, -0.11, 0.07);
  dcmGroup.add(portBlue);

  const portRed = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 12), ringRedMat);
  portRed.rotation.x = Math.PI / 2;
  portRed.position.set(0.05, -0.11, 0.07);
  dcmGroup.add(portRed);

  // Tether D-rings on sides of DCM
  const dRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.005, 8, 12, Math.PI), hardwareMetalMat);
  dRing1.rotation.y = Math.PI / 2;
  dRing1.position.set(-0.135, -0.02, 0.02);
  dcmGroup.add(dRing1);

  const dRing2 = dRing1.clone();
  dRing2.position.set(0.135, -0.02, 0.02);
  dcmGroup.add(dRing2);

  // =============================================================
  // PLSS LIFE SUPPORT BACKPACK & UMBILICAL HOSES (Matching Photo)
  // =============================================================
  const plssGroup = new THREE.Group();
  plssGroup.position.set(0, 0.16, -0.22);
  torso.add(plssGroup);

  // Main contoured backpack with quilted thermal blanket back face
  const plssMain = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.64, 0.24),
    plssBlanketMat
  );
  plssMain.castShadow = true;
  plssGroup.add(plssMain);

  // Top Oxygen Purge System (OPS) cowl
  const opsCowl = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.12, 0.22),
    suitMat
  );
  opsCowl.position.set(0, 0.36, 0.01);
  opsCowl.castShadow = true;
  plssGroup.add(opsCowl);

  // Lower manifold / battery base
  const plssBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.08, 0.22),
    hardwareMetalMat
  );
  plssBase.position.set(0, -0.34, 0.01);
  plssGroup.add(plssBase);

  // Flexible Umbilical Loop Hoses curving around the waist from backpack to front
  // Left side umbilical bundle
  const leftCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.22, -0.26, -0.08),
    new THREE.Vector3(-0.28, -0.24, 0.12),
    new THREE.Vector3(-0.24, -0.16, 0.28),
    new THREE.Vector3(-0.10, 0.04, 0.38)
  ]);
  const leftHose = new THREE.Mesh(new THREE.TubeGeometry(leftCurve, 20, 0.022, 10, false), hoseRibbedMat);
  leftHose.castShadow = true;
  plssGroup.add(leftHose);

  const leftHose2 = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.18, -0.29, -0.06),
        new THREE.Vector3(-0.27, -0.28, 0.14),
        new THREE.Vector3(-0.22, -0.22, 0.30),
        new THREE.Vector3(-0.06, -0.04, 0.38)
      ]),
      20,
      0.018,
      10,
      false
    ),
    hoseRibbedMat
  );
  leftHose2.castShadow = true;
  plssGroup.add(leftHose2);

  // Right side umbilical bundle
  const rightCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.20, -0.26, -0.08),
    new THREE.Vector3(0.27, -0.24, 0.12),
    new THREE.Vector3(0.22, -0.16, 0.28),
    new THREE.Vector3(0.08, 0.04, 0.38)
  ]);
  const rightHose = new THREE.Mesh(new THREE.TubeGeometry(rightCurve, 20, 0.02, 10, false), hoseRibbedMat);
  rightHose.castShadow = true;
  plssGroup.add(rightHose);

  // Comms antenna on top of backpack
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.35, 8), darkRubberMat);
  antenna.position.set(0.18, 0.52, -0.04);
  plssGroup.add(antenna);

  // =============================================================
  // HELMET & LARGE CHROMED VISOR (Center Y = 1.68m)
  // =============================================================
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.44, 0.02);
  torso.add(headGroup);

  // Heavy padded neck ring / collar gasket
  const neckCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 0.08, 24),
    suitMat
  );
  neckCollar.position.y = -0.04;
  headGroup.add(neckCollar);

  const neckMetalRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.20, 0.016, 10, 24),
    hardwareMetalMat
  );
  neckMetalRing.rotation.x = Math.PI / 2;
  neckMetalRing.position.y = -0.01;
  headGroup.add(neckMetalRing);

  // Outer helmet cloth cowl / hood with soft back curvature
  const helmetCowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 28, 22),
    suitMat
  );
  helmetCowl.scale.set(1.02, 1.05, 1.05);
  helmetCowl.position.set(0, 0.08, -0.02);
  helmetCowl.castShadow = true;
  headGroup.add(helmetCowl);

  // Large convex mirror chrome / gold reflective visor
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.20, 32, 24, 0, Math.PI, 0, Math.PI * 0.8),
    visorMat
  );
  visor.rotation.y = Math.PI / 2;
  visor.rotation.x = -Math.PI * 0.12;
  visor.position.set(0, 0.08, 0.06);
  headGroup.add(visor);

  // Visor perimeter frame / seal ring
  const visorRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.19, 0.018, 12, 32, Math.PI * 1.1),
    visorRimMat
  );
  visorRim.rotation.x = Math.PI / 2 - 0.28;
  visorRim.position.set(0, 0.08, 0.09);
  headGroup.add(visorRim);

  // Headlamp spotlight
  const flashlightTarget = new THREE.Object3D();
  flashlightTarget.position.set(0, 0, 16);
  headGroup.add(flashlightTarget);

  const flashlight = new THREE.SpotLight(0xfff8ea, 2.4, 35, Math.PI * 0.22, 0.25, 1.2);
  flashlight.position.set(0.12, 0.12, 0.18);
  flashlight.target = flashlightTarget;
  flashlight.castShadow = true;
  headGroup.add(flashlight);

  // =============================================================
  // ARMS & DETAILED EVA GAUNTLETS WITH ARTICULATED FINGERS
  // =============================================================
  // Helper to create an articulated EVA spacesuit arm
  function createArm(isLeft: boolean) {
    const armPivot = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    armPivot.position.set(sign * 0.32, 0.28, 0.02);

    // Shoulder scye bearing ring
    const scyeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.018, 10, 20),
      hardwareMetalMat
    );
    scyeRing.rotation.y = Math.PI / 2;
    armPivot.add(scyeRing);

    // Pressurized upper arm sleeve
    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.085, 0.30, 16),
      suitFoldMat
    );
    upperArm.position.y = -0.16;
    upperArm.position.x = sign * 0.03;
    upperArm.rotation.z = sign * 0.12;
    upperArm.castShadow = true;
    armPivot.add(upperArm);

    // Segmented accordion elbow creases
    for (let c = 0; c < 3; c++) {
      const crease = new THREE.Mesh(
        new THREE.TorusGeometry(0.088 - c * 0.003, 0.012, 8, 16),
        suitMat
      );
      crease.rotation.x = Math.PI / 2;
      crease.position.set(sign * 0.03, -0.28 - c * 0.022, 0);
      armPivot.add(crease);
    }

    // Forearm sleeve
    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.082, 0.072, 0.24, 16),
      suitMat
    );
    forearm.position.set(sign * 0.03, -0.42, 0);
    forearm.castShadow = true;
    armPivot.add(forearm);

    // Wrist disconnect ring (Left: Blue, Right: Red)
    const wristRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.076, 0.076, 0.035, 18),
      isLeft ? ringBlueMat : ringRedMat
    );
    wristRing.position.set(sign * 0.03, -0.55, 0);
    armPivot.add(wristRing);

    // Gauntlet hand & fingers (sculpted as seen in reference image)
    const handGroup = new THREE.Group();
    handGroup.position.set(sign * 0.03, -0.58, 0);
    armPivot.add(handGroup);

    // Palm / gauntlet body
    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(0.095, 0.10, 0.055),
      darkRubberMat
    );
    palm.position.y = -0.05;
    palm.castShadow = true;
    handGroup.add(palm);

    // Thumb
    const thumb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.012, 0.05, 8),
      darkRubberMat
    );
    thumb.position.set(sign * -0.05, -0.04, 0.025);
    thumb.rotation.z = sign * -0.55;
    thumb.rotation.x = 0.35;
    handGroup.add(thumb);

    // 4 Articulated Fingers (curved inward naturally)
    for (let f = 0; f < 4; f++) {
      const fingerX = (f - 1.5) * 0.022;
      const finger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.010, 0.065, 8),
        darkRubberMat
      );
      finger.position.set(fingerX, -0.12, 0.01);
      finger.rotation.x = 0.25;
      handGroup.add(finger);

      // Fingertip silicon grip cap
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.011, 8, 8),
        hardwareMetalMat
      );
      tip.position.set(fingerX, -0.155, 0.018);
      handGroup.add(tip);
    }

    return armPivot;
  }

  const leftArmPivot = createArm(true);
  torso.add(leftArmPivot);

  const rightArmPivot = createArm(false);
  torso.add(rightArmPivot);

  // =============================================================
  // LEGS & LUNAR/MARS OVERBOOTS (Touch Y = 0 on ground)
  // =============================================================
  // Helper to create an articulated EVA spacesuit leg
  function createLeg(isLeft: boolean) {
    const legPivot = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    legPivot.position.set(sign * 0.13, -0.06, 0);

    // Pressurized Thigh Sleeve with realistic horizontal folds
    const thigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.105, 0.44, 18),
      suitFoldMat
    );
    thigh.position.y = -0.22;
    thigh.castShadow = true;
    legPivot.add(thigh);

    // Knee / Shin Pivot
    const shinPivot = new THREE.Group();
    shinPivot.position.set(0, -0.44, 0);
    legPivot.add(shinPivot);

    // Rectangular double-stitched Knee Reinforcement Pad (TMG patch from photo)
    const kneePad = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.16, 0.05),
      suitMat
    );
    kneePad.position.set(0, 0.02, 0.10);
    kneePad.castShadow = true;
    shinPivot.add(kneePad);

    // Shin / Lower Leg with compression fold rings
    const shin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.105, 0.095, 0.38, 18),
      suitFoldMat
    );
    shin.position.y = -0.18;
    shin.castShadow = true;
    shinPivot.add(shin);

    // Lower Leg Gaiter Strap with metallic tension buckle (as seen in photo)
    const gaiterStrap = new THREE.Mesh(
      new THREE.TorusGeometry(0.10, 0.016, 8, 20),
      darkRubberMat
    );
    gaiterStrap.rotation.x = Math.PI / 2;
    gaiterStrap.position.set(0, -0.30, 0);
    shinPivot.add(gaiterStrap);

    const strapBuckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.025, 0.015),
      hardwareMetalMat
    );
    strapBuckle.position.set(sign * 0.10, -0.30, 0.02);
    shinPivot.add(strapBuckle);

    // ===========================================================
    // HEAVY LUNAR/MARS OVERBOOT (Sole touches Y = 0 on ground)
    // ===========================================================
    const bootGroup = new THREE.Group();
    bootGroup.position.set(0, -0.38, 0.04);
    shinPivot.add(bootGroup);

    // Main sculpted boot body
    const bootBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.11, 0.28),
      suitMat
    );
    bootBody.position.set(0, 0.04, 0.02);
    bootBody.castShadow = true;
    bootGroup.add(bootBody);

    // Reinforced curved toe cap
    const toeCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.10, 16, 1, false, 0, Math.PI),
      darkRubberMat
    );
    toeCap.rotation.z = Math.PI / 2;
    toeCap.position.set(0, 0.035, 0.14);
    bootGroup.add(toeCap);

    // Deep corrugated rubber sole (Touching ground at Y = 0)
    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.17, 0.045, 0.30),
      corrugatedSoleMat
    );
    sole.position.set(0, -0.05, 0.02);
    sole.castShadow = true;
    sole.receiveShadow = true;
    bootGroup.add(sole);

    // Ankle adjustment strap & buckle
    const ankleStrap = new THREE.Mesh(
      new THREE.BoxGeometry(0.165, 0.025, 0.10),
      darkRubberMat
    );
    ankleStrap.position.set(0, 0.08, -0.02);
    bootGroup.add(ankleStrap);

    return { legPivot, shinPivot };
  }

  const leftLeg = createLeg(true);
  pelvis.add(leftLeg.legPivot);

  const rightLeg = createLeg(false);
  pelvis.add(rightLeg.legPivot);

  // =============================================================
  // ARTICULATED ANIMATION CYCLE
  // =============================================================
  let currentStride = 0;
  let idleTime = 0;

  const updateAnimation = (delta: number, speed: number, isJumping: boolean) => {
    if (isJumping) {
      // Floaty Martian low-gravity leap
      leftLeg.legPivot.rotation.x = THREE.MathUtils.lerp(leftLeg.legPivot.rotation.x, -0.35, delta * 8);
      rightLeg.legPivot.rotation.x = THREE.MathUtils.lerp(rightLeg.legPivot.rotation.x, 0.22, delta * 8);
      leftLeg.shinPivot.rotation.x = THREE.MathUtils.lerp(leftLeg.shinPivot.rotation.x, 0.45, delta * 8);
      rightLeg.shinPivot.rotation.x = THREE.MathUtils.lerp(rightLeg.shinPivot.rotation.x, 0.55, delta * 8);
      leftArmPivot.rotation.x = THREE.MathUtils.lerp(leftArmPivot.rotation.x, -0.45, delta * 8);
      rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, -0.45, delta * 8);
      pelvis.position.y = 0.96;
      return;
    }

    if (speed > 0.12) {
      // Realistic pressurized walking / running stride
      const strideRate = speed > 4.5 ? 9.2 : 6.2;
      currentStride += delta * strideRate;

      const swingAmp = speed > 4.5 ? 0.62 : 0.46;
      const swing = Math.sin(currentStride) * swingAmp;

      // Hips swing forward/back
      leftLeg.legPivot.rotation.x = swing;
      rightLeg.legPivot.rotation.x = -swing;

      // Knees bend naturally backwards during the swing-back phase
      leftLeg.shinPivot.rotation.x = Math.max(0, -swing * 0.72);
      rightLeg.shinPivot.rotation.x = Math.max(0, swing * 0.72);

      // Arms counter-swing with slight elbow flexion
      leftArmPivot.rotation.x = -swing * 0.75;
      rightArmPivot.rotation.x = swing * 0.75;

      // Subtle hip vertical bobbing & torso twist
      pelvis.position.y = 0.96 + Math.abs(Math.sin(currentStride * 2)) * 0.024;
      torso.rotation.y = -swing * 0.14;
    } else {
      // Natural idle stance with subtle breathing motion
      idleTime += delta;
      const breathe = Math.sin(idleTime * 1.6) * 0.008;

      leftLeg.legPivot.rotation.x = THREE.MathUtils.lerp(leftLeg.legPivot.rotation.x, 0, delta * 12);
      rightLeg.legPivot.rotation.x = THREE.MathUtils.lerp(rightLeg.legPivot.rotation.x, 0, delta * 12);
      leftLeg.shinPivot.rotation.x = THREE.MathUtils.lerp(leftLeg.shinPivot.rotation.x, 0, delta * 12);
      rightLeg.shinPivot.rotation.x = THREE.MathUtils.lerp(rightLeg.shinPivot.rotation.x, 0, delta * 12);
      leftArmPivot.rotation.x = THREE.MathUtils.lerp(leftArmPivot.rotation.x, 0.04, delta * 12);
      rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, 0.04, delta * 12);
      pelvis.position.y = THREE.MathUtils.lerp(pelvis.position.y, 0.96 + breathe, delta * 12);
      torso.rotation.y = THREE.MathUtils.lerp(torso.rotation.y, 0, delta * 12);
    }
  };

  const toggleFlashlight = () => {
    flashlight.visible = !flashlight.visible;
    return flashlight.visible;
  };

  return {
    group: root,
    leftLegPivot: leftLeg.legPivot,
    rightLegPivot: rightLeg.legPivot,
    leftShinPivot: leftLeg.shinPivot,
    rightShinPivot: rightLeg.shinPivot,
    leftArmPivot,
    rightArmPivot,
    headGroup,
    flashlight,
    flashlightTarget,
    updateAnimation,
    toggleFlashlight
  };
}

// -------------------------------------------------------------
// 2. GROUNDED MARS ROVER MODEL (Wheels touch Y = 0)
// -------------------------------------------------------------
export interface RoverInstance {
  group: THREE.Group;
  wheels: THREE.Group[];
  steerPivots: THREE.Group[];
  headlights: THREE.SpotLight[];
  updateDrive: (speed: number, steerAngle: number, delta: number) => void;
}

export function createRoverModel(): RoverInstance {
  const root = new THREE.Group();

  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0xdfdfe2,
    roughness: 0.45,
    metalness: 0.55
  });

  const goldMylarMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.35,
    metalness: 0.75
  });

  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x222629,
    roughness: 0.85,
    metalness: 0.2
  });

  const solarDeckMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.25,
    metalness: 0.8
  });

  const wheelRadius = 0.34;
  const wheelWidth = 0.24;

  // Main Chassis Box (Height = 0.55m, centered at Y = 0.58m)
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.55, 2.2), chassisMat);
  chassis.position.y = 0.58;
  chassis.castShadow = true;
  root.add(chassis);

  // Gold insulated electronics bay
  const avionics = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.35, 1.1), goldMylarMat);
  avionics.position.set(0, 0.38, 0.1);
  chassis.add(avionics);

  // Solar Array Top Deck
  const solarDeck = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.03, 1.7), solarDeckMat);
  solarDeck.position.set(0, 0.3, -0.15);
  chassis.add(solarDeck);

  // MastCam Tower
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.1), chassisMat);
  mast.position.set(0.3, 0.85, 0.6);
  chassis.add(mast);

  const mastHead = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.18), chassisMat);
  mastHead.position.set(0, 0.55, 0);
  mast.add(mastHead);

  // Headlights
  const headlightLeft = new THREE.SpotLight(0xfff7e6, 2.8, 38, Math.PI * 0.28, 0.35);
  headlightLeft.position.set(-0.5, 0.05, 1.1);
  const targetL = new THREE.Object3D();
  targetL.position.set(-0.5, -0.4, 20);
  chassis.add(targetL);
  headlightLeft.target = targetL;
  chassis.add(headlightLeft);

  const headlightRight = new THREE.SpotLight(0xfff7e6, 2.8, 38, Math.PI * 0.28, 0.35);
  headlightRight.position.set(0.5, 0.05, 1.1);
  const targetR = new THREE.Object3D();
  targetR.position.set(0.5, -0.4, 20);
  chassis.add(targetR);
  headlightRight.target = targetR;
  chassis.add(headlightRight);

  // 6 WHEELS with Rocker-Bogie Layout (Bottom of wheels touches ground at Y = 0)
  const wheels: THREE.Group[] = [];
  const steerPivots: THREE.Group[] = [];

  const wheelOffsets: [number, number, number, boolean][] = [
    [-0.85, -0.24, 0.85, true],   // Front Left
    [0.85, -0.24, 0.85, true],    // Front Right
    [-0.9, -0.24, 0.0, false],    // Mid Left
    [0.9, -0.24, 0.0, false],     // Mid Right
    [-0.85, -0.24, -0.85, true],  // Rear Left
    [0.85, -0.24, -0.85, true],   // Rear Right
  ];

  wheelOffsets.forEach(([wx, wy, wz, isSteer]) => {
    const steerPivot = new THREE.Group();
    steerPivot.position.set(wx, wy, wz);
    chassis.add(steerPivot);
    if (isSteer) steerPivots.push(steerPivot);

    const wheelMeshGroup = new THREE.Group();
    steerPivot.add(wheelMeshGroup);
    wheels.push(wheelMeshGroup);

    const wheelDrum = new THREE.Mesh(
      new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 18),
      wheelMat
    );
    wheelDrum.rotation.z = Math.PI / 2;
    wheelDrum.castShadow = true;
    wheelMeshGroup.add(wheelDrum);
  });

  const updateDrive = (speed: number, steerAngle: number, delta: number) => {
    if (steerPivots.length >= 4) {
      // Front steer pivots
      steerPivots[0].rotation.y = steerAngle;
      steerPivots[1].rotation.y = steerAngle;
      // Rear steer pivots opposite for tight turning
      steerPivots[2].rotation.y = -steerAngle * 0.7;
      steerPivots[3].rotation.y = -steerAngle * 0.7;
    }

    const rollDelta = (speed / wheelRadius) * delta * 1.6;
    wheels.forEach(w => {
      w.rotation.x += rollDelta;
    });
  };

  return {
    group: root,
    wheels,
    steerPivots,
    headlights: [headlightLeft, headlightRight],
    updateDrive
  };
}

// -------------------------------------------------------------
// 3. EXPEDITION LANDER (Footpads touch Y = 0)
// -------------------------------------------------------------
export interface LanderInstance {
  group: THREE.Group;
  airlockPosition: THREE.Vector3;
}

export function createLanderModel(spacecraftType: string = 'odyssey'): LanderInstance {
  const root = new THREE.Group();

  const hullWhite = new THREE.MeshStandardMaterial({
    color: 0xf8f9fa,
    roughness: 0.35,
    metalness: 0.35
  });

  const heatShieldMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.85,
    metalness: 0.15
  });

  const strutMat = new THREE.MeshStandardMaterial({
    color: 0x4a4d52,
    roughness: 0.6,
    metalness: 0.5
  });

  const goldFoil = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.35,
    metalness: 0.8
  });

  // Base descent stage (centered at Y = 2.0m, height 1.8m)
  const baseStage = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.8, 1.8, 24), goldFoil);
  baseStage.position.y = 2.0;
  baseStage.castShadow = true;
  root.add(baseStage);

  // Upper ascent vehicle fuselage
  const upperFuselage = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 3.2, 4.6, 24), hullWhite);
  upperFuselage.position.y = 3.2;
  upperFuselage.castShadow = true;
  baseStage.add(upperFuselage);

  // Conical nose cap
  const nosecone = new THREE.Mesh(new THREE.ConeGeometry(2.3, 2.2, 24), hullWhite);
  nosecone.position.y = 3.4;
  upperFuselage.add(nosecone);

  // High gain antenna dish
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4),
    hullWhite
  );
  dish.position.set(0.6, 1.6, 0);
  dish.rotation.x = -Math.PI * 0.45;
  nosecone.add(dish);

  // 4 Sturdy Landing Legs with Footpads that touch Y = 0
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const legGroup = new THREE.Group();
    legGroup.rotation.y = angle;
    baseStage.add(legGroup);

    // Diagonal strut
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.6), strutMat);
    strut.position.set(2.8, -0.9, 0);
    strut.rotation.z = -0.65;
    strut.castShadow = true;
    legGroup.add(strut);

    // Footpad touching ground
    const footpad = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.12, 16), heatShieldMat);
    footpad.position.set(4.0, -1.94, 0);
    legGroup.add(footpad);
  }

  // Boarding ladder
  const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 0.08), strutMat);
  ladder.position.set(0, -0.9, 3.2);
  baseStage.add(ladder);

  // Airlock Beacon Light on top of ladder
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x00e676 })
  );
  beacon.position.set(0, 0.3, 3.2);
  baseStage.add(beacon);

  return {
    group: root,
    airlockPosition: new THREE.Vector3(0, 0.5, 4.0)
  };
}

// -------------------------------------------------------------
// 4. NATURAL GEOLOGICAL ROCK TARGETS (POIs)
// -------------------------------------------------------------
export interface ScientificPOI {
  id: string;
  name: string;
  shortLabel: string;
  type: 'rock' | 'clay' | 'core' | 'lander';
  position: THREE.Vector3;
  meshGroup: THREE.Group;
  scanned: boolean;
  collected: boolean;
  simpleFact: string;
  deepFact: string;
  beaconColor: number;
}

export function createNaturalRockTargets(
  scene: THREE.Scene,
  getTerrainY: (x: number, z: number) => number
): ScientificPOI[] {
  // Cohesive rock materials
  const sedimentaryMat = new THREE.MeshStandardMaterial({
    color: 0xb55a36, // Layered warm terracotta sandstone
    roughness: 0.92,
    flatShading: false
  });

  const clayMat = new THREE.MeshStandardMaterial({
    color: 0x8a5540, // Weathered clay earth
    roughness: 0.94,
    flatShading: false
  });

  const basaltMat = new THREE.MeshStandardMaterial({
    color: 0x48281d, // Dark volcanic crystalline basalt
    roughness: 0.88,
    flatShading: false
  });

  const pois: ScientificPOI[] = [
    {
      id: 'poi_first_rock',
      name: 'Layered Sandstone Rock',
      shortLabel: 'Target Rock (22m)',
      type: 'rock',
      // Placed 22m ahead of the lander for an immediate, clear first step!
      position: new THREE.Vector3(14, getTerrainY(14, 18), 18),
      meshGroup: new THREE.Group(),
      scanned: false,
      collected: false,
      simpleFact: 'Thin sandstone ripples prove a calm lake once covered this valley.',
      deepFact: 'Sediment layers like this only form when sand settles quietly at the bottom of a lake over thousands of years.',
      beaconColor: 0xf59e0b // Amber
    },
    {
      id: 'poi_clay_outcrop',
      name: 'Weathered Clay Formation',
      shortLabel: 'Clay Outcrop',
      type: 'clay',
      position: new THREE.Vector3(-36, getTerrainY(-36, 32), 32),
      meshGroup: new THREE.Group(),
      scanned: false,
      collected: false,
      simpleFact: 'Contains clay minerals that could only form in long-lasting liquid water.',
      deepFact: 'Scientists study clays because they preserve clues about whether ancient Martian water was drinkable or acidic.',
      beaconColor: 0x06b6d4 // Cyan
    },
    {
      id: 'poi_core_drill',
      name: 'Deep Basalt Bedrock',
      shortLabel: 'Drill Target',
      type: 'core',
      position: new THREE.Vector3(48, getTerrainY(48, -42), -42),
      meshGroup: new THREE.Group(),
      scanned: false,
      collected: false,
      simpleFact: 'Ancient volcanic lava shielded from cosmic radiation.',
      deepFact: 'Drilling into subsurface rock lets scientists inspect primordial Martian geology untouched by space rays.',
      beaconColor: 0xef4444 // Red
    }
  ];

  pois.forEach(poi => {
    poi.meshGroup.position.copy(poi.position);

    if (poi.type === 'rock') {
      // Natural layered rock formation with stratified slabs
      for (let s = 0; s < 3; s++) {
        const slab = new THREE.Mesh(
          new THREE.BoxGeometry(2.8 - s * 0.4, 0.38, 2.0 - s * 0.28),
          sedimentaryMat
        );
        slab.position.set(0, s * 0.34 + 0.18, 0);
        slab.rotation.y = s * 0.18;
        slab.castShadow = true;
        slab.receiveShadow = true;
        poi.meshGroup.add(slab);
      }
    } else if (poi.type === 'clay') {
      // Weathered clay formation
      const mound = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 2), clayMat);
      mound.position.y = 0.85;
      mound.scale.set(1.4, 0.75, 1.2);
      mound.castShadow = true;
      poi.meshGroup.add(mound);
    } else if (poi.type === 'core') {
      // Basalt outcrop block with drill marker ring
      const block = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 1), basaltMat);
      block.position.y = 0.8;
      block.castShadow = true;
      poi.meshGroup.add(block);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.2, 0.32, 16),
        new THREE.MeshBasicMaterial({ color: 0xff5722, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 1.5;
      poi.meshGroup.add(ring);
    }

    // Tasteful scientific waypoint marker:
    // Small ground survey pin + soft floating halo
    const pin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.8 })
    );
    pin.position.set(0, 1.1, 0);
    poi.meshGroup.add(pin);

    // Glowing survey top marker
    const marker = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22),
      new THREE.MeshBasicMaterial({ color: poi.beaconColor })
    );
    marker.position.set(0, 2.2, 0);
    poi.meshGroup.add(marker);

    // Soft ground glow ring
    const groundGlow = new THREE.Mesh(
      new THREE.RingGeometry(1.2, 1.5, 24),
      new THREE.MeshBasicMaterial({
        color: poi.beaconColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35
      })
    );
    groundGlow.rotation.x = -Math.PI / 2;
    groundGlow.position.y = 0.05;
    poi.meshGroup.add(groundGlow);

    scene.add(poi.meshGroup);
  });

  return pois;
}
