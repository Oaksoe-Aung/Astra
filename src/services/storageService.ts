import { MissionConfig, MissionDebrief } from '../types/mission';

const STORAGE_KEY_SAVED_CONFIG = 'red_frontier_saved_mission_config';
const STORAGE_KEY_PAST_DEBRIEFS = 'red_frontier_past_debriefs';

export function saveMissionConfig(config: MissionConfig): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_SAVED_CONFIG, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Failed to save mission config:', e);
    return false;
  }
}

export function loadSavedMissionConfig(): MissionConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_CONFIG);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.objectiveId === 'string' && typeof parsed.spacecraftId === 'string') {
      return parsed as MissionConfig;
    }
    return null;
  } catch (e) {
    console.error('Failed to parse saved mission config:', e);
    return null;
  }
}

export function saveMissionDebrief(debrief: MissionDebrief): void {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY_PAST_DEBRIEFS);
    const list: MissionDebrief[] = existingRaw ? JSON.parse(existingRaw) : [];
    list.unshift(debrief);
    localStorage.setItem(STORAGE_KEY_PAST_DEBRIEFS, JSON.stringify(list.slice(0, 10)));
  } catch (e) {
    console.error('Failed to save debrief:', e);
  }
}

export function loadPastDebriefs(): MissionDebrief[] {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY_PAST_DEBRIEFS);
    return existingRaw ? JSON.parse(existingRaw) : [];
  } catch (e) {
    return [];
  }
}

export function exportMissionConfigJson(config: MissionConfig): string {
  return JSON.stringify(config, null, 2);
}

export function validateAndImportMissionConfigJson(jsonStr: string): { success: boolean; config?: MissionConfig; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Malformed JSON payload.' };
    }
    if (!parsed.objectiveId || !parsed.spacecraftId || !parsed.propulsionId) {
      return { success: false, error: 'Missing essential architecture fields (objectiveId, spacecraftId, propulsionId).' };
    }
    if (typeof parsed.propellantMassKg !== 'number' || parsed.propellantMassKg <= 0) {
      return { success: false, error: 'Invalid propellant mass specified.' };
    }
    if (!parsed.lifeSupport || typeof parsed.lifeSupport.crewSize !== 'number') {
      return { success: false, error: 'Missing valid life support configuration block.' };
    }
    return { success: true, config: parsed as MissionConfig };
  } catch (err) {
    return { success: false, error: 'Invalid JSON syntax.' };
  }
}
