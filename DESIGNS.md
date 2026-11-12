# RED FRONTIER — MVP Architecture & Design Specification (DESIGNS.md)

## 1. Product Purpose
Transform RED FRONTIER from a cluttered management dashboard into a focused, highly playable, third-person 3D Mars exploration game MVP.

---

## 2. Streamlined User Flow

```
[ Step 1: Expedition Setup ] 
Choose Spacecraft (Kestrel / Odyssey / Titan) & Scientific Objective (Ancient Water / Volcanic Geology / Regolith).
        │
        ▼
[ Step 2: Landing Site Selection ]
Select Landing Zone (Jezero Crater Delta / Valles Marineris / Gale Crater) -> Click [Launch Expedition].
        │
        ▼
[ Step 3: Full-Screen 3D Mars Surface ]
• Third-person control of the high-fidelity EVA astronaut.
• Direct physical interaction: walk/sprint with WASD, jump with Space, look around with Mouse/Drag.
• Natural rock scanning: approach rock -> Press [E] to scan -> learn 1 interesting fact.
• Drilling & sampling: Press [E] to collect core sample.
• Rover driving: walk up to rover -> Press [E] to drive -> drive and steer with WASD -> Press [E] to dismount.
• Board lander: return to lander ladder -> Press [E] to conclude mission.
        │
        ▼
[ Step 4: Mission Debrief Summary ]
View clean expedition summary (samples collected, science score) -> [Play Again / Launch New Expedition].
```

---

## 3. Clutter Elimination (What is Removed)
- **Eliminated**:
  - Complex workshop subsystems (mass calculators, propellant budgets, battery charts, comm antenna matrices).
  - 2D Command Desk simulation switcher.
  - Multi-tab navigation bar header.
  - Science Center encyclopedia modal.
  - Developer scenario test bench modal.
- **Kept & Polished**:
  - Full-screen WebGL 3D world with procedural soil texturing, atmospheric fog, and natural boulders.
  - Realistic EVA astronaut model with articulated gauntlets and lunar overboots.
  - Interactive rover driving with suspension and steering.
  - Clear floating 3D waypoint indicators showing active target and distance in meters.
  - Focused life support gauges (Oxygen % and Power %).

---

## 4. Component Architecture

| Component | Role |
| :--- | :--- |
| `App.tsx` | Clean state manager: `setup` → `site` → `exploration_3d` → `debrief` |
| `ExpeditionSetup.tsx` | Step 1 visual selector for spacecraft class and primary scientific objective |
| `LandingSiteSelect.tsx` | Step 2 destination selector with direct `[Launch Expedition]` CTA |
| `Mars3DGameView.tsx` | Full-screen Three.js 3D viewport, astronaut locomotion, rock sampling, rover driving |
| `DebriefScreen.tsx` | Clean summary card with replay action |
