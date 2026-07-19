/*
  CoachDon Radio V10 metadata engine
  ----------------------------------
  This file deliberately does not create or restyle the interface.
  It observes the existing V9 player and fills the existing metadata fields.

  Super 70s provider order:
    1. 181.FM Icecast JSON
    2. Official 181.FM player page
    3. Text relay of the official player page

  The audio continues normally if metadata cannot be retrieved.
*/
(() => {
  "use strict";

  const REFRESH_MS = 20000;
  const REQUEST_TIMEOUT_MS = 8000;
  const SUPER_70S_KEYS = [
    "super 70s",
    "super '70s",
    "super ’70s",
    "181-70s",
    "181.fm super"
  ];

  const el = {
    audio: document.getElementById("radioAudio"),
    artist: document.getElementById("metadataArtist"),
    title: document.getElementById("trackTitle"),
    station: document.getElementById("stationTitle"),
    status: document.getElementById("statusText"),
    miniTitle: document.getElementById("miniTitle"),
    miniSubtitle: document.getElementById("miniSubtitle"),
    artName: document.getElementById("artName")
  };

  if (!el.audio || !el.artist || !el.title || !el.status) {
    console.warn("CoachDon metadata: V9 player fields were not found.");
    return;
  }

  let refreshTimer = null;
  let lastStationFingerprint = "";
  let requestInFlight = false;
  let lastSuccessfulTitle = "";
  let lastSuccessfulArtist = "";

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  function stationFingerprint() {
    return normalize([
      el.station?.textContent,
      el.miniTitle?.textContent,
      el.artName?.textContent,
      el.audio.currentSrc,
      el.audio.src
    ].filter(Boolean).join(" | "));
  }

  function isSuper70s() {
    const haystack = stationFingerprint();
    return SUPER_70S_KEYS.some(key => haystack.includes(normalize(key)));
  }

  function setStatus(message, state = "live") {
    const dot = el.status.querySelector("span");
    el.status.lastChild.textContent = ` ${message}`;

    // Preserve V9 classes and styling. Only set a diagnostic data attribute.
    el.status.dataset.metadataState = state;
    el.status.title = `CoachDon metadata: ${message}`;

    if (dot) {
      if (state === "live") dot.style.background = "#22c55e";
      else if (state === "checking") dot.style.background = "#f5b942";
      else if (state === "blocked") dot.style.background = "#f5b942";
      else dot.style.background = "#ef4444";
    }
  }

  function splitArtistTitle(raw) {
    const clean = String(raw || "")
      .replace(/&amp;/gi, "&")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/gi, '"')
      .replace(/\s+/g, " ")
      .replace(/^["']|["']$/g, "")
      .trim();

    if (!clean) return null;

    for (const separator of [" - ", " – ", " — ", " | "]) {
      const pieces = clean.split(separator).map(item => item.trim()).filter(Boolean);
      if (pieces.length >= 2) {
        return {
          artist: pieces.shift(),
          title: pieces.join(separator.trim())
        };
      }
    }

    return { artist: "", title: clean };
  }

  async function fetchWithTimeout(url, responseType = "text") {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: controller.signal,
        headers: { "Accept": responseType === "json" ? "application/json" : "text/html,text/plain,*/*" }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return responseType === "json" ? response.json() : response.text();
    } finally {
      clearTimeout(timeout);
    }
  }

  function find181Source(payload) {
    const stats = payload?.icestats || payload;
    let sources = stats?.source || [];
    if (!Array.isArray(sources)) sources = [sources];

    return sources.find(source => {
      const searchable = normalize(JSON.stringify(source));
      return searchable.includes("181-70s");
    }) || null;
  }

  async function fromIcecastJson() {
    const urls = [
      "https://listen.181fm.com/status-json.xsl",
      "https://listen.181fm.com/status-json.xsl?mount=/181-70s_128k.mp3"
    ];

    for (const url of urls) {
      try {
        const payload = await fetchWithTimeout(url, "json");
        const source = find181Source(payload);
        const raw = source?.title || source?.yp_currently_playing;
        const parsed = splitArtistTitle(raw);
        if (parsed?.title) return { ...parsed, source: "181.FM JSON" };
      } catch (error) {
        console.debug("CoachDon metadata JSON attempt:", error.message);
      }
    }

    return null;
  }

  function parseOfficialPlayerHtml(text) {
    if (!text) return null;

    // JSON-like metadata embedded in scripts.
    const embeddedPatterns = [
      /"artist"\s*:\s*"([^"]+)"[\s\S]{0,300}?"title"\s*:\s*"([^"]+)"/i,
      /"title"\s*:\s*"([^"]+)"[\s\S]{0,300}?"artist"\s*:\s*"([^"]+)"/i,
      /"track"\s*:\s*"([^"]+)"/i,
      /"nowPlaying"\s*:\s*"([^"]+)"/i,
      /"currentSong"\s*:\s*"([^"]+)"/i
    ];

    for (let index = 0; index < embeddedPatterns.length; index++) {
      const match = text.match(embeddedPatterns[index]);
      if (!match) continue;

      if (index === 0) {
        return { artist: match[1], title: match[2], source: "181.FM player" };
      }

      if (index === 1) {
        return { artist: match[2], title: match[1], source: "181.FM player" };
      }

      const parsed = splitArtistTitle(match[1]);
      if (parsed?.title) return { ...parsed, source: "181.FM player" };
    }

    // Reader/markdown fallback: first item immediately after “Last Played”.
    const plain = text
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, "\n")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\r/g, "");

    const marker = plain.search(/Last Played/i);
    if (marker >= 0) {
      const lines = plain.slice(marker + 11)
        .split("\n")
        .map(line => line.replace(/^[#*\-\s]+/, "").trim())
        .filter(line => line && !/^(Website|Help|Privacy|Follow Us|Powered by|BUY NOW|SHARE)$/i.test(line));

      // Typical order is title, artist, time.
      for (let i = 0; i < Math.min(lines.length - 1, 14); i++) {
        const title = lines[i];
        const artist = lines[i + 1];
        const timeLike = lines[i + 2] || "";

        if (
          title.length > 1 &&
          artist.length > 1 &&
          !/^\d{1,2}:\d{2}\s*(am|pm)?$/i.test(title) &&
          !/^\d{1,2}:\d{2}\s*(am|pm)?$/i.test(artist)
        ) {
          return { title, artist, source: "181.FM last played" };
        }

        if (/^\d{1,2}:\d{2}\s*(am|pm)?$/i.test(timeLike)) {
          return { title, artist, source: "181.FM last played" };
        }
      }
    }

    return null;
  }

  async function fromOfficialPlayer() {
    const urls = [
      "https://player.181fm.com/?station=181-70s",
      "https://r.jina.ai/http://player.181fm.com/?station=181-70s",
      "https://r.jina.ai/https://player.181fm.com/?station=181-70s"
    ];

    for (const url of urls) {
      try {
        const text = await fetchWithTimeout(url, "text");
        const parsed = parseOfficialPlayerHtml(text);
        if (parsed?.title) return parsed;
      } catch (error) {
        console.debug("CoachDon metadata player attempt:", error.message);
      }
    }

    return null;
  }

  function displayMetadata(metadata) {
    if (!metadata?.title) return false;

    lastSuccessfulTitle = metadata.title;
    lastSuccessfulArtist = metadata.artist || "";

    el.artist.textContent = metadata.artist || "Super 70s";
    el.title.textContent = metadata.title;

    if (el.miniSubtitle) {
      el.miniSubtitle.textContent = metadata.artist
        ? `${metadata.artist} — ${metadata.title}`
        : metadata.title;
    }

    setStatus(`LIVE • METADATA RECEIVED`, "live");
    return true;
  }

  function displayFallback() {
    // Do not overwrite valid song data that was received earlier.
    if (!lastSuccessfulTitle) {
      el.artist.textContent = "Super 70s";
      el.title.textContent = "Live on 181.FM";
      if (el.miniSubtitle) el.miniSubtitle.textContent = "Live on 181.FM";
    }

    setStatus("LIVE • METADATA UNAVAILABLE", "blocked");
  }

  async function refresh() {
    if (!isSuper70s() || el.audio.paused || requestInFlight) return;

    requestInFlight = true;
    setStatus("LIVE • CHECKING METADATA…", "checking");

    try {
      const metadata = await fromIcecastJson() || await fromOfficialPlayer();
      if (!displayMetadata(metadata)) displayFallback();
    } catch (error) {
      console.warn("CoachDon metadata refresh failed:", error);
      displayFallback();
    } finally {
      requestInFlight = false;
    }
  }

  function stationChanged() {
    const fingerprint = stationFingerprint();
    if (fingerprint === lastStationFingerprint) return;

    lastStationFingerprint = fingerprint;
    lastSuccessfulTitle = "";
    lastSuccessfulArtist = "";

    if (isSuper70s()) {
      setStatus(el.audio.paused ? "READY • SUPER 70s METADATA ARMED" : "LIVE • CHECKING METADATA…", "checking");
      window.setTimeout(refresh, 750);
    }
  }

  function begin() {
    refreshTimer = window.setInterval(() => {
      stationChanged();
      refresh();
    }, REFRESH_MS);

    // Fast observer catches station selections without modifying radio-v9.js.
    const observer = new MutationObserver(stationChanged);
    [
      el.station,
      el.miniTitle,
      el.artName,
      el.artist,
      el.title
    ].filter(Boolean).forEach(node => observer.observe(node, {
      childList: true,
      subtree: true,
      characterData: true
    }));

    el.audio.addEventListener("playing", () => {
      stationChanged();
      window.setTimeout(refresh, 500);
    });

    el.audio.addEventListener("loadstart", stationChanged);
    stationChanged();
  }

  begin();
})();