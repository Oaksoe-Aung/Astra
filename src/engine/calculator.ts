import { MissionConfig, EngineeringValidation } from '../types/mission';
import { SPACECRAFT_ARCHETYPES } from '../data/spacecraft';
import { PROPULSION_SYSTEMS, PROPELLANT_OPTIONS } from '../data/propulsion';
import { POWER_SYSTEMS, BATTERY_SYSTEMS, COMM_SYSTEMS, SCIENTIFIC_INSTRUMENTS, ROVER_SYSTEMS } from '../data/systems';
import { LANDING_SITES } from '../data/destinations';
import { SCIENTIFIC_OBJECTIVES } from '../data/objectives';

const G0 = 9.80665; // Standard gravitational acceleration m/s^2

export function calculateMassBudget(config: MissionConfig) {
  const craft = SPACECRAFT_ARCHETYPES.find(s => s.id === config.spacecraftId) || SPACECRAFT_ARCHETYPES[1];
  const engine = PROPULSION_SYSTEMS.find(p => p.id === config.propulsionId) || PROPULSION_SYSTEMS[0];
  const power = POWER_SYSTEMS.find(p => p.id === config.powerSystemId) || POWER_SYSTEMS[0];
  const battery = BATTERY_SYSTEMS.find(b => b.id === config.batteryId) || BATTERY_SYSTEMS[0];
  const comm = COMM_SYSTEMS.find(c => c.id === config.commSystemId) || COMM_SYSTEMS[0];
  const rover = ROVER_SYSTEMS.find(r => r.id === config.roverId) || ROVER_SYSTEMS[0];

  const selectedInstruments = SCIENTIFIC_INSTRUMENTS.filter(i => config.selectedInstrumentIds.includes(i.id));
  const instrumentsMassKg = selectedInstruments.reduce((sum, i) => sum + i.massKg, 0);

  // Life support dry hardware & consumables mass
  const crewCount = config.lifeSupport.crewSize;
  const foodMassKg = crewCount * config.lifeSupport.rationDaysFood * 1.5; // 1.5 kg food per person per day
  const waterMassKg = crewCount * config.lifeSupport.rationDaysWater * 2.5; // 2.5 kg water per person per day (with recyclers)
  const o2MassKg = crewCount * config.lifeSupport.rationDaysOxygen * 0.9; // 0.9 kg O2 per person per day
  const suitsMassKg = crewCount * (config.lifeSupport.suitType === 'lightweight_biomechanical' ? 45 : config.lifeSupport.suitType === 'advanced_hybrid' ? 80 : 120);
  const habitatShieldingMassKg = config.lifeSupport.habitatShielding === 'polyethylene_water_shield' ? 4500 : config.lifeSupport.habitatShielding === 'active_electromagnetic' ? 6200 : 2500;

  const lifeSupportTotalMassKg = foodMassKg + waterMassKg + o2MassKg + suitsMassKg + habitatShieldingMassKg;

  // Payload mass = instruments + rover + life support hardware + batteries + power + comm
  const payloadMassKg = instrumentsMassKg + rover.massKg + lifeSupportTotalMassKg + battery.massKg + power.massKg + comm.massKg;

  // Spacecraft dry mass = craft base dry mass + propulsion dry mass
  const dryMassKg = craft.dryMassKg + engine.dryMassKg;

  // Wet mass = dry mass + payload mass + propellant mass
  const propellantMassKg = config.propellantMassKg;
  const totalMassKg = dryMassKg + payloadMassKg + propellantMassKg;

  return {
    craft,
    engine,
    power,
    battery,
    comm,
    rover,
    selectedInstruments,
    dryMassKg,
    payloadMassKg,
    propellantMassKg,
    totalMassKg,
    massLimitKg: craft.dryMassKg + craft.maxPayloadMassKg + craft.maxPropellantMassKg,
    isPayloadWithinLimits: payloadMassKg <= craft.maxPayloadMassKg,
    isPropellantWithinLimits: propellantMassKg <= craft.maxPropellantMassKg
  };
}

