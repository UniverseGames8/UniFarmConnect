import React, { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const ChartCard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const animate = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // TODO: Implement chart drawing
    // For now, just draw a placeholder
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Chart coming soon...', canvasRef.current.width / 2, canvasRef.current.height / 2);

    // Request next frame only if component is visible
    if (document.visibilityState === 'visible') {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    // Start animation only when component is visible
    if (document.visibilityState === 'visible') {
      animate();
    }

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        animate();
      } else if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={400}
          className="w-full h-full"
        />
      </CardContent>
    </Card>
  );
};

export default ChartCard;