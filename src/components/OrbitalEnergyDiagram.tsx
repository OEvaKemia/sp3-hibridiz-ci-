import React from 'react';

interface OrbitalEnergyDiagramProps {
  currentTime: number;
  isProjectorMode: boolean;
}

export const OrbitalEnergyDiagram: React.FC<OrbitalEnergyDiagramProps> = ({
  currentTime,
  isProjectorMode,
}) => {
  const isGround = currentTime < 10;
  const isExcitation = currentTime >= 10 && currentTime < 20;
  const isHybridizing = currentTime >= 20 && currentTime < 30;
  const isTetrahedral = currentTime >= 30 && currentTime < 45;
  const isMethane = currentTime >= 45;

  const exciteProgress = isExcitation
    ? Math.min(1, Math.max(0, (currentTime - 11) / 3))
    : currentTime >= 20 ? 1 : 0;

  const sp3Progress = [
    currentTime >= 20 ? Math.min(1, Math.max(0, (currentTime - 20) / 2.2)) : 0,
    currentTime >= 22.2 ? Math.min(1, Math.max(0, (currentTime - 22.2) / 2.2)) : 0,
    currentTime >= 24.5 ? Math.min(1, Math.max(0, (currentTime - 24.5) / 2.2)) : 0,
    currentTime >= 27.0 ? Math.min(1, Math.max(0, (currentTime - 27.0) / 2.2)) : 0,
  ];

  const overallHybridProgress = isHybridizing
    ? Math.min(1, Math.max(0, (currentTime - 20) / 8))
    : currentTime >= 30 ? 1 : 0;

  const methaneProgress = isMethane
    ? Math.min(1, Math.max(0, (currentTime - 46) / 4))
    : 0;

  const bgClass = isProjectorMode
    ? 'bg-white/95 border-slate-300 text-slate-800 shadow-lg'
    : 'bg-slate-900/90 border-slate-700/80 text-slate-200 shadow-xl';

  const boxBgClass = isProjectorMode ? 'bg-slate-100 border-slate-400' : 'bg-slate-800/80 border-slate-600';
  const activeBoxBorder = isProjectorMode ? 'border-sky-600 bg-sky-50' : 'border-sky-400 bg-sky-950/50';

  return (
    <div
      className={`rounded-xl border p-2.5 backdrop-blur-md transition-all text-xs font-mono select-none w-[270px] sm:w-[295px] ${bgClass}`}
    >
      {/* Compact Title Bar */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-500/25">
        <span className="font-bold tracking-wider text-[10px] uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          Orbitáldiagram
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          {isGround && 'Alapállapot (C)'}
          {isExcitation && 'Gerjesztett (C*)'}
          {isHybridizing && 'sp³ Hibridizáció'}
          {isTetrahedral && '4 × sp³ tetraéder'}
          {isMethane && 'CH₄ molekula'}
        </span>
      </div>

      <div className="relative pl-5 py-0.5 flex flex-col justify-between min-h-[145px]">
        {/* Energy axis arrow */}
        <div className="absolute left-1 top-0 bottom-0.5 w-0.5 bg-gradient-to-t from-slate-600 via-sky-400 to-amber-400">
          <div className="absolute -top-1.5 -left-1 text-[8px] text-amber-400 font-bold">▲</div>
        </div>
        <div className="absolute left-2 top-0.5 -rotate-90 origin-left text-[8px] font-semibold text-slate-400 uppercase tracking-widest">
          E
        </div>

        {/* Dynamic Transition: 2s & 2p or 4x sp3 */}
        {overallHybridProgress < 0.85 ? (
          <div className="space-y-2">
            {/* 2p Level (3 boxes) with 2p figure-8 dumbbell shapes */}
            <div className="flex items-start gap-1.5">
              <span className="w-5 text-[9px] text-slate-400 font-semibold pt-1.5">2p:</span>
              <div className="flex gap-1.5">
                {/* 2px */}
                <div className="flex flex-col items-center" title="2px elnyújtott 8-as alak">
                  <div className={`w-7.5 h-7.5 border rounded flex items-center justify-center relative ${activeBoxBorder}`}>
                    <span className="text-sm font-bold text-rose-400">↑</span>
                    <span className="absolute -top-1.5 left-0.5 text-[7px] font-bold text-rose-300">px</span>
                  </div>
                  {/* Figure-8 shape */}
                  <svg viewBox="0 0 32 16" className="w-7 h-3 mt-0.5">
                    <ellipse cx="9" cy="8" rx="6.5" ry="4.5" fill="#fb7185" fillOpacity="0.85" />
                    <ellipse cx="23" cy="8" rx="6.5" ry="4.5" fill="#f43f5e" fillOpacity="0.9" />
                    <circle cx="16" cy="8" r="1.2" fill="#fff" />
                  </svg>
                  <span className="text-[7px] text-slate-400 leading-none">8-as</span>
                </div>

                {/* 2py */}
                <div className="flex flex-col items-center" title="2py elnyújtott 8-as alak">
                  <div className={`w-7.5 h-7.5 border rounded flex items-center justify-center relative ${activeBoxBorder}`}>
                    <span className="text-sm font-bold text-emerald-400">↑</span>
                    <span className="absolute -top-1.5 left-0.5 text-[7px] font-bold text-emerald-300">py</span>
                  </div>
                  <svg viewBox="0 0 32 16" className="w-7 h-3 mt-0.5">
                    <ellipse cx="16" cy="4" rx="4.5" ry="3.8" fill="#10b981" fillOpacity="0.9" />
                    <ellipse cx="16" cy="12" rx="4.5" ry="3.8" fill="#34d399" fillOpacity="0.85" />
                    <circle cx="16" cy="8" r="1.2" fill="#fff" />
                  </svg>
                  <span className="text-[7px] text-slate-400 leading-none">8-as</span>
                </div>

                {/* 2pz */}
                <div className="flex flex-col items-center" title="2pz elnyújtott 8-as alak">
                  <div
                    className={`w-7.5 h-7.5 border rounded flex items-center justify-center relative transition-all duration-300 ${
                      exciteProgress > 0.4 ? activeBoxBorder : boxBgClass
                    }`}
                  >
                    {exciteProgress > 0.4 ? (
                      <span className="text-sm font-bold text-purple-400">↑</span>
                    ) : (
                      <span className="text-[8px] text-slate-400 italic">∅</span>
                    )}
                    <span className="absolute -top-1.5 left-0.5 text-[7px] font-bold text-purple-300">pz</span>
                  </div>
                  <svg viewBox="0 0 32 16" className="w-7 h-3 mt-0.5">
                    <ellipse cx="10" cy="5" rx="5" ry="4" fill="#a855f7" fillOpacity={exciteProgress > 0.3 ? 0.9 : 0.25} />
                    <ellipse cx="22" cy="11" rx="5" ry="4" fill="#c084fc" fillOpacity={exciteProgress > 0.3 ? 0.85 : 0.25} />
                    <circle cx="16" cy="8" r="1.2" fill="#fff" />
                  </svg>
                  <span className="text-[7px] text-slate-400 leading-none">
                    {exciteProgress > 0.5 ? '2p³' : 'üres'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2s Level (1 box) with Spherical shape */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-700/30">
              <span className="w-5 text-[9px] text-slate-400 font-semibold">2s:</span>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className={`w-7.5 h-7.5 border rounded flex items-center justify-center gap-0.5 ${activeBoxBorder}`}>
                    <span className="text-sm font-bold text-sky-400">↑</span>
                    {exciteProgress < 0.7 && (
                      <span
                        className="text-sm font-bold text-amber-400 transition-opacity"
                        style={{ opacity: Math.max(0, 1 - exciteProgress * 1.5) }}
                      >
                        ↓
                      </span>
                    )}
                  </div>
                  <span className="text-[7px] text-sky-300 mt-0.5">gömb s</span>
                </div>
                <span className="text-[8.5px] text-slate-400 leading-tight">
                  {exciteProgress > 0.5 ? '2s¹ (1 elektron maradt)' : '2s² (2 ellentétes spin)'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Combined 4 equivalent sp3 boxes forming one by one */
          <div className="py-1 animate-fadeIn">
            <div className="flex items-start gap-1.5 mb-1.5">
              <span className="w-6 text-[9px] text-cyan-400 font-bold pt-1.5">sp³:</span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((idx) => {
                  const isFormed = sp3Progress[idx] >= 0.8;
                  return (
                    <div key={idx} className="flex flex-col items-center" title={`sp³ #${idx + 1} hibridpálya`}>
                      <div
                        className={`w-7 h-7 border rounded flex items-center justify-center gap-0.5 relative transition-all ${
                          isFormed
                            ? 'border-cyan-400 bg-cyan-950/60 shadow-sm ring-1 ring-cyan-400/40'
                            : 'border-slate-600 bg-slate-800/40 opacity-40'
                        }`}
                      >
                        <span className="text-sm font-bold text-cyan-300">↑</span>
                        {methaneProgress > 0.2 + idx * 0.15 && (
                          <span className="text-sm font-bold text-emerald-300 animate-fadeIn">↓</span>
                        )}
                        <span className="absolute -top-1.5 left-0.5 text-[7px] font-bold text-cyan-400">#{idx + 1}</span>
                      </div>
                      <svg viewBox="0 0 28 16" className="w-6 h-3 mt-0.5">
                        <ellipse cx="7" cy="8" rx="3.5" ry="2.8" fill="#f59e0b" fillOpacity="0.85" />
                        <ellipse cx="19" cy="8" rx="8" ry="5.5" fill="#06b6d4" fillOpacity="0.95" />
                        <circle cx="11" cy="8" r="1.2" fill="#fff" />
                      </svg>
                      <span className="text-[6.5px] text-cyan-300">sp³</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-[8.5px] text-cyan-300 leading-tight pl-7">
              {isMethane ? '4 db C–H σ-kötés kialakult' : '4 egyenértékű aszimmetrikus pálya'}
            </div>
          </div>
        )}

        {/* 1s Core */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-700/30">
          <span className="w-5 text-[9px] text-slate-400 font-semibold">1s:</span>
          <div className={`w-7 h-6 border rounded flex items-center justify-center gap-0.5 ${boxBgClass}`}>
            <span className="text-[10px] font-bold text-slate-400">↑↓</span>
          </div>
          <span className="text-[8px] text-slate-400">1s² (belső héj)</span>
        </div>
      </div>

      {/* Formula footer */}
      <div className="mt-1 pt-1 border-t border-slate-500/20 text-center font-bold text-[9.5px] text-sky-400">
        {isGround && 'Alapállapot: 1s² 2s² 2p² (C)'}
        {isExcitation && 'Gerjesztett állapot: 1s² 2s¹ 2p³ (C*)'}
        {(isHybridizing || isTetrahedral) && '1 db 2s + 3 db 2p → 4 db sp³'}
        {isMethane && 'CH₄: 4 × C(sp³) – H(1s) σ-kötés'}
      </div>
    </div>
  );
};
