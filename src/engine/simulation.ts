import { 
  MissionConfig, 
  SimulationState, 
  MissionPhase, 
  SurfaceActivity, 
  AnomalyEvent, 
  MissionDebrief 
} from '../types/mission';
import { calculateMissionReadiness, calculateMassBudget, calculateDeltaV } from './calculator';
import { PROPULSION_SYSTEMS } from '../data/propulsion';
import { POWER_SYSTEMS, BATTERY_SYSTEMS, ROVER_SYSTEMS, SCIENTIFIC_INSTRUMENTS } from '../data/systems';
import { LANDING_SITES } from '../data/destinations';
import { SCIENTIFIC_OBJECTIVES } from '../data/objectives';

// Pseudo-random number generator with seed
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function initSimulationState(config: MissionConfig): SimulationState {
  const power = POWER_SYSTEMS.find(p => p.id === config.powerSystemId) || POWER_SYSTEMS[0];
  const battery = BATTERY_SYSTEMS.find(b => b.id === config.batteryId) || BATTERY_SYSTEMS[0];
  const rover = ROVER_SYSTEMS.find(r => r.id === config.roverId) || ROVER_SYSTEMS[0];

  return {
    config,
    currentPhase: 'launch',
    missionDay: 0,
    surfaceSol: 0,
    isPaused: false,
    playbackSpeed: 1,

    remainingPropellantKg: config.propellantMassKg,
    ascentPropellantReservedKg: Math.round(config.propellantMassKg * 0.45), // Dedicated ascent reserve
    currentPowerGenerationKw: power.generationKw,
    currentBatteryChargeKwh: battery.capacityKwh,
    remainingFoodDays: config.lifeSupport.rationDaysFood,
    remainingWaterDays: config.lifeSupport.rationDaysWater,
    remainingOxygenDays: config.lifeSupport.rationDaysOxygen,
    crewHealthPercent: 100,
    roverStatus: 'nominal',
    roverBatteryKwh: rover.batteryKwh,

    inDustStorm: false,
    dustStormSeverity: 0,
    dustAccumulationPercent: 0,

    scienceDataGatheredMb: 0,
    scienceDataDownlinkedMb: 0,
    samplesCached: 0,
    milestonesCompleted: [],
    scienceScore: 0,

    currentAnomaly: null,
    logs: [
      {
        timestamp: new Date().toISOString(),
        solOrDay: 'T-00:00:00',
        phase: 'launch',
        level: 'info',
        title: 'Mission Initialized',
        detail: `Flight configuration validated for ${config.spacecraftId.toUpperCase()} expedition to Mars.`
      }
    ],

    hasFailed: false,
    failureReason: null,
    failurePhase: null,
    failureEducationalNote: null,
    isComplete: false
  };
}

// Available interactive surface activities
export const SURFACE_ACTIVITIES: SurfaceActivity[] = [
  {
    id: 'act_pano_survey',
    name: '360° Multispectral MastCam Panorama',
    costHours: 2,
    energyKwh: 3.5,
    lifeSupportSolCost: 0.1,
    scientificValue: 15,
    dataGeneratedMb: 350,
    riskFactor: 0.02,
    requiresInstrumentId: 'inst_pancam',
    description: 'Spin the mast camera to acquire high-dynamic range geological context frames and measure atmospheric dust optical depth.'
  },
  {
    id: 'act_rover_drive',
    name: 'Rover Traverse to Target Outcrop (350m)',
    costHours: 4,
    energyKwh: 6.0,
    lifeSupportSolCost: 0.2,
    scientificValue: 20,
    dataGeneratedMb: 120,
    riskFactor: 0.05,
    description: 'Drive the planetary rover toward a scientifically promising layered outcrop while navigating around boulders and sand ripples.'
  },
  {
    id: 'act_spec_scan',
    name: 'Spectroscopic Outcrop Pointing & Mineral Scan',
    costHours: 3,
    energyKwh: 4.8,
    lifeSupportSolCost: 0.15,
    scientificValue: 25,
    dataGeneratedMb: 580,
    riskFactor: 0.03,
    requiresInstrumentId: 'inst_visir_spec',
    description: 'Fire VNIR spectrometer lasers at rock coatings to identify clays, carbonates, and hydrated sulfates.'
  },
  {
    id: 'act_xrd_analysis',
    name: 'CheMin / APXS Crushed Regolith Analysis',
    costHours: 6,
    energyKwh: 8.5,
    lifeSupportSolCost: 0.25,
    scientificValue: 30,
    dataGeneratedMb: 420,
    riskFactor: 0.04,
    requiresInstrumentId: 'inst_chemin',
    description: 'Scoop loose sediment, deliver to internal XRD chamber, and record X-ray diffraction patterns to establish crystal chemistry.'
  },
  {
    id: 'act_deep_drill',
    name: 'Rotary-Percussive Subsurface Core Drill',
    costHours: 8,
    energyKwh: 12.0,
    lifeSupportSolCost: 0.35,
    scientificValue: 40,
    dataGeneratedMb: 160,
    riskFactor: 0.08,
    requiresInstrumentId: 'inst_drill',
    requiresSampleCache: true,
    description: 'Deploy the 2-meter tungsten drill to extract an unweathered rock core shielded from UV rays, then hermetically seal it inside a titanium tube.'
  },
  {
    id: 'act_radar_sounding',
    name: 'RIMFAX Deep Subsurface Radar Profile',
    costHours: 4,
    energyKwh: 5.5,
    lifeSupportSolCost: 0.2,
    scientificValue: 25,
    dataGeneratedMb: 650,
    riskFactor: 0.03,
    requiresInstrumentId: 'inst_radar',
    description: 'Transmit radar pulses into the ground during traverse to map buried ancient lake sediments, delta foreset beds, and ice strata.'
  },
  {
    id: 'act_downlink_data',
    name: 'Earth Deep Space Network (DSN) High-Rate Downlink',
    costHours: 2,
    energyKwh: 4.0,
    lifeSupportSolCost: 0.1,
    scientificValue: 0,
    dataGeneratedMb: 0,
    riskFactor: 0.01,
    description: 'Point the steerable high-gain antenna at Earth and transmit accumulated science telemetry back to the science operations center.'
  },
  {
    id: 'act_shelter_conserve',
    name: 'Conserve Power & Clean Optical Windows',
    costHours: 3,
    energyKwh: -5.0, // Recharges battery from ambient solar/RTG
    lifeSupportSolCost: 0.1,
    scientificValue: 5,
    dataGeneratedMb: 20,
    riskFactor: 0.0,
    description: 'Power down non-critical sub-assemblies, utilize purge gas to blow dust off solar panels, and allow battery systems to recharge.'
  }
];

