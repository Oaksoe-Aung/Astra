import React, { useState } from 'react';
import { Rocket, Shield, Compass, ChevronRight, CheckCircle2 } from 'lucide-react';
import marsHeroImg from '../assets/images/spacecraft_interplanetary_1791520861443.jpg';

interface ExpeditionSetupProps {
  onComplete: (spacecraftId: string, objectiveId: string) => void;
  onSwitchToEngineeringMode?: () => void;
}

export const ExpeditionSetup: React.FC<ExpeditionSetupProps> = ({ onComplete, onSwitchToEngineeringMode }) => {
  const [selectedCraft, setSelectedCraft] = useState<string>('odyssey');
  const [selectedObjective, setSelectedObjective] = useState<string>('obj_habitability');

  const CRAFT_OPTIONS = [
    {
      id: 'kestrel',
      name: 'KESTREL',
      role: 'Light Reconnaissance',
      desc: 'Compact high-thrust lander for rapid surface exploration and fast return.',
      tag: 'Agile & Fast',
      crew: '2 Crew',
      rover: 'Light Rover'
    },
    {
      id: 'odyssey',
      name: 'ODYSSEY',
      role: 'Planetary Explorer (Recommended)',
      desc: 'Balanced long-range expedition lander equipped with the 6-wheel all-terrain rover.',
      tag: 'Most Balanced',
      crew: '4 Crew',
      rover: 'Explorer Rover'
    },
    {
      id: 'titan',
      name: 'TITAN',
      role: 'Heavy Surface Outpost',
      desc: 'Heavy cargo lander with extended life support for comprehensive geologic field survey.',
      tag: 'Extended Life Support',
      crew: '6 Crew',
      rover: 'Heavy Rover'
    }
  ];

  const OBJECTIVE_OPTIONS = [
    {
      id: 'obj_habitability',
      title: 'Ancient Water & Habitability',
      badge: 'Hydrology',
      desc: 'Search ancient sedimentary rock layers for mineral evidence of liquid water lakes.'
    },
    {
      id: 'obj_geology',
      title: 'Volcanic Geology & Crust',
      badge: 'Geology',
      desc: 'Drill bedrock cores to study primordial volcanic basalt and Martian crustal history.'
    },
    {
      id: 'obj_climate',
      title: 'Atmosphere & Paleoclimate',
      badge: 'Atmosphere',
      desc: 'Investigate clay deposits to understand how Mars transitioned from wet to cold desert.'
    }
  ];

  const handleNext = () => {
    onComplete(selectedCraft, selectedObjective);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-slate-950 text-slate-100 select-none">
      {/* Background Image Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={marsHeroImg}
          alt="Mars Spacecraft"
          className="w-full h-full object-cover object-center filter brightness-[0.4] contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col justify-center">
        {/* Step Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-bold uppercase tracking-wider mb-1">
              <span>EXPEDITION PLANNING</span>
              <span>·</span>
              <span>STEP 1 OF 2</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase">
              RED FRONTIER
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-xl">
              Configure your spacecraft and primary scientific objective before departure.
            </p>
          </div>
          {onSwitchToEngineeringMode && (
            <button
              onClick={onSwitchToEngineeringMode}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Aerospace Deck</span>
            </button>
          )}
        </div>

        {/* 1. Spacecraft Architecture Picker */}
        <div className="mb-6">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
            1. Select Spacecraft Architecture
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CRAFT_OPTIONS.map((craft) => {
              const isSelected = selectedCraft === craft.id;
              return (
                <div
                  key={craft.id}
                  onClick={() => setSelectedCraft(craft.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-orange-950/60 border-orange-500 shadow-lg shadow-orange-950/40 ring-1 ring-orange-400/50'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-white font-mono flex items-center gap-1.5">
                      <Rocket className={`w-4 h-4 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`} />
                      <span>{craft.name}</span>
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {craft.tag}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-orange-300 mb-1">{craft.role}</div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{craft.desc}</p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{craft.crew}</span>
                    <span>{craft.rover}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Scientific Objective Picker */}
        <div className="mb-8">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
            2. Primary Scientific Objective
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {OBJECTIVE_OPTIONS.map((obj) => {
              const isSelected = selectedObjective === obj.id;
              return (
                <div
                  key={obj.id}
                  onClick={() => setSelectedObjective(obj.id)}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/50'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Compass className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{obj.title}</span>
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{obj.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Next Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Selected: <strong className="text-white">{CRAFT_OPTIONS.find(c => c.id === selectedCraft)?.name}</strong> · <span className="text-emerald-400">{OBJECTIVE_OPTIONS.find(o => o.id === selectedObjective)?.title}</span>
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-orange-950/50 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Proceed to Landing Site</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
