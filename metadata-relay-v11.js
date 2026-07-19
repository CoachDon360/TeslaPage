const RELAY_BASE = "https://coachdon-metadata.74p875syc7.workers.dev";
let metadataTimer = null;
let metadataRequest = 0;

function stopMetadataPolling() {
  if (metadataTimer) clearInterval(metadataTimer);
  metadataTimer = null;
  metadataRequest++;
}

async function fetch181Metadata(station) {
  const response = await fetch(
    `${RELAY_BASE}/metadata?station=${encodeURIComponent(station.relayId)}`,
    {cache:"no-store"}
  );
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return {artist:data.artist || "", title:data.title || "", source:"181.FM"};
}

async function fetchSomaMetadata(station) {
  const response = await fetch(
    `https://somafm.com/songs/${encodeURIComponent(station.somaId)}.json`,
    {cache:"no-store"}
  );
  const data = await response.json();
  const song = Array.isArray(data.songs) ? data.songs[0] : null;
  if (!song) throw new Error("No SomaFM song data");
  return {artist:song.artist || "", title:song.title || "", source:"SomaFM"};
}

async function refreshMetadata(station, requestId) {
  try {
    let result = null;
    if (station.relayId) result = await fetch181Metadata(station);
    else if (station.somaId) result = await fetchSomaMetadata(station);
    if (requestId !== metadataRequest || !result) return;
    updateNowPlayingMetadata(result.artist, result.title);
    setMetadataStatus("LIVE METADATA");
  } catch (error) {
    if (requestId !== metadataRequest) return;
    updateNowPlayingMetadata(station.name.toUpperCase(), station.relayId ? "Live on 181.FM" : "Live stream");
    setMetadataStatus("AUDIO LIVE");
    console.warn("CoachDon metadata:", error);
  }
}

function startMetadataPolling(station) {
  stopMetadataPolling();
  const requestId = metadataRequest;
  updateNowPlayingMetadata(station.name.toUpperCase(), station.relayId ? "Looking for the groove..." : "Live stream");
  setMetadataStatus(station.relayId || station.somaId ? "CHECKING METADATA" : "AUDIO LIVE");
  if (!station.relayId && !station.somaId) return;
  refreshMetadata(station, requestId);
  metadataTimer = setInterval(() => refreshMetadata(station, requestId), 20000);
}
