import React from 'react';
import { MISSION_CHALLENGES } from '../data/aerospaceSpecs';
import { MissionChallenge } from '../types/missionDesigner';
import { Compass, Rocket, Shield, Award, Sparkles, ArrowRight, Zap, Target } from 'lucide-react';
import marsHeroImg from '../assets/images/spacecraft_interplanetary_1791520861443.jpg';

interface ChallengeSelectViewProps {
  onSelectChallenge: (challenge: MissionChallenge) => void;
  onSwitchToExpeditionMode?: () => void;
}

export const ChallengeSelectView: React.FC<ChallengeSelectViewProps> = ({ onSelectChallenge, onSwitchToExpeditionMode }) => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* Background Image Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={marsHeroImg}
          alt="NASA Mars Deep Space Expedition"
          className="w-full h-full object-cover object-center filter brightness-[0.32] contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/60" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 flex flex-col justify-center">
        {/* Top Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-orange-400 font-bold uppercase tracking-wider mb-2">
              <span>2026 NASA SPACE APPS CHALLENGE</span>
              <span>·</span>
              <span>SPACE MISSION DESIGNER</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase">
              GREEN BACKTIER: MARS EXPEDITION
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Every space mission is a high-stakes puzzle of competing demands. Balance launch vehicles,
              orbital mechanics, spacecraft mass, electrical power, and scientific instruments to engineer
              a complete mission from concept to the surface of Mars.
            </p>
          </div>
          {onSwitchToExpeditionMode && (
            <button
              onClick={onSwitchToExpeditionMode}
              className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-xs font-mono text-orange-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
            >
              <Rocket className="w-3.5 h-3.5 text-orange-400" />
              <span>Quick 3D Expedition</span>
            </button>
          )}
        </div>

        {/* Challenge Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {MISSION_CHALLENGES.map((challenge) => {
            const isSandbox = challenge.id === 'challenge_sandbox';
            return (
              <div
                key={challenge.id}
                onClick={() => onSelectChallenge(challenge)}
                className={`group relative p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSandbox
                    ? 'bg-slate-900/70 border-cyan-500/40 hover:border-cyan-400 hover:bg-slate-900/90'
                    : 'bg-slate-900/80 border-slate-800 hover:border-orange-500/70 hover:bg-slate-900/95 shadow-xl'
                }`}
              >
                <div>
                  {/* Category and Difficulty metadata (clean text, no pills) */}
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-orange-400 font-semibold tracking-wider uppercase">
                      {challenge.badge}
                    </span>
                    <span className="text-slate-400">
                      {challenge.difficulty} · Budget: <strong className="text-white">${challenge.budgetM}M</strong>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                    {challenge.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">
                    {challenge.subtitle}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                    {challenge.description}
                  </p>

                  {/* Primary Goals */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                      Key Engineering Objectives:
                    </div>
                    {challenge.primaryGoals.slice(0, 3).map((goal, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-orange-400 shrink-0 mt-0.5 font-mono">0{idx + 1}.</span>
                        <span>{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-6 pt-3 flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400">
                    Target Science: <span className="text-emerald-400 font-bold">{challenge.minScienceTarget}+ pts</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                    <span>Configure Spacecraft</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Youth-Friendly Concept Footer */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Designed for Students & Youth: Experiment with the real physics of space exploration.</span>
          </div>
          <div className="text-slate-500">
            Concept → Flight Operations → 3D Mars Surface EVA
          </div>
        </div>
      </div>
    </div>
  );
};
