import { PowerSystem, BatterySystem, CommSystem, Instrument, RoverSystem } from '../types/mission';

export const POWER_SYSTEMS: PowerSystem[] = [
  {
    id: 'solar_ultraflex',
    name: 'Deployable UltraFlex Solar Array Wing',
    type: 'solar',
    costM: 65,
    massKg: 1200,
    generationKw: 28.0,
    dustVulnerability: 0.75, // Severe drop during Martian dust storms
    operationalLifetimeYears: 10,
    description: 'Lightweight accordion-folding circular solar panels using triple-junction photovoltaic cells. High power-to-mass ratio during clear Martian sols.'
  },
  {
    id: 'rtg_sterling',
    name: 'Advanced Radioisotope Thermoelectric Generator (e-RTG)',
    type: 'rtg',
    costM: 175,
    massKg: 3400,
    generationKw: 22.0,
    dustVulnerability: 0.0, // Totally immune to dust accumulation and darkness
    operationalLifetimeYears: 25,
    description: 'Enclosed Plutonium-238 heat source paired with high-efficiency Stirling converters. Provides continuous, uninterrupted baseline power through dust storms and night.'
  },
  {
    id: 'hybrid_grid',
    name: 'Hybrid Array (Photovoltaic Wing + Dual RTG Auxiliary)',
    type: 'hybrid',
    costM: 210,
    massKg: 4200,
    generationKw: 38.0,
    dustVulnerability: 0.35,
    operationalLifetimeYears: 15,
    description: 'The premier balanced power architecture. The solar wing yields massive peak energy for scientific drills while the RTG maintains life-support minimums during storms.'
  }
];

export const BATTERY_SYSTEMS: BatterySystem[] = [
  {
    id: 'batt_liion',
    name: 'Space-Grade Lithium-Nickel-Cobalt Battery Bank',
    costM: 30,
    massKg: 1400,
    capacityKwh: 65,
    cycleLife: 3000,
    description: 'Proven energy density with thermal heating blankets. Adequate for standard diurnal cycle operations and day-night buffering.'
  },
  {
    id: 'batt_solidstate',
    name: 'Advanced Solid-State Ceramic Battery Core',
    costM: 70,
    massKg: 2100,
    capacityKwh: 140,
    cycleLife: 8000,
    description: 'Next-generation non-flammable solid electrolyte delivering more than double the energy storage capacity. Crucial for powering nocturnal life support and rover heating.'
  }
];

export const COMM_SYSTEMS: CommSystem[] = [
  {
    id: 'comm_xband',
    name: 'Medium-Gain X-Band Dish & Omnidirectional Array',
    costM: 25,
    massKg: 380,
    powerDrawKw: 1.2,
    bandwidthMbps: 4.5, // ~4.5 Mbps to Earth
    reliability: 0.98,
    description: 'Standard deep-space transponder. High mechanical reliability and weather penetration, but limited data transmission rate slows large hyperspectral dataset downlinks.'
  },
  {
    id: 'comm_kaband',
    name: 'High-Gain Ka-Band Steerable Reflector (2.4m)',
    costM: 55,
    massKg: 720,
    powerDrawKw: 2.8,
    bandwidthMbps: 35.0, // 35 Mbps
    reliability: 0.94,
    description: 'High-frequency microwave dish delivering ten times the downlink speed. Requires precise pointing gimbals to track Earth across orbital mechanics.'
  },
  {
    id: 'comm_optical',
    name: 'Deep-Space Optical Communications Laser Transceiver (DSOC)',
    costM: 110,
    massKg: 1150,
    powerDrawKw: 4.5,
    bandwidthMbps: 180.0, // 180 Mbps ultra-broadband
    reliability: 0.91,
    description: 'Near-infrared pulsed laser communications payload. Allows direct high-resolution video and raw multi-gigabyte drill core spectra transmission to Earth ground stations.'
  }
];