export function executeSurfaceActivity(state: SimulationState, activityId: string): SimulationState {
  const activity = SURFACE_ACTIVITIES.find(a => a.id === activityId);
  if (!activity || state.hasFailed || state.currentPhase !== 'surface_ops') {
    return state;
  }

  const newState = { ...state };
  const engine = PROPULSION_SYSTEMS.find(p => p.id === state.config.propulsionId) || PROPULSION_SYSTEMS[0];
  const power = POWER_SYSTEMS.find(p => p.id === state.config.powerSystemId) || POWER_SYSTEMS[0];
  const rand = seededRandom(state.config.randomSeed + state.surfaceSol * 13 + activity.costHours);

  // Check required instrument
  if (activity.requiresInstrumentId && !state.config.selectedInstrumentIds.includes(activity.requiresInstrumentId)) {
    newState.logs = [
      {
        timestamp: new Date().toISOString(),
        solOrDay: `Sol ${state.surfaceSol}`,
        phase: 'surface_ops',
        level: 'warning',
        title: 'Action Incomplete: Missing Equipment',
        detail: `Cannot execute "${activity.name}". Required instrument is not installed on this expedition.`
      },
      ...newState.logs
    ];
    return newState;
  }

  // Check sample caching hardware for drill cores
  if (activity.requiresSampleCache && !state.config.selectedInstrumentIds.includes('inst_sample_cache')) {
    newState.logs = [
      {
        timestamp: new Date().toISOString(),
        solOrDay: `Sol ${state.surfaceSol}`,
        phase: 'surface_ops',
        level: 'warning',
        title: 'Sample Vault Missing',
        detail: 'Extracted core could not be sealed. Hermetic Sample Cache Vault was not included in mission configuration!'
      },
      ...newState.logs
    ];
  }

  // Consume resources
  const hoursFraction = activity.costHours / 24;
  newState.remainingFoodDays = Math.max(0, newState.remainingFoodDays - hoursFraction);
  newState.remainingWaterDays = Math.max(0, newState.remainingWaterDays - hoursFraction);
  newState.remainingOxygenDays = Math.max(0, newState.remainingOxygenDays - hoursFraction);

  // Power & Battery update
  if (activity.energyKwh < 0) {
    // Recharging
    newState.currentBatteryChargeKwh = Math.min(100, newState.currentBatteryChargeKwh + Math.abs(activity.energyKwh));
    newState.roverBatteryKwh = Math.min(30, newState.roverBatteryKwh + 8);
    newState.dustAccumulationPercent = Math.max(5, newState.dustAccumulationPercent - 15);
  } else {
    newState.currentBatteryChargeKwh = Math.max(0, newState.currentBatteryChargeKwh - activity.energyKwh * 0.4);
    newState.roverBatteryKwh = Math.max(0, newState.roverBatteryKwh - activity.energyKwh);
  }

  // Data downlink or generation
  if (activity.id === 'act_downlink_data') {
    const downlinkAmount = Math.min(newState.scienceDataGatheredMb - newState.scienceDataDownlinkedMb, 2400);
    newState.scienceDataDownlinkedMb += downlinkAmount;
    newState.logs = [
      {
        timestamp: new Date().toISOString(),
        solOrDay: `Sol ${state.surfaceSol}`,
        phase: 'surface_ops',
        level: 'success',
        title: 'DSN Downlink Successful',
        detail: `Transmitted ${downlinkAmount} MB of compressed hyperspectral and drill telemetry to Earth tracking stations.`
      },
      ...newState.logs
    ];
    return newState;
  }

  // Regular science activity
  newState.scienceDataGatheredMb += activity.dataGeneratedMb;
  newState.scienceScore += activity.scientificValue;

  if (activity.id === 'act_deep_drill' && state.config.selectedInstrumentIds.includes('inst_sample_cache')) {
    newState.samplesCached += 1;
  }

  // Check milestone completions based on objective
  const objective = SCIENTIFIC_OBJECTIVES.find(o => o.id === state.config.objectiveId);
  if (objective) {
    if (objective.id === 'obj_habitability') {
      if (activity.id === 'act_pano_survey' && !newState.milestonesCompleted.includes('ms_delta_survey')) {
        newState.milestonesCompleted.push('ms_delta_survey');
      }
      if (activity.id === 'act_spec_scan' && !newState.milestonesCompleted.includes('ms_clay_minerals')) {
        newState.milestonesCompleted.push('ms_clay_minerals');
      }
      if (activity.id === 'act_deep_drill' && !newState.milestonesCompleted.includes('ms_pristine_core')) {
        newState.milestonesCompleted.push('ms_pristine_core');
      }
      if (activity.id === 'act_xrd_analysis' && !newState.milestonesCompleted.includes('ms_biosig_context')) {
        newState.milestonesCompleted.push('ms_biosig_context');
      }
    } else if (objective.id === 'obj_geology') {
      if (activity.id === 'act_rover_drive' && !newState.milestonesCompleted.includes('ms_basalt_survey')) {
        newState.milestonesCompleted.push('ms_basalt_survey');
      }
      if (activity.id === 'act_xrd_analysis' && !newState.milestonesCompleted.includes('ms_xrd_analysis')) {
        newState.milestonesCompleted.push('ms_xrd_analysis');
      }
      if (activity.id === 'act_deep_drill' && !newState.milestonesCompleted.includes('ms_mantle_xenoliths')) {
        newState.milestonesCompleted.push('ms_mantle_xenoliths');
      }
      if (activity.id === 'act_spec_scan' && !newState.milestonesCompleted.includes('ms_alteration_ratios')) {
        newState.milestonesCompleted.push('ms_alteration_ratios');
      }
    } else if (objective.id === 'obj_climate') {
      if (activity.id === 'act_pano_survey' && !newState.milestonesCompleted.includes('ms_sediment_cyclicity')) {
        newState.milestonesCompleted.push('ms_sediment_cyclicity');
      }
      if (activity.id === 'act_radar_sounding' && !newState.milestonesCompleted.includes('ms_radar_subsurface')) {
        newState.milestonesCompleted.push('ms_radar_subsurface');
      }
      if (activity.id === 'act_spec_scan' && !newState.milestonesCompleted.includes('ms_sulfate_evaporites')) {
        newState.milestonesCompleted.push('ms_sulfate_evaporites');
      }
      if (activity.id === 'act_shelter_conserve' && !newState.milestonesCompleted.includes('ms_dust_dynamics')) {
        newState.milestonesCompleted.push('ms_dust_dynamics');
      }
    }
  }

  // Check consumables failure
  if (newState.remainingOxygenDays <= 0 || newState.remainingWaterDays <= 0 || newState.remainingFoodDays <= 0) {
    newState.hasFailed = true;
    newState.failurePhase = 'surface_ops';
    newState.failureReason = 'Life Support Consumables Starvation';
    newState.failureEducationalNote = 'Life support rations exhausted during surface operations. Expedition planned more sols on the surface than the provisioned food, water, or oxygen could sustain.';
    newState.logs = [
      {
        timestamp: new Date().toISOString(),
        solOrDay: `Sol ${newState.surfaceSol}`,
        phase: 'surface_ops',
        level: 'alert',
        title: 'CRITICAL: Life Support Depleted',
        detail: 'Essential life-support consumables reached zero. Crew survival compromised.'
      },
      ...newState.logs
    ];
    return newState;
  }

  // Check power failure
  if (newState.currentBatteryChargeKwh <= 0 && power.type === 'solar' && newState.inDustStorm) {
    newState.hasFailed = true;
    newState.failurePhase = 'surface_ops';
    newState.failureReason = 'Catastrophic Power Bus Collapse';
    newState.failureEducationalNote = 'Solar array power output degraded to near zero under heavy atmospheric dust, completely draining battery reserves. Without RTG auxiliary, environmental thermal conditioning failed.';
    newState.logs = [
      {
        timestamp: new Date().toISOString(),
        solOrDay: `Sol ${newState.surfaceSol}`,
        phase: 'surface_ops',
        level: 'alert',
        title: 'CRITICAL: Total Power Blackout',
        detail: 'Electrical bus voltage dropped to zero during night cycle.'
      },
      ...newState.logs
    ];
    return newState;
  }

  newState.logs = [
    {
      timestamp: new Date().toISOString(),
      solOrDay: `Sol ${newState.surfaceSol}`,
      phase: 'surface_ops',
      level: 'info',
      title: `Completed: ${activity.name}`,
      detail: `Generated ${activity.dataGeneratedMb} MB science data (+${activity.scientificValue} pts). Consumed ${activity.energyKwh} kWh.`
    },
    ...newState.logs
  ];

  return newState;
}

