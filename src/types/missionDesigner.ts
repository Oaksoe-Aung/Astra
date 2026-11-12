// NASA Space Apps Challenge — Mission Design & Engineering Trade-Off Types

export type ChallengeId = 'challenge_scout' | 'challenge_water' | 'challenge_flagship' | 'challenge_sandbox';

export interface MissionChallenge {
  id: ChallengeId;
  title: string;
  subtitle: string;
  badge: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Youth / Advanced' | 'Open Sandbox';
  budgetM: number;
  description: string;
  primaryGoals: string[];
  recommendedInstruments: string[];
  minScienceTarget: number;
  defaultConfig: Partial<MissionDesignSelection>;
}

export interface LaunchVehicle {
  id: string;
  name: string;
  manufacturer: string;
  costM: number;
  maxPayloadToTmiKg: number;
  reliability: number;
  fairingDiameterM: number;
  description: string;
  tradeOffNote: string;
}

export interface PropulsionSpec {
  id: string;
  name: string;
  type: 'chemical_methalox' | 'solar_electric_ion' | 'nuclear_thermal';
  costM: number;
  dryMassKg: number;
  ispSeconds: number; // Specific impulse (fuel efficiency)
  thrustKn: number;
  transitDays: number; // Duration of cruise phase
  propellantNeededKg: number;
  description: string;
  tradeOffNote: string;
}

export interface PowerSpec {
  id: string;
  name: string;
  type: 'solar_ultraflex' | 'rtg_plutonium' | 'surface_fission';
  costM: number;
  massKg: number;
  powerOutputW: number;
  dustStormTolerancePercent: number; // Solar drops to 15% in dust, RTG is 100%
  description: string;
  tradeOffNote: string;
}

export interface CommsSpec {
  id: string;
  name: string;
  costM: number;
  massKg: number;
  powerDrawW: number;
  downlinkSpeedKbps: number;
  latencyMinutes: number;
  description: string;
  tradeOffNote: string;
}

export interface ScienceInstrumentSpec {
  id: string;
  name: string;
  code: string;
  category: 'imager' | 'spectrometer' | 'drill' | 'radar' | 'weather';
  costM: number;
  massKg: number;
  powerDrawW: number;
  sciencePoints: number;
  dataPerScanMb: number;
  description: string;
  enablesAction: 'scan' | 'drill' | 'radar_pulse' | 'weather_monitor';
}

export interface SurfaceMobilitySpec {
  id: string;
  name: string;
  costM: number;
  massKg: number;
  speedKmH: number;
  batteryKwh: number;
  sampleCapacity: number;
  hasLights: boolean;
  description: string;
}

export interface MissionDesignSelection {
  launchVehicleId: string;
  propulsionId: string;
  powerSystemId: string;
  commsId: string;
  instrumentIds: string[];
  mobilityId: string;
}

export interface CalculatedTradeOffs {
  totalCostM: number;
  budgetLimitM: number;
  budgetMarginM: number;
  isBudgetValid: boolean;

  totalPayloadMassKg: number;
  launchVehicleCapacityKg: number;
  massMarginKg: number;
  isMassValid: boolean;

  totalPowerOutputW: number;
  totalPowerDrawW: number;
  powerMarginW: number;
  isPowerValid: boolean;

  deltaVAvailableMs: number;
  deltaVRequiredMs: number;
  isDeltaVValid: boolean;

  downlinkSpeedKbps: number;
  transitDays: number;
  potentialScienceScore: number;

  readinessStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  statusNotes: string[];
}
