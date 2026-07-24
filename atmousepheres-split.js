(() => {
  "use strict";

  // Direct browser-playable streams confirmed from the stations' public listings.
  // Live radio URLs can change; edit only this array if a provider migrates a stream.
  const stations = [
    {
      title: "Sorcerer Radio",
      network: "sorcerer",
      icon: "sorcerer-radio-icon.png",
      description: "All Disney music, all day long",
      stream: "https://streaming.live365.com/a89268",
      scene: "scene-atmospheres"
    },
    {
      title: "Atmospheres",
      network: "sorcerer",
      icon: "sorcerer-radio-icon.png",
      description: "Relaxing Disney park music",
      stream: "https://streaming.live365.com/a60346",
      scene: "scene-atmospheres"
    },
    {
      title: "Loop’d",
      network: "sorcerer",
      icon: "sorcerer-radio-icon.png",
      description: "Disney park and resort loops",
      stream: "",
      officialPage: "https://srsounds.com/wp/player/",
      scene: "scene-loop"
    },
    {
      title: "Rope Drop",
      network: "sorcerer",
      icon: "sorcerer-radio-icon.png",
      description: "Rides and attraction audio",
      stream: "https://streaming.live365.com/a81480",
      scene: "scene-rope"
    },
    {
      title: "DPark Main",
      network: "dpark",
      icon: "dparkradio-icon.png",
      description: "Disney theme park music",
      stream: "https://str3.openstream.co/805",
      scene: "scene-dpark"
    },
    {
      title: "Background",
      network: "dpark",
      icon: "dparkradio-icon.png",
      description: "Background area music",
      stream: "https://listen.openstream.co/7421/audio",
      scene: "scene-loop"
    },
    {
      title: "Guest TV (Resort TV)",
      network: "dpark",
      icon: "dparkradio-icon.png",
      description: "Classic Disney resort television audio",
      stream: "https://cheetah.streemlion.com:2340/;",
      scene: "scene-dpark"
    },
    {
      title: "Holiday / Main Street",
      network: "dpark",
      icon: "dparkradio-icon.png",
      description: "Holiday and Main Street programming",
      stream: "https://listen.openstream.co/4287/audio",
      scene: "scene-rope"
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
  const trackTitle = document.getElementById("trackTitle");
  const trackSubtitle = document.getElementById("trackSubtitle");
  const scene = document.getElementById("scene");
  const statusMessage = document.getElementById("statusMessage");
  let currentIndex = 1;
  let statusTimer;

  function showStatus(message) {
    clearTimeout(statusTimer);
    statusMessage.textContent = message;
    statusMessage.classList.add("show");
    statusTimer = setTimeout(() => statusMessage.classList.remove("show"), 2200);
  }

  function renderStations() {
    stations.forEach((station, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "station-button";
      button.dataset.index = index;
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
    networkLogo.src = station.icon;
    networkLogo.alt = station.network === "sorcerer" ? "Sorcerer Radio" : "DParkRadio";
    scene.className = `scene ${station.scene}`;
    trackTitle.textContent = station.title;
    trackSubtitle.textContent = "Live radio stream";

    audio.pause();
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Play");

    if (station.stream) {
      audio.src = station.stream;
      audio.load();
      if (autoplay) {
        audio.play().catch(() => showStatus("Tap Play to begin this stream"));
      }
    } else {
      audio.removeAttribute("src");
      audio.load();
      showStatus("Loop’d direct stream address needs provider confirmation");
    }
  }

  function togglePlayback() {
    const station = stations[currentIndex];
    if (!station.stream) {
      showStatus("This provider has not published a stable direct stream URL");
      return;
    }
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
    if (audio.currentSrc) trackSubtitle.textContent = "Paused";
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
  selectStation(currentIndex, false);
  updateClock();
  setInterval(updateClock, 30000);
})();