export function calculateFinancialCost(config: MissionConfig) {
  const craft = SPACECRAFT_ARCHETYPES.find(s => s.id === config.spacecraftId) || SPACECRAFT_ARCHETYPES[1];
  const engine = PROPULSION_SYSTEMS.find(p => p.id === config.propulsionId) || PROPULSION_SYSTEMS[0];
  const power = POWER_SYSTEMS.find(p => p.id === config.powerSystemId) || POWER_SYSTEMS[0];
  const battery = BATTERY_SYSTEMS.find(b => b.id === config.batteryId) || BATTERY_SYSTEMS[0];
  const comm = COMM_SYSTEMS.find(c => c.id === config.commSystemId) || COMM_SYSTEMS[0];
  const rover = ROVER_SYSTEMS.find(r => r.id === config.roverId) || ROVER_SYSTEMS[0];
  const propOption = PROPELLANT_OPTIONS[config.propellantType] || PROPELLANT_OPTIONS.methalox;

  const instrumentsCost = SCIENTIFIC_INSTRUMENTS
    .filter(i => config.selectedInstrumentIds.includes(i.id))
    .reduce((sum, i) => sum + i.costM, 0);

  // Propellant procurement: cost per ton M
  const propellantCostM = (config.propellantMassKg / 1000) * (propOption.costPerTonM / 10);

  // Crew & Life Support equipment costs
  const suitCostM = config.lifeSupport.crewSize * (config.lifeSupport.suitType === 'lightweight_biomechanical' ? 14 : config.lifeSupport.suitType === 'advanced_hybrid' ? 9 : 5);
  const shieldCostM = config.lifeSupport.habitatShielding === 'active_electromagnetic' ? 85 : config.lifeSupport.habitatShielding === 'polyethylene_water_shield' ? 45 : 20;
  const consumablesCostM = (config.lifeSupport.crewSize * (config.lifeSupport.rationDaysFood + config.lifeSupport.rationDaysWater) * 0.04);

  const totalCostM = Math.round(
    craft.baseCostM +
    engine.costM +
    power.costM +
    battery.costM +
    comm.costM +
    rover.costM +
    instrumentsCost +
    propellantCostM +
    suitCostM +
    shieldCostM +
    consumablesCostM
  );

  return {
    totalCostM,
    remainingBudgetM: config.budgetLimitM - totalCostM,
    isBudgetValid: totalCostM <= config.budgetLimitM
  };
}

export function calculateDeltaV(config: MissionConfig) {
  const { dryMassKg, payloadMassKg, propellantMassKg, engine } = calculateMassBudget(config);

  const mDryTotal = dryMassKg + payloadMassKg;
  const mInitial = mDryTotal + propellantMassKg;

  // Tsiolkovsky Rocket Equation: delta-V = Isp * g0 * ln(m0 / mf)
  const totalDeltaVAvailableMs = Math.round(engine.ispSeconds * G0 * Math.log(mInitial / mDryTotal));

  // Required delta-V breakdown for a conceptual Mars round-trip mission:
  // Outbound: Trans-Mars Injection (TMI) ~3,800 m/s; Trajectory Corrections (TCM) ~150 m/s
  // Mars Arrival: Aerobraking assists, but retro-burn / terminal descent requires ~1,400 m/s
  // Mars Ascent: Launching from surface to Low Mars Orbit (LMO) requires ~4,100 m/s
  // Earth Return: Trans-Earth Injection (TEI) from LMO requires ~1,450 m/s; TCM ~100 m/s
  const deltaVRequiredDepartureMs = 3950;
  const deltaVRequiredDescentMs = 1400;
  const deltaVRequiredAscentMs = 4100;
  const deltaVRequiredReturnMs = 1550;

  const deltaVTotalRequiredMs = deltaVRequiredDepartureMs + deltaVRequiredDescentMs + deltaVRequiredAscentMs + deltaVRequiredReturnMs;

  // Can we depart and land?
  const isFuelDepartureValid = totalDeltaVAvailableMs >= (deltaVRequiredDepartureMs + deltaVRequiredDescentMs);

  // Can we make the complete round trip?
  const isFuelReturnValid = totalDeltaVAvailableMs >= deltaVTotalRequiredMs;

  return {
    totalDeltaVAvailableMs,
    deltaVRequiredDepartureMs,
    deltaVRequiredDescentMs,
    deltaVRequiredAscentMs,
    deltaVRequiredReturnMs,
    deltaVTotalRequiredMs,
    isFuelDepartureValid,
    isFuelReturnValid,
    deltaVMarginMs: totalDeltaVAvailableMs - deltaVTotalRequiredMs
  };
}

