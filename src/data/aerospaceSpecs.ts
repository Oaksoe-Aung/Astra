import {
  LaunchVehicle,
  PropulsionSpec,
  PowerSpec,
  CommsSpec,
  ScienceInstrumentSpec,
  SurfaceMobilitySpec,
  MissionChallenge,
  MissionDesignSelection,
  CalculatedTradeOffs
} from '../types/missionDesigner';

// -------------------------------------------------------------
// 1. LAUNCH VEHICLES (Earth to Trans-Mars Injection)
// -------------------------------------------------------------
export const LAUNCH_VEHICLES: LaunchVehicle[] = [
  {
    id: 'lv_falcon_heavy',
    name: 'Falcon Heavy (Expendable Core)',
    manufacturer: 'Commercial Launch Alliance',
    costM: 130,
    maxPayloadToTmiKg: 16800,
    reliability: 0.98,
    fairingDiameterM: 5.2,
    description: 'Affordable triple-core heavy lifter. Excellent cost-to-mass ratio for compact to medium Mars missions.',
    tradeOffNote: 'Lowest cost ($130M), but payload mass is strictly capped at 16,800 kg.'
  },
  {
    id: 'lv_sls_block1',
    name: 'SLS Block 1 (Deep Space Rocket)',
    manufacturer: 'NASA / Core Industrial Base',
    costM: 350,
    maxPayloadToTmiKg: 27000,
    reliability: 0.99,
    fairingDiameterM: 8.4,
    description: 'Government deep-space exploration launcher with enormous payload fairing and direct high-energy injection.',
    tradeOffNote: 'Higher cost ($350M), but accommodates large 27,000 kg scientific payloads and wide landers.'
  },
  {
    id: 'lv_ares_super_heavy',
    name: 'Starship / Super Heavy Cargo',
    manufacturer: 'Next-Gen Aerospace Corp',
    costM: 520,
    maxPayloadToTmiKg: 45000,
    reliability: 0.96,
    fairingDiameterM: 9.0,
    description: 'Colossal heavy-lift launch architecture capable of carrying entire surface bases and heavy rovers in one launch.',
    tradeOffNote: 'Massive 45,000 kg capacity, but consumes over $520M of mission budget.'
  }
];

// -------------------------------------------------------------
// 2. PROPULSION & SPACECRAFT BUS
// -------------------------------------------------------------
export const PROPULSION_SYSTEMS: PropulsionSpec[] = [
  {
    id: 'prop_methalox',
    name: 'Methalox Staged Combustion (Chemical)',
    type: 'chemical_methalox',
    costM: 90,
    dryMassKg: 2800,
    ispSeconds: 380,
    thrustKn: 220,
    transitDays: 210, // ~7 months
    propellantNeededKg: 7800,
    description: 'High-thrust liquid methane/oxygen rocket engine. Proven, robust, and delivers fast insertion burns.',
    tradeOffNote: 'Fast cruise (210 days) and high thrust, but requires 7,800 kg of heavy propellant mass.'
  },
  {
    id: 'prop_solar_electric',
    name: 'Solar-Electric Hall Thruster (SEP Ion)',
    type: 'solar_electric_ion',
    costM: 140,
    dryMassKg: 1400,
    ispSeconds: 3200,
    thrustKn: 0.8,
    transitDays: 320, // ~10.5 months
    propellantNeededKg: 1600,
    description: 'Extreme-efficiency ion propulsion utilizing Xenon propellant accelerated by electric magnetic fields.',
    tradeOffNote: 'Ultra-light fuel mass (saves 6,200 kg!), but low thrust extends cruise transit to 320 days.'
  },
  {
    id: 'prop_nuclear_thermal',
    name: 'Nuclear Thermal Propulsion (DRACO NTP)',
    type: 'nuclear_thermal',
    costM: 260,
    dryMassKg: 3900,
    ispSeconds: 900,
    thrustKn: 110,
    transitDays: 140, // ~4.5 months
    propellantNeededKg: 4200,
    description: 'Compact fission reactor heating liquid hydrogen propellant. The holy grail of human Mars transit.',
    tradeOffNote: 'Fastest transit (only 140 days) with high Isp, but costly ($260M) and heavier engine assembly.'
  }
];

