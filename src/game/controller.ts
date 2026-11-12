import * as THREE from 'three';
import { getTerrainHeight } from './terrain';
import { AstronautInstance, RoverInstance } from './models';
import { marsAudio } from './audio';

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  jump: boolean;
  interact: boolean;
  toggleLight: boolean;
}

export type ControlMode = 'astronaut' | 'rover';

export class GameController {
  public mode: ControlMode = 'astronaut';

  // Grounded Astronaut physics
  public astronautPos = new THREE.Vector3(0, 0, 7.5); // Safe initial landing spot in front of ladder
  public astronautVel = new THREE.Vector3(0, 0, 0);
  public astronautFacing = 0; // Yaw angle in radians (0 = facing +Z)
  public isJumping = false;

  // Rover physics
  public roverPos = new THREE.Vector3(6.5, 0, 8.5); // Beside lander
  public roverVel = 0;
  public roverHeading = 0;
  public roverSteerAngle = 0;

  // Third-person camera orbit
  public cameraPitch = 0.22; // Comfortable downward angle
  public cameraYaw = 0; // Horizontal orbit angle (radians)
  public cameraDistance = 4.5;

  // Input states
  public input: InputState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
    interact: false,
    toggleLight: false
  };

  private domElement: HTMLElement;
  public isLocked = false;
  private isMouseDown = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private footstepTimer = 0;

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;
    this.setupListeners();
    // Clamp initial positions directly to ground surface
    this.astronautPos.y = getTerrainHeight(this.astronautPos.x, this.astronautPos.z);
    this.roverPos.y = getTerrainHeight(this.roverPos.x, this.roverPos.z);
  }

  private setupListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('wheel', this.handleWheel, { passive: true });
  }

  public dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('wheel', this.handleWheel);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.input.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.input.backward = true;
        break;
      case 'KeyA':
        this.input.left = true;
        break;
      case 'KeyD':
        this.input.right = true;
        break;
      case 'ArrowLeft':
        // Orbit camera left
        this.cameraYaw -= 0.06;
        break;
      case 'ArrowRight':
        // Orbit camera right
        this.cameraYaw += 0.06;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.input.sprint = true;
        break;
      case 'Space':
        this.input.jump = true;
        break;
      case 'KeyE':
        this.input.interact = true;
        break;
      case 'KeyF':
        this.input.toggleLight = true;
        break;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.input.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.input.backward = false;
        break;
      case 'KeyA':
        this.input.left = false;
        break;
      case 'KeyD':
        this.input.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.input.sprint = false;
        break;
      case 'Space':
        this.input.jump = false;
        break;
      case 'KeyE':
        this.input.interact = false;
        break;
      case 'KeyF':
        this.input.toggleLight = false;
        break;
    }
  };

  private handleMouseDown = (e: MouseEvent) => {
    this.isMouseDown = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  };

  private handleMouseUp = () => {
    this.isMouseDown = false;
  };

  private handleWheel = (e: WheelEvent) => {
    const minZoom = this.mode === 'astronaut' ? 2.5 : 4.0;
    const maxZoom = this.mode === 'astronaut' ? 7.0 : 11.0;
    this.cameraDistance = THREE.MathUtils.clamp(
      this.cameraDistance + e.deltaY * 0.003,
      minZoom,
      maxZoom
    );
  };

  private handleMouseMove = (e: MouseEvent) => {
    const sens = 0.0022;

    if (this.isLocked) {
      // Direct pointer lock control: mouse right turns right, mouse up looks up
      this.cameraYaw += e.movementX * sens;
      this.cameraPitch += e.movementY * sens;
    } else if (this.isMouseDown) {
      // Drag-to-look when pointer is not locked
      const deltaX = e.clientX - this.lastMouseX;
      const deltaY = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      this.cameraYaw += deltaX * sens;
      this.cameraPitch += deltaY * sens;
    }

    // Clamp pitch between -30° (looking slightly up) and +55° (overhead down)
    this.cameraPitch = THREE.MathUtils.clamp(this.cameraPitch, -0.45, 0.85);
  };

  // -----------------------------------------------------------
  // CONTROLLER UPDATE LOOP
  // -----------------------------------------------------------
  public update(
    delta: number,
    astronaut: AstronautInstance,
    rover: RoverInstance,
    camera: THREE.PerspectiveCamera,
    consumeEnergy: (amount: number) => void
  ) {
    if (this.mode === 'astronaut') {
      this.updateAstronaut(delta, astronaut, consumeEnergy);
    } else {
      this.updateRover(delta, rover, consumeEnergy);
    }

    this.updateCamera(delta, camera);
  }

  /**
   * Grounded, Natural Astronaut Movement
   * - No floating or sliding down slopes.
   * - Responsive camera-relative WASD direction.
   * - Snappy stopping when keys are released.
   */
  private updateAstronaut(
    delta: number,
    astronaut: AstronautInstance,
    consumeEnergy: (amount: number) => void
  ) {
    // 1. Gather directional input
    const inputForward = (this.input.forward ? 1 : 0) - (this.input.backward ? 1 : 0);
    const inputRight = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);

    const isMoving = inputForward !== 0 || inputRight !== 0;

    // 2. Camera-relative direction calculation
    // Forward view direction in X-Z ground plane:
    const camForwardX = Math.sin(this.cameraYaw);
    const camForwardZ = Math.cos(this.cameraYaw);

    // Right view direction (90 degrees clockwise):
    const camRightX = Math.cos(this.cameraYaw);
    const camRightZ = -Math.sin(this.cameraYaw);

    if (isMoving) {
      const len = Math.sqrt(inputForward * inputForward + inputRight * inputRight);
      const normF = inputForward / len;
      const normR = inputRight / len;

      const moveDirX = camForwardX * normF + camRightX * normR;
      const moveDirZ = camForwardZ * normF + camRightZ * normR;

      // Smoothly rotate character to face the movement direction
      const targetFacing = Math.atan2(moveDirX, moveDirZ);
      let diff = targetFacing - this.astronautFacing;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.astronautFacing += diff * Math.min(1.0, delta * 15.0);

      // Target movement speed
      const targetSpeed = this.input.sprint ? 5.6 : 3.2; // m/s
      this.astronautVel.x = THREE.MathUtils.lerp(this.astronautVel.x, moveDirX * targetSpeed, delta * 15.0);
      this.astronautVel.z = THREE.MathUtils.lerp(this.astronautVel.z, moveDirZ * targetSpeed, delta * 15.0);

      // Play soft footstep sound based on stride
      this.footstepTimer += delta * (this.input.sprint ? 2.8 : 1.9);
      if (this.footstepTimer >= 1.0) {
        this.footstepTimer = 0;
        if (!this.isJumping) {
          marsAudio.playFootstep();
        }
      }

      // Energy consumption
      if (this.input.sprint) {
        consumeEnergy(delta * 1.5);
      } else {
        consumeEnergy(delta * 0.5);
      }
    } else {
      // Snappy deceleration when stopped (NO ICY SLIDING)
      this.astronautVel.x = THREE.MathUtils.lerp(this.astronautVel.x, 0, delta * 24.0);
      this.astronautVel.z = THREE.MathUtils.lerp(this.astronautVel.z, 0, delta * 24.0);
      if (Math.abs(this.astronautVel.x) < 0.05) this.astronautVel.x = 0;
      if (Math.abs(this.astronautVel.z) < 0.05) this.astronautVel.z = 0;
    }

    // 3. Ground check & Martian Low-Gravity Jump
    const groundY = getTerrainHeight(this.astronautPos.x, this.astronautPos.z);
    const marsGravity = 7.2;

    if (!this.isJumping) {
      // Firmly stick feet to the terrain when walking/running (NO FLOATING DOWN HILLS)
      this.astronautPos.y = groundY;
      this.astronautVel.y = 0;

      // Initiate jump
      if (this.input.jump) {
        this.astronautVel.y = 4.2; // Smooth parabolic leap
        this.isJumping = true;
        consumeEnergy(1.8);
      }
    } else {
      // Active jump in progress
      this.astronautVel.y -= marsGravity * delta;
      this.astronautPos.y += this.astronautVel.y * delta;

      // Touchdown landing
      if (this.astronautPos.y <= groundY) {
        this.astronautPos.y = groundY;
        this.astronautVel.y = 0;
        this.isJumping = false;
        marsAudio.playFootstep();
      }
    }

    // 4. Update Horizontal Position
    this.astronautPos.x += this.astronautVel.x * delta;
    this.astronautPos.z += this.astronautVel.z * delta;

    // Bound exploration radius to 150m around the landing site
    const distToCenter = Math.sqrt(this.astronautPos.x * this.astronautPos.x + this.astronautPos.z * this.astronautPos.z);
    if (distToCenter > 150) {
      const angle = Math.atan2(this.astronautPos.z, this.astronautPos.x);
      this.astronautPos.x = Math.cos(angle) * 150;
      this.astronautPos.z = Math.sin(angle) * 150;
    }

    // 5. Update 3D Mesh Position & Orientation
    astronaut.group.position.copy(this.astronautPos);
    astronaut.group.rotation.y = this.astronautFacing;

    // 6. Update Walk Animation based on actual ground speed
    const currentSpeed = Math.sqrt(this.astronautVel.x * this.astronautVel.x + this.astronautVel.z * this.astronautVel.z);
    astronaut.updateAnimation(delta, currentSpeed, this.isJumping);

    astronaut.group.visible = true;
  }

  /**
   * Smooth Grounded Rover Driving
   * - Natural responsive steering: A turns Left, D turns Right.
   * - Direct terrain slope pitch alignment.
   */
  private updateRover(
    delta: number,
    rover: RoverInstance,
    consumeEnergy: (amount: number) => void
  ) {
    const maxSpeed = 9.5; // ~34 km/h
    const accel = 6.0;
    const reverseSpeed = -3.5;
    const friction = 4.5;

    // Forward / Reverse
    if (this.input.forward) {
      this.roverVel = Math.min(maxSpeed, this.roverVel + accel * delta);
      consumeEnergy(delta * 2.0);
    } else if (this.input.backward) {
      this.roverVel = Math.max(reverseSpeed, this.roverVel - accel * delta);
      consumeEnergy(delta * 1.5);
    } else {
      if (this.roverVel > 0) {
        this.roverVel = Math.max(0, this.roverVel - friction * delta);
      } else if (this.roverVel < 0) {
        this.roverVel = Math.min(0, this.roverVel + friction * delta);
      }
    }

    // Steering: A turns Left (negative heading delta), D turns Right (positive heading delta)
    const targetSteer = (this.input.right ? 0.45 : 0) - (this.input.left ? 0.45 : 0);
    this.roverSteerAngle = THREE.MathUtils.lerp(this.roverSteerAngle, targetSteer, delta * 12.0);

    if (Math.abs(this.roverVel) > 0.05) {
      const turnRate = (this.roverVel / 2.2) * Math.tan(this.roverSteerAngle);
      this.roverHeading += turnRate * delta;
    }

    // Update position
    this.roverPos.x += Math.sin(this.roverHeading) * this.roverVel * delta;
    this.roverPos.z += Math.cos(this.roverHeading) * this.roverVel * delta;

    // Bound exploration radius
    const distToCenter = Math.sqrt(this.roverPos.x * this.roverPos.x + this.roverPos.z * this.roverPos.z);
    if (distToCenter > 150) {
      const angle = Math.atan2(this.roverPos.z, this.roverPos.x);
      this.roverPos.x = Math.cos(angle) * 150;
      this.roverPos.z = Math.sin(angle) * 150;
    }

    // Terrain ground alignment
    const groundY = getTerrainHeight(this.roverPos.x, this.roverPos.z);
    this.roverPos.y = groundY;

    // Slope orientation
    const sampleDist = 1.1;
    const frontY = getTerrainHeight(
      this.roverPos.x + Math.sin(this.roverHeading) * sampleDist,
      this.roverPos.z + Math.cos(this.roverHeading) * sampleDist
    );
    const backY = getTerrainHeight(
      this.roverPos.x - Math.sin(this.roverHeading) * sampleDist,
      this.roverPos.z - Math.cos(this.roverHeading) * sampleDist
    );
    const pitch = Math.atan2(frontY - backY, sampleDist * 2);

    rover.group.position.copy(this.roverPos);
    rover.group.rotation.set(pitch, this.roverHeading, 0);

    // Roll wheels
    rover.updateDrive(this.roverVel, this.roverSteerAngle, delta);

    // Keep astronaut position synced with rover
    this.astronautPos.copy(this.roverPos);
  }

  /**
   * Third-Person Camera Follow
   * - Positions camera smoothly behind the character/rover.
   * - Prevents clipping beneath the terrain.
   */
  private updateCamera(delta: number, camera: THREE.PerspectiveCamera) {
    const targetPos = this.mode === 'astronaut' ? this.astronautPos : this.roverPos;
    const eyeHeight = this.mode === 'astronaut' ? 1.45 : 1.7;
    const dist = this.mode === 'astronaut' ? this.cameraDistance : this.cameraDistance + 2.0;

    // Spherical offset behind the target
    const camX = targetPos.x - Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * dist;
    const camZ = targetPos.z - Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * dist;
    let camY = targetPos.y + eyeHeight + Math.sin(this.cameraPitch) * dist;

    // Ground collision: keep camera comfortably above terrain surface
    const terrainY = getTerrainHeight(camX, camZ) + 0.6;
    if (camY < terrainY) {
      camY = terrainY;
    }

    const desiredPos = new THREE.Vector3(camX, camY, camZ);
    camera.position.lerp(desiredPos, Math.min(1.0, delta * 14.0));

    // Look at player's chest / upper torso
    camera.lookAt(new THREE.Vector3(targetPos.x, targetPos.y + eyeHeight, targetPos.z));
  }
}
