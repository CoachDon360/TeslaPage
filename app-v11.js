const audio = document.getElementById("audio");
const list = document.getElementById("stationList");
const playButton = document.getElementById("play");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const favoriteButton = document.getElementById("favorite");
const notice = document.getElementById("notice");

let currentIndex = -1;
let streamIndex = 0;
let favorites = new Set(JSON.parse(localStorage.getItem("coachdon-favorites") || "[]"));

function renderStations() {
  list.innerHTML = STATIONS.map((station, index) => `
    <button class="channel" data-index="${index}">
      <span class="num">${String(station.n).padStart(2,"0")}</span>
      <span class="logo ${station.className}">${station.logo}</span>
      <span class="info">
        <span class="name">${station.name}</span>
        <span class="desc">${station.desc}</span>
      </span>
      <span class="fav ${favorites.has(station.n) ? "on" : ""}" data-favorite="${station.n}">${favorites.has(station.n) ? "♥" : "♡"}</span>
      <span class="health"><span class="dot"></span><span class="quality">${station.quality}</span></span>
    </button>
  `).join("");

  list.querySelectorAll(".channel").forEach(button => {
    button.addEventListener("click", event => {
      const favorite = event.target.closest("[data-favorite]");
      if (favorite) {
        event.stopPropagation();
        toggleFavorite(Number(favorite.dataset.favorite));
        return;
      }
      selectStation(Number(button.dataset.index), true);
    });
  });
}

function toggleFavorite(number) {
  favorites.has(number) ? favorites.delete(number) : favorites.add(number);
  localStorage.setItem("coachdon-favorites", JSON.stringify([...favorites]));
  renderStations();
  highlightCurrent();
}

function highlightCurrent() {
  list.querySelectorAll(".channel").forEach((row, index) => {
    row.classList.toggle("active", index === currentIndex);
    row.classList.toggle("live", index === currentIndex && !audio.paused);
  });
  if (currentIndex >= 0) {
    favoriteButton.textContent = favorites.has(STATIONS[currentIndex].n) ? "♥" : "♡";
    favoriteButton.classList.toggle("on", favorites.has(STATIONS[currentIndex].n));
  }
}

function setStationPanel(station) {
  document.getElementById("plogo").textContent = station.logo.replace(/<[^>]*>/g, "");
  document.getElementById("pname").textContent = station.name;
  document.getElementById("provider").textContent = station.relayId ? "181.FM" : station.somaId ? "SomaFM" : "LIVE RADIO";
  document.getElementById("quality").textContent = `${station.quality} kbps`;
}

function updateNowPlayingMetadata(artist, title) {
  document.getElementById("artist").textContent = artist || "";
  document.getElementById("track").textContent = title || "";
}

function setMetadataStatus(text) {
  document.getElementById("metadataStatus").textContent = text;
}

function showNotice(message) {
  notice.textContent = message;
  notice.classList.add("show");
  setTimeout(() => notice.classList.remove("show"), 2200);
}

async function selectStation(index, autoplay) {
  currentIndex = (index + STATIONS.length) % STATIONS.length;
  streamIndex = 0;
  const station = STATIONS[currentIndex];
  setStationPanel(station);
  startMetadataPolling(station);
  highlightCurrent();
  if (autoplay) await playCurrentStream();
}

async function playCurrentStream() {
  const station = STATIONS[currentIndex];
  if (!station) return;
  if (!station.streams.length) {
    showNotice("No direct stream is configured.");
    return;
  }
  audio.src = station.streams[streamIndex];
  setMetadataStatus("CONNECTING");
  try {
    await audio.play();
  } catch (error) {
    tryNextStream(error);
  }
}

function tryNextStream(error) {
  const station = STATIONS[currentIndex];
  if (streamIndex + 1 < station.streams.length) {
    streamIndex++;
    showNotice("Trying backup stream...");
    playCurrentStream();
  } else {
    setMetadataStatus("OFFLINE");
    updateNowPlayingMetadata(station.name.toUpperCase(), "Station did not answer");
    showNotice("Station is not answering.");
    console.warn(error);
  }
}

playButton.addEventListener("click", async () => {
  if (currentIndex < 0) {
    await selectStation(6, true);
    return;
  }
  if (audio.paused) await playCurrentStream();
  else audio.pause();
});

prevButton.addEventListener("click", () => selectStation(currentIndex <= 0 ? STATIONS.length - 1 : currentIndex - 1, true));
nextButton.addEventListener("click", () => selectStation(currentIndex < 0 ? 0 : currentIndex + 1, true));
favoriteButton.addEventListener("click", () => currentIndex >= 0 && toggleFavorite(STATIONS[currentIndex].n));

audio.addEventListener("playing", () => {
  playButton.textContent = "Ⅱ";
  setMetadataStatus("LIVE");
  highlightCurrent();
});
audio.addEventListener("pause", () => {
  playButton.textContent = "▶";
  setMetadataStatus("PAUSED");
  highlightCurrent();
});
audio.addEventListener("waiting", () => setMetadataStatus("BUFFERING"));
audio.addEventListener("error", () => tryNextStream(audio.error));

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString([], {hour:"numeric", minute:"2-digit"});
  document.getElementById("date").textContent = now.toLocaleDateString([], {weekday:"short", month:"short", day:"numeric"});
}
setInterval(updateClock, 1000);
updateClock();
renderStations();
selectStation(6, false);
