import { MissionConfig } from '../types/mission';

export interface TestScenarioPreset {
  id: string;
  name: string;
  description: string;
  expectedOutcome: string;
  config: MissionConfig;
}

export const TEST_SCENARIOS: TestScenarioPreset[] = [
  {
    id: 'preset_nominal_success',
    name: '1. Nominal Balanced Success (Odyssey Expedition)',
    description: 'A well-engineered expedition on Odyssey with balanced chemical propulsion, robust RTG-hybrid power, full instrument array, and sufficient return reserves.',
    expectedOutcome: 'Complete mission success with high scientific score and safe crew return.',
    config: {
      objectiveId: 'obj_habitability',
      spacecraftId: 'odyssey',
      propulsionId: 'chem_raptor',
      propellantType: 'methalox',
      propellantMassKg: 130000,
      powerSystemId: 'hybrid_grid',
      batteryId: 'batt_solidstate',
      commSystemId: 'comm_kaband',
      selectedInstrumentIds: ['inst_hires_cam', 'inst_visir_spec', 'inst_chemin', 'inst_drill', 'inst_sample_cache'],
      roverId: 'rover_explorer',
      lifeSupport: {
        crewSize: 4,
        rationDaysFood: 680,
        rationDaysWater: 680,
        rationDaysOxygen: 680,
        suitType: 'advanced_hybrid',
        habitatShielding: 'polyethylene_water_shield'
      },
      landingSiteId: 'site_jezero',
      plannedSurfaceSols: 45,
      budgetLimitM: 1800,
      difficulty: 'standard',
      randomSeed: 42
    }
  },
  {
    id: 'preset_underfunded',
    name: '2. Underfunded Ambition (Over-Budget)',
    description: 'Attempting to configure the Titan dreadnought with NTP propulsion and top instruments within standard training funds.',
    expectedOutcome: 'Pre-launch budget review failure or funding termination before launch.',
    config: {
      objectiveId: 'obj_geology',
      spacecraftId: 'titan',
      propulsionId: 'ntp_cerberus',
      propellantType: 'liquid_hydrogen',
      propellantMassKg: 210000,
      powerSystemId: 'hybrid_grid',
      batteryId: 'batt_solidstate',
      commSystemId: 'comm_optical',
      selectedInstrumentIds: ['inst_hires_cam', 'inst_pancam', 'inst_chemin', 'inst_drill', 'inst_sample_cache', 'inst_radar'],
      roverId: 'rover_science_lab',
      lifeSupport: {
        crewSize: 6,
        rationDaysFood: 750,
        rationDaysWater: 750,
        rationDaysOxygen: 750,
        suitType: 'advanced_hybrid',
        habitatShielding: 'active_electromagnetic'
      },
      landingSiteId: 'site_valles',
      plannedSurfaceSols: 50,
      budgetLimitM: 1400, // Insufficient budget!
      difficulty: 'expert',
      randomSeed: 101
    }
  },
  {
    id: 'preset_fuel_deficit_return',
    name: '3. Insufficient Fuel for Earth Return',
    description: 'Propellant load calculated only for outbound transit and descent, leaving near-zero delta-V for surface ascent and Trans-Earth Injection.',
    expectedOutcome: 'Landed safely on Mars with scientific achievements, but stranded on the surface due to insufficient ascent propellant.',
    config: {
      objectiveId: 'obj_habitability',
      spacecraftId: 'kestrel',
      propulsionId: 'chem_raptor',
      propellantType: 'methalox',
      propellantMassKg: 46000, // Deficit! Needs ~75,000kg for full round-trip
      powerSystemId: 'solar_ultraflex',
      batteryId: 'batt_liion',
      commSystemId: 'comm_xband',
      selectedInstrumentIds: ['inst_hires_cam', 'inst_visir_spec', 'inst_chemin', 'inst_drill', 'inst_sample_cache'],
      roverId: 'rover_scout',
      lifeSupport: {
        crewSize: 3,
        rationDaysFood: 550,
        rationDaysWater: 550,
        rationDaysOxygen: 550,
        suitType: 'standard_eva',
        habitatShielding: 'standard_aluminum'
      },
      landingSiteId: 'site_jezero',
      plannedSurfaceSols: 35,
      budgetLimitM: 1800,
      difficulty: 'standard',
      randomSeed: 202
    }
  },
  {
    id: 'preset_consumable_starvation',
    name: '4. Life-Support Consumables Deficit',
    description: 'Planning a 210-day outbound + 45-sol surface + 210-day inbound mission (~465 days), but only provisioning 300 days of food and oxygen.',
    expectedOutcome: 'Life support exhaustion during Mars operations or inbound return leg.',
    config: {
      objectiveId: 'obj_climate',
      spacecraftId: 'odyssey',
      propulsionId: 'chem_raptor',
      propellantType: 'methalox',
      propellantMassKg: 130000,
      powerSystemId: 'hybrid_grid',
      batteryId: 'batt_solidstate',
      commSystemId: 'comm_kaband',
      selectedInstrumentIds: ['inst_pancam', 'inst_visir_spec', 'inst_radar', 'inst_met_station', 'inst_dust_sensor'],
      roverId: 'rover_explorer',
      lifeSupport: {
        crewSize: 4,
        rationDaysFood: 280, // Far below the required ~480-550 days!
        rationDaysWater: 300,
        rationDaysOxygen: 290,
        suitType: 'standard_eva',
        habitatShielding: 'standard_aluminum'
      },
      landingSiteId: 'site_ice_plains',
      plannedSurfaceSols: 45,
      budgetLimitM: 1800,
      difficulty: 'standard',
      randomSeed: 303
    }
  },
  {
    id: 'preset_power_blackout',
    name: '5. Inadequate Power Generation & Solar Collapse',
    description: 'Relying exclusively on small solar panels without RTG auxiliary in a high dust-storm hazard environment with tiny battery reserves.',
    expectedOutcome: 'Catastrophic battery depletion during Martian night or dust storm, disabling life support and instruments.',
    config: {
      objectiveId: 'obj_climate',
      spacecraftId: 'kestrel',
      propulsionId: 'chem_raptor',
      propellantType: 'methalox',
      propellantMassKg: 78000,
      powerSystemId: 'solar_ultraflex', // Highly vulnerable to dust!
      batteryId: 'batt_liion', // Small battery
      commSystemId: 'comm_xband',
      selectedInstrumentIds: ['inst_pancam', 'inst_visir_spec', 'inst_radar', 'inst_met_station', 'inst_dust_sensor'],
      roverId: 'rover_scout',
      lifeSupport: {
        crewSize: 3,
        rationDaysFood: 550,
        rationDaysWater: 550,
        rationDaysOxygen: 550,
        suitType: 'standard_eva',
        habitatShielding: 'standard_aluminum'
      },
      landingSiteId: 'site_ice_plains', // High dust storm risk
      plannedSurfaceSols: 45,
      budgetLimitM: 1800,
      difficulty: 'expert',
      randomSeed: 404
    }
  },
  {
    id: 'preset_missing_instruments',
    name: '6. Missing Critical Scientific Instruments',
    description: 'Chose Ancient Habitability objective but forgot the core drill and XRD mineralogical analyzer, only packing panoramic camera and meteorology sensors.',
    expectedOutcome: 'Safe return with failed scientific objective; debrief highlights missing instrument synergy.',
    config: {
      objectiveId: 'obj_habitability',
      spacecraftId: 'odyssey',
      propulsionId: 'chem_raptor',
      propellantType: 'methalox',
      propellantMassKg: 130000,
      powerSystemId: 'hybrid_grid',
      batteryId: 'batt_solidstate',
      commSystemId: 'comm_kaband',
      selectedInstrumentIds: ['inst_pancam', 'inst_met_station', 'inst_dust_sensor'], // Missing drill, XRD, spectrometer!
      roverId: 'rover_explorer',
      lifeSupport: {
        crewSize: 4,
        rationDaysFood: 600,
        rationDaysWater: 600,
        rationDaysOxygen: 600,
        suitType: 'advanced_hybrid',
        habitatShielding: 'polyethylene_water_shield'
      },
      landingSiteId: 'site_jezero',
      plannedSurfaceSols: 45,
      budgetLimitM: 1800,
      difficulty: 'standard',
      randomSeed: 505
    }
  },
  {
    id: 'preset_high_risk_landing',
    name: '7. High-Risk High-Elevation Landing (Olympus Flank)',
    description: 'Selecting Olympus Mons at +1.8km elevation where thin atmosphere fails to brake the heavy lander, with max terrain roughness.',
    expectedOutcome: 'High probability of EDL terrain collision or touchdown velocity exceedance.',
    config: {
      objectiveId: 'obj_geology',
      spacecraftId: 'titan', // Very heavy!
      propulsionId: 'chem_raptor',
      propellantType: 'methalox',
      propellantMassKg: 200000,
      powerSystemId: 'hybrid_grid',
      batteryId: 'batt_solidstate',
      commSystemId: 'comm_kaband',
      selectedInstrumentIds: ['inst_hires_cam', 'inst_pancam', 'inst_chemin', 'inst_drill', 'inst_sample_cache'],
      roverId: 'rover_science_lab',
      lifeSupport: {
        crewSize: 5,
        rationDaysFood: 600,
        rationDaysWater: 600,
        rationDaysOxygen: 600,
        suitType: 'advanced_hybrid',
        habitatShielding: 'standard_aluminum'
      },
      landingSiteId: 'site_olympus', // Dangerous high elevation
      plannedSurfaceSols: 40,
      budgetLimitM: 2200,
      difficulty: 'expert',
      randomSeed: 606
    }
  },
  {
    id: 'preset_storm_resilient',
    name: '8. Dust Storm Encounter & Survival (RTG Power)',
    description: 'Encountering a severe regional dust storm in Jezero, but successfully weathered due to sealed e-RTG nuclear power and autonomous rover sheltering.',
    expectedOutcome: 'Mission encounters major storm event; surviving with reduced solar generation and achieving success.',
    config: {
      objectiveId: 'obj_habitability',
      spacecraftId: 'odyssey',
      propulsionId: 'chem_raptor',
      propellantType: 'methalox',
      propellantMassKg: 135000,
      powerSystemId: 'rtg_sterling', // Immune to dust storms!
      batteryId: 'batt_solidstate',
      commSystemId: 'comm_kaband',
      selectedInstrumentIds: ['inst_hires_cam', 'inst_visir_spec', 'inst_chemin', 'inst_drill', 'inst_sample_cache'],
      roverId: 'rover_science_lab',
      lifeSupport: {
        crewSize: 4,
        rationDaysFood: 650,
        rationDaysWater: 650,
        rationDaysOxygen: 650,
        suitType: 'advanced_hybrid',
        habitatShielding: 'polyethylene_water_shield'
      },
      landingSiteId: 'site_jezero',
      plannedSurfaceSols: 45,
      budgetLimitM: 1900,
      difficulty: 'standard',
      randomSeed: 707
    }
  },
  {
    id: 'preset_sol_starvation',
    name: '9. Surface Schedule Overrun (Out of Sols)',
    description: 'Planning an overambitious 90-sol surface exploration schedule with insufficient consumables and tight departure window.',
    expectedOutcome: 'Departure window missed or surface operations terminated early before completing targets.',
    config: {
      objectiveId: 'obj_climate',
      spacecraftId: 'kestrel',
      propulsionId: 'chem_raptor',
      propellantType: 'methalox',
      propellantMassKg: 75000,
      powerSystemId: 'hybrid_grid',
      batteryId: 'batt_liion',
      commSystemId: 'comm_xband',
      selectedInstrumentIds: ['inst_pancam', 'inst_visir_spec', 'inst_radar', 'inst_met_station'],
      roverId: 'rover_scout',
      lifeSupport: {
        crewSize: 3,
        rationDaysFood: 500,
        rationDaysWater: 500,
        rationDaysOxygen: 500,
        suitType: 'standard_eva',
        habitatShielding: 'standard_aluminum'
      },
      landingSiteId: 'site_gale',
      plannedSurfaceSols: 90, // Unrealistic long duration on light craft
      budgetLimitM: 1700,
      difficulty: 'expert',
      randomSeed: 808
    }
  },
  {
    id: 'preset_science_success_no_return',
    name: '10. Scientific Triumph with Tragic Stranding',
    description: 'Exceptional scientific caching and 100% milestone achievement, but insufficient fuel for Earth return insertion leaves crew in Mars orbit.',
    expectedOutcome: 'High scientific achievement score, but expedition categorized as a critical crew survival failure in debrief.',
    config: {
      objectiveId: 'obj_habitability',
      spacecraftId: 'titan',
      propulsionId: 'chem_raptor',
      propellantType: 'methalox',
      propellantMassKg: 110000, // Enough to land and ascend to low Mars orbit, but NOT enough for Earth return burn!
      powerSystemId: 'hybrid_grid',
      batteryId: 'batt_solidstate',
      commSystemId: 'comm_optical',
      selectedInstrumentIds: ['inst_hires_cam', 'inst_visir_spec', 'inst_chemin', 'inst_drill', 'inst_sample_cache'],
      roverId: 'rover_science_lab',
      lifeSupport: {
        crewSize: 5,
        rationDaysFood: 450,
        rationDaysWater: 450,
        rationDaysOxygen: 450,
        suitType: 'advanced_hybrid',
        habitatShielding: 'polyethylene_water_shield'
      },
      landingSiteId: 'site_jezero',
      plannedSurfaceSols: 45,
      budgetLimitM: 2000,
      difficulty: 'standard',
      randomSeed: 909
    }
  }
];
