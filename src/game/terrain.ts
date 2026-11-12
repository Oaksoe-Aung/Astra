import * as THREE from 'three';

/**
 * Procedural Smooth Martian Heightfield
 * Continuous, smooth terrain without sharp jagged spikes or edge clipping.
 */
export function getTerrainHeight(x: number, z: number): number {
  const distFromCenter = Math.sqrt(x * x + z * z);
  
  // Landing zone within 20m is flattened and level for lander, rover, and astronaut
  const centerFlatten = Math.min(1.0, Math.max(0.0, (distFromCenter - 14) / 24));

  // Gentle primary rolling hills (low frequency)
  const hills = Math.sin(x * 0.024) * Math.cos(z * 0.024) * 3.4;
  // Secondary undulations
  const rolling = Math.sin(x * 0.048 + 0.8) * Math.cos(z * 0.042 + 0.4) * 1.4;
  // Soft sand ripples
  const dunes = Math.sin(x * 0.08 - z * 0.06) * 0.35;

  // Crater rim & depression in the northeast (centered around x: 52, z: -48)
  const dxCrater = x - 52;
  const dzCrater = z - (-48);
  const distCrater = Math.sqrt(dxCrater * dxCrater + dzCrater * dzCrater);
  let craterEffect = 0;
  if (distCrater < 42) {
    const normDist = distCrater / 42;
    // Smooth raised rim then gentle bowl
    const rim = Math.sin(normDist * Math.PI) * 1.6;
    const dip = -Math.cos(normDist * (Math.PI * 0.5)) * 2.8;
    craterEffect = rim + dip;
  }

  // Smooth ridge in the southwest
  const ridgeDist = Math.sqrt((x + 65) * (x + 65) + (z + 60) * (z + 60));
  let ridgeEffect = 0;
  if (ridgeDist < 65) {
    ridgeEffect = (1 - ridgeDist / 65) * 3.2;
  }

  return (hills + rolling + dunes + craterEffect + ridgeEffect) * centerFlatten;
}

/**
 * Procedural Soil Detail Texture
 * High-resolution canvas texture with fine sand ripples and micro-pebbles
 */
function createMarsSoilTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base warm terracotta tone
  ctx.fillStyle = '#b55434';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle sand ripple bands
  for (let y = 0; y < 512; y += 4) {
    const alpha = 0.04 + Math.sin(y * 0.08) * 0.03;
    ctx.fillStyle = y % 8 === 0 ? `rgba(215, 130, 95, ${alpha})` : `rgba(130, 50, 30, ${alpha})`;
    ctx.fillRect(0, y, 512, 3);
  }

  // Micro-pebble speckles
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 22;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.7));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.5));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(36, 36);
  return texture;
}

/**
 * Mars Atmosphere, Balanced Lighting, and Sky
 * Warm, cohesive palette: muted terracotta, dusty amber, pale salmon sky.
 */
