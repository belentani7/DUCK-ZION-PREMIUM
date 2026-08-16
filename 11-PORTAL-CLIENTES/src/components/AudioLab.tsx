// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AudioLines, CircleStop, Headphones, Mic, Play, RotateCcw, Save, Sparkles, Upload, Waves } from 'lucide-react';
import { AUDIO_PRESETS, AudioRack, type AudioPreset, type AudioSettings, type AudioSource } from '@/lib/audio-engine';

const CONTROL_META: { key: keyof AudioSettings; label: string; min: number; max: number; step: number; unit: string; hint: string }[] = [
  { key: 'input', label: 'Input', min: 0.5, max: 1.6, step: 0.01, unit: 'x', hint: 'Nivel de entrada' },
  { key: 'gate', label: 'Gate', min: 0.002, max: 0.08, step: 0.001, unit: '', hint: 'Limpieza de ruido' },
  { key: 'drive', label: 'Drive', min: 0, max: 1, step: 0.01, unit: '%', hint: 'Saturación armónica' },
  { key: 'tone', label: 'Tone', min: 0, max: 1, step: 0.01, unit: '%', hint: 'Apertura tonal' },
  { key: 'presence', label: 'Presence', min: 0, max: 1, step: 0.01, unit: '%', hint: 'Ataque y claridad' },
  { key: 'compression', label: 'Glue', min: 0, max: 1, step: 0.01, unit: '%', hint: 'Compresión musical' },
  { key: 'delay', label: 'Echo', min: 0, max: 1, step: 0.01, unit: '%', hint: 'Repetición espacial' },
  { key: 'feedback', label: 'Feedback', min: 0, max: 0.78, step: 0.01, unit: '%', hint: 'Cola del eco' },
  { key: 'reverb', label: 'Space', min: 0, max: 1, step: 0.01, unit: '%', hint: 'Profundidad de sala' },
  { key: 'output', label: 'Output', min: 0, max: 1, step: 0.01, unit: '%', hint: 'Nivel de salida' },
];

function formatValue(key: keyof AudioSettings, value: number) {
  if (key === 'gate') return `${Math.round(value * 1000)}‰`;
  if (key === 'input') return `${value.toFixed(2)}x`;
  return `${Math.round(value * 100)}%`;
}

function Meter({ level }: { level: number }) {
  return (
    <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-slate-900/80" aria-label={`Nivel ${Math.round(level * 100)}%`}>
      {Array.from({ length: 24 }, (_, index) => {
        const active = index / 24 < level;
        const color = index > 19 ? 'bg-rose-400' : index > 15 ? 'bg-amber-300' : 'bg-emerald-300';
        return <span key={index} className={`min-w-1 flex-1 ${active ? color : 'bg-slate-800'}`} />;
      })}
    </div>
  );
}

function PresetCard({ preset, active, onSelect }: { preset: AudioPreset; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full rounded-2xl border p-4 text-left transition duration-200 ${active ? 'border-emerald-300 bg-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,.12)] dark:border-emerald-700 dark:bg-emerald-950/40' : 'border-slate-200 bg-white/70 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.06]'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold tracking-tight text-slate-950 dark:text-white">{preset.name}</p>
          <p className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-emerald-700 dark:text-emerald-300">{preset.family}</p>
        </div>
        <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.9)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400">{preset.description}</p>
    </button>
  );
}

