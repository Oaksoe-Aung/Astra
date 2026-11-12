export type Difficulty = 'training' | 'standard' | 'expert';

export type MissionPhase = 
  | 'briefing'
  | 'spacecraft_select'
  | 'workshop'
  | 'destination_select'
  | 'validation'
  | 'launch'
  | 'transit_outbound'
  | 'edl_landing'
  | 'surface_ops'
  | 'mars_ascent'
  | 'transit_inbound'
  | 'earth_arrival'
  | 'debrief';

export interface Objective {
  id: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  scientificGoal: string;
  requiredInstrumentIds: string[];
  recommendedSiteIds: string[];
  targetMilestones: {
    id: string;
    label: string;
    points: number;
    description: string;
    achieved: boolean;
  }[];
  educationalTakeaway: string;
  estimatedDurationSols: number;
  sciencePotential: number;
}

export interface SpacecraftArchetype {
  id: string;
  name: string;
  codeName: string;
  classification: string;
  description: string;
  baseCostM: number; // In Game Credits (M)
  dryMassKg: number;
  maxPayloadMassKg: number;
  maxPropellantMassKg: number;
  maxCrewCapacity: number;
  baselineReliability: number; // 0 to 1
  basePowerCapacityKw: number;
  upgradeSlots: number;
  advantages: string[];
  disadvantages: string[];
  svgIcon: string;
}

export type EngineType = 'chemical' | 'ntp' | 'sep';
export type PropellantType = 'methalox' | 'liquid_hydrogen' | 'xenon';

export interface PropulsionSystem {
  id: string;
  name: string;
  type: EngineType;
  compatiblePropellant: PropellantType;
  costM: number;
  dryMassKg: number;
  thrustKn: number;
  ispSeconds: number; // Specific Impulse in seconds
  powerDrawKw: number;
  nominalTransitDays: number; // Outbound travel time in days
  reliability: number;
  description: string;
  tradeOffNote: string;
}

export interface PropellantOption {
  type: PropellantType;
  name: string;
  densityKgPerM3: number;
  boiloffRatePerMonth: number; // Percentage lost per 30 days
  costPerTonM: number;
  description: string;
}

export interface PowerSystem {
  id: string;
  name: string;
  type: 'solar' | 'rtg' | 'hybrid';
  costM: number;
  massKg: number;
  generationKw: number; // Baseline at Mars orbit/surface
  dustVulnerability: number; // Sensitivity to solar dust accumulation (0 = immune, 1 = severe)
  operationalLifetimeYears: number;
  description: string;
}

export interface BatterySystem {
  id: string;
  name: string;
  costM: number;
  massKg: number;
  capacityKwh: number;
  cycleLife: number;
  description: string;
}

export interface CommSystem {
  id: string;
  name: string;
  costM: number;
  massKg: number;
  powerDrawKw: number;
  bandwidthMbps: number; // Bandwidth back to Earth DSN
  reliability: number;
  description: string;
}

export interface Instrument {
  id: string;
  name: string;
  category: 'imaging' | 'spectroscopy' | 'subsurface' | 'sampling' | 'atmospheric';
  costM: number;
  massKg: number;
  powerDrawKw: number;
  dataPerObservationMb: number;
  solTimeHours: number;
  supportsObjectiveIds: string[];
  description: string;
  scientificCapability: string;
}

export interface RoverSystem {
  id: string;
  name: string;
  costM: number;
  massKg: number;
  powerSystem: string;
  batteryKwh: number;
  speedKmPerHour: number;
  instrumentSlots: number;
  sampleCapacity: number;
  dustTolerance: 'low' | 'moderate' | 'high';
  description: string;
}

export interface LifeSupportConfig {
  crewSize: number;
  rationDaysFood: number;
  rationDaysWater: number;
  rationDaysOxygen: number;
  suitType: 'standard_eva' | 'advanced_hybrid' | 'lightweight_biomechanical';
  habitatShielding: 'standard_aluminum' | 'polyethylene_water_shield' | 'active_electromagnetic';
}

export interface LandingSite {
  id: string;
  name: string;
  coordinates: string;
  elevationKm: number;
  description: string;
  geologicalFeatures: string[];
  terrainRisk: number; // 0 to 1 (affects EDL touchdown risk)
  landingDifficulty: 'Moderate' | 'Demanding' | 'Extreme';
  dustStormRisk: number; // Probability factor
  scientificInterest: string;
  recommendedObjectives: string[];
  surfaceRockTypes: string[];
}

export interface MissionConfig {
  objectiveId: string;
  spacecraftId: string;
  propulsionId: string;
  propellantType: PropellantType;
  propellantMassKg: number;
  powerSystemId: string;
  batteryId: string;
  commSystemId: string;
  selectedInstrumentIds: string[];
  roverId: string;
  lifeSupport: LifeSupportConfig;
  landingSiteId: string;
  plannedSurfaceSols: number;
  budgetLimitM: number;
  difficulty: Difficulty;
  randomSeed: number;
}

