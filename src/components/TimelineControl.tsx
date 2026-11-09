import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  Video,
  Sun,
  Moon,
  Info,
  Sliders,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { SceneToggles } from './ChemistryScene';

export interface SceneMeta {
  id: number;
  startTime: number;
  title: string;
  subtitle: string;
  badge: string;
}

export const SCENES: SceneMeta[] = [
  {
    id: 1,
    startTime: 0,
    title: '1. Alapállapot',
    subtitle: '1s² 2s² 2p² • Hund-szabály',
    badge: '0–10 mp',
  },
  {
    id: 2,
    startTime: 10,
    title: '2. Gerjesztés',
    subtitle: '2s → 2p • C* (1s² 2s¹ 2p³)',
    badge: '10–20 mp',
  },
  {
    id: 3,
    startTime: 20,
    title: '3. Hibridizáció',
    subtitle: '1s + 3p → 4 sp³ pálya',
    badge: '20–30 mp',
  },
  {
    id: 4,
    startTime: 30,
    title: '4. Tetraéder',
    subtitle: '109,5° kötésszög • Egyenértékű',
    badge: '30–45 mp',
  },
  {
    id: 5,
    startTime: 45,
    title: '5. Metán (CH₄)',
    subtitle: '4 db C–H σ-kötés • Molekula',
    badge: '45–60 mp',
  },
];

export const ETHANE_SCENES: SceneMeta[] = [
  {
    id: 1,
    startTime: 0,
    title: '1. Alapállapot',
    subtitle: '2 × C atom (1s² 2s² 2p²)',
    badge: '0–10 mp',
  },
  {
    id: 2,
    startTime: 10,
    title: '2. Gerjesztés',
    subtitle: '2 × C* (1s² 2s¹ 2p³)',
    badge: '10–20 mp',
  },
  {
    id: 3,
    startTime: 20,
    title: '3. Hibridizáció',
    subtitle: '2 × 4 = 8 db sp³ pálya',
    badge: '20–30 mp',
  },
  {
    id: 4,
    startTime: 30,
    title: '4. C–C σ-kötés',
    subtitle: 'Axiális átfedés • Szabad forgás',
    badge: '30–45 mp',
  },
  {
    id: 5,
    startTime: 45,
    title: '5. Etán (C₂H₆)',
    subtitle: '1 C–C σ + 6 C–H σ kötés',
    badge: '45–60 mp',
  },
];

interface TimelineControlProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackSpeed: number;
  isProjectorMode: boolean;
  isFullscreen: boolean;
  toggles: SceneToggles;
  activeSim?: 'methane' | 'ethane';
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onRestart: () => void;
  onStep: (delta: number) => void;
  onSpeedChange: (speed: number) => void;
  onToggleProjector: () => void;
  onToggleFullscreen: () => void;
  onOpenRecorder: () => void;
  onOpenTeacherGuide: () => void;
  onToggleSetting: <K extends keyof SceneToggles>(key: K, val: SceneToggles[K]) => void;
}