export function advanceSimulationStep(state: SimulationState): SimulationState {
  if (state.hasFailed || state.isComplete) {
    return state;
  }

  const newState = { ...state };
  const rand = seededRandom(state.config.randomSeed + state.missionDay * 17 + state.surfaceSol * 31);
  const engine = PROPULSION_SYSTEMS.find(p => p.id === state.config.propulsionId) || PROPULSION_SYSTEMS[0];
  const power = POWER_SYSTEMS.find(p => p.id === state.config.powerSystemId) || POWER_SYSTEMS[0];
  const site = LANDING_SITES.find(s => s.id === state.config.landingSiteId) || LANDING_SITES[0];

  switch (state.currentPhase) {
    case 'launch': {
      // Phase 2: Launch and Earth Departure (TMI)
      const readiness = calculateMissionReadiness(state.config);

      // Check budget constraint failure
      if (!readiness.isBudgetValid) {
        newState.hasFailed = true;
        newState.failurePhase = 'launch';
        newState.failureReason = 'Fiscal Overrun & Program Cancellation';
        newState.failureEducationalNote = `Mission exceeded funding cap by $${Math.abs(readiness.remainingBudgetM)}M. In real aerospace programs, uncontrolled cost overruns lead to cancellation or drastic descope before launch.`;
        newState.logs = [
          {
            timestamp: new Date().toISOString(),
            solOrDay: 'T-00:00:00',
            phase: 'launch',
            level: 'alert',
            title: 'Launch Scrubbed: Funding Ceiling Exceeded',
            detail: `Procurement audit failed: cost ($${readiness.totalCostM}M) exceeds approved appropriation ($${state.config.budgetLimitM}M).`
          },
          ...newState.logs
        ];
        return newState;
      }

      // Check mass constraint failure
      if (!readiness.isMassValid) {
        newState.hasFailed = true;
        newState.failurePhase = 'launch';
        newState.failureReason = 'Structural Payload Limit Exceeded';
        newState.failureEducationalNote = `Loaded payload mass (${readiness.payloadMassKg.toLocaleString()} kg) exceeded the certified structural load limit of the ${readiness.dryMassKg} kg airframe. Launch vehicle flight dynamics aborted.`;
        return newState;
      }

      // Check incompatible propellant
      if (engine.compatiblePropellant !== state.config.propellantType) {
        newState.hasFailed = true;
        newState.failurePhase = 'launch';
        newState.failureReason = 'Propellant Plumbing Incompatibility';
        newState.failureEducationalNote = `Engine cluster (${engine.name}) was fueled with incompatible propellant (${state.config.propellantType}). Cryogenic turbopumps seized on ignition.`;
        return newState;
      }

      // Check departure fuel
      if (!readiness.isFuelDepartureValid) {
        newState.hasFailed = true;
        newState.failurePhase = 'launch';
        newState.failureReason = 'Insufficient Trans-Mars Injection Delta-V';
        newState.failureEducationalNote = 'Total propellant load was insufficient to achieve hyperbolic escape velocity from Earth orbit. Spacecraft stranded in high elliptical Earth orbit.';
        return newState;
      }

      // Deduct TMI burn propellant (~35% of wet propellant)
      const tmiBurnKg = Math.round(state.remainingPropellantKg * 0.35);
      newState.remainingPropellantKg -= tmiBurnKg;
      newState.missionDay = 1;
      newState.currentPhase = 'transit_outbound';

      newState.logs = [
        {
          timestamp: new Date().toISOString(),
          solOrDay: 'Day 1',
          phase: 'transit_outbound',
          level: 'success',
          title: 'Trans-Mars Injection Burn Complete',
          detail: `Main engines executed clean 3,950 m/s burn. Consumed ${tmiBurnKg.toLocaleString()} kg propellant. On nominal trajectory to Mars.`
        },
        ...newState.logs
      ];
      break;
    }

    case 'transit_outbound': {
      // Phase 3: Outbound Transit
      const targetDays = engine.nominalTransitDays;
      const dayStep = Math.min(25, targetDays - state.missionDay);

      newState.missionDay += dayStep;
      newState.remainingFoodDays = Math.max(0, newState.remainingFoodDays - dayStep);
      newState.remainingWaterDays = Math.max(0, newState.remainingWaterDays - dayStep);
      newState.remainingOxygenDays = Math.max(0, newState.remainingOxygenDays - dayStep);

      // Trajectory Correction Maneuver (TCM) fuel consumption
      const tcmFuelKg = Math.round(dayStep * 40);
      newState.remainingPropellantKg = Math.max(0, newState.remainingPropellantKg - tcmFuelKg);

      // Consumables check
      if (newState.remainingFoodDays <= 0 || newState.remainingWaterDays <= 0 || newState.remainingOxygenDays <= 0) {
        newState.hasFailed = true;
        newState.failurePhase = 'transit_outbound';
        newState.failureReason = 'Deep-Space Life Support Depletion';
        newState.failureEducationalNote = `Consumables ran out at Day ${newState.missionDay} during the ${targetDays}-day outbound transit. A mission with low-efficiency engines (like SEP) requires significantly more life-support provisions due to extended transit times.`;
        return newState;
      }

      // Check if arrived at Mars orbit
      if (newState.missionDay >= targetDays) {
        newState.currentPhase = 'edl_landing';
        newState.logs = [
          {
            timestamp: new Date().toISOString(),
            solOrDay: `Day ${newState.missionDay}`,
            phase: 'edl_landing',
            level: 'info',
            title: 'Mars Orbital Insertion Achieved',
            detail: `Arrived at Mars coordinates above ${site.name}. Preparing Entry, Descent, and Landing (EDL) sequence.`
          },
          ...newState.logs
        ];
      }
      break;
    }

    case 'edl_landing': {
      // Phase 4: Mars Entry, Descent & Landing (EDL)
      const dv = calculateDeltaV(state.config);
      const siteRisk = site.terrainRisk; // 0 to 1
      const isHighElevation = site.elevationKm > 0;

      // Deduct landing retro-propellant
      const descentFuelKg = Math.round(state.config.propellantMassKg * 0.18);
      newState.remainingPropellantKg = Math.max(0, newState.remainingPropellantKg - descentFuelKg);

      // High elevation penalty (e.g. Olympus Mons flank has razor-thin atmosphere)
      let landingSuccessProbability = 0.94 - (siteRisk * 0.25);
      if (isHighElevation) {
        landingSuccessProbability -= 0.35; // Severe parachute braking degradation
      }

      const roll = rand();
      if (roll > landingSuccessProbability) {
        newState.hasFailed = true;
        newState.failurePhase = 'edl_landing';
        newState.failureReason = isHighElevation 
          ? 'Supersonic Parachute Failure at High Altitude' 
          : 'Terminal Terrain Collision during Touchdown';
        newState.failureEducationalNote = isHighElevation
          ? `Landing at ${site.name} (elevation +${site.elevationKm} km) failed because the Martian atmosphere at high altitudes is too thin for parachutes to decelerate a heavy crew lander before terrain impact.`
          : `Terrain roughness and boulder field at ${site.name} caused landing gear collapse on touchdown. High-risk landing sites require terrain-relative navigation and substantial retro-propulsion fuel margin.`;
        newState.logs = [
          {
            timestamp: new Date().toISOString(),
            solOrDay: `Day ${newState.missionDay}`,
            phase: 'edl_landing',
            level: 'alert',
            title: 'CRITICAL: EDL Terminal Touchdown Failure',
            detail: `Descent telemetry lost at altitude 40m above ${site.name}.`
          },
          ...newState.logs
        ];
        return newState;
      }

      newState.currentPhase = 'surface_ops';
      newState.surfaceSol = 1;
      newState.logs = [
        {
          timestamp: new Date().toISOString(),
          solOrDay: 'Sol 1',
          phase: 'surface_ops',
          level: 'success',
          title: `Touchdown Confirmed at ${site.name}`,
          detail: 'Lander secured on the surface. Environmental sensors online. Rover deployment ready.'
        },
        ...newState.logs
      ];
      break;
    }

    case 'surface_ops': {
      // Phase 5: Surface Operations (advance 1 Sol)
      const plannedSols = state.config.plannedSurfaceSols;
      newState.surfaceSol += 1;
      newState.remainingFoodDays = Math.max(0, newState.remainingFoodDays - 1);
      newState.remainingWaterDays = Math.max(0, newState.remainingWaterDays - 1);
      newState.remainingOxygenDays = Math.max(0, newState.remainingOxygenDays - 1);

      // Check dust storm trigger based on landing site risk
      const stormChance = site.dustStormRisk * 0.15;
      if (!newState.inDustStorm && rand() < stormChance) {
        newState.inDustStorm = true;
        newState.dustStormSeverity = 0.6 + rand() * 0.35;
        newState.dustAccumulationPercent = Math.min(85, newState.dustAccumulationPercent + 40);
        newState.logs = [
          {
            timestamp: new Date().toISOString(),
            solOrDay: `Sol ${newState.surfaceSol}`,
            phase: 'surface_ops',
            level: 'warning',
            title: 'Martian Dust Storm Warning',
            detail: `Atmospheric opacity (tau) surged to ${(newState.dustStormSeverity * 4).toFixed(1)}. Solar output reduced by ${Math.round(newState.dustStormSeverity * 85)}%.`
          },
          ...newState.logs
        ];
      } else if (newState.inDustStorm && rand() < 0.35) {
        // Storm clearing
        newState.inDustStorm = false;
        newState.logs = [
          {
            timestamp: new Date().toISOString(),
            solOrDay: `Sol ${newState.surfaceSol}`,
            phase: 'surface_ops',
            level: 'info',
            title: 'Atmospheric Clearing',
            detail: 'Regional dust front dissipated. Solar irradiance returning to baseline.'
          },
          ...newState.logs
        ];
      }

      // Check solar power degradation
      if (newState.inDustStorm && power.type === 'solar') {
        newState.currentPowerGenerationKw = Math.round(power.generationKw * 0.43 * (1 - newState.dustStormSeverity) * 10) / 10;
        newState.currentBatteryChargeKwh = Math.max(0, newState.currentBatteryChargeKwh - 8);
      } else {
        newState.currentPowerGenerationKw = power.type === 'solar' ? Math.round(power.generationKw * 0.43 * 10) / 10 : power.generationKw;
      }

      // Consumables exhaustion check
      if (newState.remainingFoodDays <= 0 || newState.remainingWaterDays <= 0 || newState.remainingOxygenDays <= 0) {
        newState.hasFailed = true;
        newState.failurePhase = 'surface_ops';
        newState.failureReason = 'Life Support Depletion on Surface';
        newState.failureEducationalNote = 'Crew life support rations depleted on the Martian surface before departure. Surface duration must never exceed provisioned life-support reserves.';
        return newState;
      }

      // Automatic surface science background increment
      newState.scienceDataGatheredMb += 80;
      newState.scienceScore += 2;

      // Has surface duration reached planned limit?
      if (newState.surfaceSol >= plannedSols) {
        newState.currentPhase = 'mars_ascent';
        newState.logs = [
          {
            timestamp: new Date().toISOString(),
            solOrDay: `Sol ${newState.surfaceSol}`,
            phase: 'mars_ascent',
            level: 'info',
            title: 'Surface Exploration Window Concluded',
            detail: 'Initiating Mars Ascent Vehicle (MAV) pre-flight readiness review and ascent countdown.'
          },
          ...newState.logs
        ];
      }
      break;
    }

    case 'mars_ascent': {
      // Phase 6: Mars Departure & Ascent
      // CRITICAL CHECK: Does the mission have enough remaining fuel for Mars ascent and Earth Return Injection?
      const dv = calculateDeltaV(state.config);
      const engine = PROPULSION_SYSTEMS.find(p => p.id === state.config.propulsionId) || PROPULSION_SYSTEMS[0];

      // Minimum propellant mass required for Ascent (4,100 m/s) + Return (1,550 m/s)
      const minReturnPropellantNeededKg = Math.round(state.config.propellantMassKg * 0.42);

      if (state.remainingPropellantKg < minReturnPropellantNeededKg || !dv.isFuelReturnValid) {
        // Critical failure: Stranded on Mars!
        newState.hasFailed = true;
        newState.failurePhase = 'mars_ascent';
        newState.failureReason = 'Insufficient Propellant for Earth Return Insertion';
        newState.failureEducationalNote = `CRITICAL ARCHITECTURAL FLAW: Spacecraft successfully gathered ${state.samplesCached} rock samples and reached Sol ${state.surfaceSol}, but remaining fuel (${state.remainingPropellantKg.toLocaleString()} kg) is below the minimum required (${minReturnPropellantNeededKg.toLocaleString()} kg) for Mars ascent (4,100 m/s) and Earth insertion (1,550 m/s). The crew is stranded. In aerospace planning, return delta-V is a non-negotiable hard constraint.`;
        newState.logs = [
          {
            timestamp: new Date().toISOString(),
            solOrDay: `Sol ${state.surfaceSol}`,
            phase: 'mars_ascent',
            level: 'alert',
            title: 'CRITICAL: Mars Ascent Ignition Aborted',
            detail: 'Propellant reserve calculations show insufficient delta-V to enter Mars escape trajectory. Crew cannot return.'
          },
          ...newState.logs
        ];
        return newState;
      }

      // Check if enough consumables remain for return trip!
      const inboundDays = engine.nominalTransitDays;
      if (newState.remainingFoodDays < inboundDays || newState.remainingWaterDays < inboundDays || newState.remainingOxygenDays < inboundDays) {
        newState.hasFailed = true;
        newState.failurePhase = 'mars_ascent';
        newState.failureReason = 'Insufficient Consumables for Inbound Transit';
        newState.failureEducationalNote = `Remaining food (${Math.round(newState.remainingFoodDays)} days) or oxygen (${Math.round(newState.remainingOxygenDays)} days) is less than the required ${inboundDays}-day return journey. Spacecraft cannot depart without starving crew during transit.`;
        return newState;
      }

      // Execute ascent burn
      newState.remainingPropellantKg -= Math.round(minReturnPropellantNeededKg * 0.6);
      newState.currentPhase = 'transit_inbound';
      newState.logs = [
        {
          timestamp: new Date().toISOString(),
          solOrDay: `Sol ${state.surfaceSol}`,
          phase: 'transit_inbound',
          level: 'success',
          title: 'Mars Ascent & Trans-Earth Injection Successful',
          detail: `MAV reached Low Mars Orbit. Second stage TEI burn placed crew on Earth return trajectory. Transit duration: ${inboundDays} days.`
        },
        ...newState.logs
      ];
      break;
    }

    case 'transit_inbound': {
      // Phase 7: Inbound Transit toward Earth
      const targetDays = engine.nominalTransitDays;
      const dayStep = Math.min(30, targetDays);

      newState.missionDay += dayStep;
      newState.remainingFoodDays = Math.max(0, newState.remainingFoodDays - dayStep);
      newState.remainingWaterDays = Math.max(0, newState.remainingWaterDays - dayStep);
      newState.remainingOxygenDays = Math.max(0, newState.remainingOxygenDays - dayStep);

      if (newState.remainingFoodDays <= 0 || newState.remainingOxygenDays <= 0) {
        newState.hasFailed = true;
        newState.failurePhase = 'transit_inbound';
        newState.failureReason = 'Inbound Consumables Starvation';
        newState.failureEducationalNote = 'Life support rations exhausted during the return journey to Earth.';
        return newState;
      }

      // Downlink remaining stored science data to Earth
      newState.scienceDataDownlinkedMb = Math.min(newState.scienceDataGatheredMb, newState.scienceDataDownlinkedMb + 3200);

      // Arrival at Earth
      newState.currentPhase = 'earth_arrival';
      newState.logs = [
        {
          timestamp: new Date().toISOString(),
          solOrDay: `Day ${newState.missionDay}`,
          phase: 'earth_arrival',
          level: 'success',
          title: 'Earth Return Trajectory Intercept',
          detail: 'Atmospheric re-entry capsule release confirmed. Parachutes deployed. Touchdown in recovery zone.'
        },
        ...newState.logs
      ];
      break;
    }

    case 'earth_arrival': {
      newState.currentPhase = 'debrief';
      newState.isComplete = true;
      break;
    }

    default:
      break;
  }

  return newState;
}

