import React, { useState } from 'react';
import { 
  MissionConfig, 
  SimulationState, 
  MissionDebrief 
} from './types/mission';
import {
  MissionChallenge,
  MissionDesignSelection,
  CalculatedTradeOffs
} from './types/missionDesigner';
import { MISSION_CHALLENGES } from './data/aerospaceSpecs';
import { ChallengeSelectView } from './components/ChallengeSelectView';
import { MissionDesignDeck } from './components/MissionDesignDeck';
import { StageFlightDeck } from './components/StageFlightDeck';
import { Mars3DGameView } from './components/Mars3DGameView';
import { DebriefScreen } from './components/DebriefScreen';
import { 
  initSimulationState, 
  evaluateMissionOutcome 
} from './engine/simulation';

type AppScreen = 
  | 'challenge_select' 
  | 'mission_design' 
  | 'flight_sim' 
  | 'surface_3d' 
  | 'debrief';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('challenge_select');
  const [activeChallenge, setActiveChallenge] = useState<MissionChallenge>(MISSION_CHALLENGES[0]);
  const [designSelection, setDesignSelection] = useState<MissionDesignSelection | null>(null);
  const [designTradeOffs, setDesignTradeOffs] = useState<CalculatedTradeOffs | null>(null);
  
  const [config, setConfig] = useState<MissionConfig | null>(null);
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [debrief, setDebrief] = useState<MissionDebrief | null>(null);

  // 1. Player chooses a challenge from ChallengeSelectView
  const handleSelectChallenge = (challenge: MissionChallenge) => {
    setActiveChallenge(challenge);
    setCurrentScreen('mission_design');
  };

  // 2. Player completes spacecraft design & trade-offs in MissionDesignDeck
  const handleProceedToFlight = (selection: MissionDesignSelection, tradeOffs: CalculatedTradeOffs) => {
    setDesignSelection(selection);
    setDesignTradeOffs(tradeOffs);

    // Map design selection to game MissionConfig
    const hasRover = selection.mobilityId !== 'mob_eva_only';
    const roverType = selection.mobilityId === 'mob_science_rover' ? 'rover_science_lab' : 'rover_explorer';

    const mappedConfig: MissionConfig = {
      objectiveId: activeChallenge.id === 'challenge_water' ? 'obj_habitability' : activeChallenge.id === 'challenge_flagship' ? 'obj_geology' : 'obj_climate',
      spacecraftId: selection.launchVehicleId === 'lv_ares_super_heavy' ? 'titan' : selection.launchVehicleId === 'lv_sls_block1' ? 'odyssey' : 'kestrel',
      propulsionId: selection.propulsionId === 'prop_nuclear_thermal' ? 'ntp_cerberus' : selection.propulsionId === 'prop_solar_electric' ? 'sep_hermes' : 'chem_raptor',
      propellantType: selection.propulsionId === 'prop_solar_electric' ? 'xenon' : 'methalox',
      propellantMassKg: selection.propulsionId === 'prop_solar_electric' ? 2400 : 130000,
      powerSystemId: selection.powerSystemId === 'pwr_kilopower_reactor' ? 'hybrid_grid' : selection.powerSystemId === 'pwr_mmrtg_plutonium' ? 'rtg_plutonium' : 'solar_ultraflex',
      batteryId: 'batt_solidstate',
      commSystemId: selection.commsId === 'comm_optical_laser' ? 'comm_optical' : selection.commsId === 'comm_kband_highgain' ? 'comm_kaband' : 'comm_xband_low',
      selectedInstrumentIds: selection.instrumentIds,
      roverId: hasRover ? roverType : '',
      lifeSupport: {
        crewSize: 4,
        rationDaysFood: 680,
        rationDaysWater: 680,
        rationDaysOxygen: 680,
        suitType: 'advanced_hybrid',
        habitatShielding: 'polyethylene_water_shield'
      },
      landingSiteId: 'site_jezero',
      plannedSurfaceSols: 45,
      budgetLimitM: activeChallenge.budgetM,
      difficulty: activeChallenge.difficulty === 'Beginner' ? 'training' : activeChallenge.difficulty === 'Intermediate' ? 'standard' : 'expert',
      randomSeed: 42
    };

    setConfig(mappedConfig);
    const initialSim = initSimulationState(mappedConfig);
    setSimState(initialSim);
    setCurrentScreen('flight_sim');
  };

  // 3. Stage-by-Stage flight concludes with touchdown -> transition to 3D surface game
  const handleLandingComplete = () => {
    setCurrentScreen('surface_3d');
  };

  // 4. Return to airlock in 3D Mars view -> conclude mission and compute debrief
  const handleConcludeMission = () => {
    if (!simState) return;
    const finalDebrief = evaluateMissionOutcome(simState);
    
    // Inject custom trade-off scores if available
    if (designTradeOffs) {
      if (designTradeOffs.isBudgetValid) {
        finalDebrief.scores.budgetDiscipline = Math.min(100, Math.round((designTradeOffs.budgetMarginM / designTradeOffs.budgetLimitM) * 100 + 70));
      } else {
        finalDebrief.scores.budgetDiscipline = 35;
      }

      if (designTradeOffs.isMassValid && designTradeOffs.isPowerValid) {
        finalDebrief.scores.engineeringReliability = 96;
      } else {
        finalDebrief.scores.engineeringReliability = 60;
      }
    }

    setDebrief(finalDebrief);
    setCurrentScreen('debrief');
  };

  // 5. Replay from debrief
  const handleNewExpedition = () => {
    setSimState(null);
    setDebrief(null);
    setCurrentScreen('challenge_select');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white overflow-hidden">
      {/* 1. Challenge Selector */}
      {currentScreen === 'challenge_select' && (
        <ChallengeSelectView onSelectChallenge={handleSelectChallenge} />
      )}

      {/* 2. Interactive Engineering Design Deck */}
      {currentScreen === 'mission_design' && activeChallenge && (
        <MissionDesignDeck
          challenge={activeChallenge}
          onBackToChallenges={() => setCurrentScreen('challenge_select')}
          onProceedToFlight={handleProceedToFlight}
        />
      )}

      {/* 3. Stage-by-Stage Mission Flight Operations */}
      {currentScreen === 'flight_sim' && activeChallenge && designSelection && designTradeOffs && (
        <StageFlightDeck
          challenge={activeChallenge}
          selection={designSelection}
          tradeOffs={designTradeOffs}
          onLandingComplete={handleLandingComplete}
          onAbortBackToDesign={() => setCurrentScreen('mission_design')}
        />
      )}

      {/* 4. Fullscreen 3D Mars Surface Exploration Game */}
      {currentScreen === 'surface_3d' && config && simState && (
        <Mars3DGameView
          config={config}
          state={simState}
          onUpdateState={(next) => {
            if (typeof next === 'function') {
              setSimState(prev => prev ? next(prev) : null);
            } else {
              setSimState(next);
            }
          }}
          onConcludeMission={handleConcludeMission}
          onAbortToWorkshop={() => setCurrentScreen('mission_design')}
        />
      )}

      {/* 5. NASA Evaluation & Scientific Debrief */}
      {currentScreen === 'debrief' && debrief && (
        <DebriefScreen
          debrief={debrief}
          onNewExpedition={handleNewExpedition}
        />
      )}
    </div>
  );
}

export default App;
