/**
 * Constellation background — animated nodes + edges
 * Used on О нас pages instead of the oscilloscope grid.
 */
(function () {
  const canvas = document.getElementById('constellation');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // ── Config ──────────────────────────────────────────────────────────────
  const NODE_COUNT   = 72;
  const LINK_DIST    = 160;   // max px to draw a line between nodes
  const NODE_RADIUS  = 1.6;
  const SPEED        = 0.28;  // base drift speed (px/frame at 60fps)
  const NODE_COLOR   = 'rgba(148, 163, 184, ';   // slate-400 base
  const LINE_COLOR   = 'rgba(100, 130, 180, ';   // cooler blue lines

  // ── Resize ──────────────────────────────────────────────────────────────
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // ── Nodes ───────────────────────────────────────────────────────────────
  const nodes = Array.from({ length: NODE_COUNT }, () => ({
    x:  Math.random() * canvas.width,
    y:  Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * SPEED,
    vy: (Math.random() - 0.5) * SPEED,
    r:  NODE_RADIUS * (0.6 + Math.random() * 0.8),
    // random phase offset for subtle pulse
    phase: Math.random() * Math.PI * 2,
  }));

  // ── Loop ────────────────────────────────────────────────────────────────
  let t = 0;
  function frame() {
    t += 0.008;

    // Background: match --bg-primary
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update positions
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      // Wrap around edges with a small buffer
      if (n.x < -20) n.x = canvas.width  + 20;
      if (n.x > canvas.width  + 20) n.x = -20;
      if (n.y < -20) n.y = canvas.height + 20;
      if (n.y > canvas.height + 20) n.y = -20;
    }

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d > LINK_DIST) continue;

        const alpha = (1 - d / LINK_DIST) * 0.22;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = LINE_COLOR + alpha + ')';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Draw nodes
    for (const n of nodes) {
      const pulse = 0.45 + 0.25 * Math.sin(t + n.phase);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = NODE_COLOR + pulse + ')';
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Draw once, static
    frame();
  } else {
    requestAnimationFrame(frame);
  }
})();
