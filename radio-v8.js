
const stations = [{"name": "K-LOVE", "group": "music", "accent": "#0094E1", "subtitle": "Positive. Encouraging.", "stream": "https://maestro.emfcdn.com/stream_for/k-love/iheart/aac"}, {"name": "Super 70s", "group": "music", "accent": "#0094E1", "subtitle": "The soundtrack of the 70s.", "stream": "https://listen.181fm.com/181-70s_128k.mp3", "metadata": {"provider": "181fm", "station": "181-70s", "player": "https://player.181fm.com/?station=181-70s"}}, {"name": "Awesome 80s", "group": "music", "accent": "#0094E1", "subtitle": "Turn it up.", "stream": "https://listen.181fm.com/181-awesome80s_128k.mp3"}, {"name": "Lite 80s", "group": "music", "accent": "#0094E1", "subtitle": "The softer side of the 80s.", "stream": "https://listen.181fm.com/181-lite80s_128k.mp3"}, {"name": "Star 90s", "group": "music", "accent": "#0094E1", "subtitle": "The biggest hits of the 90s.", "stream": "https://listen.181fm.com/181-star90s_128k.mp3"}, {"name": "Lite 90s", "group": "music", "accent": "#0094E1", "subtitle": "Smooth 90s favorites.", "stream": "https://listen.181fm.com/181-lite90s_128k.mp3"}, {"name": "Yacht Rock", "group": "music", "accent": "#0094E1", "subtitle": "Smooth. Soft. Sailing.", "stream": "https://listen.181fm.com/181-yachtrock_128k.mp3"}, {"name": "Good Time Oldies", "group": "music", "accent": "#0094E1", "subtitle": "More good times.", "stream": "https://listen.181fm.com/181-goodtime_128k.mp3"}, {"name": "Soul", "group": "music", "accent": "#0094E1", "subtitle": "Classic soul. Timeless groove.", "stream": "https://listen.181fm.com/181-soul_128k.mp3"}, {"name": "The Breeze", "group": "music", "accent": "#0094E1", "subtitle": "Relax. Unwind. Breathe.", "stream": "https://listen.181fm.com/181-breeze_128k.mp3"}, {"name": "Classical", "group": "music", "accent": "#0094E1", "subtitle": "Timeless masterworks.", "stream": "https://listen.181fm.com/181-classical_128k.mp3"}, {"name": "Main Street USA", "group": "disney", "accent": "#0094E1", "subtitle": "Turn-of-the-century charm and classic park atmosphere.", "stream": ""}, {"name": "Adventureland", "group": "disney", "accent": "#0094E1", "subtitle": "Jungle rhythms, island music, and exotic adventure.", "stream": ""}, {"name": "Frontierland", "group": "disney", "accent": "#0094E1", "subtitle": "Western classics, bluegrass, and frontier atmosphere.", "stream": ""}, {"name": "Tomorrowland", "group": "disney", "accent": "#0094E1", "subtitle": "Retro-futuristic music and space-age atmosphere.", "stream": ""}, {"name": "Fantasyland", "group": "disney", "accent": "#0094E1", "subtitle": "Classic melodies and storybook magic.", "stream": ""}, {"name": "Future World", "group": "disney", "accent": "#0094E1", "subtitle": "Innovation, optimism, and classic EPCOT atmosphere.", "stream": ""}, {"name": "World Showcase", "group": "disney", "accent": "#0094E1", "subtitle": "Music and atmosphere from around the world.", "stream": ""}, {"name": "Hollywood Studios", "group": "disney", "accent": "#0094E1", "subtitle": "Movie magic and Hollywood Boulevard atmosphere.", "stream": ""}, {"name": "Animal Kingdom", "group": "disney", "accent": "#0094E1", "subtitle": "Nature-inspired music and immersive park ambience.", "stream": ""}, {"name": "Resort TV", "group": "disney", "accent": "#0094E1", "subtitle": "Resort loops, lobby music, and vacation atmosphere.", "stream": ""}, {"name": "Pixar", "group": "disney", "accent": "#0094E1", "subtitle": "Music from Pixar films and themed lands.", "stream": ""}, {"name": "Villains", "group": "disney", "accent": "#0094E1", "subtitle": "Disney's darker side and villain-inspired music.", "stream": ""}, {"name": "The Ramsey Show", "group": "podcasts", "accent": "#0094E1", "subtitle": "Money, work, and life.", "stream": ""}, {"name": "Insight for Living", "group": "podcasts", "accent": "#0094E1", "subtitle": "Biblical teaching with Chuck Swindoll.", "stream": ""}, {"name": "Southeast Christian", "group": "podcasts", "accent": "#0094E1", "subtitle": "Messages from Southeast Christian Church.", "stream": ""}, {"name": "Brian Buffini", "group": "podcasts", "accent": "#0094E1", "subtitle": "Business, motivation, and real estate.", "stream": ""}];
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