// -------------------------------------------------------------
// 3. POWER GENERATION & STORAGE
// -------------------------------------------------------------
export const POWER_SYSTEMS: PowerSpec[] = [
  {
    id: 'pwr_ultraflex_solar',
    name: 'Circular UltraFlex Solar Arrays',
    type: 'solar_ultraflex',
    costM: 45,
    massKg: 320,
    powerOutputW: 1800,
    dustStormTolerancePercent: 20, // Drops to 20% in dust
    description: 'Lightweight origami deployable solar wings inspired by Phoenix and Insight. Generates 1,800W at midday.',
    tradeOffNote: 'Lightest (320 kg) and cheapest ($45M), but output drops 80% during Martian dust storms and zero at night.'
  },
  {
    id: 'pwr_mmrtg_plutonium',
    name: 'Multi-Mission RTG (Plutonium-238)',
    type: 'rtg_plutonium',
    costM: 110,
    massKg: 580,
    powerOutputW: 1400,
    dustStormTolerancePercent: 100, // Immune to dust
    description: 'Nuclear radioisotope thermoelectric generator decay-powered. Delivers uninterrupted electricity 24/7/365.',
    tradeOffNote: '100% immune to dust storms and darkness, but heavier (580 kg) and costly ($110M).'
  },
  {
    id: 'pwr_kilopower_reactor',
    name: 'Kilopower Fission Surface Reactor',
    type: 'surface_fission',
    costM: 210,
    massKg: 1200,
    powerOutputW: 5000,
    dustStormTolerancePercent: 100,
    description: 'Stirling engine nuclear fission reactor designed for long-duration science expeditions with heavy equipment.',
    tradeOffNote: 'Huge continuous power (5,000W) capable of powering heavy drill rigs, but adds 1,200 kg mass.'
  }
];

// -------------------------------------------------------------
// 4. DEEP SPACE COMMUNICATIONS
// -------------------------------------------------------------
export const COMMS_SYSTEMS: CommsSpec[] = [
  {
    id: 'comm_xband_low',
    name: 'Direct-to-Earth X-Band Horn Antenna',
    costM: 25,
    massKg: 85,
    powerDrawW: 90,
    downlinkSpeedKbps: 128,
    latencyMinutes: 14,
    description: 'Standard low-gain antenna for engineering telemetry and basic science data back to NASA Deep Space Network.',
    tradeOffNote: 'Low mass (85 kg) and low power (90W), but slow (128 kbps). HD imagery uploads take hours.'
  },
  {
    id: 'comm_kband_highgain',
    name: 'High-Gain Ka-Band Deployable Dish',
    costM: 65,
    massKg: 210,
    powerDrawW: 240,
    downlinkSpeedKbps: 2048, // 2 Mbps
    latencyMinutes: 14,
    description: 'Steerable parabolic dish reflector tuned to Ka-band microwave frequencies for high-throughput science return.',
    tradeOffNote: 'Fast 2 Mbps downlink for raw spectra and 4K scans, but requires 240W continuous power.'
  },
  {
    id: 'comm_optical_laser',
    name: 'Deep Space Optical Communications (DSOC Laser)',
    costM: 130,
    massKg: 340,
    powerDrawW: 420,
    downlinkSpeedKbps: 25000, // 25 Mbps
    latencyMinutes: 14,
    description: 'Infrared laser pulse optical transceiver transmitting broadband video and massive geological datasets to Earth.',
    tradeOffNote: 'Instant broadband data transfer (25 Mbps), but high cost ($130M) and draws 420W power.'
  }
];

