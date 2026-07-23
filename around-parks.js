(() => {
  "use strict";

  const destinations = [...document.querySelectorAll(".destination")];
  const title = document.getElementById("selectionTitle");
  const subtitle = document.getElementById("selectionSubtitle");
  const audio = document.getElementById("audioPlayer");
  const playButton = document.getElementById("playButton");
  const previousButton = document.getElementById("previousButton");
  const nextButton = document.getElementById("nextButton");
  const volumeSlider = document.getElementById("volumeSlider");
  const toast = document.getElementById("toast");

  let currentIndex = 0;
  let toastTimer;

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
  }

  function updateClock() {
    const now = new Date();
    document.getElementById("time").textContent =
      now.toLocaleTimeString([], {hour: "numeric", minute: "2-digit"});
    document.getElementById("date").textContent =
      now.toLocaleDateString([], {weekday: "long", month: "long", day: "numeric"});
  }

  function selectDestination(index, autoplay = false) {
    currentIndex = (index + destinations.length) % destinations.length;
    const item = destinations[currentIndex];

    destinations.forEach((destination, i) => {
      destination.classList.toggle("selected", i === currentIndex);
    });

    title.textContent = item.dataset.title;
    subtitle.textContent = item.dataset.subtitle;

    const feed = item.dataset.feed.trim();
    if (feed && audio.src !== feed) {
      audio.src = feed;
      audio.load();
    }

    if (autoplay) {
      if (!feed) {
        audio.pause();
        playButton.textContent = "▶";
        playButton.setAttribute("aria-label", "Play");
        showToast(`${item.dataset.title} is ready for its music feed`);
        return;
      }
      audio.play().catch(() => showToast("Tap Play to begin"));
    }
  }

  destinations.forEach((item, index) => {
    item.addEventListener("click", () => selectDestination(index, true));
  });

  previousButton.addEventListener("click", () => selectDestination(currentIndex - 1, true));
  nextButton.addEventListener("click", () => selectDestination(currentIndex + 1, true));

  playButton.addEventListener("click", () => {
    const item = destinations[currentIndex];
    const feed = item.dataset.feed.trim();

    if (!feed) {
      showToast(`${item.dataset.title} feed will be connected next`);
      return;
    }

    if (audio.paused) {
      audio.play().catch(() => showToast("This stream could not start"));
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    playButton.textContent = "Ⅱ";
    playButton.setAttribute("aria-label", "Pause");
  });

  audio.addEventListener("pause", () => {
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Play");
  });

  audio.addEventListener("error", () => showToast("This music feed is temporarily unavailable"));

  volumeSlider.addEventListener("input", () => {
    audio.volume = Number(volumeSlider.value) / 100;
  });

  document.getElementById("backButton").addEventListener("click", () => {
    window.location.href = "atmousepheres.html";
  });

  document.getElementById("homeButton").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") selectDestination(currentIndex - 1);
    if (event.key === "ArrowRight") selectDestination(currentIndex + 1);
    if (event.key === "Enter") selectDestination(currentIndex, true);
    if (event.key === " ") {
      event.preventDefault();
      playButton.click();
    }
  });

  audio.volume = Number(volumeSlider.value) / 100;
  selectDestination(0);
  updateClock();
  setInterval(updateClock, 30000);
})();