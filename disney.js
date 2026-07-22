const cards = [...document.querySelectorAll(".destination-card")];
const nowTitle = document.getElementById("nowTitle");
const nowSubtitle = document.getElementById("nowSubtitle");
const playerStatus = document.getElementById("playerStatus");
const playButton = document.getElementById("playButton");
const clockTime = document.getElementById("clockTime");
const greetingText = document.getElementById("greetingText");
const greetingIcon = document.getElementById("greetingIcon");

let previewPlaying = false;

function updateClockAndGreeting() {
  const now = new Date();
  const hour = now.getHours();

  clockTime.textContent = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });

  if (hour >= 4 && hour < 12) {
    greetingText.textContent = "Good Morning";
    greetingIcon.textContent = "☀";
  } else if (hour >= 12 && hour < 18) {
    greetingText.textContent = "Good Afternoon";
    greetingIcon.textContent = "☀";
  } else {
    greetingText.textContent = "Good Evening";
    greetingIcon.textContent = "☾";
  }
}

cards.forEach((card) => {
  card.addEventListener("click", () => {
    cards.forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");
    nowTitle.textContent = card.dataset.title;
    nowSubtitle.textContent = card.dataset.subtitle;
    playerStatus.textContent = "Selected — audio feed will be connected in the audio phase";
    previewPlaying = false;
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Preview play button");
  });
});

playButton.addEventListener("click", () => {
  previewPlaying = !previewPlaying;
  playButton.textContent = previewPlaying ? "❚❚" : "▶";
  playButton.setAttribute("aria-label", previewPlaying ? "Pause preview" : "Preview play button");
  playerStatus.textContent = previewPlaying
    ? "Interface preview only — no stream is connected yet"
    : "Phase 1 preview — audio feeds come next";
});

updateClockAndGreeting();
setInterval(updateClockAndGreeting, 30000);