export function AudioLab() {
  const rack = useRef<AudioRack | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [source, setSource] = useState<AudioSource>('guitar');
  const [activePreset, setActivePreset] = useState(AUDIO_PRESETS[0].id);
  const [settings, setSettings] = useState<AudioSettings>(AUDIO_PRESETS[0].settings);
  const [connected, setConnected] = useState(false);
  const [inputName, setInputName] = useState('Sin entrada');
  const [status, setStatus] = useState('Listo para escuchar');
  const [level, setLevel] = useState(0.08);

  const filteredPresets = useMemo(() => AUDIO_PRESETS.filter((preset) => preset.source === source), [source]);

  useEffect(() => {
    rack.current = new AudioRack();
    const animationFrame = { id: 0 };
    const frequencyData = new Uint8Array(new ArrayBuffer(1024));
    const timeData = new Uint8Array(new ArrayBuffer(1024));

    const draw = () => {
      const context = canvas.current?.getContext('2d');
      const element = canvas.current;
      if (context && element) {
        const width = element.width = element.clientWidth * window.devicePixelRatio;
        const height = element.height = element.clientHeight * window.devicePixelRatio;
        context.clearRect(0, 0, width, height);
        context.fillStyle = '#07100e';
        context.fillRect(0, 0, width, height);
        context.strokeStyle = 'rgba(99, 156, 132, .14)';
        context.lineWidth = 1;
        for (let i = 1; i < 5; i += 1) {
          const y = (height / 5) * i;
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(width, y);
          context.stroke();
        }
        const barWidth = width / frequencyData.length;
        for (let i = 0; i < frequencyData.length; i += 1) {
          const amplitude = frequencyData[i] / 255;
          const barHeight = amplitude * height * 0.88;
          const hue = 152 + amplitude * 28;
          context.fillStyle = `hsla(${hue}, 76%, 62%, ${0.16 + amplitude * 0.7})`;
          context.fillRect(i * barWidth, height - barHeight, Math.max(1, barWidth - 1), barHeight);
        }
        context.strokeStyle = 'rgba(210, 255, 226, .8)';
        context.lineWidth = 1.5 * window.devicePixelRatio;
        context.beginPath();
        timeData.forEach((sample, index) => {
          const x = (index / (timeData.length - 1)) * width;
          const y = height / 2 + ((sample - 128) / 128) * height * 0.18;
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.stroke();
      }
      rack.current?.getFrequencyData(frequencyData);
      rack.current?.getTimeDomainData(timeData);
      const average = frequencyData.reduce((sum, value) => sum + value, 0) / (frequencyData.length * 255);
      setLevel(Math.max(0.04, Math.min(1, average * 3.5)));
      animationFrame.id = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animationFrame.id);
      void rack.current?.dispose();
      rack.current = null;
    };
  }, []);

  useEffect(() => {
    rack.current?.update(settings);
  }, [settings]);

  const selectPreset = (preset: AudioPreset) => {
    setActivePreset(preset.id);
    setSettings(preset.settings);
    setStatus(`${preset.name} cargado`);
  };

  const changeSource = (nextSource: AudioSource) => {
    setSource(nextSource);
    const first = AUDIO_PRESETS.find((preset) => preset.source === nextSource) ?? AUDIO_PRESETS[0];
    selectPreset(first);
  };

  const toggleMicrophone = async () => {
    try {
      if (connected) {
        rack.current?.stopSource();
        setConnected(false);
        setInputName('Sin entrada');
        setStatus('Entrada detenida');
        return;
      }
      await rack.current?.connectMicrophone();
      setConnected(true);
      setInputName(source === 'guitar' ? 'Interfaz / guitarra' : 'Micrófono');
      setStatus('Monitorización activa');
    } catch {
      setStatus('Permiso de micrófono no concedido');
    }
  };

  const loadFile = async (file: File) => {
    try {
      await rack.current?.connectFile(file);
      setConnected(true);
      setInputName(file.name);
      setStatus('Reproduciendo archivo en el rack');
    } catch {
      setStatus('No se pudo abrir el archivo');
    }
  };

  const exportPreset = async () => {
    const preset = JSON.stringify({ name: 'Duck Audio Lab preset', source, settings }, null, 2);
    try {
      await navigator.clipboard.writeText(preset);
      setStatus('Preset copiado al portapapeles');
    } catch {
      setStatus('Preset listo para exportar');
    }
  };

  return (
    <div className="relative -m-6 min-h-[calc(100vh-4.5rem)] overflow-hidden bg-[#edf4ef] px-4 py-5 text-slate-950 dark:bg-[#06100d] dark:text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-400/10" />
      <div className="relative mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col gap-4 border-b border-slate-300/70 pb-5 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.24em] text-emerald-700 dark:text-emerald-300"><AudioLines className="h-4 w-4" /> DUCK / AUDIO LAB 01</div>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Instrumentos para señal viva.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">Un rack de escucha para guitarra y voz: entrada, carácter, dinámica y espacio en una sola superficie. Activa el micro o carga una toma para oírlo.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => changeSource('guitar')} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${source === 'guitar' ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-slate-300 bg-white/60 text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300'}`}>GUITAR</button>
            <button type="button" onClick={() => changeSource('voice')} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${source === 'voice' ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-slate-300 bg-white/60 text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300'}`}>VOICE</button>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.75fr)]">
          <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-[#07100e] shadow-2xl shadow-emerald-950/10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300 text-slate-950"><Waves className="h-4 w-4" /></div><div><p className="text-sm font-semibold text-white">Signal Observatory</p><p className="text-xs text-emerald-100/50">FFT / time domain / stereo bus</p></div></div>
              <span className="flex items-center gap-2 text-xs text-emerald-100/60"><span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-300 shadow-[0_0_12px_#6ee7b7]' : 'bg-slate-600'}`} />{status}</span>
            </div>
            <div className="h-64 px-3 py-3 sm:h-80 sm:px-5"><canvas ref={canvas} className="h-full w-full rounded-2xl" aria-label="Analizador de espectro en tiempo real" /></div>
            <div className="grid gap-4 border-t border-white/10 px-5 py-4 sm:grid-cols-[1fr_auto] sm:px-6"><div><div className="mb-2 flex justify-between text-[10px] font-bold tracking-[0.18em] text-emerald-100/50"><span>OUTPUT LEVEL</span><span>{Math.round(level * 100)}%</span></div><Meter level={level} /></div><div className="flex items-center gap-2 text-xs text-emerald-100/60"><Activity className="h-4 w-4" /> 48 kHz / interactive</div></div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white/75 p-5 shadow-xl shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold tracking-[0.2em] text-emerald-700 dark:text-emerald-300">INPUT DECK</p><h2 className="mt-1 text-xl font-semibold tracking-tight">Pon algo delante.</h2></div><Headphones className="h-5 w-5 text-slate-400" /></div>
            <div className="space-y-3"><button type="button" onClick={toggleMicrophone} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${connected && inputName !== 'Sin entrada' ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40' : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'}`}><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">{connected ? <CircleStop className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{connected ? 'Detener entrada' : 'Activar micrófono'}</span><span className="block truncate text-xs text-slate-500 dark:text-slate-400">{inputName}</span></span></button><button type="button" onClick={() => fileInput.current?.click()} className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-4 text-left transition hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-white/15 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"><Upload className="h-4 w-4" /></span><span><span className="block text-sm font-semibold">Cargar una toma</span><span className="block text-xs text-slate-500 dark:text-slate-400">WAV, MP3, M4A o OGG</span></span></button><input ref={fileInput} type="file" accept="audio/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void loadFile(file); }} /></div>
            <div className="mt-5 rounded-2xl bg-slate-100 p-4 dark:bg-white/[0.06]"><div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200"><Sparkles className="h-4 w-4 text-amber-500" /> Cadena activa</div><div className="mt-3 flex flex-wrap gap-1.5">{['GATE', 'DRIVE', 'TONE', 'GLUE', 'ECHO', 'SPACE'].map((item) => <span key={item} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">{item}</span>)}</div></div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)]">
          <div className="rounded-[28px] border border-slate-200 bg-white/75 p-5 shadow-xl shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] sm:p-6"><div className="mb-5 flex items-end justify-between"><div><p className="text-[11px] font-bold tracking-[0.2em] text-emerald-700 dark:text-emerald-300">SCENES</p><h2 className="mt-1 text-xl font-semibold tracking-tight">Presets de estudio</h2></div><span className="text-xs text-slate-500 dark:text-slate-400">{filteredPresets.length} escenas</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{filteredPresets.map((preset) => <PresetCard key={preset.id} preset={preset} active={preset.id === activePreset} onSelect={() => selectPreset(preset)} />)}</div></div>
          <div className="rounded-[28px] border border-slate-200 bg-white/75 p-5 shadow-xl shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] sm:p-6"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[11px] font-bold tracking-[0.2em] text-emerald-700 dark:text-emerald-300">SIGNAL CHAIN</p><h2 className="mt-1 text-xl font-semibold tracking-tight">Ajuste fino</h2></div><div className="flex gap-2"><button type="button" onClick={() => { const preset = AUDIO_PRESETS.find((item) => item.id === activePreset) ?? AUDIO_PRESETS[0]; setSettings(preset.settings); setStatus('Preset restaurado'); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"><RotateCcw className="h-3.5 w-3.5" /> Reset</button><button type="button" onClick={() => void exportPreset()} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"><Save className="h-3.5 w-3.5" /> Guardar</button></div></div><div className="grid gap-x-7 gap-y-5 sm:grid-cols-2">{CONTROL_META.map((control) => <label key={control.key} className="block"><span className="mb-2 flex items-center justify-between gap-3"><span><span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{control.label}</span><span className="block text-[11px] text-slate-500 dark:text-slate-400">{control.hint}</span></span><output className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700 dark:bg-white/10 dark:text-slate-200">{formatValue(control.key, settings[control.key])}</output></span><input type="range" min={control.min} max={control.max} step={control.step} value={settings[control.key]} onChange={(event) => { setSettings((current) => ({ ...current, [control.key]: Number(event.target.value) })); setStatus('Parámetro modificado'); }} className="w-full accent-emerald-600" /></label>)}</div></div>
        </section>
        <footer className="flex flex-col gap-2 border-t border-slate-300/70 pt-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Duck Audio Lab / motor Web Audio local / sin subida de audio</span><span className="inline-flex items-center gap-2"><Play className="h-3 w-3" /> Monitor bajo acción del usuario</span></footer>
      </div>
    </div>
  );
}
