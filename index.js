const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let interval = null;

const message = document.querySelector(".message");
const originalText = message.innerText;

message.addEventListener("mouseenter", () =>
{
    clearInterval(interval);

    interval = setInterval(() =>
    {
        message.innerText = originalText.split("").map(char =>
        {
            if (char === " ") return " ";
            return letters[Math.floor(Math.random() * letters.length)];
        }).join("");
    }, 50);
});

message.addEventListener("mouseleave", () =>
{
    let iteration = 0;

    clearInterval(interval);

    interval = setInterval(() =>
    {
        message.innerText = originalText.split("").map((letter, index) =>
        {
            if (index < iteration) return originalText[index];
            return letters[Math.floor(Math.random() * letters.length)];
        }).join("");

        if (iteration >= originalText.length) clearInterval(interval);

        iteration += 1 / 3;
    }, 30);
});

// Dot grid BG
const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none';
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');

const SPACING       = 36;
const DOT_R         = 2;
const FISH_R        = 220;
const FISH_R2       = FISH_R * FISH_R;
const FISH_STRENGTH = 0.2;
const FISH_FADE = 0.12;

let fish_r2 = 0;
let mx = -9999, my = -9999;

window.addEventListener('mousemove', e =>
{
    mx = e.clientX;
    my = e.clientY;
});

let gridPts = [];

function buildGrid(w, h)
{
    gridPts = [];
    const cols = Math.ceil(w / SPACING) + 2;
    const rows = Math.ceil(h / SPACING) + 2;
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            gridPts.push(c * SPACING, r * SPACING);
}

function resizeCanvas()
{
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildGrid(canvas.width, canvas.height);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let lastFrame = 0;
const FRAME_MS = 1000 / 30;

function drawDots(ts)
{
    requestAnimationFrame(drawDots);
    if (ts - lastFrame < FRAME_MS) return;
    lastFrame = ts;

    mx = mx;
    my = my;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < gridPts.length; i += 2)
    {
        const gx = gridPts[i];
        const gy = gridPts[i + 1];

        const dx    = gx - mx;
        const dy    = gy - my;
        const dist2 = dx * dx + dy * dy;

        let px = gx, py = gy, scale = 1;

        if (dist2 < FISH_R2 && dist2 > 0)
        {
            const dist      = Math.sqrt(dist2);
            const norm      = dist / FISH_R;
            const falloff   = (1 - norm) * (1 - norm);
            const push      = falloff * FISH_STRENGTH;
            px      = gx + dx * push;
            py      = gy + dy * push;
            scale   = 1 + falloff * 1.2;
        }

        const alpha = 0.18 + (scale - 1) * 0.28;
        ctx.beginPath();
        ctx.arc(px, py, DOT_R * Math.min(scale, 1.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.min(alpha, 0.5)})`;
        ctx.fill();
    }
}
requestAnimationFrame(drawDots);