export function evaluateMissionOutcome(state: SimulationState): MissionDebrief {
  const objective = SCIENTIFIC_OBJECTIVES.find(o => o.id === state.config.objectiveId) || SCIENTIFIC_OBJECTIVES[0];
  const readiness = calculateMissionReadiness(state.config);

  // Scoring dimensions
  // 1. Scientific Achievement (0-100)
  const milestoneRatio = state.milestonesCompleted.length / Math.max(1, objective.targetMilestones.length);
  const sampleBonus = Math.min(25, state.samplesCached * 10);
  const scientificAchievement = Math.min(100, Math.round((milestoneRatio * 65) + sampleBonus + (state.scienceScore > 80 ? 10 : 5)));

  // 2. Engineering Reliability (0-100)
  const hadFailure = state.hasFailed;
  const engineeringReliability = hadFailure ? 20 : Math.round(readiness.overallReadiness === 'SAFE' ? 95 : 75);

  // 3. Resource Efficiency (0-100)
  const fuelRemainingRatio = state.remainingPropellantKg / Math.max(1, state.config.propellantMassKg);
  const resourceEfficiency = Math.round(50 + (fuelRemainingRatio * 40));

  // 4. Budget Discipline (0-100)
  const budgetRatio = readiness.remainingBudgetM / Math.max(1, state.config.budgetLimitM);
  const budgetDiscipline = readiness.isBudgetValid ? Math.min(100, Math.round(70 + budgetRatio * 30)) : 10;

  // 5. Crew Safety (0-100)
  let crewSafety = 100;
  if (state.hasFailed) {
    if (state.failurePhase === 'mars_ascent' || state.failurePhase === 'surface_ops' || state.failurePhase === 'transit_inbound') {
      crewSafety = 0; // Stranded or perished
    } else {
      crewSafety = 30; // Aborted early or launch scrub
    }
  }

  // 6. Data Return (0-100)
  const dataDownlinkedRatio = state.scienceDataGatheredMb > 0 
    ? state.scienceDataDownlinkedMb / state.scienceDataGatheredMb 
    : 1;
  const dataReturn = Math.min(100, Math.round(dataDownlinkedRatio * 100));

  // 7. Adaptability (0-100)
  const adaptability = state.inDustStorm || state.dustAccumulationPercent > 20 ? 90 : 75;

  // Overall Score (Weighted)
  let overallScore = Math.round(
    scientificAchievement * 0.30 +
    engineeringReliability * 0.20 +
    crewSafety * 0.25 +
    budgetDiscipline * 0.10 +
    resourceEfficiency * 0.08 +
    dataReturn * 0.07
  );

  if (crewSafety === 0) {
    // Cannot achieve high score if crew was stranded or lost
    overallScore = Math.min(45, overallScore);
  }

  // Outcome categorization
  let outcome: MissionDebrief['outcome'] = 'complete_success';
  let outcomeTitle = 'COMPLETE EXPEDITION SUCCESS';
  let summary = 'The expedition fulfilled its primary scientific objectives, completed surface operations, and returned crew and hermetic samples safely to Earth.';

  if (state.hasFailed) {
    if (state.failurePhase === 'mars_ascent' && state.samplesCached > 0) {
      outcome = 'science_success_crew_lost';
      outcomeTitle = 'SCIENTIFIC TRIUMPH — CREW STRANDED ON MARS';
      summary = `The mission achieved significant scientific breakthroughs and cached ${state.samplesCached} core samples, but ran out of ascent/return propellant. Landing on Mars without reserving return resources is a critical failure.`;
    } else if (state.failurePhase === 'launch') {
      outcome = 'operational_failure';
      outcomeTitle = 'PRE-LAUNCH CANCELLATION / SCRUB';
      summary = state.failureEducationalNote || 'Mission failed before leaving Earth orbit due to architectural or fiscal constraints.';
    } else {
      outcome = 'critical_failure';
      outcomeTitle = `CRITICAL FAILURE DURING ${state.failurePhase?.toUpperCase()}`;
      summary = state.failureEducationalNote || 'Catastrophic event during the expedition terminated operations.';
    }
  } else if (scientificAchievement < 60) {
    outcome = 'partial_success';
    outcomeTitle = 'SAFE CREW RETURN — PARTIAL SCIENTIFIC ACHIEVEMENT';
    summary = 'The crew returned safely to Earth, but the expedition lacked key scientific instruments or sufficient surface sols to fulfill all milestones.';
  }

  const keyAchievements: string[] = [];
  if (state.samplesCached > 0) keyAchievements.push(`Extracted and sealed ${state.samplesCached} rock cores in titanium sample tubes.`);
  if (state.milestonesCompleted.length > 0) keyAchievements.push(`Completed ${state.milestonesCompleted.length} primary scientific milestones for ${objective.shortTitle}.`);
  if (!state.hasFailed) keyAchievements.push('Executed full interplanetary round-trip delta-V sequence without stranding.');
  if (state.scienceDataDownlinkedMb > 1000) keyAchievements.push(`Downlinked ${state.scienceDataDownlinkedMb.toLocaleString()} MB of uncompressed planetary data to Earth.`);

  const criticalFailures: string[] = [];
  if (state.hasFailed && state.failureReason) {
    criticalFailures.push(`Terminal Failure: ${state.failureReason} (${state.failurePhase})`);
  }
  if (!readiness.isFuelReturnValid) {
    criticalFailures.push('Delta-V calculation showed return propellant deficit before launch.');
  }
  if (!readiness.isLifeSupportValid) {
    criticalFailures.push('Consumables ration days were below total round-trip mission requirement.');
  }

  const recommendations: string[] = [];
  if (outcome === 'science_success_crew_lost' || !readiness.isFuelReturnValid) {
    recommendations.push('Always couple departure propellant with return propellant: an expedition to Mars requires at least 5,650 m/s reserved for ascent and Trans-Earth Injection.');
  }
  if (scientificAchievement < 80) {
    recommendations.push(`Equip all mandatory instruments for ${objective.shortTitle}: ${objective.requiredInstrumentIds.join(', ')}.`);
  }
  if (readiness.remainingBudgetM < 50) {
    recommendations.push('Maintain at least $100M contingency reserve for unexpected anomalies.');
  }

  const educationalLessons = [
    objective.educationalTakeaway,
    'Landing on Mars is only the midpoint of a human mission. Ascent from Mars requires ~4,100 m/s delta-V plus ~1,550 m/s to inject into Earth return orbit.',
    'Mars dust storms can diminish solar array output by over 80%. Multi-mission RTG nuclear units or solid-state batteries are critical for life-support survival during global storm seasons.'
  ];

  return {
    outcome,
    outcomeTitle,
    summary,
    scores: {
      scientificAchievement,
      engineeringReliability,
      resourceEfficiency,
      budgetDiscipline,
      crewSafety,
      dataReturn,
      adaptability,
      overallScore
    },
    keyAchievements,
    criticalFailures,
    recommendations,
    educationalLessons,
    telemetrySummary: {
      totalCreditsSpentM: readiness.totalCostM,
      totalMissionDays: state.missionDay,
      surfaceSolsCompleted: state.surfaceSol,
      propellantRemainingKg: state.remainingPropellantKg,
      samplesBroughtHome: state.hasFailed && state.failurePhase !== 'earth_arrival' ? 0 : state.samplesCached,
      dataTransmittedMb: state.scienceDataDownlinkedMb,
      dustStormsSurvived: state.inDustStorm || state.dustAccumulationPercent > 20 ? 1 : 0
    }
  };
}
