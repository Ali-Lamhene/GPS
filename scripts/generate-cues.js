// Generates the short non-verbal cues of the traveller interface as WAV files in
// assets/sounds/, from the tone sequences of the mockup v7 (decision D11).
// Run once after changing a cue: node scripts/generate-cues.js
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;

// [frequency in Hz, duration in seconds]; each tone starts at 90 % of the previous one.
const CUES = {
  select: [[700, 0.08]],
  turn: [
    [660, 0.12],
    [880, 0.16],
  ],
  alert: [
    [880, 0.18],
    [660, 0.18],
    [880, 0.25],
  ],
  vehicle: [
    [740, 0.2],
    [988, 0.3],
  ],
  exit: [
    [988, 0.12],
    [740, 0.2],
  ],
  offline: [
    [330, 0.3],
    [262, 0.4],
  ],
  arrival: [
    [523, 0.12],
    [659, 0.12],
    [784, 0.12],
    [1046, 0.3],
  ],
  saved: [
    [660, 0.1],
    [990, 0.2],
  ],
};

function render(sequence) {
  let start = 0;
  const notes = sequence.map(([frequency, duration]) => {
    const note = { frequency, duration, start };
    start += duration * 0.9;
    return note;
  });
  const total = Math.max(...notes.map((n) => n.start + n.duration)) + 0.03;
  const samples = new Float32Array(Math.ceil(total * SAMPLE_RATE));

  for (const { frequency, duration, start: at } of notes) {
    const first = Math.floor(at * SAMPLE_RATE);
    const count = Math.floor(duration * SAMPLE_RATE);
    for (let i = 0; i < count; i++) {
      const t = i / SAMPLE_RATE;
      // Exponential attack (20 ms) and decay, as in the mockup's Web Audio envelope.
      const attack = Math.min(1, t / 0.02);
      const decay = Math.exp((-5 * Math.max(0, t - 0.02)) / duration);
      const gain = 0.22 * attack * decay;
      samples[first + i] += gain * Math.sin(2 * Math.PI * frequency * t);
    }
  }
  return samples;
}

function toWav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((value, i) => {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, value)) * 32767), i * 2);
  });
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });
for (const [name, sequence] of Object.entries(CUES)) {
  fs.writeFileSync(path.join(outDir, `${name}.wav`), toWav(render(sequence)));
}