// -------------------------------------------------------------
// 5. SCIENTIFIC INSTRUMENTS
// -------------------------------------------------------------
export const SCIENCE_INSTRUMENTS: ScienceInstrumentSpec[] = [
  {
    id: 'inst_mastcam_z',
    name: 'Mastcam-Z Multispectral Stereo Camera',
    code: 'MASTCAM',
    category: 'imager',
    costM: 35,
    massKg: 45,
    powerDrawW: 55,
    sciencePoints: 25,
    dataPerScanMb: 85,
    description: 'Dual-camera zoom stereoscopic imaging system to inspect rock textures, dust layers, and geologic strata.',
    enablesAction: 'scan'
  },
  {
    id: 'inst_sherloc_raman',
    name: 'SHERLOC / PIXL Raman Spectrometer',
    code: 'RAMAN',
    category: 'spectrometer',
    costM: 75,
    massKg: 95,
    powerDrawW: 130,
    sciencePoints: 50,
    dataPerScanMb: 140,
    description: 'Deep-UV laser Raman spectrometer that detects organic molecules, bio-signatures, and mineral crystal lattices.',
    enablesAction: 'scan'
  },
  {
    id: 'inst_subsurface_drill',
    name: 'Planetary Rotary-Percussive Core Drill',
    code: 'DRILL',
    category: 'drill',
    costM: 95,
    massKg: 280,
    powerDrawW: 380,
    sciencePoints: 75,
    dataPerScanMb: 40,
    description: 'Hollow coring bit drill capable of penetrating 2 meters into bedrock to extract pristine sealed core samples.',
    enablesAction: 'drill'
  },
  {
    id: 'inst_rimfax_radar',
    name: 'RIMFAX Ground-Penetrating Radar',
    code: 'RADAR',
    category: 'radar',
    costM: 40,
    massKg: 60,
    powerDrawW: 70,
    sciencePoints: 35,
    dataPerScanMb: 110,
    description: 'Subsurface radar sounding system that maps buried volcanic lava tubes, fault lines, and ancient subsurface water ice.',
    enablesAction: 'radar_pulse'
  },
  {
    id: 'inst_meda_weather',
    name: 'MEDA Atmospheric & Dust Sensor Suite',
    code: 'WEATHER',
    category: 'weather',
    costM: 20,
    massKg: 30,
    powerDrawW: 35,
    sciencePoints: 20,
    dataPerScanMb: 25,
    description: 'Environmental monitoring station measuring Martian atmospheric pressure, humidity, wind velocity, and dust grain size.',
    enablesAction: 'weather_monitor'
  }
];

// -------------------------------------------------------------
// 6. SURFACE MOBILITY & ROVERS
// -------------------------------------------------------------
export const MOBILITY_SYSTEMS: SurfaceMobilitySpec[] = [
  {
    id: 'mob_eva_only',
    name: 'Astronaut EVA Suit Only (No Rover)',
    costM: 0,
    massKg: 0,
    speedKmH: 5,
    batteryKwh: 0,
    sampleCapacity: 1,
    hasLights: false,
    description: 'The astronaut walks on foot. Saves budget and launch mass, but limits exploration range and sample capacity.',
  },
  {
    id: 'mob_scout_rover',
    name: 'Ares Scout Rover (4-Wheel Agile)',
    costM: 60,
    massKg: 450,
    speedKmH: 15,
    batteryKwh: 14,
    sampleCapacity: 3,
    hasLights: true,
    description: 'Compact 4-wheel rover with rock storage bay and LED headlights for rapid transit across dune fields.',
  },
  {
    id: 'mob_science_rover',
    name: 'Perseverance-Class Heavy Rover (6-Wheel Rocker-Bogie)',
    costM: 140,
    massKg: 1050,
    speedKmH: 12,
    batteryKwh: 28,
    sampleCapacity: 6,
    hasLights: true,
    description: '6-wheel rocker-bogie articulated science crawler. Extreme obstacle clearance, heavy sample carousel, and onboard lab.',
  }
];

