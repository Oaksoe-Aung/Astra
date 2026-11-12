import React, { useState } from 'react';
import { MapPin, Rocket, ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import marsSurfaceImg from '../assets/images/jezero_crater_surface_1791520851410.jpg';

interface LandingSiteSelectProps {
  spacecraftId: string;
  objectiveId: string;
  onLaunch: (siteId: string) => void;
  onBack: () => void;
}

export const LandingSiteSelect: React.FC<LandingSiteSelectProps> = ({
  spacecraftId,
  objectiveId,
  onLaunch,
  onBack
}) => {
  const [selectedSite, setSelectedSite] = useState<string>('site_jezero');

  const SITES = [
    {
      id: 'site_jezero',
      name: 'Jezero Crater (Ancient Lake & Delta)',
      coords: '18.38°N 77.58°E',
      type: 'Ancient River Delta',
      desc: 'Fan-shaped river delta rich in layered clays and mudstones. Prime location to study ancient water and cache rock samples.',
      features: ['Layered Sandstone', 'Clay Minerals', 'Safe Landing Zone']
    },
    {
      id: 'site_gale',
      name: 'Gale Crater (Mount Sharp Foothills)',
      coords: '5.4°S 137.8°E',
      type: 'Sedimentary Strata',
      desc: 'Layered mountain base inside an impact basin. Sedimentary record reveals changing climate from water-rich to arid.',
      features: ['Sulfate Outcrops', 'Dune Fields', 'Rolling Terraces']
    },
    {
      id: 'site_valles',
      name: 'Valles Marineris (Chasma Plateau)',
      coords: '14.0°S 59.2°W',
      type: 'Canyon Escarpment',
      desc: 'Tectonic canyon plateau exposing deep basalt bedrock and crustal layers untouched by space radiation.',
      features: ['Basalt Bedrock', 'Deep Canyon Ridge', 'Eroded Boulder Fields']
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-slate-950 text-slate-100 select-none">
      {/* Background Surface Landscape */}
      <div className="absolute inset-0 z-0">
        <img
          src={marsSurfaceImg}
          alt="Mars Surface Landscape"
          className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col justify-center">
        {/* Step Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-bold uppercase tracking-wider mb-1">
            <span>EXPEDITION PLANNING</span>
            <span>·</span>
            <span>STEP 2 OF 2</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase">
            CHOOSE LANDING ZONE
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-xl">
            Select touchdown coordinates on the Martian surface. Touchdown immediately begins the 3D surface mission.
          </p>
        </div>

        {/* Landing Sites Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {SITES.map((site) => {
            const isSelected = selectedSite === site.id;
            return (
              <div
                key={site.id}
                onClick={() => setSelectedSite(site.id)}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-orange-950/70 border-orange-500 shadow-xl shadow-orange-950/50 ring-2 ring-orange-500/50'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-sm font-extrabold text-white">
                    <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`} />
                    <span>{site.name.split(' (')[0]}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />}
                </div>

                <div className="text-[11px] font-mono text-orange-300 mb-2">
                  {site.coords} · {site.type}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {site.desc}
                </p>

                <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1">
                  {site.features.map((feat, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono bg-slate-950/80 text-slate-400 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={onBack}
            className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Spacecraft</span>
          </button>

          <button
            onClick={() => onLaunch(selectedSite)}
            className="px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-extrabold rounded-xl shadow-xl shadow-orange-950/60 flex items-center gap-2 transition-all hover:scale-[1.03] cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>Launch Expedition to Mars</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
