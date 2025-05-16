import React, { useEffect, useRef } from 'react';
import './VoiceVisualizer.css';

const VoiceVisualizer = ({ isListening, audioLevel }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Draw background
      ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isListening) {
        // Draw voice visualization
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
        const baseRadius = maxRadius * 0.3;

        // Draw outer circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + (audioLevel * maxRadius * 0.2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 38, 38, ${0.3 + audioLevel * 0.2})`;
        ctx.fill();

        // Draw inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 38, 38, ${0.5 + audioLevel * 0.3})`;
        ctx.fill();

        // Draw pulse effect
        const pulseRadius = baseRadius + (Math.sin(Date.now() * 0.005) * 20);
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(220, 38, 38, ${0.2 + audioLevel * 0.1})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        // Draw static state
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.3;

        // Draw outer circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
        ctx.fill();

        // Draw inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(37, 99, 235, 0.4)';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isListening, audioLevel]);

  return (
    <div className={`voice-visualizer ${isListening ? 'listening' : ''}`}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default VoiceVisualizer; 