// -------------------------------------------------------------
// 7. GUIDED CHALLENGES & SANDBOX
// -------------------------------------------------------------
export const MISSION_CHALLENGES: MissionChallenge[] = [
  {
    id: 'challenge_scout',
    title: 'Challenge 1: Scout on a Shoestring',
    subtitle: 'Low-Budget Reconnaissance Expedition',
    badge: 'Discovery Tier',
    difficulty: 'Beginner',
    budgetM: 450,
    description: 'NASA has allocated a tight $450M budget cap. Design a lean, high-efficiency Mars reconnaissance probe that scans ancient river deltas without exceeding the Falcon Heavy mass limit.',
    primaryGoals: [
      'Keep total mission cost under $450M',
      'Select a launch vehicle and propulsion within 16,800 kg',
      'Equip Mastcam-Z and Weather Suite for baseline surveys',
      'Conduct surface EVA and scan minimum 2 geological formations'
    ],
    recommendedInstruments: ['inst_mastcam_z', 'inst_meda_weather'],
    minScienceTarget: 45,
    defaultConfig: {
      launchVehicleId: 'lv_falcon_heavy',
      propulsionId: 'prop_methalox',
      powerSystemId: 'pwr_ultraflex_solar',
      commsId: 'comm_xband_low',
      instrumentIds: ['inst_mastcam_z', 'inst_meda_weather'],
      mobilityId: 'mob_eva_only'
    }
  },
  {
    id: 'challenge_water',
    title: 'Challenge 2: In Search of Ancient Water',
    subtitle: 'Subsurface Drilling & Sample Caching',
    badge: 'New Frontiers',
    difficulty: 'Intermediate',
    budgetM: 850,
    description: 'Scientists hypothesize that liquid water once carved Jezero Crater. Design an expedition equipped with a subsurface rotary drill and rover to extract pristine bedrock core samples.',
    primaryGoals: [
      'Balance power consumption of the 380W Subsurface Core Drill',
      'Equip a rover to transport extracted core samples across the crater',
      'Maintain positive power margin during Martian dust storms',
      'Collect and cache at least 2 core samples'
    ],
    recommendedInstruments: ['inst_mastcam_z', 'inst_sherloc_raman', 'inst_subsurface_drill'],
    minScienceTarget: 120,
    defaultConfig: {
      launchVehicleId: 'lv_sls_block1',
      propulsionId: 'prop_methalox',
      powerSystemId: 'pwr_mmrtg_plutonium',
      commsId: 'comm_kband_highgain',
      instrumentIds: ['inst_mastcam_z', 'inst_sherloc_raman', 'inst_subsurface_drill'],
      mobilityId: 'mob_scout_rover'
    }
  },
  {
    id: 'challenge_flagship',
    title: 'Challenge 3: Flagship Astrobiology & Sample Return',
    subtitle: 'Comprehensive Scientific Laboratory',
    badge: 'Flagship Tier',
    difficulty: 'Youth / Advanced',
    budgetM: 1500,
    description: 'Lead NASA’s premier Mars expedition. Equip a heavy rover with Raman spectrometry, ground-penetrating radar, high-speed optical laser comms, and nuclear surface power.',
    primaryGoals: [
      'Manage high electrical power draws exceeding 1,000W',
      'Achieve maximum orbital Delta-V for direct Mars capture',
      'Equip all primary instruments and 6-wheel science rover',
      'Achieve over 150 science points across all outcrop targets'
    ],
    recommendedInstruments: ['inst_mastcam_z', 'inst_sherloc_raman', 'inst_subsurface_drill', 'inst_rimfax_radar', 'inst_meda_weather'],
    minScienceTarget: 180,
    defaultConfig: {
      launchVehicleId: 'lv_ares_super_heavy',
      propulsionId: 'prop_nuclear_thermal',
      powerSystemId: 'pwr_kilopower_reactor',
      commsId: 'comm_optical_laser',
      instrumentIds: ['inst_mastcam_z', 'inst_sherloc_raman', 'inst_subsurface_drill', 'inst_rimfax_radar', 'inst_meda_weather'],
      mobilityId: 'mob_science_rover'
    }
  },
  {
    id: 'challenge_sandbox',
    title: 'Sandbox: Open Aerospace Lab',
    subtitle: 'Freeform Engineering & Extreme Design',
    badge: 'Freeform',
    difficulty: 'Open Sandbox',
    budgetM: 2000,
    description: 'Experiment freely with any combination of rockets, propulsion systems, power sources, instruments, and rovers without budget or mass restrictions.',
    primaryGoals: [
      'Test radical engineering combinations (e.g. Ion drive + heavy rover)',
      'Analyze failure modes and boundary constraints',
      'Simulate the flight and explore the Martian surface'
    ],
    recommendedInstruments: [],
    minScienceTarget: 50,
    defaultConfig: {
      launchVehicleId: 'lv_falcon_heavy',
      propulsionId: 'prop_methalox',
      powerSystemId: 'pwr_mmrtg_plutonium',
      commsId: 'comm_kband_highgain',
      instrumentIds: ['inst_mastcam_z', 'inst_subsurface_drill'],
      mobilityId: 'mob_scout_rover'
    }
  }
];

