import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  audioUrl: string;
  height?: number;
}

export function WaveformVisualizer({ audioUrl, height = 80 }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!audioUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    fetch(audioUrl)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const rawData = audioBuffer.getChannelData(0);
        const samples = 150;
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];
        
        for (let i = 0; i < samples; i++) {
          const blockStart = blockSize * i;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[blockStart + j]);
          }
          filteredData.push(sum / blockSize);
        }

        const multiplier = Math.pow(Math.max(...filteredData), -1);
        const normalizedData = filteredData.map(n => n * multiplier);

        // Draw waveform with gradient
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const barWidth = width / samples;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "#a855f7"); // purple-500
        gradient.addColorStop(0.5, "#ec4899"); // pink-500
        gradient.addColorStop(1, "#06b6d4"); // cyan-500

        ctx.clearRect(0, 0, width, height);
        
        normalizedData.forEach((value, index) => {
          const barHeight = value * height * 0.8;
          const x = barWidth * index;
          const y = (height - barHeight) / 2;

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth - 1, barHeight);
        });
      })
      .catch(error => {
        console.error("Error loading audio for waveform:", error);
      });

    return () => {
      audioContext.close();
    };
  }, [audioUrl]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg bg-slate-800/50"
      style={{ height: `${height}px` }}
    />
  );
}