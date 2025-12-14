const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d", { alpha: true });

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

let t = 0;

function draw() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // background fade
  ctx.clearRect(0, 0, w, h);

  // subtle glow
  const g = ctx.createRadialGradient(w * 0.6, h * 0.5, 0, w * 0.6, h * 0.5, Math.max(w, h));
  g.addColorStop(0, "rgba(255,255,255,0.06)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // flowing lines (full width)
  const lineCount = 7;
  for (let i = 0; i < lineCount; i++) {
    ctx.beginPath();
    const amp = 45 + i * 8;
    const y0 = h * 0.45 + (i - (lineCount - 1) / 2) * 28;

    for (let x = -20; x <= w + 20; x += 10) {
      const y =
        y0 +
        Math.sin(x * 0.006 + t + i * 0.55) * amp * 0.25 +
        Math.sin(x * 0.002 + t * 0.7 + i) * amp * 0.18;
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // drifting nodes to the right (fills empty space visually)
  for (let k = 0; k < 10; k++) {
    const x = (w * 0.15 + (k * 140 + (t * 60) % (w + 200))) % (w + 200) - 100;
    const y = h * 0.5 + Math.sin(t * 0.8 + k) * 120;
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.arc(x, y, 2.0, 0, Math.PI * 2);
    ctx.fill();
  }

  t += 0.012;
  requestAnimationFrame(draw);
}

draw();
// update