// -------------------------------------------------------------
// 8. AEROSPACE TRADE-OFF ENGINE (Math & Educational Feedback)
// -------------------------------------------------------------
export function computeMissionTradeOffs(
  selection: MissionDesignSelection,
  budgetCapM: number
): CalculatedTradeOffs {
  const lv = LAUNCH_VEHICLES.find(l => l.id === selection.launchVehicleId) || LAUNCH_VEHICLES[0];
  const prop = PROPULSION_SYSTEMS.find(p => p.id === selection.propulsionId) || PROPULSION_SYSTEMS[0];
  const pwr = POWER_SYSTEMS.find(p => p.id === selection.powerSystemId) || POWER_SYSTEMS[0];
  const comm = COMMS_SYSTEMS.find(c => c.id === selection.commsId) || COMMS_SYSTEMS[0];
  const mob = MOBILITY_SYSTEMS.find(m => m.id === selection.mobilityId) || MOBILITY_SYSTEMS[0];
  const insts = SCIENCE_INSTRUMENTS.filter(i => selection.instrumentIds.includes(i.id));

  // 1. Cost Calculations
  const instrumentsCost = insts.reduce((sum, i) => sum + i.costM, 0);
  const baseSpacecraftBusCost = 60; // Avionics, structure, thermal control
  const totalCostM = lv.costM + prop.costM + pwr.costM + comm.costM + mob.costM + instrumentsCost + baseSpacecraftBusCost;
  const budgetMarginM = budgetCapM - totalCostM;
  const isBudgetValid = budgetMarginM >= 0;

  // 2. Mass Calculations (Payload that must be boosted to TMI)
  const instrumentsMass = insts.reduce((sum, i) => sum + i.massKg, 0);
  const baseDryBusMass = 2200; // Landers, heat shield structure, descent stage
  const totalPayloadMassKg = prop.dryMassKg + prop.propellantNeededKg + pwr.massKg + comm.massKg + mob.massKg + instrumentsMass + baseDryBusMass;
  const massMarginKg = lv.maxPayloadToTmiKg - totalPayloadMassKg;
  const isMassValid = massMarginKg >= 0;

  // 3. Power Balance (Watts)
  const instrumentsPower = insts.reduce((sum, i) => sum + i.powerDrawW, 0);
  const baseBusPowerDraw = 350; // Avionics, computers, thermal heaters, life support telemetry
  const totalPowerDrawW = baseBusPowerDraw + comm.powerDrawW + instrumentsPower;
  const totalPowerOutputW = pwr.powerOutputW;
  const powerMarginW = totalPowerOutputW - totalPowerDrawW;
  const isPowerValid = powerMarginW >= 0;

  // 4. Orbital Delta-V (Tsiolkovsky rocket equation approximation)
  // Required delta-V for Earth TMI + Mars orbit capture + powered landing ~ 4,150 m/s
  const deltaVRequiredMs = 4150;
  // Effective delta-V based on Isp and mass ratio
  const wetMass = totalPayloadMassKg;
  const dryMass = totalPayloadMassKg - prop.propellantNeededKg;
  const massRatio = Math.max(1.1, wetMass / Math.max(100, dryMass));
  const g0 = 9.80665;
  const deltaVAvailableMs = Math.round(prop.ispSeconds * g0 * Math.log(massRatio));
  const isDeltaVValid = deltaVAvailableMs >= 3800; // Tolerable boundary

  // 5. Science & Telemetry
  const potentialScienceScore = insts.reduce((sum, i) => sum + i.sciencePoints, 0) + (mob.id !== 'mob_eva_only' ? 20 : 0);
  const downlinkSpeedKbps = comm.downlinkSpeedKbps;
  const transitDays = prop.transitDays;

  // 6. Educational Status & Notes
  const statusNotes: string[] = [];
  let readinessStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';

  if (!isBudgetValid) {
    readinessStatus = 'CRITICAL';
    statusNotes.push(`Cost Overrun: Exceeds budget cap by $${Math.abs(budgetMarginM)}M. Downgrade launch vehicle or reduce instruments.`);
  }

  if (!isMassValid) {
    readinessStatus = 'CRITICAL';
    statusNotes.push(`Mass Limit Exceeded: Spacecraft weighs ${totalPayloadMassKg.toLocaleString()} kg, but ${lv.name} only lifts ${lv.maxPayloadToTmiKg.toLocaleString()} kg.`);
  }

  if (!isPowerValid) {
    if (readinessStatus !== 'CRITICAL') readinessStatus = 'WARNING';
    statusNotes.push(`Power Deficit: Consuming ${totalPowerDrawW}W but generating only ${totalPowerOutputW}W (-${Math.abs(powerMarginW)}W deficit). Batteries will drain quickly!`);
  }

  if (!isDeltaVValid) {
    if (readinessStatus !== 'CRITICAL') readinessStatus = 'WARNING';
    statusNotes.push(`Low Delta-V: Available fuel delivers ${deltaVAvailableMs} m/s (minimum ~3,800 m/s needed). Mars capture may fail.`);
  }

  if (pwr.type === 'solar_ultraflex' && insts.some(i => i.id === 'inst_subsurface_drill')) {
    statusNotes.push(`Warning: The Rotary Drill draws 380W. Solar panels will struggle during dust storms. An RTG is recommended for drilling.`);
  }

  if (comm.id === 'comm_xband_low' && insts.length >= 3) {
    statusNotes.push(`Telemetry Bottleneck: X-Band (128 kbps) will take several days to downlink high-resolution spectrometer datasets.`);
  }

  if (mob.id === 'mob_eva_only') {
    statusNotes.push(`Foot Exploration: Without a rover, your astronaut can only explore nearby outcrops and carry 1 sample at a time.`);
  }

  if (statusNotes.length === 0) {
    statusNotes.push(`Optimal Configuration: All systems nominal! Positive mass and power margins ensure high mission success probability.`);
  }

  return {
    totalCostM,
    budgetLimitM: budgetCapM,
    budgetMarginM,
    isBudgetValid,

    totalPayloadMassKg,
    launchVehicleCapacityKg: lv.maxPayloadToTmiKg,
    massMarginKg,
    isMassValid,

    totalPowerOutputW,
    totalPowerDrawW,
    powerMarginW,
    isPowerValid,

    deltaVAvailableMs,
    deltaVRequiredMs,
    isDeltaVValid,

    downlinkSpeedKbps,
    transitDays,
    potentialScienceScore,

    readinessStatus,
    statusNotes
  };
}
