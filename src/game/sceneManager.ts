import * as THREE from 'three';
import { 
  getTerrainHeight, 
  createMarsSkyAndAtmosphere, 
  createMarsTerrainMesh, 
  createScatteredRocks, 
  createDistantMountains, 
  createDustParticleSystem 
} from './terrain';
import { 
  createAstronautModel, 
  createRoverModel, 
  createLanderModel, 
  createNaturalRockTargets, 
  AstronautInstance, 
  RoverInstance, 
  LanderInstance, 
  ScientificPOI 
} from './models';
import { GameController } from './controller';
import { ObjectiveGuide, ScienceDiscovery } from './objectiveGuide';
import { MissionConfig, SimulationState } from '../types/mission';
import { marsAudio } from './audio';

export interface InteractionPrompt {
  show: boolean;
  text: string;
  subtext?: string;
  type: 'action' | 'rover' | 'lander' | 'info';
  action?: () => void;
}

export class MarsGameSceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // 3D Instances
  public astronaut!: AstronautInstance;
  public rover!: RoverInstance;
  public lander!: LanderInstance;
  public pois: ScientificPOI[] = [];
  public controller!: GameController;
  public objectiveGuide: ObjectiveGuide = new ObjectiveGuide();

  private dustSystem!: ReturnType<typeof createDustParticleSystem>;
  private atmosphereLights!: ReturnType<typeof createMarsSkyAndAtmosphere>;

  // Landing sequence
  public isCinematic: boolean = true;
  private cinematicTime: number = 0;
  private descentFlame: THREE.Mesh | null = null;

  // Storm hazard
  public stormIntensity: number = 0;
  public stormActive: boolean = false;

  // Callbacks
  private config: MissionConfig;
  private onStateUpdate: (updater: (prev: SimulationState) => SimulationState) => void;
  private onTriggerDeparture: () => void;
  private onPromptChange: (prompt: InteractionPrompt | null) => void;
  private onDiscovery: (discovery: ScienceDiscovery | null) => void;

  constructor(
    container: HTMLElement,
    config: MissionConfig,
    onStateUpdate: (updater: (prev: SimulationState) => SimulationState) => void,
    onTriggerDeparture: () => void,
    onPromptChange: (prompt: InteractionPrompt | null) => void,
    onDiscovery: (discovery: ScienceDiscovery | null) => void,
    skipLanding: boolean = false
  ) {
    this.container = container;
    this.config = config;
    this.onStateUpdate = onStateUpdate;
    this.onTriggerDeparture = onTriggerDeparture;
    this.onPromptChange = onPromptChange;
    this.onDiscovery = onDiscovery;
    this.isCinematic = !skipLanding;

    // 1. Scene & Renderer setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      600
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 2. Cohesive Mars Environment
    this.atmosphereLights = createMarsSkyAndAtmosphere(this.scene);
    const terrain = createMarsTerrainMesh();
    this.scene.add(terrain);
    createScatteredRocks(this.scene);
    createDistantMountains(this.scene);
    this.dustSystem = createDustParticleSystem(this.scene);

    // 3. Grounded 3D Models
    this.astronaut = createAstronautModel();
    this.scene.add(this.astronaut.group);

    this.rover = createRoverModel();
    this.scene.add(this.rover.group);

    this.lander = createLanderModel(config.spacecraftId);
    this.lander.group.position.set(0, getTerrainHeight(0, 0), 0);
    this.scene.add(this.lander.group);

    // 4. Natural Scientific Targets
    this.pois = createNaturalRockTargets(this.scene, getTerrainHeight);

    // 5. Controller
    this.controller = new GameController(this.renderer.domElement);

    // Initial cinematic state
    if (this.isCinematic) {
      this.setupLandingCinematic();
    }

    // Resize handling
    window.addEventListener('resize', this.handleResize);

    // Start loop
    this.lastTime = performance.now();
    this.loop();
  }

  private setupLandingCinematic() {
    this.cinematicTime = 0;
    this.astronaut.group.visible = false;
    this.rover.group.visible = false;

    // Position lander high up
    this.lander.group.position.set(0, 60, 0);

    const flameGeo = new THREE.ConeGeometry(2.0, 7, 12);
    flameGeo.rotateX(Math.PI);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xff7043,
      transparent: true,
      opacity: 0.85
    });
    this.descentFlame = new THREE.Mesh(flameGeo, flameMat);
    this.descentFlame.position.y = -2.2;
    this.lander.group.add(this.descentFlame);
  }

  public skipLanding() {
    this.isCinematic = false;
    if (this.descentFlame) {
      this.lander.group.remove(this.descentFlame);
      this.descentFlame = null;
    }
    this.lander.group.position.set(0, getTerrainHeight(0, 0), 0);
    this.astronaut.group.visible = true;
    this.rover.group.visible = true;
    this.controller.astronautPos.set(0, getTerrainHeight(0, 7.5), 7.5);
    this.controller.roverPos.set(6.5, getTerrainHeight(6.5, 8.5), 8.5);
  }

  private handleResize = () => {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public triggerDustStorm(intensity: number) {
    this.stormActive = intensity > 0;
    this.stormIntensity = intensity;

    if (this.stormActive) {
      this.scene.background = new THREE.Color(0x8a381d);
      this.scene.fog = new THREE.FogExp2(0x8a381d, 0.016 + intensity * 0.02);
      this.atmosphereLights.dirLight.intensity = 0.5;
      this.atmosphereLights.hemiLight.intensity = 0.35;
    } else {
      this.scene.background = new THREE.Color(0xd47e5b);
      this.scene.fog = new THREE.FogExp2(0xd47e5b, 0.006);
      this.atmosphereLights.dirLight.intensity = 1.6;
      this.atmosphereLights.hemiLight.intensity = 0.7;
    }
  }

  /**
   * Simple, Direct Interaction Prompts
   */
  private checkInteractions() {
    if (this.isCinematic) return;

    const playerPos = this.controller.mode === 'astronaut'
      ? this.controller.astronautPos
      : this.controller.roverPos;

    // 1. Lander Return (Distance to ladder < 4.0m)
    const distToLander = playerPos.distanceTo(new THREE.Vector3(0, playerPos.y, 3.8));
    if (distToLander < 4.2) {
      this.onPromptChange({
        show: true,
        text: 'Press E to return to lander',
        subtext: this.objectiveGuide.samplesCollected > 0
          ? 'Expedition tasks completed. Return to the lander to finish the mission.'
          : 'Ready to board the lander.',
        type: 'lander',
        action: () => {
          this.onTriggerDeparture();
        }
      });

      if (this.controller.input.interact) {
        this.controller.input.interact = false;
        this.onTriggerDeparture();
      }
      return;
    }

    // 2. Rover Mount / Dismount
    const distToRover = this.controller.astronautPos.distanceTo(this.controller.roverPos);
    if (this.controller.mode === 'astronaut' && distToRover < 3.2) {
      this.onPromptChange({
        show: true,
        text: 'Press E to drive rover',
        subtext: 'Drive faster across the terrain.',
        type: 'rover',
        action: () => {
          this.mountRover();
        }
      });

      if (this.controller.input.interact) {
        this.controller.input.interact = false;
        this.mountRover();
      }
      return;
    } else if (this.controller.mode === 'rover') {
      this.onPromptChange({
        show: true,
        text: 'Press E to exit rover',
        type: 'rover',
        action: () => {
          this.dismountRover();
        }
      });

      if (this.controller.input.interact) {
        this.controller.input.interact = false;
        this.dismountRover();
      }
      return;
    }

    // 3. Natural Rock Targets
    for (const poi of this.pois) {
      const distToPoi = playerPos.distanceTo(poi.position);
      if (distToPoi < 4.5) {
        if (!poi.scanned) {
          // Action 1: Scan
          this.onPromptChange({
            show: true,
            text: 'Press E to scan rock',
            subtext: `Scan ${poi.name} to learn what it contains.`,
            type: 'action',
            action: () => {
              this.scanRock(poi);
            }
          });

          if (this.controller.input.interact) {
            this.controller.input.interact = false;
            this.scanRock(poi);
          }
          return;
        } else if (!poi.collected) {
          // Action 2: Collect
          this.onPromptChange({
            show: true,
            text: 'Press E to collect sample',
            subtext: 'Store rock sample in the return container.',
            type: 'action',
            action: () => {
              this.collectSample(poi);
            }
          });

          if (this.controller.input.interact) {
            this.controller.input.interact = false;
            this.collectSample(poi);
          }
          return;
        } else {
          // Already completed
          this.onPromptChange({
            show: true,
            text: `${poi.name}: Complete`,
            subtext: 'Sample collected and safely stored.',
            type: 'info'
          });
          return;
        }
      }
    }

    // No interaction nearby
    this.onPromptChange(null);
  }

  private mountRover() {
    this.controller.mode = 'rover';
    this.astronaut.group.visible = false;
  }

  private dismountRover() {
    this.controller.mode = 'astronaut';
    this.astronaut.group.visible = true;
    this.controller.astronautPos.set(
      this.controller.roverPos.x + 2.0,
      getTerrainHeight(this.controller.roverPos.x + 2.0, this.controller.roverPos.z),
      this.controller.roverPos.z
    );
  }

  private scanRock(poi: ScientificPOI) {
    poi.scanned = true;
    marsAudio.playScanChime();

    // Turn beacon green
    poi.meshGroup.children.forEach(c => {
      if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial) {
        c.material.color.setHex(0x00e676);
      }
    });

    this.objectiveGuide.onScannedRock(poi.id, poi.simpleFact, poi.deepFact);
    this.onDiscovery(this.objectiveGuide.currentDiscovery);

    // Update mission state
    this.onStateUpdate(prev => ({
      ...prev,
      scienceScore: prev.scienceScore + 25,
      scienceDataGatheredMb: prev.scienceDataGatheredMb + 250,
      logs: [
        {
          timestamp: new Date().toISOString(),
          solOrDay: `Sol ${prev.surfaceSol}`,
          phase: 'surface_ops' as const,
          level: 'success' as const,
          title: 'Rock Scanned',
          detail: poi.simpleFact
        },
        ...prev.logs
      ]
    }));
  }

  private collectSample(poi: ScientificPOI) {
    poi.collected = true;
    marsAudio.playDrillSound();

    const isAllComplete = this.objectiveGuide.onCollectedSample();
    this.onDiscovery(null);

    this.onStateUpdate(prev => ({
      ...prev,
      samplesCached: prev.samplesCached + 1,
      scienceScore: prev.scienceScore + 35,
      logs: [
        {
          timestamp: new Date().toISOString(),
          solOrDay: `Sol ${prev.surfaceSol}`,
          phase: 'surface_ops' as const,
          level: 'success' as const,
          title: 'Sample Collected',
          detail: `Rock core from ${poi.name} safely sealed in sample vault.`
        },
        ...prev.logs
      ]
    }));
  }

  // -----------------------------------------------------------
  // RENDER LOOP
  // -----------------------------------------------------------
  private loop = () => {
    this.animFrameId = requestAnimationFrame(this.loop);

    const now = performance.now();
    const delta = Math.min(0.08, (now - this.lastTime) / 1000);
    this.lastTime = now;

    // 1. Cinematic Landing
    if (this.isCinematic) {
      this.cinematicTime += delta;
      const duration = 7.0;
      const t = Math.min(1.0, this.cinematicTime / duration);

      // Smooth ease-out descent
      const startY = 60;
      const endY = getTerrainHeight(0, 0);
      const currentY = THREE.MathUtils.lerp(startY, endY, 1 - Math.pow(1 - t, 3));
      this.lander.group.position.y = currentY;

      if (this.descentFlame) {
        const flicker = 0.9 + Math.sin(now * 0.04) * 0.2;
        this.descentFlame.scale.set(flicker, flicker * (1 - t * 0.8), flicker);
      }

      // Smooth camera orbit around descending craft
      const camAngle = this.cinematicTime * 0.4;
      const camDist = 24 - t * 8;
      this.camera.position.set(
        Math.cos(camAngle) * camDist,
        currentY + 5.0 + (1 - t) * 6.0,
        Math.sin(camAngle) * camDist
      );
      this.camera.lookAt(new THREE.Vector3(0, currentY + 2.0, 0));

      if (t >= 1.0) {
        this.skipLanding();
      }

      this.renderer.render(this.scene, this.camera);
      return;
    }

    // 2. Playable Controller Update
    const consumeEnergy = (amount: number) => {
      this.onStateUpdate(prev => ({
        ...prev,
        currentBatteryChargeKwh: Math.max(0, prev.currentBatteryChargeKwh - amount * 0.003)
      }));
    };

    this.controller.update(
      delta,
      this.astronaut,
      this.rover,
      this.camera,
      consumeEnergy
    );

    // Light toggle
    if (this.controller.input.toggleLight) {
      this.controller.input.toggleLight = false;
      if (this.controller.mode === 'astronaut') {
        this.astronaut.toggleFlashlight();
      } else {
        this.rover.headlights.forEach(h => {
          h.visible = !h.visible;
        });
      }
    }

    // Dust particles
    const activeX = this.controller.mode === 'astronaut' ? this.controller.astronautPos.x : this.controller.roverPos.x;
    const activeZ = this.controller.mode === 'astronaut' ? this.controller.astronautPos.z : this.controller.roverPos.z;
    this.dustSystem.update(delta, this.stormIntensity, activeX, activeZ);

    // Check interactions
    this.checkInteractions();

    // 3. Render frame
    this.renderer.render(this.scene, this.camera);
  };

  public toScreenPosition(worldPos: THREE.Vector3): { x: number; y: number; inFront: boolean } {
    const v = worldPos.clone().project(this.camera);
    const inFront = v.z < 1.0;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    return {
      x: (v.x * 0.5 + 0.5) * width,
      y: (-(v.y * 0.5) + 0.5) * height,
      inFront
    };
  }

  public dispose() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    this.controller.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
