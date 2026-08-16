import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Volume2 } from "lucide-react";

export function InstrumentsLab() {
  const [activeTab, setActiveTab] = useState<"synth" | "drums" | "piano">("synth");
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playNote = (freq: number, type: OscillatorType = "sine", duration = 0.3) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  const playDrum = (type: "kick" | "snare" | "hihat" | "clap") => {
    try {
      const ctx = getAudioContext();
      if (type === "kick") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "snare") {
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 800;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else if (type === "hihat") {
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 5000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pianoKeys = [
    { note: "C4", freq: 261.63, label: "Do" },
    { note: "D4", freq: 293.66, label: "Re" },
    { note: "E4", freq: 329.63, label: "Mi" },
    { note: "F4", freq: 349.23, label: "Fa" },
    { note: "G4", freq: 392.00, label: "Sol" },
    { note: "A4", freq: 440.00, label: "La" },
    { note: "B4", freq: 493.88, label: "Si" },
    { note: "C5", freq: 523.25, label: "Do 5" },
  ];

  return (
    <div className="border border-border bg-card/60 backdrop-blur p-6 rounded-xl my-12 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <span className="font-mono text-xs text-accent uppercase tracking-widest">// VIVE LOS INSTRUMENTOS</span>
          <h3 className="font-unbounded text-2xl font-bold mt-1">Laboratorio Web Audio API</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "synth" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("synth")}
            className="font-mono text-xs"
          >
            Sintetizador 808
          </Button>
          <Button
            variant={activeTab === "drums" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("drums")}
            className="font-mono text-xs"
          >
            Drum Machine
          </Button>
          <Button
            variant={activeTab === "piano" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("piano")}
            className="font-mono text-xs"
          >
            Teclado Mágico
          </Button>
        </div>
      </div>

      {activeTab === "synth" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
          {[110, 220, 330, 440, 550, 660, 770, 880].map((f, i) => (
            <Button
              key={i}
              onClick={() => playNote(f, "sawtooth", 0.4)}
              className="h-24 bg-surface2 border border-border hover:border-accent flex flex-col justify-between p-4 group transition-all"
            >
              <span className="font-mono text-xs text-dim">OSC #{i + 1}</span>
              <span className="font-unbounded font-bold text-lg group-hover:text-accent">{f}Hz</span>
              <Volume2 className="w-4 h-4 text-accent opacity-60 group-hover:opacity-100" />
            </Button>
          ))}
        </div>
      )}

      {activeTab === "drums" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
          <Button
            onClick={() => playDrum("kick")}
            className="h-28 bg-surface2 border border-border hover:border-accent2 flex flex-col items-center justify-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-accent2/20 grid place-items-center font-bold text-accent2">K</div>
            <span className="font-mono text-xs">808 KICK</span>
          </Button>
          <Button
            onClick={() => playDrum("snare")}
            className="h-28 bg-surface2 border border-border hover:border-accent2 flex flex-col items-center justify-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-accent/20 grid place-items-center font-bold text-accent">S</div>
            <span className="font-mono text-xs">SNARE TRAP</span>
          </Button>
          <Button
            onClick={() => playDrum("hihat")}
            className="h-28 bg-surface2 border border-border hover:border-accent2 flex flex-col items-center justify-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 grid place-items-center font-bold text-emerald-400">H</div>
            <span className="font-mono text-xs">HI-HAT ROLLS</span>
          </Button>
          <Button
            onClick={() => playDrum("kick")}
            className="h-28 bg-surface2 border border-border hover:border-accent2 flex flex-col items-center justify-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 grid place-items-center font-bold text-purple-400">B</div>
            <span className="font-mono text-xs">BASS 808</span>
          </Button>
        </div>
      )}

      {activeTab === "piano" && (
        <div className="flex justify-center gap-2 py-6 overflow-x-auto">
          {pianoKeys.map((k, i) => (
            <button
              key={i}
              onClick={() => playNote(k.freq, "sine", 0.5)}
              className="w-14 h-40 bg-white text-black rounded-b-md border border-gray-300 flex flex-col justify-end items-center pb-4 hover:bg-accent hover:text-white transition-colors shadow-lg active:translate-y-1"
            >
              <span className="font-mono text-[10px] font-bold">{k.label}</span>
              <span className="font-mono text-[9px] opacity-70">{k.note}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
