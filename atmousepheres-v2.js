(() => {
  "use strict";

  const stations = [
    {
      title: "Sorcerer Radio",
      icon: "sorcerer-radio-icon.png",
      description: "All Disney music, all day long",
      stream: "https://streaming.live365.com/a89268"
    },
    {
      title: "DPark Main",
      icon: "dparkradio-icon.png",
      description: "Disney theme park music",
      stream: "https://str3.openstream.co/805"
    },
    {
      title: "DPark Background",
      icon: "dparkradio-icon.png",
      description: "Background area music",
      stream: "https://listen.openstream.co/7421/audio"
    },
    {
      title: "DPark Holiday",
      icon: "dparkradio-icon.png",
      description: "Holiday and Main Street programming",
      stream: "https://listen.openstream.co/4287/audio"
    }
  ];

  const grid = document.getElementById("stationGrid");
  const audio = document.getElementById("audioPlayer");
  const playButton = document.getElementById("playButton");
  const previousButton = document.getElementById("previousButton");
  const nextButton = document.getElementById("nextButton");
  const stationTitle = document.getElementById("stationTitle");
  const stationDescription = document.getElementById("stationDescription");
  const networkLogo = document.getElementById("networkLogo");
  const albumArt = document.getElementById("albumArt");
  const trackTitle = document.getElementById("trackTitle");
  const trackSubtitle = document.getElementById("trackSubtitle");
  const statusMessage = document.getElementById("statusMessage");

  let currentIndex = 0;
  let statusTimer;

  function showStatus(message) {
    clearTimeout(statusTimer);
    statusMessage.textContent = message;
    statusMessage.classList.add("show");
    statusTimer = setTimeout(() => statusMessage.classList.remove("show"), 2400);
  }

  function renderStations() {
    grid.innerHTML = "";
    stations.forEach((station, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "station-button";
      button.setAttribute("aria-label", `Play ${station.title}`);
      button.innerHTML = `
        <span class="icon-wrap"><img src="${station.icon}" alt=""></span>
        <strong>${station.title}</strong>
      `;
      button.addEventListener("click", () => selectStation(index, true));
      grid.appendChild(button);
    });
  }

  function selectStation(index, autoplay = false) {
    currentIndex = (index + stations.length) % stations.length;
    const station = stations[currentIndex];

    document.querySelectorAll(".station-button").forEach((button, i) => {
      button.classList.toggle("selected", i === currentIndex);
    });

    stationTitle.textContent = station.title;
    stationDescription.textContent = station.description;
    trackTitle.textContent = station.title;
    trackSubtitle.textContent = autoplay ? "Connecting…" : "Tap Play to begin";
    networkLogo.src = station.icon;
    networkLogo.alt = station.title;
    albumArt.src = station.icon;

    audio.pause();
    audio.src = station.stream;
    audio.load();
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Play");

    if (autoplay) {
      audio.play().catch(() => {
        trackSubtitle.textContent = "Tap Play to begin";
        showStatus("Tap Play to start this station");
      });
    }
  }

  function togglePlayback() {
    if (audio.paused) {
      trackSubtitle.textContent = "Connecting…";
      audio.play().catch(() => {
        trackSubtitle.textContent = "Stream could not start";
        showStatus("The station may be temporarily unavailable");
      });
    } else {
      audio.pause();
    }
  }

  audio.addEventListener("playing", () => {
    playButton.textContent = "Ⅱ";
    playButton.setAttribute("aria-label", "Pause");
    trackSubtitle.textContent = "Live now";
  });

  audio.addEventListener("pause", () => {
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Play");
    if (audio.currentSrc && !audio.ended) trackSubtitle.textContent = "Paused";
  });

  audio.addEventListener("waiting", () => {
    trackSubtitle.textContent = "Buffering…";
  });

  audio.addEventListener("error", () => {
    trackSubtitle.textContent = "Stream unavailable";
    showStatus("This station did not answer. Try again shortly.");
  });

  playButton.addEventListener("click", togglePlayback);
  previousButton.addEventListener("click", () => selectStation(currentIndex - 1, true));
  nextButton.addEventListener("click", () => selectStation(currentIndex + 1, true));

  function updateClock() {
    document.getElementById("clock").textContent =
      new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  renderStations();
  selectStation(0, false);
  updateClock();
  setInterval(updateClock, 30000);
})();
