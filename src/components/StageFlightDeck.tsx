import React, { useState, useEffect, useRef } from 'react';
import {
  MissionDesignSelection,
  CalculatedTradeOffs,
  MissionChallenge
} from '../types/missionDesigner';
import {
  LAUNCH_VEHICLES,
  PROPULSION_SYSTEMS,
  POWER_SYSTEMS,
  COMMS_SYSTEMS,
  SCIENCE_INSTRUMENTS,
  MOBILITY_SYSTEMS
} from '../data/aerospaceSpecs';
import {
  Rocket,
  Flame,
  Radio,
  Zap,
  Shield,
  Gauge,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { marsAudio } from '../game/audio';

interface StageFlightDeckProps {
  challenge: MissionChallenge;
  selection: MissionDesignSelection;
  tradeOffs: CalculatedTradeOffs;
  onLandingComplete: () => void;
  onAbortBackToDesign: () => void;
}

type FlightStage = 'STAGE_1_TMI' | 'STAGE_2_CRUISE' | 'STAGE_3_EDL' | 'TOUCHDOWN';

export const StageFlightDeck: React.FC<StageFlightDeckProps> = ({
  challenge,
  selection,
  tradeOffs,
  onLandingComplete,
  onAbortBackToDesign
}) => {
  const [currentStage, setCurrentStage] = useState<FlightStage>('STAGE_1_TMI');
  const [stageProgress, setStageProgress] = useState<number>(0);
  const [isExecutingBurn, setIsExecutingBurn] = useState<boolean>(false);
  const [flightLog, setFlightLog] = useState<string[]>([
    'T-00:00:10 // Guidance systems synchronized. Deep Space Network locked.',
    'T-00:00:02 // Main stage ignition sequence armed. Trans-Mars Injection ready.'
  ]);

  // Stage 2 Event Choice
  const [eventResolved, setEventResolved] = useState<boolean>(false);
  const [eventBonus, setEventBonus] = useState<string | null>(null);

  // EDL sub-phases
  const [edlPhase, setEdlPhase] = useState<'ENTRY' | 'PARACHUTE' | 'TERMINAL_RETRO' | 'LANDED'>('ENTRY');

  const lv = LAUNCH_VEHICLES.find(l => l.id === selection.launchVehicleId) || LAUNCH_VEHICLES[0];
  const prop = PROPULSION_SYSTEMS.find(p => p.id === selection.propulsionId) || PROPULSION_SYSTEMS[0];
  const pwr = POWER_SYSTEMS.find(p => p.id === selection.powerSystemId) || POWER_SYSTEMS[0];
  const comm = COMMS_SYSTEMS.find(c => c.id === selection.commsId) || COMMS_SYSTEMS[0];

  const addLog = (msg: string) => {
    setFlightLog(prev => [msg, ...prev.slice(0, 15)]);
  };

  // Stage 1: Execute Trans-Mars Injection Burn
  const handleExecuteTmi = () => {
    setIsExecutingBurn(true);
    marsAudio.playThrusterRoar();
    addLog(`[TMI BURN INITIATED] ${prop.name} firing at 100% throttle.`);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setStageProgress(progress);

      if (progress === 40) {
        addLog('[STAGING] Core booster separation nominal. Fairing jettisoned.');
      } else if (progress === 80) {
        addLog('[ORBIT] Escape velocity achieved (11.2 km/s). Hyperbolic insertion confirmed.');
      } else if (progress >= 100) {
        clearInterval(interval);
        setIsExecutingBurn(false);
        marsAudio.playScanChime();
        addLog('[TMI COMPLETE] Spacecraft successfully injected into Hohmann transfer orbit to Mars.');
      }
    }, 150);
  };

  // Advance to Stage 2
  const handleProceedToCruise = () => {
    setCurrentStage('STAGE_2_CRUISE');
    setStageProgress(0);
    addLog('[CRUISE COMMENCED] Deep Space Network handoff to Goldstone station. Systems nominal.');
  };

  // Cruise simulation step
  const handleSimulateCruise = () => {
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setStageProgress(p);
      if (p === 30) {
        addLog(`[AU 1.2] Solar distance increasing. Solar flux at ${(1 / Math.pow(1.2, 2) * 100).toFixed(0)}% of Earth.`);
      } else if (p === 60) {
        addLog('[EVENT DETECTED] Solar Particle Event warning issued by Space Weather Center.');
      } else if (p >= 100) {
        clearInterval(interval);
        marsAudio.playScanChime();
        addLog(`[MARS APPROACH] Mars gravitational SOI reached after ${prop.transitDays} days of cruise.`);
      }
    }, 180);
  };

  // Solve Cruise Event
  const handleResolveEvent = (choice: 'SHIELD' | 'ALIGN') => {
    setEventResolved(true);
    if (choice === 'SHIELD') {
      setEventBonus('Avionics shielded. Trajectory precision maintained at 99.8%.');
      addLog('[EVENT RESOLVED] Spacecraft oriented into protective attitude. Flight computers safe.');
    } else {
      setEventBonus('Telemetry optimized. Additional 450 MB scientific data downlinked.');
      addLog('[EVENT RESOLVED] High-gain comms locked continuously. Science cache broadcasted.');
    }
  };

  // Advance to Stage 3 EDL
  const handleProceedToEdl = () => {
    setCurrentStage('STAGE_3_EDL');
    setStageProgress(0);
    setEdlPhase('ENTRY');
    addLog('[EDL INITIATED] Entry interface reached at altitude 125 km. Velocity: 5.8 km/s.');
  };

  // Execute EDL Simulation
  const handleStartEdl = () => {
    setIsExecutingBurn(true);
    marsAudio.playThrusterRoar();
    let p = 0;
    const interval = setInterval(() => {
      p += 4;
      setStageProgress(p);

      if (p === 20) {
        setEdlPhase('ENTRY');
        addLog('[PEAK HEATING] Heat shield surface temperature: 1,650°C. Ionization blackout in progress.');
      } else if (p === 50) {
        setEdlPhase('PARACHUTE');
        marsAudio.playScanChime();
        addLog('[SUPERSONIC CHUTE] 21.5m parachute deployed at Mach 1.7. Heat shield released.');
      } else if (p === 80) {
        setEdlPhase('TERMINAL_RETRO');
        marsAudio.playThrusterRoar();
        addLog('[TERMINAL DESCENT] Radar terrain lock acquired. Retro-propulsion landing engines firing.');
      } else if (p >= 100) {
        clearInterval(interval);
        setIsExecutingBurn(false);
        marsAudio.playScanChime();
        setEdlPhase('LANDED');
        setCurrentStage('TOUCHDOWN');
        addLog('[TOUCHDOWN CONFIRMED] Green Backtier Lander has touched down safely in Jezero Crater!');
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none pb-16">
      {/* 1. Header Ribbon */}
      <div className="border-b border-slate-800 bg-slate-950/90 px-4 sm:px-6 py-3 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onAbortBackToDesign}
              className="px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded transition-colors"
            >
              Abort to Design
            </button>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-orange-400 uppercase tracking-wider font-bold">
                <span>STAGE-BY-STAGE FLIGHT SIMULATION</span>
                <span>·</span>
                <span>{challenge.badge}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {currentStage === 'STAGE_1_TMI' && 'Stage 1: Earth Departure & TMI Burn'}
                {currentStage === 'STAGE_2_CRUISE' && 'Stage 2: Deep-Space Heliocentric Cruise'}
                {currentStage === 'STAGE_3_EDL' && 'Stage 3: Mars Entry, Descent & Landing (EDL)'}
                {currentStage === 'TOUCHDOWN' && 'Touchdown Confirmed — Jezero Crater'}
              </h1>
            </div>
          </div>

          {/* Quick Subsystem Pill Ribbon */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Rocket: <strong className="text-white">{lv.name.split(' ')[0]}</strong></span>
            <span>·</span>
            <span>Engine: <strong className="text-white">{prop.name.split(' ')[0]}</strong></span>
            <span>·</span>
            <span>Power: <strong className="text-emerald-400">+{tradeOffs.totalPowerOutputW}W</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Main Flight Deck Body */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Stage Progress Tracker */}
        <div className="grid grid-cols-3 gap-3 font-mono text-xs">
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 ${
              currentStage === 'STAGE_1_TMI'
                ? 'bg-orange-950/30 border-orange-500 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-400 shrink-0">
              1
            </div>
            <div>
              <div className="font-bold">Stage 1: TMI Injection</div>
              <div className="text-[10px] text-slate-400">Earth Escape Burn</div>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border flex items-center gap-3 ${
              currentStage === 'STAGE_2_CRUISE'
                ? 'bg-orange-950/30 border-orange-500 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-400 shrink-0">
              2
            </div>
            <div>
              <div className="font-bold">Stage 2: Deep Cruise</div>
              <div className="text-[10px] text-slate-400">{prop.transitDays} Days Transit</div>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border flex items-center gap-3 ${
              currentStage === 'STAGE_3_EDL' || currentStage === 'TOUCHDOWN'
                ? 'bg-orange-950/30 border-orange-500 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-400 shrink-0">
              3
            </div>
            <div>
              <div className="font-bold">Stage 3: EDL Landing</div>
              <div className="text-[10px] text-slate-400">7 Minutes of Terror</div>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Stage Stage Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Main Flight Visualizer & Telemetry (2 Cols) */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* STAGE 1: TMI BURN */}
            {currentStage === 'STAGE_1_TMI' && (
              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                    <span>MISSION CLOCK: T+00:08:42</span>
                    <span className="text-orange-400">TARGET: 3,950 m/s DELTA-V</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">Trans-Mars Injection (TMI) Burn</h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                    The {prop.name} will ignite for a continuous burn to accelerate the spacecraft past Earth’s escape velocity into a Mars transfer trajectory.
                  </p>

                  {/* Orbital Arc Graphic */}
                  <div className="my-6 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center relative min-h-[160px]">
                    <div className="w-full max-w-md flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <span className="text-cyan-400">Earth LEO Orbit</span>
                      <span className="text-orange-400">Mars Intercept</span>
                    </div>

                    {/* Trajectory Bar */}
                    <div className="w-full max-w-md h-3 bg-slate-800 rounded-full relative overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-orange-500 to-red-500 transition-all duration-300"
                        style={{ width: `${stageProgress}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs font-mono">
                      <span>Velocity: <strong className="text-white">{(7.8 + (stageProgress / 100) * 3.4).toFixed(2)} km/s</strong></span>
                      <span>·</span>
                      <span>Burn Expended: <strong className="text-orange-400">{Math.round((stageProgress / 100) * prop.propellantNeededKg)} kg</strong></span>
                    </div>
                  </div>
                </div>

                {/* Stage 1 Actions */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400">
                    Engine Status: <span className={isExecutingBurn ? 'text-orange-400 font-bold animate-pulse' : 'text-slate-300'}>
                      {isExecutingBurn ? 'FIRING (100% THRUST)' : stageProgress >= 100 ? 'BURN COMPLETED' : 'READY TO IGNITE'}
                    </span>
                  </div>

                  {stageProgress < 100 ? (
                    <button
                      onClick={handleExecuteTmi}
                      disabled={isExecutingBurn}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20"
                    >
                      <Flame className="w-4 h-4 text-white" />
                      <span>{isExecutingBurn ? 'Executing Burn...' : 'Ignite TMI Burn'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleProceedToCruise}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      <span>Proceed to Deep Cruise</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 2: CRUISE */}
            {currentStage === 'STAGE_2_CRUISE' && (
              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                    <span>TRANSIT PROGRESS: {stageProgress}%</span>
                    <span className="text-cyan-400">{prop.transitDays} DAYS EN ROUTE</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">Deep-Space Heliocentric Cruise</h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                    Travelling across 140 million miles of interplanetary space. As distance from the Sun increases, solar power output decreases while light-speed communications delay climbs to 14 minutes.
                  </p>

                  {/* Cruise Telemetry Stats */}
                  <div className="my-6 grid grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Solar Distance</div>
                      <div className="text-base font-bold text-orange-400 mt-1">
                        {(1.0 + (stageProgress / 100) * 0.52).toFixed(2)} AU
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Comm Delay</div>
                      <div className="text-base font-bold text-cyan-400 mt-1">
                        {(stageProgress / 100 * 14.2).toFixed(1)} Min
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Downlink Rate</div>
                      <div className="text-base font-bold text-white mt-1">
                        {comm.downlinkSpeedKbps >= 1000
                          ? `${(comm.downlinkSpeedKbps / 1000).toFixed(1)} Mbps`
                          : `${comm.downlinkSpeedKbps} kbps`}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Decision Event */}
                  {stageProgress >= 60 && !eventResolved && (
                    <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/60 text-xs">
                      <div className="flex items-center gap-2 text-amber-400 font-bold mb-1 font-mono uppercase">
                        <AlertTriangle className="w-4 h-4" />
                        <span>In-Flight Decision: Solar Particle Flare Encountered</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed mb-3">
                        A coronal mass ejection is sweeping past the spacecraft trajectory. How should mission control orient the spacecraft?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleResolveEvent('SHIELD')}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/80 hover:bg-slate-800 text-white font-medium"
                        >
                          Orient Heat Shield to Sun (Protects Avionics)
                        </button>
                        <button
                          onClick={() => handleResolveEvent('ALIGN')}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-medium"
                        >
                          Maintain Earth Comms Lock (Maximizes Data)
                        </button>
                      </div>
                    </div>
                  )}

                  {eventBonus && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/60 text-xs text-emerald-200 font-mono">
                      ✓ {eventBonus}
                    </div>
                  )}
                </div>

                {/* Stage 2 Actions */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400">
                    Cruise Trajectory: <span className="text-emerald-400 font-bold">NOMINAL</span>
                  </div>

                  {stageProgress < 100 ? (
                    <button
                      onClick={handleSimulateCruise}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      <Play className="w-4 h-4" />
                      <span>Simulate Cruise Transit</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleProceedToEdl}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      <span>Prepare for EDL Landing</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 3: EDL */}
            {(currentStage === 'STAGE_3_EDL' || currentStage === 'TOUCHDOWN') && (
              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                    <span>MARS ATMOSPHERIC ENTRY</span>
                    <span className="text-orange-400">JEZERO CRATER LANDING ELLIPSE</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">Entry, Descent & Landing (EDL)</h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                    Mars has a thin atmosphere (1% of Earth). The lander must shed 12,000 mph of velocity using a heat shield, supersonic parachute, and terminal retro-propulsion thrusters.
                  </p>

                  {/* EDL Milestones */}
                  <div className="my-6 grid grid-cols-4 gap-2 font-mono text-[11px] text-center">
                    <div className={`p-2.5 rounded-xl border ${
                      edlPhase === 'ENTRY' ? 'bg-orange-500/20 border-orange-500 text-white font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      1. Atmospheric Entry
                    </div>
                    <div className={`p-2.5 rounded-xl border ${
                      edlPhase === 'PARACHUTE' ? 'bg-orange-500/20 border-orange-500 text-white font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      2. Supersonic Chute
                    </div>
                    <div className={`p-2.5 rounded-xl border ${
                      edlPhase === 'TERMINAL_RETRO' ? 'bg-orange-500/20 border-orange-500 text-white font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      3. Retro Thrusters
                    </div>
                    <div className={`p-2.5 rounded-xl border ${
                      edlPhase === 'LANDED' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      4. Touchdown!
                    </div>
                  </div>

                  {/* Altitude Bar */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Altitude: <strong className="text-white">{Math.max(0, Math.round(125 * (1 - stageProgress / 100)))} km</strong></span>
                      <span>Velocity: <strong className="text-orange-400">{Math.max(0, Math.round(5800 * (1 - stageProgress / 100)))} m/s</strong></span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all duration-200"
                        style={{ width: `${stageProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* EDL Actions */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400">
                    EDL Status: <span className={currentStage === 'TOUCHDOWN' ? 'text-emerald-400 font-bold' : 'text-orange-400 font-bold'}>
                      {currentStage === 'TOUCHDOWN' ? 'TOUCHDOWN CONFIRMED (0.0 m/s)' : isExecutingBurn ? 'EDL IN PROGRESS' : 'READY FOR ENTRY'}
                    </span>
                  </div>

                  {currentStage !== 'TOUCHDOWN' ? (
                    <button
                      onClick={handleStartEdl}
                      disabled={isExecutingBurn}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      <Rocket className="w-4 h-4" />
                      <span>{isExecutingBurn ? 'Executing EDL...' : 'Initiate Atmospheric Entry'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={onLandingComplete}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Exit Airlock & Begin 3D Surface EVA</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Real-Time Telemetry Log Terminal (1 Col) */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-orange-400 font-bold uppercase">
                  <Radio className="w-3.5 h-3.5" />
                  Live Flight Telemetry
                </span>
                <span className="text-emerald-400">DSN ONLINE</span>
              </div>

              <div className="mt-4 space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {flightLog.map((log, idx) => (
                  <div key={idx} className="text-slate-300 text-[11px] leading-relaxed border-l-2 border-slate-800 pl-2">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Equipment Footnote */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400">
              Payload: {selection.instrumentIds.length} scientific instruments · Mobility: {selection.mobilityId.replace('mob_', '').toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
