import { Objective } from '../types/mission';

export const SCIENTIFIC_OBJECTIVES: Objective[] = [
  {
    id: 'obj_habitability',
    title: 'Find the Clues of an Ancient Habitable Mars',
    shortTitle: 'Ancient Habitability',
    tagline: 'Seek geological and geochemical biosignature contexts in ancient water-carved strata.',
    description: 'Investigate whether ancient environmental conditions on Mars could have sustained microbial life billions of years ago. You will target fine sedimentary layers, aqueous clay minerals, and extract drill cores from rock formations shielded from sterilizing surface radiation.',
    scientificGoal: 'Determine if ancient Mars possessed standing liquid water with neutral pH, bio-essential elements (C, H, N, O, P, S), and persistent energy sources capable of sustaining life.',
    requiredInstrumentIds: ['inst_hires_cam', 'inst_visir_spec', 'inst_chemin', 'inst_drill', 'inst_sample_cache'],
    recommendedSiteIds: ['site_jezero', 'site_gale'],
    targetMilestones: [
      {
        id: 'ms_delta_survey',
        label: 'Delta Sedimentary Stratigraphy Survey',
        points: 20,
        description: 'Document fine grain laminations indicating quiescent lake deposition rather than turbulent flash floods.',
        achieved: false
      },
      {
        id: 'ms_clay_minerals',
        label: 'Aqueous Clay & Smectite Confirmation',
        points: 25,
        description: 'Spectroscopically verify phyllosilicates formed in neutral-to-alkaline long-duration water environments.',
        achieved: false
      },
      {
        id: 'ms_pristine_core',
        label: 'Deep Rock Core Extraction & Hermetic Caching',
        points: 30,
        description: 'Drill and seal a 10cm rock core from beneath the oxidized radiation-damaged surface layer.',
        achieved: false
      },
      {
        id: 'ms_biosig_context',
        label: 'Geochemical Biosignature Context Analysis',
        points: 25,
        description: 'Measure organic carbon associations and mineral textures with potential biogenic taphonomy.',
        achieved: false
      }
    ],
    educationalTakeaway: 'Crucial Scientific Distinction: Evidence of past habitability (benign water, nutrients, energy) is NOT proof that microbial life ever existed. Confirming habitability establishes that life was possible, which guides future sample return laboratory tests.',
    estimatedDurationSols: 45,
    sciencePotential: 100
  },
  {
    id: 'obj_geology',
    title: 'Investigate Unique Martian Rocks and Minerals',
    shortTitle: 'Martian Petrology',
    tagline: 'Characterize Martian igneous, metamorphic, and planetary differentiation processes.',
    description: 'Mars is a one-plate planetary laboratory where ancient volcanic structures and primordial crust remain un-recycled by Earth-style plate tectonics. Characterize planetary mantle chemistry, volcanic evolution, and distinctive Martian rock types.',
    scientificGoal: 'Analyze pristine mantle and crustal rock samples across diverse geological epochs to reconstruct Martian thermal evolution and crustal petrogenesis.',
    requiredInstrumentIds: ['inst_hires_cam', 'inst_pancam', 'inst_chemin', 'inst_drill', 'inst_sample_cache'],
    recommendedSiteIds: ['site_valles', 'site_olympus', 'site_gale'],
    targetMilestones: [
      {
        id: 'ms_basalt_survey',
        label: 'Primary Igneous Outcrop Petrology',
        points: 20,
        description: 'Map crystal grain distributions in pristine tholeiitic and olivine-rich flood basalts.',
        achieved: false
      },
      {
        id: 'ms_xrd_analysis',
        label: 'Definitive XRD Quantitative Mineralogy',
        points: 25,
        description: 'Quantify lattice parameters of pyroxenes and plagioclase to determine magma cooling rates.',
        achieved: false
      },
      {
        id: 'ms_mantle_xenoliths',
        label: 'Deep Crustal Xenolith Sampling',
        points: 30,
        description: 'Identify and core deep mantle nodules brought to the surface during explosive caldera eruptions.',
        achieved: false
      },
      {
        id: 'ms_alteration_ratios',
        label: 'Volcanic Hydrothermal Alteration Mapping',
        points: 25,
        description: 'Analyze fumarolic mineral deposits where ancient volcanic heat interacted with localized groundwater.',
        achieved: false
      }
    ],
    educationalTakeaway: 'Martian rocks share volcanic origins with Earth’s basalts, but Mars cooled faster and lacks subduction zones. Consequently, rocks on Mars preserve pristine 4-billion-year-old crustal chemistry that has been destroyed on Earth by plate tectonics.',
    estimatedDurationSols: 40,
    sciencePotential: 100
  },
  {
    id: 'obj_climate',
    title: 'Reconstruct Mars’ Climate and Water History',
    shortTitle: 'Paleoclimate & Volatiles',
    tagline: 'Trace the planetary transition from a wet, denser atmosphere to the cold, dry desert of today.',
    description: 'Investigate how Mars lost the majority of its ancient atmosphere and surface water. Examine ice deposits, layered sulfate evaporites formed as lakes dried up, and modern dust-atmospheric coupling.',
    scientificGoal: 'Quantify volatile inventories, paleoclimate transitions recorded in sedimentary cycles, and modern atmospheric escape mechanisms.',
    requiredInstrumentIds: ['inst_pancam', 'inst_visir_spec', 'inst_radar', 'inst_met_station', 'inst_dust_sensor'],
    recommendedSiteIds: ['site_gale', 'site_ice_plains', 'site_jezero'],
    targetMilestones: [
      {
        id: 'ms_sediment_cyclicity',
        label: 'Milankovitch Climatic Layering Correlation',
        points: 20,
        description: 'Detect rhythmic bedding in sedimentary stacks caused by Martian orbital obliquity oscillations.',
        achieved: false
      },
      {
        id: 'ms_radar_subsurface',
        label: 'Radar Sounding of Buried Ice Strata',
        points: 25,
        description: 'Map dielectric contrast layers revealing subsurface water ice sheets and paleolake bed depths.',
        achieved: false
      },
      {
        id: 'ms_sulfate_evaporites',
        label: 'Acidic Evaporite Sequence Chronology',
        points: 25,
        description: 'Analyze polyhydrated magnesium and iron sulfates that mark the grand planetary drying transition.',
        achieved: false
      },
      {
        id: 'ms_dust_dynamics',
        label: 'Atmospheric Boundary Layer Dust Profiling',
        points: 30,
        description: 'Record solar diurnal pressure fluxes and aerosol opacity to calibrate planetary wind circulation models.',
        achieved: false
      }
    ],
    educationalTakeaway: 'Modern Mars has a thin CO2 atmosphere (less than 1% of Earth’s sea level pressure) where liquid water quickly boils or freezes. Ancient Mars had sufficient atmospheric pressure and greenhouse warmth for rivers and lakes, lost primarily due to solar wind stripping after Mars lost its global magnetic dynamo.',
    estimatedDurationSols: 50,
    sciencePotential: 100
  }
];
