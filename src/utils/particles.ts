/**
 * Particle System for Flame Detection Effects
 * Creates animated particles when flame is detected
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

export class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationFrame: number | null = null;
  private isRunning = false;

  constructor(containerId: string) {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '10';

    const container = document.getElementById(containerId);
    if (container) {
      container.style.position = 'relative';
      container.appendChild(this.canvas);

      // Set canvas size
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');
    this.ctx = ctx;
  }

  createFlameParticles(x: number, y: number, count: number = 15) {
    const colors = [
      getComputedStyle(document.documentElement).getPropertyValue('--chart-primary').trim(),
      getComputedStyle(document.documentElement).getPropertyValue('--chart-secondary').trim(),
      getComputedStyle(document.documentElement).getPropertyValue('--accent-warning').trim(),
    ];

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 3 + 1;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Slight upward bias
        life: 1,
        maxLife: Math.random() * 30 + 30,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
      });
    }

    if (!this.isRunning) {
      this.start();
    }
  }

  createGlowPulse(x: number, y: number) {
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--chart-primary').trim();

    // Create expanding ring
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 50;

      this.particles.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        life: 1,
        maxLife: 40,
        size: 3,
        color: primaryColor,
        alpha: 0.8,
      });
    }

    if (!this.isRunning) {
      this.start();
    }
  }

  private update() {
    // Update and remove dead particles
    this.particles = this.particles.filter((p) => {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravity
      p.alpha = 1 - p.life / p.maxLife;

      return p.life < p.maxLife;
    });

    // Stop animation if no particles
    if (this.particles.length === 0) {
      this.stop();
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p) => {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  private animate = () => {
    this.update();
    this.draw();
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  stop() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.isRunning = false;
  }

  destroy() {
    this.stop();
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}

/**
 * Simple particle burst for button clicks
 */
export const triggerClickBurst = (event: MouseEvent, color?: string) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '100';

  target.style.position = 'relative';
  target.appendChild(canvas);

  canvas.width = rect.width;
  canvas.height = rect.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particles: Particle[] = [];
  const particleColor = color || getComputedStyle(document.documentElement).getPropertyValue('--chart-primary').trim();

  // Create particles
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * 3,
      vy: Math.sin(angle) * 3,
      life: 0,
      maxLife: 20,
      size: 3,
      color: particleColor,
      alpha: 1,
    });
  }

  let animationFrame: number;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = 1 - p.life / p.maxLife;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    if (particles.every((p) => p.life >= p.maxLife)) {
      cancelAnimationFrame(animationFrame);
      target.removeChild(canvas);
    } else {
      animationFrame = requestAnimationFrame(animate);
    }
  };

  animate();
};