// ---- CoachDon metadata prototype: Super 70s ----
const metadataArtist = document.getElementById("metadataArtist");
let metadataTimer = null;
let metadataStationToken = 0;

function cleanMetadataText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function splitArtistTitle(value) {
  const text = cleanMetadataText(value);
  const separators = [" - ", " – ", " — ", " | "];
  for (const separator of separators) {
    const at = text.indexOf(separator);
    if (at > 0) {
      return {
        artist: text.slice(0, at).trim(),
        title: text.slice(at + separator.length).trim()
      };
    }
  }
  return { artist: "", title: text };
}

function showMetadata(artist, title) {
  metadataArtist.textContent = artist || "SUPER 70s";
  document.getElementById("trackTitle").textContent = title || "Live on 181.FM";
  document.getElementById("miniSubtitle").textContent =
    artist && title ? `${artist} — ${title}` : "Live on 181.FM";
}

function metadataFallback() {
  showMetadata("SUPER 70s", "Live on 181.FM");
}

// The official 181.FM player is dynamic. This adapter tries the official page
// and recognizes several common JSON/HTML metadata shapes. It fails quietly.
async function fetchSuper70sMetadata(token) {
  const sources = [
    "https://player.181fm.com/?station=181-70s"
  ];

  for (const url of sources) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        mode: "cors",
        headers: { "Accept": "application/json,text/plain,text/html" }
      });
      if (!response.ok) continue;

      const body = await response.text();
      let candidate = "";

      try {
        const data = JSON.parse(body);
        candidate =
          data.nowPlaying || data.now_playing || data.currentSong ||
          data.current_song || data.song || data.title ||
          data?.now_playing?.song?.text || data?.now_playing?.song?.title || "";
        if (!candidate && data.artist && data.track) {
          candidate = `${data.artist} - ${data.track}`;
        }
      } catch (_) {
        const patterns = [
          /"nowPlaying"\s*:\s*"([^"]+)"/i,
          /"currentSong"\s*:\s*"([^"]+)"/i,
          /"song"\s*:\s*"([^"]+)"/i,
          /class=["'][^"']*(?:song|track-title|now-playing)[^"']*["'][^>]*>([^<]+)/i,
          /<title>([^<]+)<\/title>/i
        ];
        for (const pattern of patterns) {
          const match = body.match(pattern);
          if (match && match[1]) {
            candidate = match[1];
            break;
          }
        }
      }

      candidate = cleanMetadataText(candidate)
        .replace(/\s*\|\s*181\.?FM.*$/i, "")
        .replace(/^Super\s*'?70s\s*[-–—:]\s*/i, "");

      if (candidate && !/super\s*'?70s|181\.?fm|online radio/i.test(candidate)) {
        if (token !== metadataStationToken) return;
        const parsed = splitArtistTitle(candidate);
        showMetadata(parsed.artist || "SUPER 70s", parsed.title);
        return;
      }
    } catch (_) {
      // Tesla/browser compatibility fallback below.
    }
  }

  if (token === metadataStationToken) metadataFallback();
}

function startStationMetadata(station) {
  metadataStationToken += 1;
  const token = metadataStationToken;
  clearInterval(metadataTimer);
  metadataTimer = null;

  if (station && station.name === "Super 70s") {
    metadataArtist.textContent = "SUPER 70s";
    document.getElementById("trackTitle").textContent = "Checking now playing…";
    fetchSuper70sMetadata(token);
    metadataTimer = setInterval(() => fetchSuper70sMetadata(token), 20000);
  } else {
    metadataArtist.textContent = station ? station.name.toUpperCase() : "NOW PLAYING";
    document.getElementById("trackTitle").textContent =
      station ? station.subtitle : "Choose a station";
  }
}

// Hook into the existing station selection function.
if (typeof selectStation === "function") {
  const originalSelectStation = selectStation;
  selectStation = function(index, autoplay) {
    const result = originalSelectStation(index, autoplay);
    startStationMetadata(stations[index]);
    return result;
  };
}
