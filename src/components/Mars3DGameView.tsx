import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MissionConfig, SimulationState } from '../types/mission';
import { MarsGameSceneManager, InteractionPrompt } from '../game/sceneManager';
import { ScienceDiscovery } from '../game/objectiveGuide';
import { marsAudio } from '../game/audio';
import { 
  Navigation, 
  Wind, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Map, 
  X, 
  ChevronRight,
  Car,
  User,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface Mars3DGameViewProps {
  config: MissionConfig;
  state: SimulationState;
  onUpdateState: (newState: SimulationState | ((prev: SimulationState) => SimulationState)) => void;
  onConcludeMission: () => void;
  onAbortToWorkshop: () => void;
}

export const Mars3DGameView: React.FC<Mars3DGameViewProps> = ({
  config,
  state,
  onUpdateState,
  onConcludeMission,
  onAbortToWorkshop
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<MarsGameSceneManager | null>(null);

  // HUD & UI States
  const [prompt, setPrompt] = useState<InteractionPrompt | null>(null);
  const [activeDiscovery, setActiveDiscovery] = useState<ScienceDiscovery | null>(null);
  const [showDeepFact, setShowDeepFact] = useState<boolean>(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [isTabletOpen, setIsTabletOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isCinematic, setIsCinematic] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Active Task Guidance
  const [taskHeadline, setTaskHeadline] = useState('Find the marked rock');
  const [taskSubtext, setTaskSubtext] = useState('Follow the yellow marker to the first rock formation.');
  const [targetLabel, setTargetLabel] = useState('Layered Rock');
  const [targetDistanceM, setTargetDistanceM] = useState(22);
  const [currentStep, setCurrentStep] = useState(1);

  // Floating 3D waypoint position on screen
  const [waypointScreen, setWaypointScreen] = useState<{ x: number; y: number; visible: boolean } | null>(null);

  // Player mode & gauges
  const [playerMode, setPlayerMode] = useState<'astronaut' | 'rover'>('astronaut');
  const [suitO2, setSuitO2] = useState(98);
  const [suitPower, setSuitPower] = useState(96);

  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new MarsGameSceneManager(
      containerRef.current,
      config,
      (updater) => {
        onUpdateState(updater);
      },
      () => {
        // Conclude mission safely
        marsAudio.playThrusterRoar();
        onConcludeMission();
      },
      (newPrompt) => {
        setPrompt(newPrompt);
      },
      (discovery) => {
        setActiveDiscovery(discovery);
        setShowDeepFact(false);
      }
    );

    sceneManagerRef.current = manager;

    // Pointer lock listener
    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === containerRef.current?.querySelector('canvas');
      setIsPointerLocked(locked);
      if (manager.controller) {
        manager.controller.isLocked = locked;
      }
    };
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    // Sync loop for active guidance and meters (runs at 20Hz)
    const guideInterval = setInterval(() => {
      if (!manager.controller || !manager.objectiveGuide) return;

      setIsCinematic(manager.isCinematic);
      setPlayerMode(manager.controller.mode);
      setCurrentStep(manager.objectiveGuide.currentStep);

      // Distance from player to current guided target
      const playerPos = manager.controller.mode === 'astronaut'
        ? manager.controller.astronautPos
        : manager.controller.roverPos;

      const dist = playerPos.distanceTo(manager.objectiveGuide.activeTargetPos);
      const taskInfo = manager.objectiveGuide.getCurrentTaskInfo(dist);

      setTaskHeadline(taskInfo.headline);
      setTaskSubtext(taskInfo.subtext);
      setTargetLabel(taskInfo.targetLabel);
      setTargetDistanceM(taskInfo.distanceM);

      // Calculate 2D screen coordinate for active target
      if (!manager.isCinematic) {
        const screenPos = manager.toScreenPosition(
          manager.objectiveGuide.activeTargetPos.clone().setY(
            manager.objectiveGuide.activeTargetPos.y + 2.4
          )
        );
        const containerW = containerRef.current?.clientWidth || 800;
        const containerH = containerRef.current?.clientHeight || 600;

        const isInside = screenPos.inFront && 
          screenPos.x >= 20 && screenPos.x <= containerW - 20 && 
          screenPos.y >= 20 && screenPos.y <= containerH - 20;

        setWaypointScreen({
          x: Math.round(screenPos.x),
          y: Math.round(screenPos.y),
          visible: isInside
        });
      } else {
        setWaypointScreen(null);
      }

      // Decrement suit oxygen slowly
      setSuitO2(prev => Math.max(20, Math.round(prev - 0.04)));

      // Recharge suit power when near lander or inside rover
      const distToLander = playerPos.distanceTo(new THREE.Vector3(0, playerPos.y, 0));
      if (distToLander < 10 || manager.controller.mode === 'rover') {
        setSuitPower(prev => Math.min(100, prev + 0.5));
      } else {
        setSuitPower(prev => Math.max(15, prev - 0.03));
      }
    }, 100);

    // Keyboard shortcut for Tablet (Tab)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        setIsTabletOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(guideInterval);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('keydown', handleKeyDown);
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, [config]);

  const handleRequestPointerLock = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas && !isPointerLocked) {
      try {
        canvas.requestPointerLock();
      } catch {
        // Fallback to drag-to-look
      }
    }
  };

  const handleSkipLanding = () => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.skipLanding();
      setIsCinematic(false);
    }
  };

  const handleToggleStorm = () => {
    if (sceneManagerRef.current) {
      const nextStorm = !sceneManagerRef.current.stormActive;
      sceneManagerRef.current.triggerDustStorm(nextStorm ? 0.75 : 0);
      if (nextStorm) {
        marsAudio.playStormAlert();
      }
    }
  };

  const handleToggleAudio = () => {
    marsAudio.isMuted = !marsAudio.isMuted;
    setIsMuted(marsAudio.isMuted);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 select-none font-sans">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        onClick={handleRequestPointerLock}
        className="w-full h-full cursor-crosshair"
      />

      {/* FLOATING 3D WAYPOINT INDICATOR IN WORLD SPACE */}
      {waypointScreen && waypointScreen.visible && !isCinematic && (
        <div
          style={{
            transform: `translate3d(${waypointScreen.x}px, ${waypointScreen.y}px, 0)`,
            left: 0,
            top: 0
          }}
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-10 transition-transform duration-75 ease-out"
        >
          <div className="flex flex-col items-center">
            <div className="bg-orange-950/90 border border-orange-500 text-white px-2.5 py-1 rounded-full shadow-lg text-[11px] font-mono font-bold whitespace-nowrap flex items-center gap-1.5 backdrop-blur-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span>{targetLabel}</span>
              <span className="text-orange-300 font-extrabold">{targetDistanceM}m</span>
            </div>
            <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-orange-500 mt-0.5" />
          </div>
        </div>
      )}

      {/* TOP HUD: One Clear Active Task at a Time */}
      <div className="absolute top-3 left-4 right-4 pointer-events-none flex items-start justify-between gap-4 z-20">
        {/* Top-Left: Simple Status */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-xl pointer-events-auto shadow-md">
          <div className="text-[10px] uppercase font-mono text-orange-400 font-bold tracking-wider">
            Mars Surface
          </div>
          <div className="text-xs font-semibold text-white mt-0.5">
            Sol {state.surfaceSol} · Nominal
          </div>
        </div>

        {/* TOP CENTER: ONE PROMINENT ACTIVE OBJECTIVE */}
        <div className="flex flex-col items-center bg-slate-950/90 backdrop-blur-md border border-orange-500/60 px-6 py-2.5 rounded-xl shadow-xl max-w-md text-center pointer-events-auto">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-orange-400 uppercase font-bold tracking-wider mb-0.5">
            <Navigation className="w-3 h-3 text-orange-400" />
            <span>MISSION STEP {currentStep} OF 4</span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">
            {taskHeadline}
          </h3>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
            {taskSubtext}
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-xs font-mono font-bold text-orange-300 bg-orange-950/40 px-2.5 py-0.5 rounded border border-orange-900/60">
            <span>{targetLabel}</span>
            <span>·</span>
            <span>{targetDistanceM}m away</span>
          </div>
        </div>

        {/* Top-Right: Minimal Action Bar */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {isCinematic && (
            <button
              onClick={handleSkipLanding}
              className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1"
            >
              <span>Skip Landing</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleToggleStorm}
            title="Simulate Dust Hazard"
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-lg backdrop-blur-md transition-colors"
          >
            <Wind className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleAudio}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg backdrop-blur-md transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsControlsOpen(true)}
            title="Controls Guide"
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg backdrop-blur-md transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsTabletOpen(true)}
            className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1.5"
          >
            <Map className="w-3.5 h-3.5 text-orange-400" />
            <span>Field Tablet</span>
          </button>
        </div>
      </div>

      {/* CENTER: SHORT SCIENTIFIC DISCOVERY CARD WITH [LEARN MORE] */}
      {activeDiscovery && !isCinematic && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-auto z-30">
          <div className="bg-slate-950/95 border border-emerald-500/80 text-slate-100 p-4 rounded-xl shadow-2xl backdrop-blur-md max-w-sm text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Discovery Made</span>
              </span>
              <button
                onClick={() => setActiveDiscovery(null)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs font-semibold text-white leading-relaxed">
              "{activeDiscovery.simpleFact}"
            </p>

            {/* Optional Learn More toggle */}
            {!showDeepFact ? (
              <button
                onClick={() => setShowDeepFact(true)}
                className="mt-2 text-[11px] font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                <span>[Learn more]</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-0.5">Why it matters:</div>
                {activeDiscovery.deepFact}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CENTER: CONTEXTUAL ACTION PROMPT (When near an interactive object) */}
      {prompt && prompt.show && !isCinematic && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-16 pointer-events-none z-30">
          <div className="bg-slate-950/95 border-2 border-orange-500 text-white px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white font-mono font-extrabold text-base flex items-center justify-center shadow-md shrink-0">
              E
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">
                {prompt.text}
              </div>
              {prompt.subtext && (
                <div className="text-[11px] text-slate-300 mt-0.5">
                  {prompt.subtext}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CENTER: CLICK OR DRAG HINT (When cursor is unlocked) */}
      {!isPointerLocked && !isCinematic && !isTabletOpen && !isControlsOpen && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-20">
          <div className="bg-slate-950/80 border border-slate-800 text-slate-300 px-4 py-2 rounded-full shadow-lg backdrop-blur-md text-center text-[11px] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Click canvas to lock mouse, or <strong>Click & Drag</strong> to look around · <strong>WASD</strong> to walk</span>
          </div>
        </div>
      )}

      {/* DUST STORM ALERT HUD */}
      {sceneManagerRef.current?.stormActive && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-20">
          <div className="bg-amber-950/90 border border-amber-500 text-amber-200 px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xl">
            <Wind className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Dust is blocking sunlight. Solar power is dropping.</span>
          </div>
        </div>
      )}

      {/* BOTTOM-LEFT: Minimal Life-Support Meters */}
      <div className="absolute bottom-4 left-4 pointer-events-none z-20">
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-3 rounded-xl pointer-events-auto shadow-lg space-y-2 w-56 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[11px]">
            <span className="text-white font-bold flex items-center gap-1.5">
              {playerMode === 'astronaut' ? <User className="w-3.5 h-3.5 text-orange-400" /> : <Car className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{playerMode === 'astronaut' ? 'Astronaut' : 'Rover Driver'}</span>
            </span>
            <span className="text-[10px] text-slate-500">[F] Light</span>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="text-slate-400">Oxygen</span>
              <span className="text-emerald-400 font-bold">{suitO2}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${suitO2}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="text-slate-400">Power</span>
              <span className="text-cyan-400 font-bold">{Math.round(suitPower)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${suitPower}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM-RIGHT: Samples & Return Status */}
      <div className="absolute bottom-4 right-4 pointer-events-none z-20">
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-3 rounded-xl pointer-events-auto shadow-lg space-y-1.5 w-56 font-mono text-xs">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Samples Collected:</span>
            <span className="text-white font-bold">{state.samplesCached} / 3</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Science Score:</span>
            <span className="text-orange-400 font-bold">+{state.scienceScore} pts</span>
          </div>
          <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>Departure:</span>
            <span className="text-emerald-400 font-bold">Lander Ready</span>
          </div>
        </div>
      </div>

      {/* ASTRONAUT FIELD TABLET MODAL */}
      {isTabletOpen && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Field Tablet · Mission Overview
              </h3>
              <button onClick={() => setIsTabletOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Scientific Objective:</span>
                <h4 className="text-base font-bold text-white">{config.objectiveId === 'obj_habitability' ? 'Ancient Water & Habitability' : 'Martian Geology'}</h4>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  Study geological rocks for clues of past water, collect rock cores, and return safely to the lander.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 font-mono">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Target Checklist:</div>
                <div className="flex justify-between text-slate-300">
                  <span>1. Layered Sandstone Rock</span>
                  <strong className={state.samplesCached >= 1 ? 'text-emerald-400' : 'text-amber-400'}>
                    {state.samplesCached >= 1 ? '✓ Complete' : 'Active Target'}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>2. Weathered Clay Outcrop</span>
                  <strong className={state.samplesCached >= 2 ? 'text-emerald-400' : 'text-slate-500'}>
                    {state.samplesCached >= 2 ? '✓ Complete' : 'Pending'}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>3. Deep Basalt Bedrock</span>
                  <strong className={state.samplesCached >= 3 ? 'text-emerald-400' : 'text-slate-500'}>
                    {state.samplesCached >= 3 ? '✓ Complete' : 'Pending'}
                  </strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed font-mono">
                <strong className="text-white not-italic">Reminder:</strong> When you are ready to depart, return to the lander and press E at the ladder.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsTabletOpen(false)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold"
              >
                Close Tablet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTROLS GUIDE MODAL */}
      {isControlsOpen && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 text-slate-100 shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white uppercase">Controls Guide</span>
              <button onClick={() => setIsControlsOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">W / A / S / D</span>
                <strong className="text-white">Walk / Steer Rover</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mouse</span>
                <strong className="text-white">Look Around / Drag</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Arrow Keys</span>
                <strong className="text-white">Walk / Orbit Camera</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shift</span>
                <strong className="text-white">Sprint</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Space</span>
                <strong className="text-white">Mars Jump</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">E</span>
                <strong className="text-orange-400 font-bold">Interact / Rover / Depart</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">F</span>
                <strong className="text-white">Flashlight</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tab</span>
                <strong className="text-white">Field Tablet</strong>
              </div>
            </div>

            <button
              onClick={() => setIsControlsOpen(false)}
              className="w-full mt-2 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold"
            >
              Resume Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
