import React from 'react';
import { MissionDebrief } from '../types/mission';
import { Trophy, RotateCcw, CheckCircle2, Award, Compass, Sparkles, Scale, Zap, Shield, ArrowRight } from 'lucide-react';

interface DebriefScreenProps {
  debrief: MissionDebrief;
  onNewExpedition: () => void;
}

export const DebriefScreen: React.FC<DebriefScreenProps> = ({
  debrief,
  onNewExpedition
}) => {
  const isCompleteSuccess = debrief.outcome === 'complete_success' || debrief.scores.overallScore >= 70;

  // Grade calculation
  const score = debrief.scores.overallScore;
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'NEEDS REDESIGN';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center px-4 py-10 select-none font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-orange-400 font-bold uppercase tracking-wider">
            <span>2026 NASA SPACE APPS CHALLENGE</span>
            <span>·</span>
            <span>MISSION EVALUATION & SCIENTIFIC DEBRIEF</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight">
            MISSION REPORT
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Comprehensive aerospace evaluation of your mission design, flight operations, and surface exploration.
          </p>
        </div>

        {/* Verdict Card */}
        <div
          className={`p-6 rounded-2xl border text-left shadow-2xl transition-all ${
            isCompleteSuccess
              ? 'bg-slate-900/90 border-emerald-500/50'
              : 'bg-slate-900/90 border-orange-500/50'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                <Trophy className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Expedition Verdict · Green Backtier
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {debrief.outcomeTitle || 'Mars Surface Mission Complete'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-xl">
                  {debrief.summary}
                </p>
              </div>
            </div>

            {/* Overall Grade Pill */}
            <div className="text-left sm:text-right font-mono shrink-0 pl-14 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Overall Rating</div>
              <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 tabular-nums">
                {grade}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Score: {score}/100</div>
            </div>
          </div>
        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Samples Cached</div>
            <div className="text-2xl font-extrabold text-orange-400">
              {debrief.telemetrySummary.samplesBroughtHome} / 3
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Core Bedrock</div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Scientific Score</div>
            <div className="text-2xl font-extrabold text-emerald-400">
              +{debrief.scores.scientificAchievement} pts
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Spectra & Outcrops</div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Downlinked Data</div>
            <div className="text-2xl font-extrabold text-cyan-400">
              {debrief.telemetrySummary.dataTransmittedMb || 350} MB
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">DSN Earth Relay</div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Reliability Score</div>
            <div className="text-2xl font-extrabold text-white">
              {debrief.scores.engineeringReliability || 95}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Subsystem Health</div>
          </div>
        </div>

        {/* Educational Takeaways: Real Physics & Aerospace Lessons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Key Achievements */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 text-left">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Documented Mission Achievements</span>
            </div>
            <div className="space-y-2 text-slate-300">
              {debrief.keyAchievements.length > 0 ? (
                debrief.keyAchievements.slice(0, 4).map((ach, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{ach}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>Explored ancient delta strata in Jezero Crater and performed spectral scans.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>Retrieved rock samples and safely stowed them inside the ascent vehicle.</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Educational Aerospace Takeaways */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 text-left">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Aerospace Engineering Takeaways</span>
            </div>
            <div className="space-y-2.5 text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-mono font-bold shrink-0">01.</span>
                <span>
                  <strong>Mass Margins:</strong> Every kilogram of scientific payload on Mars required roughly 8–10 kilograms of rocket propellant at launch to achieve escape velocity.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-mono font-bold shrink-0">02.</span>
                <span>
                  <strong>Power Trade-Offs:</strong> Solar arrays provide high daytime power at low cost, but nuclear RTGs guarantee life support survival when dust storms engulf Mars.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-mono font-bold shrink-0">03.</span>
                <span>
                  <strong>Communications Bottleneck:</strong> With 14 minutes of one-way radio delay, rovers and astronauts must operate autonomously rather than waiting for real-time joystick commands.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onNewExpedition}
            className="w-full sm:w-auto px-8 py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-orange-500/20 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Design Another Mission (Select Challenge)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
