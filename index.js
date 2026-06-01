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