export interface EngineeringValidation {
  totalCostM: number;
  remainingBudgetM: number;
  isBudgetValid: boolean;

  dryMassKg: number;
  payloadMassKg: number;
  totalMassKg: number;
  massLimitKg: number;
  isMassValid: boolean;

  totalDeltaVAvailableMs: number;
  deltaVRequiredDepartureMs: number;
  deltaVRequiredDescentMs: number;
  deltaVRequiredAscentMs: number;
  deltaVRequiredReturnMs: number;
  deltaVTotalRequiredMs: number;
  isFuelDepartureValid: boolean;
  isFuelReturnValid: boolean;

  powerGenerationKw: number;
  powerBaselineDrawKw: number;
  powerNetBalanceKw: number;
  isPowerValid: boolean;

  totalMissionDaysRequired: number;
  lifeSupportCoverageDays: number;
  isLifeSupportValid: boolean;

  dailyDataDownlinkMb: number;
  dailyDataGenerationMb: number;
  isCommValid: boolean;

  objectiveInstrumentMatches: number;
  totalObjectiveRequirements: number;
  isScienceSufficient: boolean;

  overallReadiness: 'SAFE' | 'WARNING' | 'CRITICAL';
  statusMessages: {
    category: 'Budget' | 'Propulsion' | 'Power' | 'Life Support' | 'Communications' | 'Science' | 'Landing';
    severity: 'SAFE' | 'WARNING' | 'CRITICAL';
    message: string;
    advice: string;
  }[];
}

export interface SurfaceActivity {
  id: string;
  name: string;
  costHours: number;
  energyKwh: number;
  lifeSupportSolCost: number; // fraction of a sol
  scientificValue: number;
  dataGeneratedMb: number;
  riskFactor: number;
  requiresInstrumentId?: string;
  requiresSampleCache?: boolean;
  description: string;
}

export interface SimulationLog {
  timestamp: string;
  solOrDay: string;
  phase: MissionPhase;
  level: 'info' | 'warning' | 'alert' | 'success';
  title: string;
  detail: string;
}

export interface AnomalyEvent {
  id: string;
  phase: MissionPhase;
  title: string;
  description: string;
  scientificContext: string;
  choices: {
    id: string;
    label: string;
    consequenceDescription: string;
    fuelCostKg?: number;
    powerDrainKw?: number;
    timeDelayDays?: number;
    sciencePenalty?: number;
    scienceBonus?: number;
    resolved: boolean;
  }[];
}

export interface SimulationState {
  config: MissionConfig;
  currentPhase: MissionPhase;
  missionDay: number;
  surfaceSol: number;
  isPaused: boolean;
  playbackSpeed: number; // 1x, 2x, 5x

  // Live resources
  remainingPropellantKg: number;
  ascentPropellantReservedKg: number;
  currentPowerGenerationKw: number;
  currentBatteryChargeKwh: number;
  remainingFoodDays: number;
  remainingWaterDays: number;
  remainingOxygenDays: number;
  crewHealthPercent: number;
  roverStatus: 'nominal' | 'dust_impaired' | 'battery_low' | 'inactive';
  roverBatteryKwh: number;

  // Environmental
  inDustStorm: boolean;
  dustStormSeverity: number; // 0 to 1
  dustAccumulationPercent: number;

  // Scientific tracking
  scienceDataGatheredMb: number;
  scienceDataDownlinkedMb: number;
  samplesCached: number;
  milestonesCompleted: string[];
  scienceScore: number;

  // Anomaly
  currentAnomaly: AnomalyEvent | null;
  logs: SimulationLog[];

  // Outcome
  hasFailed: boolean;
  failureReason: string | null;
  failurePhase: MissionPhase | null;
  failureEducationalNote: string | null;
  isComplete: boolean;
}

export interface MissionDebrief {
  outcome: 'complete_success' | 'partial_success' | 'science_success_crew_lost' | 'operational_failure' | 'critical_failure';
  outcomeTitle: string;
  summary: string;
  scores: {
    scientificAchievement: number; // 0 - 100
    engineeringReliability: number; // 0 - 100
    resourceEfficiency: number; // 0 - 100
    budgetDiscipline: number; // 0 - 100
    crewSafety: number; // 0 - 100
    dataReturn: number; // 0 - 100
    adaptability: number; // 0 - 100
    overallScore: number; // Weighted 0 - 100
  };
  keyAchievements: string[];
  criticalFailures: string[];
  recommendations: string[];
  educationalLessons: string[];
  telemetrySummary: {
    totalCreditsSpentM: number;
    totalMissionDays: number;
    surfaceSolsCompleted: number;
    propellantRemainingKg: number;
    samplesBroughtHome: number;
    dataTransmittedMb: number;
    dustStormsSurvived: number;
  };
}
