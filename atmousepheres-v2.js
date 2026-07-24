const stations = [
  {
    "name": "Sorcerer Radio",
    "description": "Disney Parks music and more",
    "icon": "sorcerer-radio-icon.png",
    "streams": [
      "https://streaming.live365.com/a88380"
    ]
  },
  {
    "name": "DPark Main",
    "description": "Disney Parks favorites",
    "icon": "dpark-radio-icon.png",
    "streams": [
      "https://cheetah.streemlion.com/dparkradio"
    ]
  },
  {
    "name": "DPark Background",
    "description": "Background music from the parks",
    "icon": "dpark-radio-icon.png",
    "streams": [
      "https://cheetah.streemlion.com/dparkradiobgm"
    ]
  },
  {
    "name": "DPark Holiday",
    "description": "Seasonal Disney music",
    "icon": "dpark-radio-icon.png",
    "streams": [
      "https://cheetah.streemlion.com/dparkradioholiday"
    ]
  }
];

const grid = document.getElementById("stationGrid");
const audio = document.getElementById("audioPlayer");
const title = document.getElementById("stationTitle");
const description = document.getElementById("stationDescription");
const logo = document.getElementById("networkLogo");
const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const trackTitle = document.getElementById("trackTitle");
const trackSubtitle = document.getElementById("trackSubtitle");
const statusMessage = document.getElementById("statusMessage");

let currentIndex = 0;
let isPlaying = false;
let statusTimer;

stations.forEach((station, index) => {
  const button = document.createElement("button");
  button.className = "station-button" + (index === 0 ? " selected" : "");
  button.type = "button";
  button.setAttribute("aria-label", `Play ${station.name}`);
  button.innerHTML = `
    <span class="icon-wrap">
      <img src="${station.icon}" alt="">
    </span>
    <strong>${station.name}</strong>
  `;
  button.addEventListener("click", () => selectStation(index, true));
  grid.appendChild(button);
});

function showStatus(message) {
  clearTimeout(statusTimer);
  statusMessage.textContent = message;
  statusMessage.classList.add("show");
  statusTimer = setTimeout(() => statusMessage.classList.remove("show"), 3200);
}

function updateUI() {
  [...grid.children].forEach((button, index) => {
    button.classList.toggle("selected", index === currentIndex);
  });

  const station = stations[currentIndex];
  title.textContent = station.name;
  description.textContent = station.description;
  logo.src = station.icon;
  logo.alt = station.name;
  playButton.textContent = isPlaying ? "Ⅱ" : "▶";
  playButton.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
}

async function playCurrentStation() {
  const station = stations[currentIndex];
  trackTitle.textContent = "Connecting…";
  trackSubtitle.textContent = station.name;

  for (const streamUrl of station.streams) {
    try {
      audio.src = streamUrl;
      audio.load();
      await audio.play();
      isPlaying = true;
      trackTitle.textContent = "Live radio stream";
      trackSubtitle.textContent = station.name;
      updateUI();
      showStatus("Playing");
      return;
    } catch (error) {
      console.warn(`Stream failed for ${station.name}`, error);
    }
  }

  isPlaying = false;
  trackTitle.textContent = "Stream could not start";
  trackSubtitle.textContent = "Tap Play to retry";
  updateUI();
  showStatus("Stream could not start");
}

function selectStation(index, autoplay = false) {
  currentIndex = (index + stations.length) % stations.length;
  audio.pause();
  isPlaying = false;
  trackTitle.textContent = "Live radio stream";
  trackSubtitle.textContent = "Tap Play to begin";
  updateUI();

  if (autoplay) {
    playCurrentStation();
  }
}

playButton.addEventListener("click", () => {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    trackTitle.textContent = "Paused";
    trackSubtitle.textContent = stations[currentIndex].name;
    updateUI();
    showStatus("Paused");
  } else {
    playCurrentStation();
  }
});

previousButton.addEventListener("click", () => selectStation(currentIndex - 1, true));
nextButton.addEventListener("click", () => selectStation(currentIndex + 1, true));

audio.addEventListener("playing", () => {
  isPlaying = true;
  updateUI();
});

audio.addEventListener("pause", () => {
  if (!audio.ended) {
    isPlaying = false;
    updateUI();
  }
});

audio.addEventListener("error", () => {
  isPlaying = false;
  updateUI();
});

updateUI();
