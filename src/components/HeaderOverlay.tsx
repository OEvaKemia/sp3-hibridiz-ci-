import React from 'react';
import { SCENES, ETHANE_SCENES } from './TimelineControl';

interface HeaderOverlayProps {
  currentTime: number;
  duration: number;
  isProjectorMode: boolean;
  activeSim: 'methane' | 'ethane';
  onSelectSim: (sim: 'methane' | 'ethane') => void;
}

export const HeaderOverlay: React.FC<HeaderOverlayProps> = ({
  currentTime,
  isProjectorMode,
  activeSim,
  onSelectSim,
}) => {
  const isScene1 = currentTime < 10;
  const isScene2 = currentTime >= 10 && currentTime < 20;
  const isScene3 = currentTime >= 20 && currentTime < 30;
  const isScene4 = currentTime >= 30 && currentTime < 45;
  const isScene5 = currentTime >= 45;

  const currentScenes = activeSim === 'ethane' ? ETHANE_SCENES : SCENES;
  const currentScene = currentScenes.find((s, idx) => {
    const nextStart = currentScenes[idx + 1] ? currentScenes[idx + 1].startTime : 60;
    return currentTime >= s.startTime && currentTime < nextStart;
  }) || currentScenes[0];

  const headerBg = isProjectorMode
    ? 'bg-white/95 border-slate-300 text-slate-800 shadow-md'
    : 'bg-slate-900/90 border-slate-700/80 text-slate-100 shadow-xl';

  return (
    <div className="fixed top-3 left-3 right-3 pointer-events-none z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
      {/* Left: App Title, Simulation Switcher & Pedagogical Stage Info */}
      <div className={`pointer-events-auto rounded-2xl border px-3.5 py-2 backdrop-blur-md transition-colors ${headerBg} max-w-xl`}>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {/* Simulation Mode Switcher Pills */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <button
              onClick={() => onSelectSim('methane')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                activeSim === 'methane'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Metán (CH₄)
            </button>
            <button
              onClick={() => onSelectSim('ethane')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                activeSim === 'ethane'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Etán (C₂H₆)
            </button>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
            11. Kémia • 3D Szimuláció
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {currentScene.badge}
          </span>
        </div>

        <h1 className="text-base sm:text-lg font-extrabold tracking-tight">
          {activeSim === 'methane' ? (
            <>
              {isScene1 && '1. Jelenet – A szénatom alapállapota (1s² 2s² 2p²)'}
              {isScene2 && '2. Jelenet – Elektrongerjesztés (Gerjesztett állapot: C*)'}
              {isScene3 && '3. Jelenet – A hibridizáció folyamata (1 s + 3 p → 4 sp³)'}
              {isScene4 && '4. Jelenet – A tetraéderes térszerkezet (109,5°)'}
              {isScene5 && '5. Jelenet – Metán (CH₄) molekula kialakulása'}
            </>
          ) : (
            <>
              {isScene1 && '1. Jelenet – Két szénatom alapállapota (2 × 1s² 2s² 2p²)'}
              {isScene2 && '2. Jelenet – Párhuzamos elektrongerjesztés (2 × C*)'}
              {isScene3 && '3. Jelenet – Két szénatom sp³-hibridizációja (8 db sp³ pálya)'}
              {isScene4 && '4. Jelenet – A szén-szén (C–C) σ-kötés & Szabad rotáció'}
              {isScene5 && '5. Jelenet – 6 H atom kapcsolódása → Etán (C₂H₆) molekula'}
            </>
          )}
        </h1>

        <div className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-x-2">
          {activeSim === 'methane' ? (
            <>
              {isScene1 && (
                <span>
                  Konfiguráció: <strong className="text-sky-300 font-mono">1s² 2s² 2p²</strong> • 2 db párosítatlan elektron a 2p alhéjon (Hund-szabály).
                </span>
              )}
              {isScene2 && (
                <span>
                  Konfiguráció: <strong className="text-amber-300 font-mono">1s² 2s¹ 2p³</strong> • 1 db 2s elektron felkerül az üres 2p pályára → 4 párosítatlan vegyértékelektron.
                </span>
              )}
              {isScene3 && (
                <span className="font-bold text-cyan-300 text-xs bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                  1 db 2s + 3 db 2p → 4 db sp³-hibridpálya
                </span>
              )}
              {isScene4 && (
                <span>
                  <strong className="text-cyan-300">Négy egyenértékű sp³-hibridpálya</strong> • A nagyobb lebenyek a tetraéder 4 csúcsa felé mutatnak (<strong className="text-yellow-400 font-mono">109,5°</strong>).
                </span>
              )}
              {isScene5 && (
                <span>
                  <strong className="text-emerald-300 font-mono">Metán – CH₄ – 109,5°</strong> • 4 db hidrogén (1s) atommal létesített kovalens <strong className="text-white">C–H σ</strong> kötés.
                </span>
              )}
            </>
          ) : (
            <>
              {isScene1 && (
                <span>
                  Mindkét szénatom magja körül külön gömb alakú 2s és elnyújtott 8-as alakú 2p pályák keringenek.
                </span>
              )}
              {isScene2 && (
                <span>
                  Mindkét szénatomban 1-1 elektron átugrik a 2pz-re: <strong className="text-amber-300 font-mono">2 × (1s² 2s¹ 2p³)</strong> → összesen 8 vegyértékelektron.
                </span>
              )}
              {isScene3 && (
                <span className="font-bold text-emerald-300 text-xs bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                  2 × (1s + 3p) → 8 db sp³-hibridpálya keletkezik
                </span>
              )}
              {isScene4 && (
                <span>
                  <strong className="text-emerald-300">C–C σ-kötés kialakulása:</strong> A két szembeforduló sp³ pálya axiálisan átfed • <strong className="text-yellow-300">Szabad rotáció</strong> a kötéstengely körül!
                </span>
              )}
              {isScene5 && (
                <span>
                  <strong className="text-emerald-300 font-mono">Etán – C₂H₆:</strong> 1 db C–C σ + 6 db C–H σ = <strong className="text-white">7 db kovalens kötés</strong> • Staggered (nyitott) konformáció.
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
