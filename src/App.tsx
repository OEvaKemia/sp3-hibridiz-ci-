import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChemistryScene, SceneToggles } from './components/ChemistryScene';
import { EthaneScene } from './components/EthaneScene';
import { TimelineControl, SCENES, ETHANE_SCENES } from './components/TimelineControl';
import { OrbitalEnergyDiagram } from './components/OrbitalEnergyDiagram';
import { EthaneEnergyDiagram } from './components/EthaneEnergyDiagram';
import { HeaderOverlay } from './components/HeaderOverlay';
import { VideoRecorderModal } from './components/VideoRecorderModal';
import { TeacherGuideModal } from './components/TeacherGuideModal';

export default function App() {
  const [activeSim, setActiveSim] = useState<'methane' | 'ethane'>('methane');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState<boolean>(false);
  const [isTeacherGuideOpen, setIsTeacherGuideOpen] = useState<boolean>(false);

  const [toggles, setToggles] = useState<SceneToggles>({
    showTetrahedronFrame: true,
    showAngleArc: true,
    showElectrons: true,
    showAxes: true,
    showMinorLobes: true,
    autoRotate: false,
    modelStyle: 'orbitals',
    viewMode: 'sideBySide',
  });

  const duration = 60; // 60 seconds full animation
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Animation playback loop
  useEffect(() => {
    let animId: number;

    const tick = (time: number) => {
      if (lastTimeRef.current !== null && isPlaying) {
        const delta = (time - lastTimeRef.current) / 1000;
        setCurrentTime((prev) => {
          const next = prev + delta * playbackSpeed;
          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return next;
        });
      }
      lastTimeRef.current = time;
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed, duration]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const activeSceneList = activeSim === 'ethane' ? ETHANE_SCENES : SCENES;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((prev) => Math.max(0, prev - 5));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((prev) => Math.min(duration, prev + 5));
      } else if (e.key >= '1' && e.key <= '5') {
        const sceneIndex = parseInt(e.key, 10) - 1;
        if (activeSceneList[sceneIndex]) {
          setCurrentTime(activeSceneList[sceneIndex].startTime);
        }
      } else if (e.key === 'p' || e.key === 'P') {
        setIsProjectorMode((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        handleSelectSim('methane');
      } else if (e.key === 'e' || e.key === 'E') {
        handleSelectSim('ethane');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, activeSim]);

  const handlePlayPause = useCallback(() => {
    if (currentTime >= duration) {
      setCurrentTime(0);
    }
    setIsPlaying((p) => !p);
  }, [currentTime, duration]);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(Math.min(duration, Math.max(0, time)));
  }, [duration]);

  const handleRestart = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  const handleStep = useCallback((delta: number) => {
    setCurrentTime((prev) => Math.min(duration, Math.max(0, prev + delta)));
  }, [duration]);

  const handleToggleSetting = useCallback(<K extends keyof SceneToggles>(key: K, val: SceneToggles[K]) => {
    setToggles((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleSelectSim = useCallback((sim: 'methane' | 'ethane') => {
    setActiveSim(sim);
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden font-sans select-none ${
        isProjectorMode ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* 3D WebGL Canvas Layer (Switches dynamically between Methane and Ethane) */}
      <div className="absolute inset-0 z-0">
        {activeSim === 'methane' ? (
          <ChemistryScene
            key="methane-scene"
            currentTime={currentTime}
            toggles={toggles}
            isProjectorMode={isProjectorMode}
            canvasRefCallback={(canvas) => {
              canvasElementRef.current = canvas;
            }}
          />
        ) : (
          <EthaneScene
            key="ethane-scene"
            currentTime={currentTime}
            toggles={toggles}
            isProjectorMode={isProjectorMode}
            canvasRefCallback={(canvas) => {
              canvasElementRef.current = canvas;
            }}
          />
        )}
      </div>

      {/* Top Header & Simulation Switcher (Methane vs Ethane) */}
      <HeaderOverlay
        currentTime={currentTime}
        duration={duration}
        isProjectorMode={isProjectorMode}
        activeSim={activeSim}
        onSelectSim={handleSelectSim}
      />

      {/* Top-Right Compact Energy Diagram (Tailored to active simulation) */}
      <div className="fixed top-3 right-3 z-20 pointer-events-auto">
        {activeSim === 'methane' ? (
          <OrbitalEnergyDiagram
            currentTime={currentTime}
            isProjectorMode={isProjectorMode}
          />
        ) : (
          <EthaneEnergyDiagram
            currentTime={currentTime}
            isProjectorMode={isProjectorMode}
          />
        )}
      </div>

      {/* Bottom Timeline, Playback & 3D Layer Controls */}
      <TimelineControl
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        isProjectorMode={isProjectorMode}
        isFullscreen={isFullscreen}
        toggles={toggles}
        activeSim={activeSim}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onRestart={handleRestart}
        onStep={handleStep}
        onSpeedChange={setPlaybackSpeed}
        onToggleProjector={() => setIsProjectorMode((p) => !p)}
        onToggleFullscreen={toggleFullscreen}
        onOpenRecorder={() => setIsRecorderOpen(true)}
        onOpenTeacherGuide={() => setIsTeacherGuideOpen(true)}
        onToggleSetting={handleToggleSetting}
      />

      {/* Video Recorder & Exporter Modal (Saves distinct videos for Methane or Ethane) */}
      <VideoRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        canvas={canvasElementRef.current}
        onPlayFromStart={() => {
          setCurrentTime(0);
          setIsPlaying(true);
        }}
        onSeek={handleSeek}
        duration={duration}
        activeSim={activeSim}
      />

      {/* 11th Grade Chemistry Teacher Guide Modal */}
      <TeacherGuideModal
        isOpen={isTeacherGuideOpen}
        onClose={() => setIsTeacherGuideOpen(false)}
        onJumpToScene={(t) => {
          handleSeek(t);
          setIsPlaying(true);
        }}
      />
    </div>
  );
}
