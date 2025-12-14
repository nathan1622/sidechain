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

  ctx.clearRect(0, 0, w, h);

  // soft glow
  const g = ctx.createRadialGradient(w * 0.55, h * 0.45, 0, w * 0.55, h * 0.45, Math.max(w, h));
  g.addColorStop(0, "rgba(255,255,255,0.06)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // flowing lines (full width)
  const lineCount = 8;
  for (let i = 0; i < lineCount; i++) {
    ctx.beginPath();

    const yBase = h * 0.46 + (i - (lineCount - 1) / 2) * 26;
    const ampA = 28 + i * 4;
    const ampB = 18 + i * 3;

    for (let x = -30; x <= w + 30; x += 10) {
      const y =
        yBase +
        Math.sin(x * 0.006 + t + i * 0.45) * ampA +
        Math.sin(x * 0.002 + t * 0.7 + i) * ampB;
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // drifting nodes, to avoid "empty right side" feeling
  for (let k = 0; k < 14; k++) {
    const speed = 50;
    const x = ((k * 140) + (t * speed)) % (w + 260) - 130;
    const y = h * 0.5 + Math.sin(t * 0.9 + k) * 130;

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  t += 0.010;
  requestAnimationFrame(draw);
}

draw();