export function calculatePowerAndComm(config: MissionConfig) {
  const power = POWER_SYSTEMS.find(p => p.id === config.powerSystemId) || POWER_SYSTEMS[0];
  const battery = BATTERY_SYSTEMS.find(b => b.id === config.batteryId) || BATTERY_SYSTEMS[0];
  const comm = COMM_SYSTEMS.find(c => c.id === config.commSystemId) || COMM_SYSTEMS[0];
  const engine = PROPULSION_SYSTEMS.find(p => p.id === config.propulsionId) || PROPULSION_SYSTEMS[0];

  const selectedInstruments = SCIENTIFIC_INSTRUMENTS.filter(i => config.selectedInstrumentIds.includes(i.id));
  const instrumentsDrawKw = selectedInstruments.reduce((sum, i) => sum + i.powerDrawKw, 0);

  // Baseline craft hotel load + life support draw (0.8 kW per crew member)
  const hotelLoadKw = 6.0 + (config.lifeSupport.crewSize * 0.8);
  const baselineDrawKw = hotelLoadKw + comm.powerDrawKw + (engine.type === 'sep' ? 12.0 : 0);
  const peakDrawKw = baselineDrawKw + instrumentsDrawKw;

  // Solar degradation at Mars distance: Mars is at 1.52 AU, irradiance is ~43% of Earth orbit
  const solarFactorAtMars = 0.43;
  const effectiveGenerationKw = power.type === 'solar'
    ? Math.round(power.generationKw * solarFactorAtMars * 10) / 10
    : power.type === 'hybrid'
    ? Math.round((power.generationKw * 0.6 * solarFactorAtMars + power.generationKw * 0.4) * 10) / 10
    : power.generationKw;

  const netBalanceKw = Math.round((effectiveGenerationKw - baselineDrawKw) * 10) / 10;
  const isPowerValid = effectiveGenerationKw >= baselineDrawKw;

  // Communications throughput: daily Megabytes
  // Effective daily link window: ~12 hours to DSN Earth stations
  const dailySeconds = 12 * 3600;
  const dailyDataDownlinkMb = Math.round((comm.bandwidthMbps * 0.125 * dailySeconds)); // Mbps to MB/s
  const dailyDataGenerationMb = selectedInstruments.reduce((sum, i) => sum + i.dataPerObservationMb, 0);
  const isCommValid = dailyDataDownlinkMb >= (dailyDataGenerationMb * 0.6);

  return {
    powerGenerationKw: effectiveGenerationKw,
    powerBaselineDrawKw: baselineDrawKw,
    powerPeakDrawKw: peakDrawKw,
    powerNetBalanceKw: netBalanceKw,
    batteryCapacityKwh: battery.capacityKwh,
    isPowerValid,
    dailyDataDownlinkMb,
    dailyDataGenerationMb,
    isCommValid
  };
}

