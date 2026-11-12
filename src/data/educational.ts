export interface ScienceTopic {
  id: string;
  category: 'Planetary Facts' | 'Ancient Mars' | 'Geology & Rocks' | 'Water & Volatiles' | 'Atmosphere & Dust' | 'Human Missions';
  title: string;
  summary: string;
  fullExplanation: string[];
  keyTakeaway: string;
  nasaResourceTitle: string;
  nasaResourceUrl: string;
}

export const SCIENCE_TOPICS: ScienceTopic[] = [
  {
    id: 'topic_mars_overview',
    category: 'Planetary Facts',
    title: 'Mars at a Glance: Orbital & Physical Characteristics',
    summary: 'The fourth planet from the Sun, Mars is roughly half the diameter of Earth, with ~38% of Earth’s surface gravity and a day (sol) of 24 hours 39 minutes.',
    fullExplanation: [
      'Mars orbits at an average distance of 1.52 Astronomical Units (AU) (~228 million km) from the Sun, receiving only about 43% of the solar irradiance that reaches Earth.',
      'A Martian year lasts 687 Earth days (~668.6 Martian sols). Its axial tilt of 25.2° is very similar to Earth’s 23.4°, creating familiar seasonal changes, though its eccentric orbit makes southern summers significantly warmer and shorter than northern ones.',
      'Surface gravity on Mars is 3.72 m/s² (0.38 g). A 100 kg spacesuit and human crew member weighs only 38 kg-force on the surface, altering mobility and rover mechanics.',
      'Mars has two small, irregularly shaped moons—Phobos (22 km) and Deimos (12 km)—which are likely captured asteroids or remnants of a giant ancient impact.'
    ],
    keyTakeaway: 'Low gravity eases surface ascent delta-V requirements, but reduced solar radiation and cold temperatures demand substantial power and thermal engineering.',
    nasaResourceTitle: 'NASA Science: Mars Facts & Planetary Overview',
    nasaResourceUrl: 'https://science.nasa.gov/mars/facts/'
  },
  {
    id: 'topic_ancient_habitability',
    category: 'Ancient Mars',
    title: 'Habitability vs. Life: What Science Actually Seeks',
    summary: 'Planetary scientists search for ancient habitable environments—places that possessed water, energy, and chemistry—not direct living microbes.',
    fullExplanation: [
      'Evidence from orbital spectrometers and surface rovers (Opportunity, Curiosity, Perseverance) confirms that during the Noachian and early Hesperian periods (3.5 to 4.1 billion years ago), Mars harbored persistent lakes, river valleys, and alluvial deltas.',
      'Sediments in Jezero and Gale craters show layered mudstones and smectite clays that formed in fresh, neutral-to-alkaline water—conditions friendly to known microbial biology.',
      'Crucial distinction: Finding evidence of habitability means the physical environment COULD have sustained life. It does NOT prove that life ever originated or existed.',
      'Confirming ancient life requires returning intact, uncontaminated rock samples to Earth for atomic-scale isotopic and micro-paleontological analyses that cannot be performed by mini-rover sensors alone.'
    ],
    keyTakeaway: 'In science, habitability means an environment met the physical preconditions for life. Proof of past life requires rigorous biosignature criteria verified in terrestrial laboratories.',
    nasaResourceTitle: 'NASA Mars Exploration: Science Goals on Past Habitability',
    nasaResourceUrl: 'https://science.nasa.gov/planetary-science/programs/mars-exploration/science-goals/'
  },
  {
    id: 'topic_geology_rocks',
    category: 'Geology & Rocks',
    title: 'Martian Petrology: Basalts, Clays, and Sulfates',
    summary: 'Mars is largely a volcanic world covered in fine iron-oxide dust (rust). Its rock layers preserve billions of years of solar system history without plate tectonic recycling.',
    fullExplanation: [
      'The reddish tint of Mars is caused by pervasive ferric iron oxide dust (hematite and nanophase iron oxides) coating the bedrock and mixed into the regolith.',
      'Most Martian bedrock consists of dark, dense volcanic basalt rich in iron, magnesium, olivine, and pyroxene, produced by volcanic eruptions from giant shield volcanoes like Olympus Mons and Elysium Mons.',
      'Unlike Earth, Mars lacks active plate tectonics. Without plate recycling, the crust preserves ancient impact basins and geological structures dating back to the birth of the inner solar system 4.5 billion years ago.',
      'Over time, as the climate became colder and more acidic, volcanic gases (sulfur dioxide) reacted with evaporating water to precipitate vast beds of hydrated sulfates (gypsum, kieserite), creating distinctive layered rock records.'
    ],
    keyTakeaway: 'Mars provides a pristine window into the early geological evolution of terrestrial planets that plate tectonics has completely erased from Earth.',
    nasaResourceTitle: 'NASA Mars Reconnaissance Orbiter: Mineral & Rock Highlights',
    nasaResourceUrl: 'https://science.nasa.gov/mission/mars-reconnaissance-orbiter/science-highlights/'
  },
  {
    id: 'topic_water_ice',
    category: 'Water & Volatiles',
    title: 'Martian Water: Ice Caps, Subsurface Glaciers, and Triple-Point Physics',
    summary: 'Liquid water cannot remain stable on the modern Martian surface because the atmospheric pressure is near or below the triple point of water.',
    fullExplanation: [
      'Average surface atmospheric pressure on Mars is ~610 Pascals (6.1 millibars), which is right at the triple point of water (611.65 Pa). Below this pressure, liquid water cannot exist in equilibrium—it boils directly into vapor or freezes into solid ice.',
      'Substantial water survives on Mars today, but almost entirely locked in perennial polar ice caps and widespread subsurface permafrost sheets covered by protective lithic dust.',
      'Ground-penetrating radar on missions like MRO (SHARAD) has identified massive pure ice sheets in Utopia Planitia and Arcadia Planitia, in some places just 1 to 2 meters beneath the dry dust mantle.',
      'For future human missions, these subsurface ice reservoirs represent critical In-Situ Resource Utilization (ISRU) assets: water can be melted for drinking, radiation shielding, and split into hydrogen and oxygen rocket propellant.'
    ],
    keyTakeaway: 'Water is abundant on Mars as solid ice, but modern atmospheric physics prevents open liquid ponds. Accessing water requires subsurface drilling or thermal melting.',
    nasaResourceTitle: 'NASA Science: Water on Mars Overview',
    nasaResourceUrl: 'https://science.nasa.gov/mars/facts/'
  },
  {
    id: 'topic_atmosphere_storms',
    category: 'Atmosphere & Dust',
    title: 'The Thin Atmosphere & Continental Dust Storms',
    summary: 'Mars’ atmosphere is 95% carbon dioxide and less than 1% as dense as Earth’s, yet powerful thermal winds lift fine dust into planet-encircling storms.',
    fullExplanation: [
      'The thin atmosphere provides minimal thermal insulation, causing extreme diurnal temperature swings from +20°C at noon at the equator down to -100°C at night.',
      'Because Mars has no global magnetic field, its upper atmosphere has been gradually stripped by solar wind ions over billions of years, a process actively studied by NASA’s MAVEN mission.',
      'When southern spring warms the surface, strong atmospheric convection cells trigger massive dust devils and regional dust storms. Occasionally, these merge into global dust storms that engulf the entire planet for months.',
      'Dust storms severely reduce sunlight (increasing optical depth tau from 0.5 to over 8.0), cutting solar panel output by 80-95% and coating optical lenses, as demonstrated by the loss of the Opportunity rover in 2018.'
    ],
    keyTakeaway: 'Dust storms threaten solar-powered architectures. Missions relying on solar arrays must include battery buffers, RTG supplements, or automated dust-cleaning procedures.',
    nasaResourceTitle: 'NASA Science: Dust Storms on Mars Report',
    nasaResourceUrl: 'https://science.nasa.gov/resource/mars-report-dust-storms-on-mars/'
  },
  {
    id: 'topic_human_engineering',
    category: 'Human Missions',
    title: 'Human Expedition Physics: The Return Delta-V Constraint',
    summary: 'Getting to Mars is only half the engineering challenge: returning safely requires reserving substantial propellant, life support, and launch stages.',
    fullExplanation: [
      'A one-way trip to Mars requires ~3,600 to 4,200 m/s of Trans-Mars Injection (TMI) delta-V from Low Earth Orbit, followed by atmospheric entry, descent, and landing (EDL).',
      'Atmospheric entry requires a massive thermal protection heat shield and supersonic parachutes or retro-propulsion (powered landing), because Mars’ atmosphere is thick enough to generate severe heat yet too thin to stop a heavy craft on parachutes alone.',
      'Ascending from the Martian surface back to orbit requires ~4,100 m/s of delta-V, plus another ~1,400 m/s for Trans-Earth Injection (TEI) to send the crew home.',
      'If an expedition lands on Mars without the propellant, ascent vehicle, or life-support consumables needed for the 200-day return journey, the crew is permanently stranded. Safe mission design mandates coupled return planning.'
    ],
    keyTakeaway: 'A Mars mission is fundamentally a closed-loop round-trip equation. Landing is not mission completion; safe ascent and Earth insertion are mandatory requirements.',
    nasaResourceTitle: 'NASA Human Exploration: Journey to Mars Architecture',
    nasaResourceUrl: 'https://science.nasa.gov/planetary-science/programs/mars-exploration/'
  }
];
