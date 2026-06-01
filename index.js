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
canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none';
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');

let mx = -9999, my = -9999;

const SPACING = 36;
const DOT_R = 2;
const FISH_RADIUS = 220;
const FISH_STRENGTH = 0.2;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function drawDots()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cols = Math.ceil(canvas.width / SPACING) + 2;
    const rows = Math.ceil(canvas.height / SPACING) + 2;

    for (let r = 0; r < rows; r++)
    {
        for (let c = 0; c < cols; c++)
        {
            const gx = c * SPACING;
            const gy = r * SPACING;

            const dx = gx - mx;
            const dy = gy - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let px = gx, py = gy, scale = 1;

            if (dist < FISH_RADIUS && dist > 0)
            {
                const norm = dist / FISH_RADIUS;
                const falloff = 1 - Math.sin((norm * Math.PI) / 2);
                const push = falloff * FISH_STRENGTH;
                px = gx + dx * push;
                py = gy + dy * push;
                scale = 1 + falloff * 1.2;
            }

            const alpha = 0.18 + (scale - 1) * 0.28;
            ctx.beginPath();
            ctx.arc(px, py, DOT_R * Math.min(scale, 1.5), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${Math.min(alpha, 0.5)})`;
            ctx.fill();
        }
    }

    requestAnimationFrame(drawDots);
}
drawDots();