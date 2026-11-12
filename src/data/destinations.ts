import { LandingSite } from '../types/mission';

export const LANDING_SITES: LandingSite[] = [
  {
    id: 'site_jezero',
    name: 'Jezero Crater (Ancient Lake & Delta)',
    coordinates: '18.38°N 77.58°E',
    elevationKm: -2.5,
    description: 'An ancient impact basin that held an open-system lake approximately 3.7 billion years ago, fed by an inlet river that deposited a magnificent clay-rich river delta.',
    geologicalFeatures: [
      'Fan-shaped river delta with distinct sediment layers',
      'Smectite and carbonate minerals known to preserve taphonomic signs',
      'Crater rim exposing deep crustal Noachian bedrock'
    ],
    terrainRisk: 0.35, // Manageable risk with terrain-relative navigation
    landingDifficulty: 'Moderate',
    dustStormRisk: 0.40,
    scientificInterest: 'Top priority for ancient habitability and aqueous mineral signatures. Delta sediments act as exceptional sedimentary traps.',
    recommendedObjectives: ['obj_habitability', 'obj_climate'],
    surfaceRockTypes: ['Mudstones', 'Clay-bearing sandstones', 'Carbonates', 'Crater-floor basalts']
  },
  {
    id: 'site_gale',
    name: 'Gale Crater (Mount Sharp / Aeolis Mons)',
    coordinates: '5.4°S 137.8°E',
    elevationKm: -4.5,
    description: 'A 154 km wide crater featuring a central 5 km high sedimentary mountain (Mount Sharp) recording millions of years of changing Martian climate in its stacked rock strata.',
    geologicalFeatures: [
      'Layered sulfate and clay transition strata',
      'Ancient stream and lakebed conglomerates',
      'Deep basin providing higher atmospheric density for parachute deceleration'
    ],
    terrainRisk: 0.30,
    landingDifficulty: 'Moderate',
    dustStormRisk: 0.35,
    scientificInterest: 'Unparalleled chronological record of Mars drying out over geological epochs as clays gave way to evaporite sulfates.',
    recommendedObjectives: ['obj_habitability', 'obj_geology', 'obj_climate'],
    surfaceRockTypes: ['Siltstones', 'Calcium sulfates', 'Iron oxides', 'Conglomerates']
  },
  {
    id: 'site_valles',
    name: 'Valles Marineris (Coprates Chasma Floor)',
    coordinates: '14.0°S 59.2°W',
    elevationKm: -3.8,
    description: 'The solar system’s grandest tectonic canyon system, stretching over 4,000 km. Canyon walls plunge 7 km deep, exposing billions of years of crustal stratigraphic history.',
    geologicalFeatures: [
      'Massive landslide debris and layered interior deposits',
      'Recurrent Slope Lineae (RSL) seasonal streaks on sunny slopes',
      'Extreme cliff walls creating localized thermal wind shear'
    ],
    terrainRisk: 0.65,
    landingDifficulty: 'Demanding',
    dustStormRisk: 0.50,
    scientificInterest: 'Deepest natural cross-section of the Martian crust anywhere on the planet; unique access to primordial volcanic strata.',
    recommendedObjectives: ['obj_geology'],
    surfaceRockTypes: ['Deep crustal basalts', 'Layered sulfates', 'Hematite spherules', 'Volcanic breccia']
  },
  {
    id: 'site_olympus',
    name: 'Olympus Mons (East Flank Caldera Apron)',
    coordinates: '18.65°N 226.2°E',
    elevationKm: 1.8, // High elevation means razor-thin atmosphere!
    description: 'The colossal shield volcano towering 21.9 km above Martian datum. The flank apron exposes basaltic lava tubes, collapsed pit chains, and pristine volcanic flow lobes.',
    geologicalFeatures: [
      'Vast basaltic lava tube networks offering natural radiation shielding',
      'Fresh pahoehoe and aa-type lava flow margins',
      'High elevation severely degrades parachute aerodynamic braking'
    ],
    terrainRisk: 0.75,
    landingDifficulty: 'Extreme',
    dustStormRisk: 0.25,
    scientificInterest: 'Decisive study of Martian mantle plumes, hotspot volcanism, and subterranean lava tube shelter feasibility.',
    recommendedObjectives: ['obj_geology'],
    surfaceRockTypes: ['Tholeiitic basalts', 'Porphyritic olivine basalt', 'Scoria', 'Volcanic glass']
  },
  {
    id: 'site_ice_plains',
    name: 'Utopia Planitia (Subsurface Ice Sheets)',
    coordinates: '46.7°N 117.5°E',
    elevationKm: -3.5,
    description: 'Vast northern lowlands concealing a massive subsurface water ice deposit as large as Lake Superior beneath 1 to 10 meters of protective lithic regolith.',
    geologicalFeatures: [
      'Periglacial patterned ground, polygonal cracking, and scallop depressions',
      'Massive subsurface excess ice lens detectable via radar',
      'Subzero polar climate with harsh winter frost cycles'
    ],
    terrainRisk: 0.45,
    landingDifficulty: 'Demanding',
    dustStormRisk: 0.55,
    scientificInterest: 'Direct investigation of Martian cryosphere, paleoclimate ice ages, and prime reservoir for future in-situ propellant water extraction.',
    recommendedObjectives: ['obj_climate'],
    surfaceRockTypes: ['Ice-cemented regolith', 'Periglacial diamictons', 'Basaltic dust mantles']
  }
];
