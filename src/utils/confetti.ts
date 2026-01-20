/**
 * Confetti Animation System
 * Creates particle effects for achievement unlocks
 */

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  gravity: number;
}

export const triggerConfetti = (options: {
  duration?: number;
  particleCount?: number;
  colors?: string[];
  startVelocity?: number;
  origin?: { x: number; y: number };
} = {}) => {
  const {
    duration = 3000,
    particleCount = 50,
    colors = ['#10b981', '#84cc16', '#fbbf24', '#f59e0b', '#ef4444'],
    startVelocity = 25,
    origin = { x: 0.5, y: 0.5 },
  } = options;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Create particles
  const particles: ConfettiParticle[] = [];
  const originX = canvas.width * origin.x;
  const originY = canvas.height * origin.y;

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.random() * Math.PI * 2);
    const velocity = Math.random() * startVelocity + startVelocity / 2;

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - 5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      gravity: 0.5 + Math.random() * 0.5,
    });
  }

  // Animation loop
  const startTime = Date.now();
  const animate = () => {
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      document.body.removeChild(canvas);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      // Update physics
      particle.vy += particle.gravity;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;

      // Fade out near end
      const opacity = Math.max(0, 1 - elapsed / duration);

      // Draw particle
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      ctx.restore();
    });

    requestAnimationFrame(animate);
  };

  animate();
};

/**
 * Achievement-specific confetti
 */
export const triggerAchievementConfetti = (rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common') => {
  const configs = {
    common: {
      particleCount: 30,
      colors: ['var(--chart-primary)', 'var(--chart-secondary)'],
      startVelocity: 20,
    },
    rare: {
      particleCount: 50,
      colors: ['#3b82f6', '#06b6d4', '#8b5cf6'],
      startVelocity: 25,
    },
    epic: {
      particleCount: 75,
      colors: ['#a855f7', '#ec4899', '#f472b6'],
      startVelocity: 30,
    },
    legendary: {
      particleCount: 100,
      colors: ['#fbbf24', '#f59e0b', '#ef4444', '#ec4899'],
      startVelocity: 35,
    },
  };

  // Get CSS variable values
  const root = document.documentElement;
  const primaryColor = getComputedStyle(root).getPropertyValue('--chart-primary').trim();
  const secondaryColor = getComputedStyle(root).getPropertyValue('--chart-secondary').trim();

  const config = configs[rarity];
  triggerConfetti({
    ...config,
    colors: rarity === 'common' ? [primaryColor, secondaryColor] : config.colors,
  });
};
