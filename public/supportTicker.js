const supportTickerMessage = document.getElementById("supportTickerMessage");
const supportTickerToggle = document.getElementById("supportTickerToggle");

if (supportTickerMessage && supportTickerToggle) {
    supportTickerToggle.addEventListener("click", () => {
        const isPaused = supportTickerToggle.getAttribute("aria-pressed") === "true";

        supportTickerMessage.style.animationPlayState = isPaused ? "running" : "paused";
        supportTickerToggle.setAttribute("aria-pressed", String(!isPaused));
        supportTickerToggle.setAttribute(
            "aria-label",
            isPaused ? "Pause moving donation message" : "Resume moving donation message"
        );
        supportTickerToggle.textContent = isPaused ? "Pause message" : "Resume message";
    });
}