export function createMarsSkyAndAtmosphere(scene: THREE.Scene) {
  // Atmospheric background & smooth exponential fog
  const skyColor = new THREE.Color(0xd27b58); // Realistic dusty Martian salmon-orange
  scene.background = skyColor;
  scene.fog = new THREE.FogExp2(0xd27b58, 0.0055);

  // Distant bright Sun
  const sunGeo = new THREE.SphereGeometry(6.5, 24, 24);
  const sunMat = new THREE.MeshBasicMaterial({
    color: 0xfff6e4,
    fog: false
  });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.position.set(160, 115, -270);
  scene.add(sunMesh);

  // Soft atmospheric sun halo
  const haloGeo = new THREE.SphereGeometry(15, 24, 24);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xf5a378,
    transparent: true,
    opacity: 0.28,
    fog: false
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  haloMesh.position.copy(sunMesh.position);
  scene.add(haloMesh);

  // Phobos (Moon 1) - small cratered natural moon
  const phobosGeo = new THREE.DodecahedronGeometry(2.6, 2);
  const phobosMat = new THREE.MeshStandardMaterial({
    color: 0x8a7f78,
    roughness: 0.9,
    metalness: 0.1,
    fog: false
  });
  const phobos = new THREE.Mesh(phobosGeo, phobosMat);
  phobos.position.set(-110, 130, -180);
  scene.add(phobos);

  // Deimos (Moon 2) - small distant point
  const deimosGeo = new THREE.DodecahedronGeometry(1.3, 1);
  const deimosMat = new THREE.MeshStandardMaterial({
    color: 0x9c938a,
    roughness: 0.95,
    fog: false
  });
  const deimos = new THREE.Mesh(deimosGeo, deimosMat);
  deimos.position.set(70, 142, -210);
  scene.add(deimos);

  // Main directional sunlight (warm, soft shadows)
  const dirLight = new THREE.DirectionalLight(0xffecd4, 1.55);
  dirLight.position.set(150, 130, -200);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 450;
  dirLight.shadow.camera.left = -90;
  dirLight.shadow.camera.right = 90;
  dirLight.shadow.camera.top = 90;
  dirLight.shadow.camera.bottom = -90;
  dirLight.shadow.bias = -0.0004;
  scene.add(dirLight);

  // Ambient hemisphere light (salmon sky to warm dark soil)
  const hemiLight = new THREE.HemisphereLight(0xdc8662, 0x4f2315, 0.75);
  scene.add(hemiLight);

  return { dirLight, hemiLight, sunMesh, haloMesh };
}

/**
 * Mars Terrain Mesh
 * Smooth geometry with high-resolution procedural soil texture & natural earth tones.
 */
export function createMarsTerrainMesh(): THREE.Mesh {
  const size = 360;
  const segments = 120;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const pos = geometry.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  // Cohesive Martian earth palette
  const baseRed = new THREE.Color(0xb25232);    // Muted terracotta
  const sandOchre = new THREE.Color(0xc9754e);  // Warm sandy dune
  const darkBasalt = new THREE.Color(0x612919); // Rocky elevation basalt
  const fineDust = new THREE.Color(0xd48f6c);   // Pale windblown dust

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = getTerrainHeight(x, z);
    pos.setY(i, y);

    // Smooth color blending based on height and undulating coordinates
    const clr = baseRed.clone();
    const noise = Math.sin(x * 0.075) * Math.cos(z * 0.075) * 0.5 + 0.5;

    if (y > 2.2) {
      const t = Math.min(1.0, (y - 2.2) / 3.0);
      clr.lerp(darkBasalt, t * 0.55);
    } else if (y < -0.4) {
      const t = Math.min(1.0, (-0.4 - y) / 2.2);
      clr.lerp(fineDust, t * 0.5);
    } else {
      clr.lerp(sandOchre, noise * 0.35);
    }

    colors[i * 3] = clr.r;
    colors[i * 3 + 1] = clr.g;
    colors[i * 3 + 2] = clr.b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const soilTexture = createMarsSoilTexture();

  const material = new THREE.MeshStandardMaterial({
    map: soilTexture,
    vertexColors: true,
    roughness: 0.92,
    metalness: 0.05,
    flatShading: false
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Natural Scattered Martian Boulders
 * Weathered, partially embedded rocks with realistic eroded shapes.
 */
export function createScatteredRocks(scene: THREE.Scene) {
  const rockGroup = new THREE.Group();

  const rockMat1 = new THREE.MeshStandardMaterial({
    color: 0x823e25,
    roughness: 0.94,
    metalness: 0.1,
    flatShading: false
  });

  const rockMat2 = new THREE.MeshStandardMaterial({
    color: 0x59281a,
    roughness: 0.92,
    metalness: 0.18,
    flatShading: false
  });

  const count = 75;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (i % 5) * 0.8;
    const radius = 18 + (i * 1.6) % 130;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Keep immediate landing zone clear
    if (Math.abs(x) < 14 && Math.abs(z) < 14) continue;

    const y = getTerrainHeight(x, z);
    const scale = 0.5 + (i % 3) * 0.35;

    // Weathered, rounded boulder geometry
    const geo = new THREE.DodecahedronGeometry(1.0, 2);
    // Apply subtle organic deformation so rocks aren't perfect spheres
    const pos = geo.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      const vx = pos.getX(j);
      const vy = pos.getY(j);
      const vz = pos.getZ(j);
      const deform = 1.0 + Math.sin(vx * 4.0) * Math.cos(vz * 4.0) * 0.12;
      pos.setXYZ(j, vx * deform, vy * deform * 0.65, vz * deform);
    }
    geo.computeVertexNormals();

    const mat = (i % 2 === 0) ? rockMat1 : rockMat2;
    const rock = new THREE.Mesh(geo, mat);

    // Half-buried in the soil
    rock.position.set(x, y + scale * 0.18, z);
    rock.rotation.set((i * 0.6) % 3, (i * 1.2) % 3, (i * 0.3) % 3);
    rock.scale.set(scale * 1.1, scale * 0.7, scale * 0.95);
    rock.castShadow = true;
    rock.receiveShadow = true;

    rockGroup.add(rock);
  }

  scene.add(rockGroup);
  return rockGroup;
}

/**
 * Distant Mountain & Crater Rim Silhouettes
 * Smooth eroded crater rims that softly fade into the dusty horizon.
 */
export function createDistantMountains(scene: THREE.Scene) {
  const group = new THREE.Group();
  const count = 18;
  const radius = 230;

  const mountainMat = new THREE.MeshStandardMaterial({
    color: 0x823c26,
    roughness: 0.96,
    metalness: 0.05,
    flatShading: false
  });

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.15;
    const x = Math.cos(angle) * (radius + ((i % 4) * 14));
    const z = Math.sin(angle) * (radius + ((i % 4) * 14));
    const height = 28 + (i % 4) * 12;
    const width = 50 + (i % 3) * 20;

    // Smooth weathered ridge mound geometry
    const geo = new THREE.CylinderGeometry(width * 0.15, width * 0.6, height, 16);
    // Scale to gentle slope
    const ridge = new THREE.Mesh(geo, mountainMat);
    ridge.position.set(x, height * 0.35, z);
    ridge.rotation.y = angle + Math.PI / 2;
    ridge.scale.set(1.4, 1.0, 0.7);
    group.add(ridge);
  }

  scene.add(group);
  return group;
}

