import React, { useState, useMemo } from 'react';
import {
  MissionChallenge,
  MissionDesignSelection,
  CalculatedTradeOffs
} from '../types/missionDesigner';
import {
  LAUNCH_VEHICLES,
  PROPULSION_SYSTEMS,
  POWER_SYSTEMS,
  COMMS_SYSTEMS,
  SCIENCE_INSTRUMENTS,
  MOBILITY_SYSTEMS,
  computeMissionTradeOffs
} from '../data/aerospaceSpecs';
import {
  Rocket,
  Zap,
  Radio,
  Microscope,
  Compass,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Scale,
  Gauge,
  DollarSign,
  Info
} from 'lucide-react';

interface MissionDesignDeckProps {
  challenge: MissionChallenge;
  onBackToChallenges: () => void;
  onProceedToFlight: (selection: MissionDesignSelection, tradeOffs: CalculatedTradeOffs) => void;
}

type TabType = 'launch' | 'propulsion' | 'power' | 'comms' | 'instruments' | 'mobility';

export const MissionDesignDeck: React.FC<MissionDesignDeckProps> = ({
  challenge,
  onBackToChallenges,
  onProceedToFlight
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('launch');

  // Initial selection derived from challenge defaults
  const [selection, setSelection] = useState<MissionDesignSelection>({
    launchVehicleId: challenge.defaultConfig.launchVehicleId || 'lv_falcon_heavy',
    propulsionId: challenge.defaultConfig.propulsionId || 'prop_methalox',
    powerSystemId: challenge.defaultConfig.powerSystemId || 'pwr_ultraflex_solar',
    commsId: challenge.defaultConfig.commsId || 'comm_xband_low',
    instrumentIds: challenge.defaultConfig.instrumentIds || ['inst_mastcam_z'],
    mobilityId: challenge.defaultConfig.mobilityId || 'mob_scout_rover'
  });

  // Calculate live engineering trade-offs
  const tradeOffs = useMemo(() => {
    return computeMissionTradeOffs(selection, challenge.budgetM);
  }, [selection, challenge.budgetM]);

  // Handle instrument toggle (multi-select)
  const toggleInstrument = (instId: string) => {
    setSelection(prev => {
      const exists = prev.instrumentIds.includes(instId);
      if (exists) {
        // Keep at least one instrument
        if (prev.instrumentIds.length <= 1) return prev;
        return {
          ...prev,
          instrumentIds: prev.instrumentIds.filter(id => id !== instId)
        };
      } else {
        return {
          ...prev,
          instrumentIds: [...prev.instrumentIds, instId]
        };
      }
    });
  };

  const handleReset = () => {
    setSelection({
      launchVehicleId: challenge.defaultConfig.launchVehicleId || 'lv_falcon_heavy',
      propulsionId: challenge.defaultConfig.propulsionId || 'prop_methalox',
      powerSystemId: challenge.defaultConfig.powerSystemId || 'pwr_ultraflex_solar',
      commsId: challenge.defaultConfig.commsId || 'comm_xband_low',
      instrumentIds: challenge.defaultConfig.instrumentIds || ['inst_mastcam_z'],
      mobilityId: challenge.defaultConfig.mobilityId || 'mob_scout_rover'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none pb-20">
      {/* 1. TOP TELEMETRY RIBBON: Header & Real-Time Trade-Off Gauges */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Challenge Title & Back */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToChallenges}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Return to Challenges"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-orange-400 uppercase tracking-wider font-bold">
                <span>{challenge.badge}</span>
                <span>·</span>
                <span>MISSION DESIGN DECK</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                {challenge.title}
              </h1>
            </div>
          </div>

          {/* Right: Live Trade-Off Quick Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 font-mono">
            {/* Cost Gauge */}
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase mb-0.5">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-orange-400" />
                  Budget
                </span>
                <span className={tradeOffs.isBudgetValid ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                  ${tradeOffs.totalCostM}M / ${challenge.budgetM}M
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    tradeOffs.isBudgetValid ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (tradeOffs.totalCostM / challenge.budgetM) * 100)}%` }}
                />
              </div>
            </div>

            {/* Mass Gauge */}
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase mb-0.5">
                <span className="flex items-center gap-1">
                  <Scale className="w-3 h-3 text-cyan-400" />
                  Payload Mass
                </span>
                <span className={tradeOffs.isMassValid ? 'text-slate-200' : 'text-red-400 font-bold'}>
                  {Math.round(tradeOffs.totalPayloadMassKg / 1000)}t / {Math.round(tradeOffs.launchVehicleCapacityKg / 1000)}t
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    tradeOffs.isMassValid ? 'bg-cyan-500' : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (tradeOffs.totalPayloadMassKg / tradeOffs.launchVehicleCapacityKg) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Power Gauge */}
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase mb-0.5">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Power Balance
                </span>
                <span className={tradeOffs.isPowerValid ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                  {tradeOffs.totalPowerDrawW}W / {tradeOffs.totalPowerOutputW}W
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    tradeOffs.isPowerValid ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (tradeOffs.totalPowerDrawW / Math.max(1, tradeOffs.totalPowerOutputW)) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Delta-V Gauge */}
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase mb-0.5">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-indigo-400" />
                  Delta-V
                </span>
                <span className={tradeOffs.isDeltaVValid ? 'text-indigo-300' : 'text-amber-400 font-bold'}>
                  {tradeOffs.deltaVAvailableMs} m/s
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (tradeOffs.deltaVAvailableMs / tradeOffs.deltaVRequiredMs) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EDUCATIONAL AEROSPACE ADVICE BANNER */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4">
        <div
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
            tradeOffs.readinessStatus === 'CRITICAL'
              ? 'bg-red-950/40 border-red-500/60 text-red-200'
              : tradeOffs.readinessStatus === 'WARNING'
              ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {tradeOffs.readinessStatus === 'CRITICAL' ? (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            ) : tradeOffs.readinessStatus === 'WARNING' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="font-semibold block sm:inline mr-2">
                Aerospace Advisory ({tradeOffs.readinessStatus}):
              </strong>
              <span>{tradeOffs.statusNotes[0]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. SUBSYSTEM SELECTION NAVIGATION (Segmented Control) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('launch')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'launch'
                ? 'bg-orange-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>1. Launch Vehicle</span>
          </button>

          <button
            onClick={() => setActiveTab('propulsion')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'propulsion'
                ? 'bg-orange-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>2. Propulsion & Transit</span>
          </button>

          <button
            onClick={() => setActiveTab('power')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'power'
                ? 'bg-orange-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3. Power System</span>
          </button>

          <button
            onClick={() => setActiveTab('comms')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'comms'
                ? 'bg-orange-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>4. Communications</span>
          </button>

          <button
            onClick={() => setActiveTab('instruments')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'instruments'
                ? 'bg-orange-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>5. Science Instruments ({selection.instrumentIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mobility')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'mobility'
                ? 'bg-orange-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>6. Surface Mobility</span>
          </button>
        </div>
      </div>

      {/* 4. ACTIVE TAB COMPONENT OPTIONS */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        {/* TAB 1: LAUNCH VEHICLE */}
        {activeTab === 'launch' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Select Heavy Launch Vehicle</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                The launch vehicle provides the initial energy to escape Earth’s gravity well and inject the spacecraft on a Trans-Mars trajectory.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {LAUNCH_VEHICLES.map((lv) => {
                const isSelected = selection.launchVehicleId === lv.id;
                return (
                  <div
                    key={lv.id}
                    onClick={() => setSelection(prev => ({ ...prev, launchVehicleId: lv.id }))}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-orange-950/20 border-orange-500 ring-1 ring-orange-500/50'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-orange-400 font-bold">${lv.costM}M</span>
                        <span className="text-slate-400">Cap: {(lv.maxPayloadToTmiKg / 1000).toFixed(1)}t TMI</span>
                      </div>
                      <h3 className="text-base font-bold text-white">{lv.name}</h3>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{lv.manufacturer}</div>
                      <p className="text-xs text-slate-300 mt-3 leading-relaxed">{lv.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-cyan-300">
                      <strong>Trade-off:</strong> {lv.tradeOffNote}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PROPULSION & BUS */}
        {activeTab === 'propulsion' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Select In-Space Propulsion System</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Balances cruise speed, fuel mass, and specific impulse (Isp). High efficiency ion drives save tons of propellant but take longer.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PROPULSION_SYSTEMS.map((prop) => {
                const isSelected = selection.propulsionId === prop.id;
                return (
                  <div
                    key={prop.id}
                    onClick={() => setSelection(prev => ({ ...prev, propulsionId: prop.id }))}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-orange-950/20 border-orange-500 ring-1 ring-orange-500/50'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-orange-400 font-bold">${prop.costM}M</span>
                        <span className="text-indigo-400 font-bold">Isp: {prop.ispSeconds}s</span>
                      </div>
                      <h3 className="text-base font-bold text-white">{prop.name}</h3>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Transit: ~{prop.transitDays} Days · Fuel: {prop.propellantNeededKg.toLocaleString()} kg
                      </div>
                      <p className="text-xs text-slate-300 mt-3 leading-relaxed">{prop.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-cyan-300">
                      <strong>Trade-off:</strong> {prop.tradeOffNote}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: POWER SYSTEM */}
        {activeTab === 'power' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Select Electrical Power System</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Powers scientific instruments, life support, and communications. Solar power degrades rapidly during global dust storms.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {POWER_SYSTEMS.map((pwr) => {
                const isSelected = selection.powerSystemId === pwr.id;
                return (
                  <div
                    key={pwr.id}
                    onClick={() => setSelection(prev => ({ ...prev, powerSystemId: pwr.id }))}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-orange-950/20 border-orange-500 ring-1 ring-orange-500/50'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-orange-400 font-bold">${pwr.costM}M</span>
                        <span className="text-emerald-400 font-bold">+{pwr.powerOutputW}W</span>
                      </div>
                      <h3 className="text-base font-bold text-white">{pwr.name}</h3>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Mass: {pwr.massKg} kg · Dust Tolerance: {pwr.dustStormTolerancePercent}%
                      </div>
                      <p className="text-xs text-slate-300 mt-3 leading-relaxed">{pwr.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-cyan-300">
                      <strong>Trade-off:</strong> {pwr.tradeOffNote}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: COMMUNICATIONS */}
        {activeTab === 'comms' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Select Deep Space Network Telemetry</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Transmits scientific discoveries and telemetry across 140 million miles back to Earth.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COMMS_SYSTEMS.map((comm) => {
                const isSelected = selection.commsId === comm.id;
                return (
                  <div
                    key={comm.id}
                    onClick={() => setSelection(prev => ({ ...prev, commsId: comm.id }))}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-orange-950/20 border-orange-500 ring-1 ring-orange-500/50'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-orange-400 font-bold">${comm.costM}M</span>
                        <span className="text-cyan-400 font-bold">
                          {comm.downlinkSpeedKbps >= 1000
                            ? `${(comm.downlinkSpeedKbps / 1000).toFixed(1)} Mbps`
                            : `${comm.downlinkSpeedKbps} kbps`}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{comm.name}</h3>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Mass: {comm.massKg} kg · Draw: {comm.powerDrawW}W
                      </div>
                      <p className="text-xs text-slate-300 mt-3 leading-relaxed">{comm.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-cyan-300">
                      <strong>Trade-off:</strong> {comm.tradeOffNote}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: SCIENTIFIC INSTRUMENTS */}
        {activeTab === 'instruments' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Equip Scientific Instruments (Multi-Select)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every instrument unlocks specific scientific activities on Mars. Equipping heavier instruments consumes more mass and power.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SCIENCE_INSTRUMENTS.map((inst) => {
                const isSelected = selection.instrumentIds.includes(inst.id);
                return (
                  <div
                    key={inst.id}
                    onClick={() => toggleInstrument(inst.id)}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-orange-950/20 border-orange-500 ring-1 ring-orange-500/50'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-orange-400 font-bold">${inst.costM}M</span>
                        <span className="text-emerald-400 font-bold">+{inst.sciencePoints} pts</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white">{inst.name}</h3>
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-orange-500 border-orange-400 text-white'
                              : 'bg-slate-800 border-slate-700 text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Mass: {inst.massKg} kg · Power Draw: {inst.powerDrawW}W · Action: [{inst.enablesAction.toUpperCase()}]
                      </div>
                      <p className="text-xs text-slate-300 mt-3 leading-relaxed">{inst.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Data/Scan: ~{inst.dataPerScanMb} MB</span>
                      <span className={isSelected ? 'text-orange-400 font-bold' : 'text-slate-500'}>
                        {isSelected ? 'Equipped on Lander' : 'Click to Equip'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: SURFACE MOBILITY */}
        {activeTab === 'mobility' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Select Surface Mobility Architecture</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Determines how fast and far you can traverse the surface of Mars, and how many rock samples you can cache.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOBILITY_SYSTEMS.map((mob) => {
                const isSelected = selection.mobilityId === mob.id;
                return (
                  <div
                    key={mob.id}
                    onClick={() => setSelection(prev => ({ ...prev, mobilityId: mob.id }))}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-orange-950/20 border-orange-500 ring-1 ring-orange-500/50'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-orange-400 font-bold">${mob.costM}M</span>
                        <span className="text-cyan-400 font-bold">Speed: {mob.speedKmH} km/h</span>
                      </div>
                      <h3 className="text-base font-bold text-white">{mob.name}</h3>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Mass: {mob.massKg} kg · Sample Capacity: {mob.sampleCapacity}
                      </div>
                      <p className="text-xs text-slate-300 mt-3 leading-relaxed">{mob.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-cyan-300">
                      <strong>Capability:</strong>{' '}
                      {mob.id === 'mob_eva_only'
                        ? 'Astronaut walks on foot only.'
                        : `Driveable in 3D Mars view with headlights & cargo bed.`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. BOTTOM ACTION BAR: Final Launch Gate */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
            <span>
              Science Potential: <strong className="text-emerald-400">{tradeOffs.potentialScienceScore} pts</strong>
            </span>
            <span>·</span>
            <span>
              Cruise Duration: <strong className="text-white">{tradeOffs.transitDays} Days</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                // Navigate to next tab sequentially if not on last tab
                const tabs: TabType[] = ['launch', 'propulsion', 'power', 'comms', 'instruments', 'mobility'];
                const nextIdx = tabs.indexOf(activeTab) + 1;
                if (nextIdx < tabs.length) {
                  setActiveTab(tabs[nextIdx]);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors hidden sm:block"
            >
              Next Subsystem
            </button>

            <button
              onClick={() => onProceedToFlight(selection, tradeOffs)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20"
            >
              <span>Simulate Flight Operations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
