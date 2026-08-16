// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
export type AudioSource = 'guitar' | 'voice';

export interface AudioSettings {
  input: number;
  gate: number;
  drive: number;
  tone: number;
  presence: number;
  compression: number;
  delay: number;
  feedback: number;
  reverb: number;
  output: number;
}

export interface AudioPreset {
  id: string;
  name: string;
  family: string;
  source: AudioSource;
  description: string;
  settings: AudioSettings;
}

export const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: 'cobalt-clean',
    name: 'Cobalt Clean',
    family: 'GUITAR',
    source: 'guitar',
    description: 'Clean amplio, ataque definido y espacio de estudio.',
    settings: { input: 1.1, gate: 0.012, drive: 0.08, tone: 0.68, presence: 0.64, compression: 0.2, delay: 0.12, feedback: 0.18, reverb: 0.24, output: 0.86 },
  },
  {
    id: 'voltage-cathedral',
    name: 'Voltage Cathedral',
    family: 'GUITAR',
    source: 'guitar',
    description: 'Saturación grande, medios vivos y cola cinematográfica.',
    settings: { input: 1.35, gate: 0.018, drive: 0.62, tone: 0.56, presence: 0.7, compression: 0.42, delay: 0.2, feedback: 0.32, reverb: 0.5, output: 0.72 },
  },
  {
    id: 'velvet-lead',
    name: 'Velvet Lead',
    family: 'GUITAR',
    source: 'guitar',
    description: 'Lead suave con compresión musical y eco sincronizable.',
    settings: { input: 1.2, gate: 0.01, drive: 0.42, tone: 0.64, presence: 0.78, compression: 0.58, delay: 0.32, feedback: 0.36, reverb: 0.34, output: 0.76 },
  },
  {
    id: 'gold-vocal',
    name: 'Gold Vocal',
    family: 'VOICE',
    source: 'voice',
    description: 'Voz frontal, cálida y limpia para una toma principal.',
    settings: { input: 1.08, gate: 0.008, drive: 0.04, tone: 0.58, presence: 0.76, compression: 0.66, delay: 0.1, feedback: 0.12, reverb: 0.22, output: 0.82 },
  },
  {
    id: 'night-air',
    name: 'Night Air',
    family: 'VOICE',
    source: 'voice',
    description: 'Aire arriba, profundidad estéreo y una sombra de cinta.',
    settings: { input: 1.05, gate: 0.006, drive: 0.1, tone: 0.72, presence: 0.86, compression: 0.48, delay: 0.26, feedback: 0.28, reverb: 0.46, output: 0.8 },
  },
  {
    id: 'radio-noir',
    name: 'Radio Noir',
    family: 'VOICE',
    source: 'voice',
    description: 'Color estrecho, control dinámico y presencia de narración.',
    settings: { input: 1.18, gate: 0.014, drive: 0.22, tone: 0.34, presence: 0.7, compression: 0.78, delay: 0.06, feedback: 0.08, reverb: 0.12, output: 0.78 },
  },
];

type AudioNodeWithDisconnect = AudioNode & { disconnect: (destination?: AudioNode) => void };

function saturationCurve(amount: number) {
  const samples = 2048;
  const curve = new Float32Array(samples);
  const drive = 1 + amount * 24;
  for (let i = 0; i < samples; i += 1) {
    const x = (i * 2) / samples - 1;
    curve[i] = Math.tanh(x * drive) / Math.tanh(drive);
  }
  return curve;
}

function createImpulse(context: BaseAudioContext, seconds: number, decay: number) {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds));
  const impulse = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

export class AudioRack {
  private context: AudioContext | null = null;
  private inputGain: GainNode | null = null;
  private gate: AudioWorkletNode | null = null;
  private drive: WaveShaperNode | null = null;
  private lowCut: BiquadFilterNode | null = null;
  private tone: BiquadFilterNode | null = null;
  private presence: BiquadFilterNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private dry: GainNode | null = null;
  private delay: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayWet: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private reverbWet: GainNode | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private source: AudioNodeWithDisconnect | null = null;
  private mediaElement: HTMLAudioElement | null = null;
  private stream: MediaStream | null = null;
  private workletReady = false;

