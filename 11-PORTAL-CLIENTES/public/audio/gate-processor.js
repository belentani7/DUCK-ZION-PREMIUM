class DuckGateProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'threshold', defaultValue: 0.02, minValue: 0.0001, maxValue: 1, automationRate: 'k-rate' },
      { name: 'attack', defaultValue: 0.008, minValue: 0.001, maxValue: 0.5, automationRate: 'k-rate' },
      { name: 'release', defaultValue: 0.12, minValue: 0.005, maxValue: 2, automationRate: 'k-rate' },
    ];
  }

  constructor() {
    super();
    this.gain = 0;
    this.envelope = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || input.length === 0) return true;

    const threshold = parameters.threshold[0];
    const attack = parameters.attack[0];
    const release = parameters.release[0];
    const attackStep = 1 / Math.max(1, attack * sampleRate);
    const releaseStep = 1 / Math.max(1, release * sampleRate);

    for (let channel = 0; channel < output.length; channel += 1) {
      const source = input[channel] || input[0];
      const target = output[channel];
      for (let i = 0; i < target.length; i += 1) {
        const sample = source[i] || 0;
        const absolute = Math.abs(sample);
        this.envelope += (absolute - this.envelope) * (absolute > this.envelope ? 0.12 : 0.02);
        const open = this.envelope >= threshold ? 1 : 0;
        this.gain += (open - this.gain) * (open > this.gain ? attackStep : releaseStep);
        target[i] = sample * this.gain;
      }
    }

    return true;
  }
}

registerProcessor('duck-gate-processor', DuckGateProcessor);