/**
 * Atmospheric Dust Particle System
 */
export function createDustParticleSystem(scene: THREE.Scene) {
  const particleCount = 700;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 160;
    positions[i * 3 + 1] = Math.random() * 20 + 0.3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 160;

    velocities[i * 3] = 0.3 + Math.random() * 0.5; // Drift East
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.06;
    velocities[i * 3 + 2] = 0.15 + Math.random() * 0.25;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xdc8662,
    size: 0.22,
    transparent: true,
    opacity: 0.42
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return {
    points,
    velocities,
    update: (delta: number, stormIntensity: number, playerX: number, playerZ: number) => {
      const posAttr = geometry.attributes.position;
      const posArr = posAttr.array as Float32Array;

      material.size = 0.22 + stormIntensity * 0.45;
      material.opacity = 0.35 + stormIntensity * 0.5;
      const speedMultiplier = 1.0 + stormIntensity * 3.8;

      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3] += velocities[i * 3] * speedMultiplier * delta * 12;
        posArr[i * 3 + 1] += velocities[i * 3 + 1] * delta * 6;
        posArr[i * 3 + 2] += velocities[i * 3 + 2] * speedMultiplier * delta * 12;

        const dx = posArr[i * 3] - playerX;
        const dz = posArr[i * 3 + 2] - playerZ;

        if (dx > 80) posArr[i * 3] = playerX - 80;
        if (dx < -80) posArr[i * 3] = playerX + 80;
        if (dz > 80) posArr[i * 3 + 2] = playerZ - 80;
        if (dz < -80) posArr[i * 3 + 2] = playerZ + 80;
        if (posArr[i * 3 + 1] > 24) posArr[i * 3 + 1] = 0.8;
        if (posArr[i * 3 + 1] < 0.2) posArr[i * 3 + 1] = 22.0;
      }
      posAttr.needsUpdate = true;
    }
  };
}
