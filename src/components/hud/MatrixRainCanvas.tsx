import React, { useEffect, useRef } from "react";

interface MatrixRainCanvasProps {
  color?: string; // e.g. '#00ff66' for Matrix Green, '#ff9900' for Fallout Amber, '#00e5ff' for Stark Arc Cyan
  density?: number;
  opacity?: number;
  speed?: number;
  fontSize?: number;
  className?: string;
  glow?: boolean;
}

export const MatrixRainCanvas: React.FC<MatrixRainCanvasProps> = ({
  color = "#00ff66",
  density = 0.8,
  opacity = 0.22,
  speed = 1.0,
  fontSize = 14,
  className = "",
  glow = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Matrix katakana, runes, hex numbers and Stark HUD symbols
    const chars = "ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789ABCDEF0101XYZ<>/[]+=-*~ΔΩΨ⚡";
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = [];

    // Initialize drop positions staggered randomly
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -50);
    }

    let lastTime = 0;
    const interval = 1000 / (30 * speed);

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (time - lastTime < interval) return;
      lastTime = time;

      // Subtle translucent clear for trail effect
      ctx.fillStyle = "rgba(4, 7, 12, 0.12)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "Courier New", monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Skip some columns based on density
        if (Math.random() > density && drops[i] <= 0) continue;

        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Leading char is bright/white, trailing stream is themed neon color
        const isLeading = Math.random() > 0.85;
        if (isLeading) {
          ctx.fillStyle = "#ffffff";
          if (glow) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = color;
          }
        } else {
          ctx.fillStyle = color;
          ctx.shadowBlur = glow ? 4 : 0;
          ctx.shadowColor = color;
        }

        ctx.fillText(text, x, y);

        // Reset drop to top with randomized delay once off screen
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      const newCols = Math.floor(width / fontSize);
      drops.length = 0;
      for (let i = 0; i < newCols; i++) {
        drops[i] = Math.floor(Math.random() * -50);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [color, density, speed, glow]);

  return (
    <canvas
      ref={canvasRef}
      style={{ opacity }}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
    />
  );
};
