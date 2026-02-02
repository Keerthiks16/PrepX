import { useEffect, useRef } from 'react';

type Props = {
  isListening: boolean;
  isSpeaking: boolean;
};

const AudioVisualizer = ({ isListening, isSpeaking }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize AudioContext and AnalyserNode if not already
    if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256; 
        }
    }

    const audioContext = audioContextRef.current;
    const analyser = analyserRef.current;
    
    // Safety check
    if (!audioContext || !analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const setupMicrophone = async () => {
      if (isListening && audioContext && analyser) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          // Disconnect old stream if exists
          if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
          }
          
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          mediaStreamSourceRef.current = source;
          
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
        } catch (err) {
          console.error('Error accessing microphone:', err);
        }
      } else if (!isListening && mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
      }
    };

    setupMicrophone();

    const draw = () => {
      if (!ctx || !canvas || !analyser) return;

      animationRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isListening && audioContext?.state === 'running') {
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i] / 2; // Scale height

          const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
          gradient.addColorStop(0, '#8B5CF6'); // Purple
          gradient.addColorStop(1, '#06B6D4'); // Cyan

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }
      } else if (isSpeaking) {
        // Simple speaking animation (pulsing line)
        const time = Date.now() * 0.005;
        const amplitude = Math.sin(time) * 20 + 30;

        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        for (let i = 0; i < canvas.width; i++) {
          const y = canvas.height / 2 + Math.sin(i * 0.05 + time * 2) * (amplitude * (1 - i / canvas.width));
          ctx.lineTo(i, y);
        }
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#8B5CF6'); 
        gradient.addColorStop(1, '#06B6D4'); 
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        // Waiting state
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = '#4B5563'; // gray-600
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
      }
    };
  }, [isListening, isSpeaking]);

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={100}
      className="w-full h-full"
    />
  );
};

export default AudioVisualizer;
