// Mars Science & NASA Data Provider Abstraction Layer
// Completely functional without any external API keys or network connectivity.

export interface MarsTelemetryPoint {
  sol: number;
  season: string; // e.g. "Ls 180° - Autumn"
  airTemperatureMinC: number;
  airTemperatureMaxC: number;
  groundTemperatureC: number;
  pressurePascals: number;
  windSpeedMps: number;
  opticalDepthTau: number; // Atmospheric dust opacity
}

export interface ScienceDataProvider {
  mode: 'demo' | 'live';
  getLatestTelemetry(): Promise<MarsTelemetryPoint>;
  getSiteGeologySummary(siteId: string): Promise<string>;
}

// Calibrated reference dataset grounded in NASA Curiosity/Perseverance environmental science reports
const DEMO_TELEMETRY: MarsTelemetryPoint = {
  sol: 1042,
  season: 'Ls 142° (Late Northern Summer)',
  airTemperatureMinC: -78.4,
  airTemperatureMaxC: -14.2,
  groundTemperatureC: -8.5,
  pressurePascals: 745.2, // ~7.45 mbar
  windSpeedMps: 4.8,
  opticalDepthTau: 0.58 // Normal clear sky
};

class DemoMarsDataProvider implements ScienceDataProvider {
  mode: 'demo' = 'demo';

  async getLatestTelemetry(): Promise<MarsTelemetryPoint> {
    // Add realistic subtle diurnal variation
    const jitter = (Math.random() - 0.5) * 2;
    return {
      ...DEMO_TELEMETRY,
      pressurePascals: Math.round((DEMO_TELEMETRY.pressurePascals + jitter * 5) * 10) / 10,
      airTemperatureMaxC: Math.round((DEMO_TELEMETRY.airTemperatureMaxC + jitter) * 10) / 10
    };
  }

  async getSiteGeologySummary(siteId: string): Promise<string> {
    switch (siteId) {
      case 'site_jezero':
        return 'Jezero Crater features an ancient fluvio-lacustrine delta with smectite clays and magnesium carbonates, prime for biosignature preservation taphonomy.';
      case 'site_gale':
        return 'Gale Crater exhibits an exposed 5-km sedimentary mound (Aeolis Mons) capturing the Hesperian drying epoch through stacked clay-to-sulfate transitions.';
      case 'site_valles':
        return 'Valles Marineris provides a 7-km structural vertical window into early Noachian volcanic crust and basaltic plateau formation.';
      case 'site_olympus':
        return 'Olympus Mons represents the largest shield volcano in the Solar System, exposing low-viscosity tholeiitic basalt flows with natural lava tube conduits.';
      case 'site_ice_plains':
        return 'Utopia Planitia conceals extensive subsurface excess water ice sheets under 1-2 meters of protective regolith, verified by orbital radar sounders.';
      default:
        return 'Planetary surface characterized by iron-oxide rich basaltic regolith under thin carbon dioxide atmosphere.';
    }
  }
}

export const marsDataProvider: ScienceDataProvider = new DemoMarsDataProvider();