  async ensureReady() {
    if (this.context) {
      await this.context.resume();
      return;
    }

    const context = new AudioContext({ latencyHint: 'interactive' });
    this.context = context;
    try {
      await context.audioWorklet.addModule('/audio/gate-processor.js');
      this.workletReady = true;
    } catch {
      this.workletReady = false;
    }

    this.inputGain = context.createGain();
    this.lowCut = context.createBiquadFilter();
    this.lowCut.type = 'highpass';
    this.lowCut.frequency.value = 48;
    this.drive = context.createWaveShaper();
    this.drive.oversample = '4x';
    this.tone = context.createBiquadFilter();
    this.tone.type = 'lowpass';
    this.presence = context.createBiquadFilter();
    this.presence.type = 'peaking';
    this.presence.frequency.value = 2600;
    this.presence.Q.value = 0.72;
    this.compressor = context.createDynamicsCompressor();
    this.compressor.knee.value = 18;
    this.dry = context.createGain();
    this.delay = context.createDelay(2);
    this.delayFeedback = context.createGain();
    this.delayWet = context.createGain();
    this.reverb = context.createConvolver();
    this.reverb.buffer = createImpulse(context, 2.8, 2.3);
    this.reverbWet = context.createGain();
    this.master = context.createGain();
    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.82;

    const gateOutput: AudioNode = this.workletReady
      ? (this.gate = new AudioWorkletNode(context, 'duck-gate-processor'))
      : this.inputGain;
    this.inputGain.connect(gateOutput);
    gateOutput.connect(this.lowCut);
    this.lowCut.connect(this.drive);
    this.drive.connect(this.tone);
    this.tone.connect(this.presence);
    this.presence.connect(this.compressor);
    this.compressor.connect(this.dry);
    this.compressor.connect(this.delay);
    this.compressor.connect(this.reverb);
    this.dry.connect(this.master);
    this.delay.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delay);
    this.delay.connect(this.delayWet);
    this.delayWet.connect(this.master);
    this.reverb.connect(this.reverbWet);
    this.reverbWet.connect(this.master);
    this.master.connect(this.analyser);
    this.analyser.connect(context.destination);
    await context.resume();
  }

  private clearSource() {
    this.source?.disconnect();
    this.source = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    if (this.mediaElement) {
      this.mediaElement.pause();
      this.mediaElement.src = '';
      this.mediaElement = null;
    }
  }

  async connectMicrophone() {
    await this.ensureReady();
    this.clearSource();
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, autoGainControl: false, noiseSuppression: false } });
    this.source = this.context!.createMediaStreamSource(this.stream);
    this.source.connect(this.inputGain!);
  }

  async connectFile(file: File) {
    await this.ensureReady();
    this.clearSource();
    const element = new Audio();
    element.loop = true;
    element.src = URL.createObjectURL(file);
    this.mediaElement = element;
    this.source = this.context!.createMediaElementSource(element);
    this.source.connect(this.inputGain!);
    await element.play();
  }

  stopSource() {
    this.clearSource();
  }

  update(settings: AudioSettings) {
    if (!this.context || !this.inputGain || !this.drive || !this.tone || !this.presence || !this.compressor || !this.dry || !this.delay || !this.delayFeedback || !this.delayWet || !this.reverbWet || !this.master) return;
    const now = this.context.currentTime;
    this.inputGain.gain.setTargetAtTime(settings.input, now, 0.015);
    this.drive.curve = saturationCurve(settings.drive);
    this.tone.frequency.setTargetAtTime(1100 + settings.tone * 12500, now, 0.02);
    this.presence.gain.setTargetAtTime((settings.presence - 0.5) * 12, now, 0.02);
    this.compressor.threshold.setTargetAtTime(-8 - settings.compression * 32, now, 0.02);
    this.compressor.ratio.setTargetAtTime(1.4 + settings.compression * 10, now, 0.02);
    this.dry.gain.setTargetAtTime(1 - Math.max(settings.delay, settings.reverb) * 0.22, now, 0.02);
    this.delay.delayTime.setTargetAtTime(0.045 + settings.delay * 0.58, now, 0.02);
    this.delayFeedback.gain.setTargetAtTime(Math.min(0.82, settings.feedback), now, 0.02);
    this.delayWet.gain.setTargetAtTime(settings.delay * 0.62, now, 0.02);
    this.reverbWet.gain.setTargetAtTime(settings.reverb * 0.58, now, 0.02);
    this.master.gain.setTargetAtTime(settings.output, now, 0.02);

    if (this.gate) {
      this.gate.parameters.get('threshold')?.setTargetAtTime(settings.gate, now, 0.02);
      this.gate.parameters.get('attack')?.setTargetAtTime(0.006 + settings.gate * 0.35, now, 0.02);
      this.gate.parameters.get('release')?.setTargetAtTime(0.08 + settings.gate * 5, now, 0.02);
    }
  }

  getFrequencyData(buffer: Uint8Array<ArrayBuffer>) {
    this.analyser?.getByteFrequencyData(buffer);
  }

  getTimeDomainData(buffer: Uint8Array<ArrayBuffer>) {
    this.analyser?.getByteTimeDomainData(buffer);
  }

  async dispose() {
    this.clearSource();
    if (this.context) await this.context.close();
    this.context = null;
  }
}