export const SCIENTIFIC_INSTRUMENTS: Instrument[] = [
  {
    id: 'inst_hires_cam',
    name: 'High-Resolution Orbital & Surface Imaging Camera (Hi-CAM)',
    category: 'imaging',
    costM: 45,
    massKg: 180,
    powerDrawKw: 0.8,
    dataPerObservationMb: 420,
    solTimeHours: 1.5,
    supportsObjectiveIds: ['obj_habitability', 'obj_geology', 'obj_climate'],
    description: 'Sub-millimeter close-up imager with stereo elevation mapping. Captures fine sedimentary laminations and rock textures.',
    scientificCapability: 'Resolves sedimentary grain structure, rock coatings, and microscopic volcanic vesicles.'
  },
  {
    id: 'inst_pancam',
    name: 'Panoramic Multispectral Mast Camera Suite',
    category: 'imaging',
    costM: 35,
    massKg: 120,
    powerDrawKw: 0.5,
    dataPerObservationMb: 250,
    solTimeHours: 1.0,
    supportsObjectiveIds: ['obj_habitability', 'obj_geology', 'obj_climate'],
    description: 'Mast-mounted stereo panoramic cameras with 12 distinct geological color filters. Maps outcrops and dust opacity.',
    scientificCapability: 'Identifies geological strata, terrain hazards, and measures atmospheric optical depth (tau).'
  },
  {
    id: 'inst_visir_spec',
    name: 'Visible & Near-Infrared Reflectance Spectrometer (VNIR)',
    category: 'spectroscopy',
    costM: 65,
    massKg: 260,
    powerDrawKw: 1.4,
    dataPerObservationMb: 680,
    solTimeHours: 2.5,
    supportsObjectiveIds: ['obj_habitability', 'obj_climate'],
    description: 'Pinpoints clay minerals (phyllosilicates), hydrated carbonates, and sulfates that only form in persistent aqueous conditions.',
    scientificCapability: 'Discriminates between alkaline, neutral, and acidic past water chemistry through mineral absorption bands.'
  },
  {
    id: 'inst_chemin',
    name: 'Mineralogical X-Ray Diffraction & Fluorescence Analyzer (XRD/XRF)',
    category: 'spectroscopy',
    costM: 85,
    massKg: 390,
    powerDrawKw: 2.1,
    dataPerObservationMb: 520,
    solTimeHours: 4.0,
    supportsObjectiveIds: ['obj_habitability', 'obj_geology'],
    description: 'Direct quantitative crystallography of crushed rock samples. Distinguishes primary igneous minerals from secondary aqueous alterations.',
    scientificCapability: 'Definitive quantitative mineral identification of olivine, pyroxene, plagioclase, hematite, and clays.'
  },
  {
    id: 'inst_radar',
    name: 'Ground-Penetrating Subsurface Radar Sounder (RIMFAX-II)',
    category: 'subsurface',
    costM: 70,
    massKg: 210,
    powerDrawKw: 1.8,
    dataPerObservationMb: 850,
    solTimeHours: 3.0,
    supportsObjectiveIds: ['obj_climate', 'obj_habitability'],
    description: 'High-frequency radar sounder penetrating up to 25 meters beneath the Martian surface to map buried stratigraphic layers and ice lenses.',
    scientificCapability: 'Discovers subsurface sediment layers, delta cross-bedding, and buried permafrost or ice sheets.'
  },
  {
    id: 'inst_drill',
    name: 'Rotary-Percussive Subsurface Core Drill (2-Meter Depth)',
    category: 'sampling',
    costM: 95,
    massKg: 580,
    powerDrawKw: 3.6,
    dataPerObservationMb: 120,
    solTimeHours: 5.0,
    supportsObjectiveIds: ['obj_habitability', 'obj_geology'],
    description: 'Heavy tungsten-carbide core drill capable of extracting pristine 10cm rock cores from beneath the radiation-damaged oxidizing surface veneer.',
    scientificCapability: 'Retrieves unweathered rock samples protected from UV photodegradation and surface perchlorates.'
  },
  {
    id: 'inst_sample_cache',
    name: 'Hermetic Sample Caching & Vault Containment Unit',
    category: 'sampling',
    costM: 55,
    massKg: 340,
    powerDrawKw: 0.6,
    dataPerObservationMb: 40,
    solTimeHours: 1.5,
    supportsObjectiveIds: ['obj_habitability', 'obj_geology', 'obj_climate'],
    description: 'Ultra-clean hermetically sealed titanium sample tube carrousel. Ensures samples can be safely returned to Earth laboratories.',
    scientificCapability: 'Preserves volatile gases, delicate mineral structures, and potential organic compounds for Earth return analysis.'
  },
  {
    id: 'inst_met_station',
    name: 'Martian Environmental & Meteorological Station (MEDA-Pro)',
    category: 'atmospheric',
    costM: 40,
    massKg: 110,
    powerDrawKw: 0.4,
    dataPerObservationMb: 180,
    solTimeHours: 0.5,
    supportsObjectiveIds: ['obj_climate'],
    description: 'Continuous monitoring of surface temperature, atmospheric pressure, relative humidity, UV radiation flux, and wind vectors.',
    scientificCapability: 'Records diurnal atmospheric pressure cycles, dust devil vortices, and seasonal polar CO2 freeze-thaw cycles.'
  },
  {
    id: 'inst_dust_sensor',
    name: 'Aerosol Optical & Dust Dynamics Particle Counter',
    category: 'atmospheric',
    costM: 30,
    massKg: 85,
    powerDrawKw: 0.3,
    dataPerObservationMb: 95,
    solTimeHours: 0.5,
    supportsObjectiveIds: ['obj_climate'],
    description: 'Laser nephelometer that tracks suspended airborne dust particle size distribution and electrostatic charging.',
    scientificCapability: 'Provides real-time warning for developing local dust storms and characterizes dust abrasive properties.'
  }
];

export const ROVER_SYSTEMS: RoverSystem[] = [
  {
    id: 'rover_scout',
    name: 'ARES-Scout: Agile Reconnaissance Buggy',
    costM: 85,
    massKg: 450,
    powerSystem: 'Solar-PV + 12kWh Li-Ion',
    batteryKwh: 12,
    speedKmPerHour: 0.35,
    instrumentSlots: 3,
    sampleCapacity: 8,
    dustTolerance: 'moderate',
    description: 'Compact 4-wheeled reconnaissance rover. Fast and nimble for scouting traverses, but carries a limited payload and fewer science slots.'
  },
  {
    id: 'rover_science_lab',
    name: 'CYDONIA: Heavy Mobile Astrobiology Lab',
    costM: 190,
    massKg: 1450,
    powerSystem: 'Multi-Mission RTG + 35kWh Solid-State Core',
    batteryKwh: 35,
    speedKmPerHour: 0.15,
    instrumentSlots: 6,
    sampleCapacity: 24,
    dustTolerance: 'high',
    description: 'A 6-wheeled robotic colossus equipped with a 2.1-meter robotic arm, continuous nuclear power, and an internal sample preparation chamber.'
  },
  {
    id: 'rover_explorer',
    name: 'HELIOS: Long-Range Autonomous Traverse Explorer',
    costM: 140,
    massKg: 920,
    powerSystem: 'Hybrid Solar-RTG + 22kWh Battery',
    batteryKwh: 22,
    speedKmPerHour: 0.25,
    instrumentSlots: 4,
    sampleCapacity: 16,
    dustTolerance: 'high',
    description: 'Balanced planetary rover featuring rocker-bogie suspension and autonomous hazard-avoidance vision navigation.'
  }
];