export const TimelineControl: React.FC<TimelineControlProps> = ({
  currentTime,
  duration,
  isPlaying,
  playbackSpeed,
  isProjectorMode,
  isFullscreen,
  toggles,
  activeSim = 'methane',
  onPlayPause,
  onSeek,
  onRestart,
  onStep,
  onSpeedChange,
  onToggleProjector,
  onToggleFullscreen,
  onOpenRecorder,
  onOpenTeacherGuide,
  onToggleSetting,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [showOptions, setShowOptions] = React.useState(false);

  const sceneList = activeSim === 'ethane' ? ETHANE_SCENES : SCENES;

  // Active scene
  const activeSceneIndex = sceneList.findIndex((s, idx) => {
    const nextStart = sceneList[idx + 1] ? sceneList[idx + 1].startTime : duration;
    return currentTime >= s.startTime && currentTime < nextStart;
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  const dockBg = isProjectorMode
    ? 'bg-white/95 border-slate-300 text-slate-800 shadow-2xl'
    : 'bg-slate-900/90 border-slate-700/80 text-slate-100 shadow-2xl';

  const btnBg = isProjectorMode
    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700';

  const activeBtnBg = 'bg-sky-600 text-white border-sky-500 shadow-sm';

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[96vw] max-w-5xl z-30 transition-all duration-300">
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow transition-all ${
            isProjectorMode
              ? 'bg-white/90 text-slate-700 border-slate-300 hover:bg-white'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
          title={isExpanded ? 'Vezérlők elrejtése (Teljes kép)' : 'Vezérlők megjelenítése'}
        >
          {isExpanded ? (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Vezérlősáv elrejtése</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Vezérlősáv megnyitása ({formatTime(currentTime)})</span>
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className={`rounded-2xl border p-3 md:p-4 backdrop-blur-xl ${dockBg}`}>
          {/* Top Row: Scene Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mb-3">
            {sceneList.map((scene, idx) => {
              const isActive = idx === activeSceneIndex;
              return (
                <button
                  key={scene.id}
                  onClick={() => onSeek(scene.startTime)}
                  className={`text-left px-2.5 py-1.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? isProjectorMode
                        ? 'bg-sky-100 border-sky-500 text-sky-950 font-bold ring-2 ring-sky-400/40'
                        : 'bg-sky-950/70 border-sky-400 text-sky-200 font-bold ring-2 ring-sky-500/30'
                      : isProjectorMode
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-[11px] truncate">{scene.title}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-black/15">
                      {scene.badge}
                    </span>
                  </div>
                  <div className="text-[9px] font-normal opacity-80 truncate mt-0.5">
                    {scene.subtitle}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Middle Row: Progress Slider with Scene Dividers */}
          <div className="relative mb-3 flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-sky-400 w-12 text-right">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-sky-500 bg-slate-700/50"
              />
              {/* Scene tick markers */}
              {sceneList.map((s) => {
                const percent = (s.startTime / duration) * 100;
                return (
                  <div
                    key={s.id}
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 bg-white/40 pointer-events-none rounded-full"
                    style={{ left: `${percent}%` }}
                    title={s.title}
                  />
                );
              })}
            </div>

            <span className="font-mono text-xs text-slate-400 w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Bottom Row: Primary Playback Actions & Utility Tools */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-700/30">
            {/* Left: Playback controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onRestart}
                className={`p-2 rounded-xl border text-sm transition ${btnBg}`}
                title="Újraindítás az elejétől (0:00)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => onStep(-5)}
                className={`p-2 rounded-xl border text-sm transition ${btnBg}`}
                title="Vissza 5 másodpercet"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={onPlayPause}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-md transition active:scale-95"
                title={isPlaying ? 'Szüneteltetés (Szóköz)' : 'Lejátszás (Szóköz)'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Szünet' : 'Lejátszás'}</span>
              </button>

              <button
                onClick={() => onStep(5)}
                className={`p-2 rounded-xl border text-sm transition ${btnBg}`}
                title="Előre 5 másodpercet"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Speed Pills */}
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-700/40">
                <span className="text-[10px] text-slate-400 font-semibold mr-0.5">Sebesség:</span>
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onSpeedChange(spd)}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-bold border transition ${
                      playbackSpeed === spd ? activeBtnBg : btnBg
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Model Display Toggles & Utilities */}
            <div className="flex items-center gap-1.5">
              {/* Toggles Dropdown button */}
              <button
                onClick={() => setShowOptions(!showOptions)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  showOptions ? activeBtnBg : btnBg
                }`}
                title="3D rétegek és megjelenítési beállítások"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>3D Rétegek</span>
              </button>

              {/* Teacher Guide */}
              <button
                onClick={onOpenTeacherGuide}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${btnBg}`}
                title="Tanári útmutató és 11. osztályos tananyag"
              >
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Tananyag</span>
              </button>

              {/* Video Recording & Export */}
              <button
                onClick={onOpenRecorder}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/50 bg-red-950/40 hover:bg-red-900/50 text-red-300 font-semibold text-xs transition"
                title="Videó rögzítése és letöltése (WebM / MP4)"
              >
                <Video className="w-3.5 h-3.5 text-red-400" />
                <span>Videó rögzítés</span>
              </button>

              {/* Projector / High Contrast Mode */}
              <button
                onClick={onToggleProjector}
                className={`p-2 rounded-xl border text-xs transition ${
                  isProjectorMode ? 'bg-amber-100 text-amber-900 border-amber-300' : btnBg
                }`}
                title={isProjectorMode ? 'Váltás Sötét módra' : 'Kivetítő mód (fehér háttér, tanterembe)'}
              >
                {isProjectorMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>

              {/* Fullscreen */}
              <button
                onClick={onToggleFullscreen}
                className={`p-2 rounded-xl border text-xs transition ${btnBg}`}
                title="Teljes képernyő (F11)"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collapsible 3D Layers Drawer */}
          {showOptions && (
            <div className="mt-3 pt-3 border-t border-slate-700/40 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={toggles.showTetrahedronFrame}
                  onChange={(e) => onToggleSetting('showTetrahedronFrame', e.target.checked)}
                  className="rounded accent-sky-500"
                />
                <span>Tetraéder váz</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={toggles.showAngleArc}
                  onChange={(e) => onToggleSetting('showAngleArc', e.target.checked)}
                  className="rounded accent-sky-500"
                />
                <span>109,5° kötésszög</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={toggles.showElectrons}
                  onChange={(e) => onToggleSetting('showElectrons', e.target.checked)}
                  className="rounded accent-sky-500"
                />
                <span>Elektronok</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={toggles.showAxes}
                  onChange={(e) => onToggleSetting('showAxes', e.target.checked)}
                  className="rounded accent-sky-500"
                />
                <span>XYZ tengelyek</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={toggles.showMinorLobes}
                  onChange={(e) => onToggleSetting('showMinorLobes', e.target.checked)}
                  className="rounded accent-sky-500"
                />
                <span>Kis lebenyek (back)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={toggles.autoRotate}
                  onChange={(e) => onToggleSetting('autoRotate', e.target.checked)}
                  className="rounded accent-sky-500"
                />
                <span>Forgás körbe</span>
              </label>

              {/* View Mode: Dual-Space vs Single Centered Atom */}
              <div className="col-span-2 sm:col-span-4 md:col-span-6 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/20">
                <span className="text-[11px] font-semibold text-cyan-400">Térbeli elrendezés:</span>
                <button
                  onClick={() => onToggleSetting('viewMode', 'sideBySide')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    toggles.viewMode === 'sideBySide' ? activeBtnBg : btnBg
                  }`}
                  title="Egy térben látható a kezdeti 1s/2s/2p és a végső sp³ állapot is"
                >
                  Közös tér: Kezdeti + Végső egy térben
                </button>
                <button
                  onClick={() => onToggleSetting('viewMode', 'single')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    toggles.viewMode === 'single' ? activeBtnBg : btnBg
                  }`}
                  title="Egyetlen atommagra fókuszált nézet"
                >
                  Központi atom nézet
                </button>
              </div>

              {/* One-by-one sp3 formation controls during hybridization */}
              <div className="col-span-2 sm:col-span-4 md:col-span-6 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-700/20">
                <span className="text-[11px] font-semibold text-amber-300">sp³ egyenkénti képződés:</span>
                {[
                  { label: 'sp³ #1', time: 21.0 },
                  { label: 'sp³ #2', time: 23.3 },
                  { label: 'sp³ #3', time: 25.8 },
                  { label: 'sp³ #4', time: 28.2 },
                  { label: '4 × sp³ kész (30s)', time: 30.0 },
                ].map((step) => (
                  <button
                    key={step.label}
                    onClick={() => onSeek(step.time)}
                    className="px-2 py-0.5 rounded-md text-[11px] font-mono border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 text-amber-200 transition"
                  >
                    {step.label}
                  </button>
                ))}
              </div>

              {/* Model representation style for Scene 5 */}
              <div className="col-span-2 sm:col-span-4 md:col-span-6 flex items-center gap-2 pt-2 border-t border-slate-700/20">
                <span className="text-[11px] font-semibold text-slate-400">CH₄ Megjelenítés:</span>
                {(['orbitals', 'ballAndStick', 'spaceFilling'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => onToggleSetting('modelStyle', style)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      toggles.modelStyle === style ? activeBtnBg : btnBg
                    }`}
                  >
                    {style === 'orbitals' && 'Orbitál átfedés (σ)'}
                    {style === 'ballAndStick' && 'Golyó-pálcika modell'}
                    {style === 'spaceFilling' && 'Térkitöltő modell (CPK)'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
