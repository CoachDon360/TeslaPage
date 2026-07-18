
const stations = [{"name": "K-LOVE", "group": "music", "accent": "#0094E1", "subtitle": "Positive. Encouraging.", "stream": "https://emf-hls.streamguys1.com/klove-live-aac/playlist.m3u8"}, {"name": "Super 70s", "group": "music", "accent": "#0094E1", "subtitle": "The soundtrack of the 70s.", "stream": "https://listen.181fm.com/181-70s_128k.mp3"}, {"name": "Awesome 80s", "group": "music", "accent": "#0094E1", "subtitle": "Turn it up.", "stream": "https://listen.181fm.com/181-awesome80s_128k.mp3"}, {"name": "Lite 80s", "group": "music", "accent": "#0094E1", "subtitle": "The softer side of the 80s.", "stream": "https://listen.181fm.com/181-lite80s_128k.mp3"}, {"name": "Star 90s", "group": "music", "accent": "#0094E1", "subtitle": "The biggest hits of the 90s.", "stream": "https://listen.181fm.com/181-star90s_128k.mp3"}, {"name": "Lite 90s", "group": "music", "accent": "#0094E1", "subtitle": "Smooth 90s favorites.", "stream": "https://listen.181fm.com/181-lite90s_128k.mp3"}, {"name": "Yacht Rock", "group": "music", "accent": "#0094E1", "subtitle": "Smooth. Soft. Sailing.", "stream": "https://listen.181fm.com/181-yachtrock_128k.mp3"}, {"name": "Good Time Oldies", "group": "music", "accent": "#0094E1", "subtitle": "More good times.", "stream": "https://listen.181fm.com/181-goodtime_128k.mp3"}, {"name": "Soul", "group": "music", "accent": "#0094E1", "subtitle": "Classic soul. Timeless groove.", "stream": "https://listen.181fm.com/181-soul_128k.mp3"}, {"name": "Cinema", "group": "music", "accent": "#0094E1", "subtitle": "Music from the movies.", "stream": "https://listen.181fm.com/181-cinemasoundtracks_128k.mp3"}, {"name": "The Breeze", "group": "music", "accent": "#0094E1", "subtitle": "Relax. Unwind. Breathe.", "stream": "https://listen.181fm.com/181-breeze_128k.mp3"}, {"name": "Classical", "group": "music", "accent": "#0094E1", "subtitle": "Timeless masterworks.", "stream": "https://listen.181fm.com/181-classical_128k.mp3"}, {"name": "DParkRadio", "group": "disney", "accent": "#D65A54", "subtitle": "Disney parks audio.", "stream": ""}, {"name": "Sorcerer Radio", "group": "disney", "accent": "#D65A54", "subtitle": "All Disney music, all day.", "stream": ""}, {"name": "Disney Hits", "group": "disney", "accent": "#D65A54", "subtitle": "All the favorites.", "stream": ""}, {"name": "Disney Parks", "group": "disney", "accent": "#D65A54", "subtitle": "The magic of the parks.", "stream": ""}, {"name": "The Ramsey Show", "group": "podcasts", "accent": "#9B5DE5", "subtitle": "Money, work, and life.", "stream": ""}, {"name": "Insight for Living", "group": "podcasts", "accent": "#9B5DE5", "subtitle": "Biblical teaching with Chuck Swindoll.", "stream": ""}, {"name": "Southeast Christian", "group": "podcasts", "accent": "#9B5DE5", "subtitle": "Messages from Southeast Christian Church.", "stream": ""}, {"name": "Brian Buffini", "group": "podcasts", "accent": "#9B5DE5", "subtitle": "Business, motivation, and real estate.", "stream": ""}];
const audio = document.getElementById("radioAudio");
const groups = {
  music: document.getElementById("musicStations"),
  disney: document.getElementById("disneyStations"),
  podcasts: document.getElementById("podcastStations")
};
let selected = Math.max(0, stations.findIndex(s => s.name === "Soul"));
let playing = false;
const favorites = new Set(JSON.parse(localStorage.getItem("coachdonRadioFavorites") || "[]"));

function shortName(name) {
  const words = name.replace(/[^a-z0-9 ]/gi, "").split(/\s+/).filter(Boolean);
  return words.length === 1 ? words[0].slice(0,2).toUpperCase() : words.slice(0,2).map(w => w[0]).join("").toUpperCase();
}

