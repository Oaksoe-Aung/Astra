import * as THREE from 'three';

export interface GuidedTask {
  step: number;
  title: string;
  instruction: string;
  targetName: string;
  targetPos: THREE.Vector3;
  actionPrompt: string;
  completed: boolean;
}

export interface ScienceDiscovery {
  title: string;
  simpleFact: string;
  deepFact: string;
}

export class ObjectiveGuide {
  public currentStep: number = 1;
  public totalSteps: number = 4;

  // Active target position in the 3D world for HUD compass & distance indicator
  public activeTargetPos: THREE.Vector3 = new THREE.Vector3(14, 0, 18);
  public activeTargetName: string = 'Layered Rock';

  public currentDiscovery: ScienceDiscovery | null = null;
  public samplesCollected: number = 0;
  public maxSamples: number = 3;

  /**
   * Returns current active task in plain, direct English
   */
  public getCurrentTaskInfo(distToTarget: number): {
    headline: string;
    subtext: string;
    targetLabel: string;
    distanceM: number;
  } {
    switch (this.currentStep) {
      case 1:
        return {
          headline: 'Find the marked rock',
          subtext: 'Follow the yellow marker to the first rock formation.',
          targetLabel: 'Layered Rock',
          distanceM: Math.round(distToTarget)
        };
      case 2:
        return {
          headline: 'Collect rock sample',
          subtext: 'Take a core sample to store in the sample vault.',
          targetLabel: 'Layered Rock',
          distanceM: Math.round(distToTarget)
        };
      case 3:
        return {
          headline: 'Explore deeper outcrops',
          subtext: 'Walk or drive the rover to the second geological target.',
          targetLabel: 'Clay Outcrop',
          distanceM: Math.round(distToTarget)
        };
      case 4:
      default:
        return {
          headline: 'Return to the lander',
          subtext: 'Walk back to the lander airlock to finish the expedition.',
          targetLabel: 'Lander Airlock',
          distanceM: Math.round(distToTarget)
        };
    }
  }

  /**
   * Advances the guided mission step upon player physical action in 3D
   */
  public onScannedRock(poiId: string, simpleFact: string, deepFact: string) {
    this.currentDiscovery = {
      title: 'Rock Scanned',
      simpleFact,
      deepFact
    };

    if (this.currentStep === 1) {
      this.currentStep = 2; // Prompt to collect sample next
    }
  }

  public onCollectedSample(): boolean {
    this.samplesCollected += 1;
    this.currentDiscovery = null;

    if (this.currentStep === 2) {
      this.currentStep = 3;
      // Point towards Clay Outcrop
      this.activeTargetPos = new THREE.Vector3(-36, 0, 32);
      this.activeTargetName = 'Clay Outcrop';
    } else if (this.currentStep === 3) {
      this.currentStep = 4;
      // Point back to Lander
      this.activeTargetPos = new THREE.Vector3(0, 0, 4.0);
      this.activeTargetName = 'Lander Airlock';
    }

    return this.currentStep === 4;
  }

  public setReturnToLander() {
    this.currentStep = 4;
    this.activeTargetPos = new THREE.Vector3(0, 0, 4.0);
    this.activeTargetName = 'Lander Airlock';
  }
}
