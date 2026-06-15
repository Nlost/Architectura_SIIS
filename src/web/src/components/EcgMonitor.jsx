import { useEffect, useMemo, useRef } from "react";
import "./EcgMonitor.css";

const gaussian = (x, mu, sigma, amp) =>
  amp * Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));

// Synthetic PQRST complex over a single normalized beat phase [0, 1).
const ecgWave = (phase) =>
  gaussian(phase, 0.16, 0.025, 0.13) + // P wave
  gaussian(phase, 0.235, 0.008, -0.09) + // Q
  gaussian(phase, 0.26, 0.0095, 1.0) + // R (spike)
  gaussian(phase, 0.288, 0.009, -0.24) + // S
  gaussian(phase, 0.43, 0.04, 0.26); // T wave

function EcgMonitor({
  bpm = 72,
  lead = "FF03",
  live = true,
  samples = null,
  samplingHz = 1000,
  baseline = 2048,
  adcMax = 4095,
}) {
  const canvasRef = useRef(null);
  const bpmRef = useRef(bpm);
  const dataRef = useRef(null);
  const cursorRef = useRef(0);

  useEffect(() => {
    bpmRef.current = bpm && bpm > 20 && bpm < 240 ? bpm : 72;
  }, [bpm]);

  // Normalize the real ECG samples (raw ADC) into a [-~1, ~1] range with auto-gain.
  const normalized = useMemo(() => {
    if (!Array.isArray(samples) || samples.length < 2) return null;

    const half = adcMax / 2 || 2048;
    const values = new Float32Array(samples.length);
    let peak = 0;
    for (let i = 0; i < samples.length; i++) {
      const v = (Number(samples[i]) - baseline) / half;
      values[i] = v;
      const abs = Math.abs(v);
      if (abs > peak) peak = abs;
    }
    const gain = 0.9 / Math.max(peak, 0.12);
    return { values, gain };
  }, [samples, baseline, adcMax]);

  useEffect(() => {
    dataRef.current = normalized;
    cursorRef.current = 0;
  }, [normalized]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    const pixelsPerSecond = 165;

    let raf;
    let width = 0;
    let height = 0;
    let buffer = [];
    let elapsed = 0;
    let carry = 0;
    let last = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const next = new Array(width).fill(0);
      const copy = Math.min(width, buffer.length);
      for (let i = 1; i <= copy; i++) {
        next[width - i] = buffer[buffer.length - i];
      }
      buffer = next;
    };

    const nextValue = (dtPerPixel) => {
      const data = dataRef.current;
      if (data && data.values.length >= 2) {
        const stride = samplingHz / pixelsPerSecond;
        cursorRef.current += stride;
        if (cursorRef.current >= data.values.length) {
          cursorRef.current -= data.values.length;
        }
        const idx = Math.floor(cursorRef.current);
        return data.values[idx] * data.gain;
      }

      const beat = 60 / bpmRef.current;
      elapsed += dtPerPixel;
      const phase = (elapsed % beat) / beat;
      return ecgWave(phase);
    };

    const draw = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      const dtPerPixel = 1 / pixelsPerSecond;

      let advance = dt * pixelsPerSecond + carry;
      let steps = Math.floor(advance);
      carry = advance - steps;
      if (steps > width) steps = width;

      for (let i = 0; i < steps; i++) {
        buffer.push(nextValue(dtPerPixel));
        buffer.shift();
      }

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#06120c";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(34, 197, 94, 0.09)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const gridStep = 26;
      for (let x = width % gridStep; x < width; x += gridStep) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = (height / 2) % gridStep; y < height; y += gridStep) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      const mid = height * 0.62;
      const amp = height * 0.34;

      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = 2.1;
      ctx.strokeStyle = "#34f37a";
      ctx.shadowColor = "rgba(52, 243, 122, 0.75)";
      ctx.shadowBlur = 9;
      ctx.beginPath();
      for (let x = 0; x < buffer.length; x++) {
        const y = mid - buffer[x] * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [samplingHz]);

  const hasReal = Array.isArray(samples) && samples.length >= 2;

  return (
    <div className="ecg-card">
      <div className="ecg-head">
        <div className="ecg-title">
          <span className="ecg-heart">💚</span>
          ECG — Electrocardiograma
        </div>
        {live && <span className="ecg-live">LIVE</span>}
      </div>

      <div className="ecg-screen">
        <canvas ref={canvasRef} className="ecg-canvas" />
      </div>

      <div className="ecg-foot">
        <span className="ecg-status">
          {hasReal
            ? `Semnal ECG activ (${lead})`
            : "Semnal ECG simulat (fără date senzor)"}
        </span>
        <span className="ecg-speed">25 mm/s</span>
      </div>
    </div>
  );
}

export default EcgMonitor;
