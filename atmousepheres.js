(() => {
  "use strict";

  const artboard = document.querySelector(".artboard");
  const cards = [...document.querySelectorAll(".card")];
  const title = document.getElementById("selectionTitle");
  const subtitle = document.getElementById("selectionSubtitle");
  const playButton = document.getElementById("playButton");
  const previousButton = document.getElementById("previousButton");
  const nextButton = document.getElementById("nextButton");
  const volumeSlider = document.getElementById("volumeSlider");
  const homeButton = document.getElementById("homeButton");
  const audio = document.getElementById("audioPlayer");
  const toast = document.getElementById("toast");
  const developerHotspot = document.getElementById("developerHotspot");
  const developerPanel = document.getElementById("developerPanel");
  const closeDeveloper = document.getElementById("closeDeveloper");
  const timePreview = document.getElementById("timePreview");

  let currentIndex = 4;
  let isPlaying = false;
  let toastTimer;
  let hotspotTaps = 0;
  let hotspotTimer;

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1300);
  }

  function selectCard(index, announce = false) {
    currentIndex = (index + cards.length) % cards.length;
    const card = cards[currentIndex];
    cards.forEach((item, itemIndex) => item.classList.toggle("selected", itemIndex === currentIndex));
    title.textContent = card.dataset.title;
    subtitle.textContent = card.dataset.subtitle;
    if (announce) showToast(`${card.dataset.title} selected`);
  }

  function automaticTheme() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return "morning";
    if (hour >= 10 && hour < 18) return "day";
    return "night";
  }

  function applyTheme(value) {
    const theme = value === "auto" ? automaticTheme() : value;
    artboard.dataset.timeTheme = theme;
  }

  cards.forEach((card, index) => card.addEventListener("click", () => {
    if (card.classList.contains("card-parks")) {
      window.location.href = "around-parks.html";
      return;
    }
    selectCard(index, true);
  }));
  previousButton.addEventListener("click", () => selectCard(currentIndex - 1));
  nextButton.addEventListener("click", () => selectCard(currentIndex + 1));

  playButton.addEventListener("click", () => {
    isPlaying = !isPlaying;
    playButton.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
    showToast(isPlaying ? `Playing ${cards[currentIndex].dataset.title}` : "Paused");
  });

  volumeSlider.addEventListener("input", () => {
    audio.volume = Number(volumeSlider.value) / 100;
    showToast(`Volume ${volumeSlider.value}%`);
  });

  homeButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  developerHotspot.addEventListener("click", () => {
    hotspotTaps += 1;
    clearTimeout(hotspotTimer);
    hotspotTimer = setTimeout(() => { hotspotTaps = 0; }, 900);
    if (hotspotTaps >= 3) {
      hotspotTaps = 0;
      developerPanel.hidden = false;
    }
  });

  closeDeveloper.addEventListener("click", () => {
    developerPanel.hidden = true;
  });

  timePreview.addEventListener("change", () => {
    applyTheme(timePreview.value);
    showToast(timePreview.value === "auto" ? "Automatic lighting" : `${timePreview.options[timePreview.selectedIndex].text}`);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") selectCard(currentIndex - 1);
    if (event.key === "ArrowRight") selectCard(currentIndex + 1);
    if (event.key === "Enter") selectCard(currentIndex, true);
    if (event.key === " ") {
      event.preventDefault();
      playButton.click();
    }
  });

  selectCard(currentIndex);
  audio.volume = Number(volumeSlider.value) / 100;
  applyTheme("auto");
  setInterval(() => {
    if (timePreview.value === "auto") applyTheme("auto");
  }, 60 * 1000);
})();
