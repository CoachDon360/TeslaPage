(() => {
  "use strict";

  const stations = Array.isArray(window.COACHDON_STATIONS)
    ? window.COACHDON_STATIONS
    : [];

  const els = {
    home: document.getElementById("home"),
    list: document.getElementById("stationList"),
    audio: document.getElementById("audio"),
    play: document.getElementById("playButton"),
    previous: document.getElementById("previousButton"),
    next: document.getElementById("nextButton"),
    playerLogo: document.getElementById("playerLogo"),
    playerName: document.getElementById("playerName"),
    track: document.getElementById("trackTitle"),
    artist: document.getElementById("artistName"),
    liveBar: document.getElementById("liveBar"),
    liveText: document.getElementById("liveText"),
    quality: document.getElementById("qualityText"),
    clock: document.getElementById("clock"),
    date: document.getElementById("date"),
    notice: document.getElementById("notice")
  };

  let currentIndex = -1;
  let streamIndex = 0;
  let metadataTimer = null;
  let metadataRequest = 0;
  const favorites = new Set(JSON.parse(localStorage.getItem("coachdonxm-favorites") || "[]"));

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderStations() {
    els.list.innerHTML = stations.map((station, index) => `
      <button class="channel" type="button" data-index="${index}" aria-label="Play channel ${station.n}, ${escapeHtml(station.name)}">
        <span class="num">${station.n}</span>
        <span class="logo ${escapeHtml(station.lc || "")}">${escapeHtml(station.logo || station.name)}</span>
        <span class="info">
          <span class="name">${escapeHtml(station.name)}</span>
          <span class="desc">${escapeHtml(station.desc || "")}</span>
        </span>
        <span class="health"><span class="dot"></span></span>
        <span class="quality">${escapeHtml(station.q || "")}</span>
      </button>
    `).join("");

    els.list.querySelectorAll(".channel").forEach(button => {
      button.addEventListener("click", () => selectStation(Number(button.dataset.index), true));
    });
  }

  function stationButton(index) {
    return els.list.querySelector(`.channel[data-index="${index}"]`);
  }

  function markActive() {
    els.list.querySelectorAll(".channel").forEach((button, index) => {
      button.classList.toggle("active", index === currentIndex);
      button.classList.toggle("live", index === currentIndex && !els.audio.paused);
    });
  }

  function currentStation() {
    return stations[currentIndex] || null;
  }

  function setLiveState(state, text) {
    els.liveBar.classList.remove("live", "wait", "offline");
    if (state) els.liveBar.classList.add(state);
    els.liveText.textContent = text;
  }

  function updatePlayer(station) {
    els.playerLogo.textContent = station.logo || station.name;
    els.playerLogo.className = `plogo ${station.lc || ""}`;
    els.playerName.textContent = station.name;
    els.track.textContent = station.mount || station.meta
      ? "Checking now playing…"
      : station.desc || "Live radio";
    els.artist.textContent = station.mount || station.meta
      ? "Metadata ready"
      : "Live broadcast";
    els.quality.textContent = station.q ? `${station.q} kbps` : "LIVE";
  }

  function stopMetadata() {
    if (metadataTimer) clearInterval(metadataTimer);
    metadataTimer = null;
    metadataRequest++;
  }

  async function refreshMetadata() {
    const station = currentStation();
    if (!station || els.audio.paused || (!station.mount && !station.meta)) return;

    const requestId = ++metadataRequest;
    setLiveState("wait", "LIVE • CHECKING METADATA");

    try {
      const metadata = await window.COACHDON_METADATA.get(station);
      if (requestId !== metadataRequest || station !== currentStation()) return;

      if (metadata?.title) {
        els.track.textContent = metadata.title;
        els.artist.textContent = metadata.artist || station.name;
        setLiveState("live", "LIVE • METADATA RECEIVED");
      } else {
        els.track.textContent = station.name === "Super 70s"
          ? "Live on 181.FM"
          : station.desc || "Live radio";
        els.artist.textContent = station.name;
        setLiveState("live", "LIVE • METADATA UNAVAILABLE");
      }
    } catch (error) {
      if (requestId !== metadataRequest) return;
      console.warn("Metadata refresh failed:", error);
      els.track.textContent = station.name === "Super 70s"
        ? "Live on 181.FM"
        : station.desc || "Live radio";
      els.artist.textContent = station.name;
      setLiveState("live", "LIVE • METADATA UNAVAILABLE");
    }
  }

  function beginMetadata() {
    stopMetadata();
    refreshMetadata();
    metadataTimer = setInterval(refreshMetadata, 20000);
  }

  function playCurrent() {
    const station = currentStation();
    if (!station) {
      selectStation(0, true);
      return;
    }

    if (station.podcast) {
      showNotice(`${station.podcast} opens as a podcast channel.`);
      return;
    }

    const streams = station.streams || [];
    if (!streams.length) {
      setLiveState("offline", "OFFLINE");
      return;
    }

    if (!els.audio.src) {
      els.audio.src = streams[streamIndex] || streams[0];
    }

    setLiveState("wait", "CONNECTING");
    els.audio.play().catch(error => {
      console.warn("Playback failed:", error);
      tryNextStream();
    });
  }

  function tryNextStream() {
    const station = currentStation();
    const streams = station?.streams || [];

    if (streamIndex + 1 < streams.length) {
      streamIndex++;
      els.audio.src = streams[streamIndex];
      els.audio.load();
      playCurrent();
      return;
    }

    setLiveState("offline", "OFFLINE");
    els.play.textContent = "▶";
    markActive();
  }

  function selectStation(index, autoplay = false) {
    if (!stations[index]) return;

    stopMetadata();
    currentIndex = index;
    streamIndex = 0;
    const station = stations[index];

    els.audio.pause();
    els.audio.removeAttribute("src");
    els.audio.load();

    updatePlayer(station);
    markActive();
    stationButton(index)?.scrollIntoView({ block: "nearest", behavior: "smooth" });

    localStorage.setItem("coachdonxm-last-station", String(index));

    if (autoplay && !station.podcast) {
      els.audio.src = station.streams?.[0] || "";
      playCurrent();
    }
  }

  function move(direction) {
    if (!stations.length) return;
    const start = currentIndex < 0 ? 0 : currentIndex;
    let next = (start + direction + stations.length) % stations.length;

    for (let tries = 0; tries < stations.length; tries++) {
      if (!stations[next].podcast) break;
      next = (next + direction + stations.length) % stations.length;
    }
    selectStation(next, true);
  }

  function showNotice(message) {
    els.notice.textContent = message;
    els.notice.classList.add("show");
    setTimeout(() => els.notice.classList.remove("show"), 2600);
  }

  function updateClock() {
    const now = new Date();
    els.clock.textContent = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
    els.date.textContent = now.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric"
    });
  }

  els.home.addEventListener("click", () => {
    window.location.href = "index.html?v=10.0.0";
  });

  els.play.addEventListener("click", () => {
    if (els.audio.paused) playCurrent();
    else els.audio.pause();
  });

  els.previous.addEventListener("click", () => move(-1));
  els.next.addEventListener("click", () => move(1));

  els.audio.addEventListener("playing", () => {
    els.play.textContent = "❚❚";
    setLiveState("live", "LIVE");
    markActive();
    beginMetadata();
  });

  els.audio.addEventListener("pause", () => {
    els.play.textContent = "▶";
    stopMetadata();
    if (currentStation()) setLiveState("", "PAUSED");
    markActive();
  });

  els.audio.addEventListener("waiting", () => setLiveState("wait", "BUFFERING"));
  els.audio.addEventListener("stalled", () => setLiveState("wait", "BUFFERING"));
  els.audio.addEventListener("error", tryNextStream);

  renderStations();
  updateClock();
  setInterval(updateClock, 30000);

  const savedIndex = Number(localStorage.getItem("coachdonxm-last-station"));
  selectStation(Number.isInteger(savedIndex) && stations[savedIndex] ? savedIndex : 6, false);
})();
