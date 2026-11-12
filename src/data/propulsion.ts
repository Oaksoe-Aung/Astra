import { PropulsionSystem, PropellantOption } from '../types/mission';

export const PROPELLANT_OPTIONS: Record<string, PropellantOption> = {
  methalox: {
    type: 'methalox',
    name: 'Liquid Methane / Liquid Oxygen (Methalox)',
    densityKgPerM3: 830,
    boiloffRatePerMonth: 0.005, // 0.5% boiloff per month with passive cryocooling
    costPerTonM: 0.8, // 0.8M per 10,000 kg ($80/kg)
    description: 'High-density storable cryogen with modest boil-off characteristics. Compatible with conceptual Martian in-situ resource utilization (ISRU) Sabatier chemistry.'
  },
  liquid_hydrogen: {
    type: 'liquid_hydrogen',
    name: 'Liquid Hydrogen / Liquid Oxygen (Hydrolox / LH2)',
    densityKgPerM3: 71,
    boiloffRatePerMonth: 0.035, // 3.5% boiloff per month
    costPerTonM: 1.4,
    description: 'Ultra-low molecular weight working fluid delivering extreme specific impulse. Requires bulky vacuum insulated tanks and active cryocooling to mitigate boil-off.'
  },
  xenon: {
    type: 'xenon',
    name: 'High-Pressure Xenon Gas',
    densityKgPerM3: 1600,
    boiloffRatePerMonth: 0.0, // Non-cryogenic gas
    costPerTonM: 4.5,
    description: 'Heavy noble gas utilized in electrostatic ion thrusters. Chemically inert and storable indefinitely at room temperature, but expensive per kilogram.'
  }
};

export const PROPULSION_SYSTEMS: PropulsionSystem[] = [
  {
    id: 'chem_raptor',
    name: 'Aero-Chemical Methalox Cluster',
    type: 'chemical',
    compatiblePropellant: 'methalox',
    costM: 140,
    dryMassKg: 4200,
    thrustKn: 4400,
    ispSeconds: 380,
    powerDrawKw: 1.2,
    nominalTransitDays: 210, // ~7 months
    reliability: 0.95,
    description: 'Clustered staged-combustion rocket engines burning liquid oxygen and methane. High thrust enables short burns for Earth departure (TMI) and Mars orbital capture.',
    tradeOffNote: 'High thrust allows fast burns and efficient Oberth effect maneuvers, but lower specific impulse (380s) requires substantial propellant mass.'
  },
  {
    id: 'ntp_cerberus',
    name: 'Nuclear Thermal Propulsion (NTP Core)',
    type: 'ntp',
    compatiblePropellant: 'liquid_hydrogen',
    costM: 320,
    dryMassKg: 8900,
    thrustKn: 1100,
    ispSeconds: 900,
    powerDrawKw: 3.5,
    nominalTransitDays: 140, // ~4.6 months (fast transit)
    reliability: 0.91,
    description: 'A conceptual solid-core nuclear reactor that superheats cryogenic liquid hydrogen working fluid. Yields more than double the propellant efficiency of chemical rockets.',
    tradeOffNote: 'Cuts outbound transit time to ~140 days, dramatically reducing crew radiation and life-support consumption, but carries higher development cost and LH2 tank volume requirements.'
  },
  {
    id: 'sep_ion',
    name: 'Solar-Electric Ion Propulsion Grid (SEP)',
    type: 'sep',
    compatiblePropellant: 'xenon',
    costM: 210,
    dryMassKg: 3100,
    thrustKn: 12, // Continuous micro-thrust
    ispSeconds: 3800,
    powerDrawKw: 24.0, // Substantial electric power draw
    nominalTransitDays: 320, // ~10.6 months spiral trajectory
    reliability: 0.96,
    description: 'Multi-megawatt Hall-effect ion propulsion grid accelerating xenon ions with electrostatic fields. Astounding 3,800s specific impulse minimizes required fuel mass.',
    tradeOffNote: 'Extremely high specific impulse means tiny fuel mass, but continuous low-thrust spiral trajectory lengthens interplanetary transit to 320 days, multiplying crew consumable requirements.'
  }
];