export function calculateMissionReadiness(config: MissionConfig): EngineeringValidation {
  const { totalCostM, remainingBudgetM, isBudgetValid } = calculateFinancialCost(config);
  const mass = calculateMassBudget(config);
  const dv = calculateDeltaV(config);
  const powerComm = calculatePowerAndComm(config);
  const engine = mass.engine;

  // Mission time calculation: Outbound transit + Surface sols + Inbound transit + 15% safety buffer
  const outboundDays = engine.nominalTransitDays;
  const surfaceSols = config.plannedSurfaceSols;
  const inboundDays = engine.nominalTransitDays;
  const totalMissionDaysRequired = Math.round((outboundDays + surfaceSols + inboundDays) * 1.15);

  const minConsumableDays = Math.min(
    config.lifeSupport.rationDaysFood,
    config.lifeSupport.rationDaysWater,
    config.lifeSupport.rationDaysOxygen
  );
  const isLifeSupportValid = minConsumableDays >= totalMissionDaysRequired;

  // Objective validation: does the player have the mandatory instruments?
  const objective = SCIENTIFIC_OBJECTIVES.find(o => o.id === config.objectiveId) || SCIENTIFIC_OBJECTIVES[0];
  const matchingInstruments = objective.requiredInstrumentIds.filter(id => config.selectedInstrumentIds.includes(id));
  const isScienceSufficient = matchingInstruments.length >= Math.ceil(objective.requiredInstrumentIds.length * 0.6);

  // Status messages aggregation
  const statusMessages: EngineeringValidation['statusMessages'] = [];

  // 1. Budget
  if (!isBudgetValid) {
    statusMessages.push({
      category: 'Budget',
      severity: 'CRITICAL',
      message: `Budget overrun by $${Math.abs(remainingBudgetM)}M. Procurement cannot be approved.`,
      advice: 'Downgrade spacecraft architecture, switch to chemical engines, or select fewer optional instruments.'
    });
  } else if (remainingBudgetM < 50) {
    statusMessages.push({
      category: 'Budget',
      severity: 'WARNING',
      message: `Tight budget contingency reserve ($${remainingBudgetM}M remaining).`,
      advice: 'A thin funding margin leaves no reserve for unexpected telemetry or flight software upgrades.'
    });
  } else {
    statusMessages.push({
      category: 'Budget',
      severity: 'SAFE',
      message: `Budget fully funded with $${remainingBudgetM}M in reserves.`,
      advice: 'Fiscal plan is sound.'
    });
  }

  // 2. Mass limits
  if (!mass.isPayloadWithinLimits) {
    statusMessages.push({
      category: 'Propulsion',
      severity: 'CRITICAL',
      message: `Payload mass (${mass.payloadMassKg.toLocaleString()} kg) exceeds spacecraft limit (${mass.craft.maxPayloadMassKg.toLocaleString()} kg).`,
      advice: `Choose the ${mass.craft.id === 'kestrel' ? 'Odyssey or Titan' : 'Titan'} architecture or reduce heavy equipment/crew.`
    });
  } else if (!mass.isPropellantWithinLimits) {
    statusMessages.push({
      category: 'Propulsion',
      severity: 'CRITICAL',
      message: `Propellant tank overfill: ${mass.propellantMassKg.toLocaleString()} kg loaded in ${mass.craft.maxPropellantMassKg.toLocaleString()} kg tank capacity.`,
      advice: 'Reduce propellant load to fit inside certified tanks.'
    });
  }

  // 3. Propulsion compatibility
  if (engine.compatiblePropellant !== config.propellantType) {
    statusMessages.push({
      category: 'Propulsion',
      severity: 'CRITICAL',
      message: `Incompatible propellant! Engine ${engine.name} requires ${engine.compatiblePropellant}, but ${config.propellantType} is selected.`,
      advice: `Switch propellant type to match ${engine.name}.`
    });
  }

  // 4. Delta-V & Fuel for Earth Return
  if (!dv.isFuelDepartureValid) {
    statusMessages.push({
      category: 'Propulsion',
      severity: 'CRITICAL',
      message: `Insufficient propellant to even reach Mars! Available: ${dv.totalDeltaVAvailableMs.toLocaleString()} m/s, required for departure & descent: ${(dv.deltaVRequiredDepartureMs + dv.deltaVRequiredDescentMs).toLocaleString()} m/s.`,
      advice: 'Increase propellant mass load or switch to higher Isp propulsion (NTP or SEP).'
    });
  } else if (!dv.isFuelReturnValid) {
    statusMessages.push({
      category: 'Propulsion',
      severity: 'CRITICAL',
      message: `CRITICAL RETURN DEFICIT: Fuel supports Mars landing but leaves crew stranded! Total round-trip requires ${dv.deltaVTotalRequiredMs.toLocaleString()} m/s, craft only has ${dv.totalDeltaVAvailableMs.toLocaleString()} m/s (short by ${Math.abs(dv.deltaVMarginMs).toLocaleString()} m/s).`,
      advice: 'Mandatory rule: Landing is not enough. You must carry sufficient propellant for Mars surface ascent and Earth return injection.'
    });
  } else {
    statusMessages.push({
      category: 'Propulsion',
      severity: 'SAFE',
      message: `Delta-V budget certified for complete round trip (${dv.totalDeltaVAvailableMs.toLocaleString()} m/s available, ${dv.deltaVMarginMs.toLocaleString()} m/s safety margin).`,
      advice: 'Trans-Earth injection and descent propulsion reserves are verified.'
    });
  }

  // 5. Power
  if (!powerComm.isPowerValid) {
    statusMessages.push({
      category: 'Power',
      severity: 'CRITICAL',
      message: `Electrical power generation (${powerComm.powerGenerationKw} kW) cannot meet baseline life support and craft draw (${powerComm.powerBaselineDrawKw.toFixed(1)} kW).`,
      advice: 'Add an RTG auxiliary or high-output hybrid power wing to avoid nocturnal life-support blackout.'
    });
  } else {
    statusMessages.push({
      category: 'Power',
      severity: 'SAFE',
      message: `Positive net power balance (+${powerComm.powerNetBalanceKw} kW surplus at Mars orbit).`,
      advice: 'System supports baseline life-support and instrument operations.'
    });
  }

  // 6. Life support
  if (!isLifeSupportValid) {
    statusMessages.push({
      category: 'Life Support',
      severity: 'CRITICAL',
      message: `Consumables shortfall: Minimum supply is ${minConsumableDays} days, but estimated expedition duration requires ${totalMissionDaysRequired} days.`,
      advice: 'Increase food, water, and oxygen ration days, or choose a faster NTP propulsion system.'
    });
  } else {
    statusMessages.push({
      category: 'Life Support',
      severity: 'SAFE',
      message: `Life support verified for ${minConsumableDays} days (${minConsumableDays - totalMissionDaysRequired} days contingency buffer).`,
      advice: 'Sufficient oxygen, water, and caloric rations loaded.'
    });
  }

  // 7. Scientific coverage
  if (!isScienceSufficient) {
    statusMessages.push({
      category: 'Science',
      severity: 'WARNING',
      message: `Missing key instruments for "${objective.shortTitle}". Equipped ${matchingInstruments.length} of ${objective.requiredInstrumentIds.length} required.`,
      advice: `Add missing instruments: ${objective.requiredInstrumentIds.filter(id => !config.selectedInstrumentIds.includes(id)).map(id => SCIENTIFIC_INSTRUMENTS.find(i => i.id === id)?.name).join(', ')}.`
    });
  } else {
    statusMessages.push({
      category: 'Science',
      severity: 'SAFE',
      message: `Complete instrument payload equipped for ${objective.shortTitle} milestones.`,
      advice: 'Ready to fulfill primary scientific criteria.'
    });
  }

  // 8. Landing site terrain risk
  const site = LANDING_SITES.find(s => s.id === config.landingSiteId) || LANDING_SITES[0];
  if (site.terrainRisk > 0.6) {
    statusMessages.push({
      category: 'Landing',
      severity: 'WARNING',
      message: `Selected landing site (${site.name}) has high terrain roughness & demanding landing conditions.`,
      advice: 'Ensure adequate retro-propulsion fuel margin for precision terminal touchdown.'
    });
  }

  // Determine overall readiness
  const hasCritical = statusMessages.some(s => s.severity === 'CRITICAL');
  const hasWarning = statusMessages.some(s => s.severity === 'WARNING');
  const overallReadiness = hasCritical ? 'CRITICAL' : hasWarning ? 'WARNING' : 'SAFE';

  return {
    totalCostM,
    remainingBudgetM,
    isBudgetValid,
    dryMassKg: mass.dryMassKg,
    payloadMassKg: mass.payloadMassKg,
    totalMassKg: mass.totalMassKg,
    massLimitKg: mass.massLimitKg,
    isMassValid: mass.isPayloadWithinLimits && mass.isPropellantWithinLimits,
    totalDeltaVAvailableMs: dv.totalDeltaVAvailableMs,
    deltaVRequiredDepartureMs: dv.deltaVRequiredDepartureMs,
    deltaVRequiredDescentMs: dv.deltaVRequiredDescentMs,
    deltaVRequiredAscentMs: dv.deltaVRequiredAscentMs,
    deltaVRequiredReturnMs: dv.deltaVRequiredReturnMs,
    deltaVTotalRequiredMs: dv.deltaVTotalRequiredMs,
    isFuelDepartureValid: dv.isFuelDepartureValid,
    isFuelReturnValid: dv.isFuelReturnValid,
    powerGenerationKw: powerComm.powerGenerationKw,
    powerBaselineDrawKw: powerComm.powerBaselineDrawKw,
    powerNetBalanceKw: powerComm.powerNetBalanceKw,
    isPowerValid: powerComm.isPowerValid,
    totalMissionDaysRequired,
    lifeSupportCoverageDays: minConsumableDays,
    isLifeSupportValid,
    dailyDataDownlinkMb: powerComm.dailyDataDownlinkMb,
    dailyDataGenerationMb: powerComm.dailyDataGenerationMb,
    isCommValid: powerComm.isCommValid,
    objectiveInstrumentMatches: matchingInstruments.length,
    totalObjectiveRequirements: objective.requiredInstrumentIds.length,
    isScienceSufficient,
    overallReadiness,
    statusMessages
  };
}
