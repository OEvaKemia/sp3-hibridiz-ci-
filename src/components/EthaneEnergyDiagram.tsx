import React from 'react';

interface EthaneEnergyDiagramProps {
  currentTime: number;
  isProjectorMode: boolean;
}

export const EthaneEnergyDiagram: React.FC<EthaneEnergyDiagramProps> = ({
  currentTime,
  isProjectorMode,
}) => {
  const isGround = currentTime < 10;
  const isExcitation = currentTime >= 10 && currentTime < 20;
  const isHybridizing = currentTime >= 20 && currentTime < 30;
  const isCCBond = currentTime >= 30 && currentTime < 45;
  const isEthane = currentTime >= 45;

  const exciteProgress = isExcitation
    ? Math.min(1, Math.max(0, (currentTime - 11) / 3))
    : currentTime >= 20 ? 1 : 0;

  const hybridProgress = isHybridizing
    ? Math.min(1, Math.max(0, (currentTime - 20) / 8))
    : currentTime >= 30 ? 1 : 0;

  const ccBondProgress = isCCBond
    ? Math.min(1, Math.max(0, (currentTime - 30) / 5))
    : currentTime >= 45 ? 1 : 0;

  const ethaneProgress = isEthane
    ? Math.min(1, Math.max(0, (currentTime - 46) / 4))
    : 0;

  const bgClass = isProjectorMode
    ? 'bg-white/95 border-slate-300 text-slate-800 shadow-lg'
    : 'bg-slate-900/90 border-slate-700/80 text-slate-200 shadow-xl';

  const boxBgClass = isProjectorMode ? 'bg-slate-100 border-slate-400' : 'bg-slate-800/80 border-slate-600';
  const activeBoxBorder = isProjectorMode ? 'border-sky-600 bg-sky-50' : 'border-sky-400 bg-sky-950/50';

  return (
    <div
      className={`rounded-xl border p-2.5 backdrop-blur-md transition-all text-xs font-mono select-none w-[275px] sm:w-[300px] ${bgClass}`}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-500/25">
        <span className="font-bold tracking-wider text-[10px] uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Etán Orbitáldiagram
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {isGround && '2 × C Alapállapot'}
          {isExcitation && '2 × C* Gerjesztett'}
          {isHybridizing && '2 × 4 sp³ Hibrid'}
          {isCCBond && 'C–C σ-kötés képződés'}
          {isEthane && 'C₂H₆ (7 db σ-kötés)'}
        </span>
      </div>

      <div className="relative pl-5 py-0.5 flex flex-col justify-between min-h-[150px]">
        {/* Energy axis */}
        <div className="absolute left-1 top-0 bottom-0.5 w-0.5 bg-gradient-to-t from-slate-600 via-sky-400 to-amber-400">
          <div className="absolute -top-1.5 -left-1 text-[8px] text-amber-400 font-bold">▲</div>
        </div>
        <div className="absolute left-2 top-0.5 -rotate-90 origin-left text-[8px] font-semibold text-slate-400 uppercase tracking-widest">
          E
        </div>

        {hybridProgress < 0.85 ? (
          // Separated 2p and 2s levels for Carbon atoms
          <div className="space-y-2">
            <div className="flex items-start gap-1.5">
              <span className="w-6 text-[9px] text-slate-400 font-semibold pt-1">2p:</span>
              <div className="flex gap-1">
                {['px', 'py', 'pz'].map((pName, idx) => {
                  const isPz = pName === 'pz';
                  const isOccupied = !isPz || exciteProgress > 0.4;
                  return (
                    <div key={pName} className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 border rounded flex items-center justify-center relative transition-all ${
                          isOccupied ? activeBoxBorder : boxBgClass
                        }`}
                      >
                        {isOccupied ? (
                          <span className="text-sm font-bold text-rose-400">↑</span>
                        ) : (
                          <span className="text-[8px] text-slate-400 italic">∅</span>
                        )}
                        <span className="absolute -top-1.5 left-0.5 text-[6.5px] font-bold text-slate-300">
                          {pName}
                        </span>
                      </div>
                      <span className="text-[6.5px] text-slate-400">8-as</span>
                    </div>
                  );
                })}
              </div>
              <span className="text-[8px] text-slate-400 pt-1 ml-1">× 2 szénatom</span>
            </div>

            {/* 2s level */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-700/30">
              <span className="w-6 text-[9px] text-slate-400 font-semibold">2s:</span>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 border rounded flex items-center justify-center gap-0.5 ${activeBoxBorder}`}>
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
                  <span className="text-[6.5px] text-sky-300">gömb</span>
                </div>
                <span className="text-[8.5px] text-slate-400 leading-tight">
                  {exciteProgress > 0.5 ? '2 × 2s¹ (gerjesztve)' : '2 × 2s² (mindkét szénben)'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Hybridized state: C-C sigma bond + 6 C-H sigma bonds
          <div className="py-1 space-y-2 animate-fadeIn">
            {/* C-C Sigma Bond Highlight */}
            <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-emerald-300 block">Központi C–C σ-kötés:</span>
                <span className="text-[7.5px] text-slate-400">C_A(sp³) – C_B(sp³) axiális átfedés</span>
              </div>
              <div className="w-8 h-7 border border-emerald-400 bg-emerald-900/60 rounded flex items-center justify-center font-bold text-sm text-emerald-200">
                {ccBondProgress > 0.5 ? '↑↓' : '↑ ↑'}
              </div>
            </div>

            {/* 6 C-H sigma bonds */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8.5px] text-cyan-300 font-semibold">6 db C–H σ-kötés (H 1s):</span>
                <span className="text-[8px] text-slate-400">{isEthane ? '6/6 kötve' : 'képződik...'}</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className="h-6 border border-cyan-500/50 bg-cyan-950/40 rounded flex items-center justify-center text-[10px] font-bold text-cyan-300"
                  >
                    {ethaneProgress > 0.2 + idx * 0.12 ? '↑↓' : '↑'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 1s core shells */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-700/30">
          <span className="w-6 text-[9px] text-slate-400 font-semibold">1s:</span>
          <div className={`w-7 h-5.5 border rounded flex items-center justify-center ${boxBgClass}`}>
            <span className="text-[9px] font-bold text-slate-400">↑↓</span>
          </div>
          <span className="text-[8px] text-slate-400">2 × 1s² (belső törzsek C_A és C_B)</span>
        </div>
      </div>

      {/* Formula footer */}
      <div className="mt-1 pt-1 border-t border-slate-500/20 text-center font-bold text-[9px] text-emerald-400">
        {isGround && '2 db C(alap) • 2 × (1s² 2s² 2p²)'}
        {isExcitation && '2 db C*(gerjesztett) • 2 × (1s² 2s¹ 2p³)'}
        {isHybridizing && '2 × 4 = 8 db sp³-hibridpálya keletkezik'}
        {isCCBond && '1 db C–C σ-kötés alakul ki (154 pm)'}
        {isEthane && 'Etán (C₂H₆): 1 db C–C σ + 6 db C–H σ = 7 kovalens kötés'}
      </div>
    </div>
  );
};
