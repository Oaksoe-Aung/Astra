import { SpacecraftArchetype } from '../types/mission';

export const SPACECRAFT_ARCHETYPES: SpacecraftArchetype[] = [
  {
    id: 'kestrel',
    name: 'KESTREL',
    codeName: 'SC-100 Light Expedition',
    classification: 'Light Reconnaissance & Fast Transit Architecture',
    description: 'A compact, hyper-lean expedition architecture designed around low dry mass and high cost efficiency. Demands meticulous resource rationing and offers virtually zero redundancy buffer.',
    baseCostM: 420,
    dryMassKg: 28500,
    maxPayloadMassKg: 16000,
    maxPropellantMassKg: 85000,
    maxCrewCapacity: 3,
    baselineReliability: 0.88,
    basePowerCapacityKw: 18.0,
    upgradeSlots: 4,
    advantages: [
      'Lowest procurement cost ($420M) allows rich instrument investment',
      'Lower total mass reduces delta-V propellant requirements',
      'Rapid turnaround and maneuverability'
    ],
    disadvantages: [
      'Strict 16,000 kg payload ceiling limits heavy scientific rigs',
      'Tight life-support volume; maximum 3 crew members',
      'Zero structural redundancy for major system faults'
    ],
    svgIcon: 'kestrel'
  },
  {
    id: 'odyssey',
    name: 'ODYSSEY',
    codeName: 'SC-250 Balanced Explorer',
    classification: 'Modular Deep-Space Transport & Surface Habitation Platform',
    description: 'The benchmark mission architecture balancing procurement economics against robust payload capacity and life-support margin. Built with dual modular rings and resilient multi-redundant bus.',
    baseCostM: 680,
    dryMassKg: 46000,
    maxPayloadMassKg: 28000,
    maxPropellantMassKg: 140000,
    maxCrewCapacity: 4,
    baselineReliability: 0.94,
    basePowerCapacityKw: 32.0,
    upgradeSlots: 6,
    advantages: [
      'Generous 28,000 kg payload capacity accommodates rover and full instrument suite',
      'Dual life-support recyclers support crew of 4 comfortably',
      'Excellent power bus flexibility and moderate mass penalty'
    ],
    disadvantages: [
      'Higher procurement cost ($680M) requires careful equipment budgeting',
      'Higher propellant mass needed for Mars Orbit Insertion and ascent maneuvers'
    ],
    svgIcon: 'odyssey'
  },
  {
    id: 'titan',
    name: 'TITAN',
    codeName: 'SC-500 Heavy Expedition',
    classification: 'Long-Duration Heavy Surface Base & High-Throughput Explorer',
    description: 'A massive interplanetary transit dreadnought with reinforced micrometeorite hull, high-volume pressurized habitat, extensive lab workstations, and substantial propellant tankage.',
    baseCostM: 980,
    dryMassKg: 78000,
    maxPayloadMassKg: 48000,
    maxPropellantMassKg: 240000,
    maxCrewCapacity: 6,
    baselineReliability: 0.97,
    basePowerCapacityKw: 55.0,
    upgradeSlots: 8,
    advantages: [
      'Massive 48,000 kg payload capacity allows heavy rovers, drills, and vaults',
      'Accommodates up to 6 crew with triple redundant life support systems',
      'Highest structural integrity and radiation shielding rating'
    ],
    disadvantages: [
      'Highest base price ($980M) consumes nearly half of standard mission budget',
      'Massive propellant demand (up to 240,000 kg) heavily inflates total mission wet mass'
    ],
    svgIcon: 'titan'
  }
];
