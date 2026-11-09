import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Square, Download, Video, CheckCircle, AlertCircle } from 'lucide-react';

interface VideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: HTMLCanvasElement | null;
  onPlayFromStart: () => void;
  onSeek: (time: number) => void;
  duration: number;
  activeSim?: 'methane' | 'ethane';
}

export const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({
  isOpen,
  onClose,
  canvas,
  onPlayFromStart,
  onSeek,
  duration,
  activeSim = 'methane',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [format, setFormat] = useState<'webm' | 'mp4'>('webm');
  const [recordMode, setRecordMode] = useState<'full' | 'manual'>('full');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  if (!isOpen) return null;

  // Determine optimal MIME type
  const getSupportedMimeType = (requestedFormat: 'webm' | 'mp4'): string => {
    if (requestedFormat === 'mp4' && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
      return 'video/mp4;codecs=avc1';
    }
    if (requestedFormat === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')) {
      return 'video/mp4';
    }
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      return 'video/webm;codecs=vp9';
    }
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      return 'video/webm;codecs=vp8';
    }
    return 'video/webm';
  };

  const startRecording = () => {
    if (!canvas) {
      setErrorMsg('A 3D vászon még nem töltődött be.');
      return;
    }

    try {
      setErrorMsg(null);
      setRecordedBlob(null);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
      chunksRef.current = [];

      const stream = canvas.captureStream(30);
      const mimeType = getSupportedMimeType(format);

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000, // 5 Mbps high quality for classroom projector
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setRecordedUrl(url);
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(500); // 500ms chunk intervals
      setIsRecording(true);
      setRecordedDuration(0);

      // Start timer
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        setRecordedDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 500);

      if (recordMode === 'full') {
        onSeek(0);
        onPlayFromStart();
        // Automatically stop when 60s animation ends
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, (duration + 1) * 1000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`A felvétel indítása nem sikerült: ${err.message || 'Ismeretlen hiba'}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const downloadVideo = () => {
    if (!recordedUrl) return;
    const a = document.createElement('a');
    a.href = recordedUrl;
    const ext = format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4') ? 'mp4' : 'webm';
    const prefix = activeSim === 'ethane' ? 'etan_c2h6_sp3_szimulacio' : 'szenatom_sp3_metan_ch4';
    a.download = `${prefix}_${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-red-400" />
            <h3 className="text-base font-bold text-white">3D Animáció Rögzítése & Exportálás</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Rögzítési mód:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRecordMode('full')}
                disabled={isRecording}
                className={`p-3 rounded-xl border text-left transition ${
                  recordMode === 'full'
                    ? 'border-sky-500 bg-sky-950/50 text-sky-200'
                    : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-sm mb-0.5">Teljes animáció (0–60 mp)</div>
                <div className="text-[10px] text-slate-400">
                  Automatikusan lejátsza és rögzíti mind az 5 jelenetet.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRecordMode('manual')}
                disabled={isRecording}
                className={`p-3 rounded-xl border text-left transition ${
                  recordMode === 'manual'
                    ? 'border-sky-500 bg-sky-950/50 text-sky-200'
                    : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-sm mb-0.5">Kézi indítás & leállítás</div>
                <div className="text-[10px] text-slate-400">
                  Pontosan azt a szakaszt rögzíti, amíg a Leállítás gombot meg nem nyomod.
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Kívánt formátum:</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormat('webm')}
                disabled={isRecording}
                className={`flex-1 py-2 px-3 rounded-xl border text-center font-bold transition ${
                  format === 'webm'
                    ? 'border-cyan-500 bg-cyan-950/50 text-cyan-200'
                    : 'border-slate-700 bg-slate-800/50 text-slate-300'
                }`}
              >
                WebM (Ajánlott, veszteségmentes)
              </button>
              <button
                type="button"
                onClick={() => setFormat('mp4')}
                disabled={isRecording}
                className={`flex-1 py-2 px-3 rounded-xl border text-center font-bold transition ${
                  format === 'mp4'
                    ? 'border-cyan-500 bg-cyan-950/50 text-cyan-200'
                    : 'border-slate-700 bg-slate-800/50 text-slate-300'
                }`}
              >
                MP4 / AVC (Böngészőtől függő)
              </button>
            </div>
          </div>

          {/* Recording Status Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            {isRecording ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-sm">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                  <span>Rögzítés folyamatban... ({recordedDuration} mp)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  A 3D modell vásznáról közvetlenül rögzítünk 30 képkocka/mp sebességgel.
                </p>
                <button
                  onClick={stopRecording}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow transition"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Rögzítés befejezése most</span>
                </button>
              </div>
            ) : recordedUrl ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle className="w-5 h-5" />
                  <span>A videó sikeresen elkészült!</span>
                </div>
                <video
                  src={recordedUrl}
                  controls
                  className="w-full max-h-48 rounded-lg border border-slate-700 mx-auto"
                />
                <button
                  onClick={downloadVideo}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Videófájl letöltése a számítógépre</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-400">
                  Kattints az indítás gombra a 3D-s animáció videófájlba történő felvételéhez.
                </p>
                <button
                  onClick={startRecording}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg transition active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Felvétel indítása</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
