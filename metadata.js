/*
CoachDonXM V10 JSON metadata engine
Provider support:
- 181.FM / Icecast mounts
- SomaFM channels
Metadata failure never interrupts audio.
*/
window.COACHDON_METADATA = (() => {
  "use strict";

  const TIMEOUT_MS = 8000;

  async function fetchWithTimeout(url, type = "json") {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: controller.signal,
        headers: {
          "Accept": type === "json" ? "application/json,text/plain,*/*" : "text/plain,text/html,*/*"
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return type === "json" ? await response.json() : await response.text();
    } finally {
      clearTimeout(timer);
    }
  }

  function decode(value) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = String(value || "");
    return textarea.value.replace(/\s+/g, " ").trim();
  }

  function splitTrack(raw) {
    const clean = decode(raw)
      .replace(/^["']|["']$/g, "")
      .trim();

    if (!clean) return null;

    for (const separator of [" - ", " – ", " — ", " | "]) {
      const at = clean.indexOf(separator);
      if (at > 0) {
        return {
          artist: clean.slice(0, at).trim(),
          title: clean.slice(at + separator.length).trim()
        };
      }
    }
    return { artist: "", title: clean };
  }

  function allSources(payload) {
    let sources = payload?.icestats?.source || payload?.source || [];
    return Array.isArray(sources) ? sources : [sources];
  }

  function sourceMatchesMount(source, mount) {
    const text = JSON.stringify(source || {}).toLowerCase();
    return text.includes(String(mount || "").toLowerCase());
  }

  async function icecast181(station) {
    const endpoints = [
      "https://listen.181fm.com/status-json.xsl",
      `https://listen.181fm.com/status-json.xsl?mount=/${station.mount}_128k.mp3`
    ];

    for (const endpoint of endpoints) {
      try {
        const data = await fetchWithTimeout(endpoint, "json");
        const source = allSources(data).find(item => sourceMatchesMount(item, station.mount));
        const parsed = splitTrack(
          source?.title ||
          source?.yp_currently_playing ||
          source?.server_description
        );
        if (parsed?.title) return { ...parsed, provider: "181.FM JSON" };
      } catch (error) {
        console.debug("181.FM JSON attempt failed:", error.message);
      }
    }

    // Official player page and readable relay fallback.
    const playerUrls = [
      `https://player.181fm.com/?station=${encodeURIComponent(station.mount)}`,
      `https://r.jina.ai/https://player.181fm.com/?station=${encodeURIComponent(station.mount)}`
    ];

    for (const endpoint of playerUrls) {
      try {
        const text = await fetchWithTimeout(endpoint, "text");

        const patterns = [
          /"artist"\s*:\s*"([^"]+)"[\s\S]{0,300}?"title"\s*:\s*"([^"]+)"/i,
          /"title"\s*:\s*"([^"]+)"[\s\S]{0,300}?"artist"\s*:\s*"([^"]+)"/i,
          /"nowPlaying"\s*:\s*"([^"]+)"/i,
          /"currentSong"\s*:\s*"([^"]+)"/i,
          /"track"\s*:\s*"([^"]+)"/i
        ];

        for (let i = 0; i < patterns.length; i++) {
          const match = text.match(patterns[i]);
          if (!match) continue;
          if (i === 0) return { artist: decode(match[1]), title: decode(match[2]), provider: "181.FM Player" };
          if (i === 1) return { artist: decode(match[2]), title: decode(match[1]), provider: "181.FM Player" };
          const parsed = splitTrack(match[1]);
          if (parsed?.title) return { ...parsed, provider: "181.FM Player" };
        }

        const plain = text
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, "\n")
          .replace(/\r/g, "");

        const marker = plain.search(/Last Played/i);
        if (marker >= 0) {
          const lines = plain.slice(marker + 11)
            .split("\n")
            .map(line => decode(line.replace(/^[#*\-\s]+/, "")))
            .filter(Boolean);

          for (let i = 0; i < Math.min(lines.length - 1, 18); i++) {
            const title = lines[i];
            const artist = lines[i + 1];
            if (
              title.length > 1 &&
              artist.length > 1 &&
              !/^(website|help|privacy|share|buy now|follow us)$/i.test(title) &&
              !/^\d{1,2}:\d{2}/.test(title) &&
              !/^\d{1,2}:\d{2}/.test(artist)
            ) {
              return { artist, title, provider: "181.FM Last Played" };
            }
          }
        }
      } catch (error) {
        console.debug("181.FM player attempt failed:", error.message);
      }
    }
    return null;
  }

  async function somaFM(station) {
    const channel = station.meta;
    if (!channel) return null;

    const endpoints = [
      `https://somafm.com/songs/${encodeURIComponent(channel)}.json`,
      `https://somafm.com/songs/${encodeURIComponent(channel)}.json?${Date.now()}`
    ];

    for (const endpoint of endpoints) {
      try {
        const data = await fetchWithTimeout(endpoint, "json");
        const song = data?.songs?.[0] || data?.song || data?.current;
        if (!song) continue;

        const artist = decode(song.artist || "");
        const title = decode(song.title || song.song || "");
        if (title) return { artist, title, provider: "SomaFM JSON" };
      } catch (error) {
        console.debug("SomaFM JSON attempt failed:", error.message);
      }
    }
    return null;
  }

  async function get(station) {
    if (!station) return null;
    if (station.mount) return icecast181(station);
    if (station.meta) return somaFM(station);
    return null;
  }

  return { get };
})();