function render() {
  Object.values(groups).forEach(el => el.innerHTML = "");
  stations.forEach((station, index) => {
    const button = document.createElement("button");
    button.className = "station-row" + (index === selected ? " active" : "");
    button.innerHTML = `<span class="name">${station.name}</span><span class="playing">▶</span>`;
    button.addEventListener("click", () => choose(index, playing));
    groups[station.group].appendChild(button);
  });
}

function choose(index, autoplay = false) {
  selected = (index + stations.length) % stations.length;
  const station = stations[selected];
  document.documentElement.style.setProperty("--accent", station.accent);
  document.getElementById("artName").textContent = station.group === "podcasts" ? "PODCAST" : station.name;
  document.getElementById("artSubtitle").textContent = station.subtitle;
  document.getElementById("modeLabel").textContent = station.group === "podcasts" ? "PODCAST" : "NOW PLAYING";
  document.getElementById("trackTitle").textContent = station.stream ? "Live Radio" : (station.group === "podcasts" ? "Episode feed setup needed" : "Stream setup needed");
  document.getElementById("stationTitle").textContent = station.name;
  document.getElementById("miniTitle").textContent = station.name;
  document.getElementById("miniSubtitle").textContent = station.stream ? "Tap play to listen" : (station.group === "podcasts" ? "Podcast feed to connect" : "Direct stream to connect");
  document.getElementById("miniArt").textContent = station.group === "podcasts" ? "◉" : shortName(station.name);
  document.getElementById("statusText").innerHTML = `<span></span> ${station.stream ? "READY" : "SETUP NEEDED"}`;
  document.getElementById("favoriteButton").textContent = favorites.has(station.name) ? "♥" : "♡";
  render();
  if (autoplay) playSelected();
}

async function playSelected() {
  const station = stations[selected];
  if (!station.stream) {
    playing = false;
    document.getElementById("playButton").textContent = "▶";
    document.getElementById("statusText").innerHTML = '<span style="background:#f2c94c;box-shadow:0 0 14px #f2c94c"></span> SETUP NEEDED';
    return;
  }
  if (audio.src !== station.stream) audio.src = station.stream;
  try {
    await audio.play();
    playing = true;
    document.getElementById("playButton").textContent = "Ⅱ";
    document.getElementById("trackTitle").textContent = "Playing Live";
    document.getElementById("miniSubtitle").textContent = "Playing live";
    document.getElementById("statusText").innerHTML = "<span></span> LIVE";
  } catch (error) {
    playing = false;
    document.getElementById("playButton").textContent = "▶";
    document.getElementById("trackTitle").textContent = "Station unavailable";
    document.getElementById("miniSubtitle").textContent = "Try again later";
    document.getElementById("statusText").innerHTML = '<span style="background:#ff5b62;box-shadow:0 0 14px #ff5b62"></span> COULD NOT CONNECT';
  }
}

document.getElementById("playButton").addEventListener("click", () => {
  if (playing) {
    audio.pause();
    playing = false;
    document.getElementById("playButton").textContent = "▶";
    document.getElementById("statusText").innerHTML = '<span style="background:#aab2bf;box-shadow:none"></span> PAUSED';
  } else {
    playSelected();
  }
});
document.getElementById("previousButton").addEventListener("click", () => { choose(selected - 1); playSelected(); });
document.getElementById("nextButton").addEventListener("click", () => { choose(selected + 1); playSelected(); });
document.getElementById("volumeSlider").addEventListener("input", e => audio.volume = Number(e.target.value));
document.getElementById("favoriteButton").addEventListener("click", () => {
  const name = stations[selected].name;
  favorites.has(name) ? favorites.delete(name) : favorites.add(name);
  localStorage.setItem("coachdonRadioFavorites", JSON.stringify([...favorites]));
  document.getElementById("favoriteButton").textContent = favorites.has(name) ? "♥" : "♡";
});
function updateClock() {
  document.getElementById("radioClock").textContent = new Date().toLocaleTimeString([], {hour:"numeric", minute:"2-digit"});
}
audio.volume = .75;
setInterval(updateClock, 30000);
updateClock();
choose(selected);
