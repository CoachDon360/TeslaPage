const stations = [
  {name:"K-LOVE",group:"music",color:"#38b5ff",desc:"Positive. Encouraging.",quality:"AAC",stream:"https://maestro.emfcdn.com/stream_for/k-love/iheart/aac"},
  {name:"Super 70s",display:"SUPER ’70s",group:"music",color:"#ff8b18",desc:"The soundtrack of the 70s.",quality:"128",stream:"https://listen.181fm.com/181-70s_128k.mp3",relayId:"181-70s"},
  {name:"Awesome 80s",display:"AWESOME ’80s",group:"music",color:"#f14db8",desc:"Turn it up.",quality:"128",stream:"https://listen.181fm.com/181-awesome80s_128k.mp3",relayId:"181-awesome80s"},
  {name:"Lite 80s",display:"LITE ’80s",group:"music",color:"#b87cff",desc:"The softer side of the 80s.",quality:"128",stream:"https://listen.181fm.com/181-lite80s_128k.mp3",relayId:"181-lite80s"},
  {name:"Star 90s",display:"STAR ’90s",group:"music",color:"#8dd03a",desc:"The biggest hits of the 90s.",quality:"128",stream:"https://listen.181fm.com/181-star90s_128k.mp3",relayId:"181-star90s"},
  {name:"Lite 90s",display:"LITE ’90s",group:"music",color:"#5ac6ff",desc:"Smooth 90s favorites.",quality:"128",stream:"https://listen.181fm.com/181-lite90s_128k.mp3",relayId:"181-lite90s"},
  {name:"The Yacht",display:"The Yacht",group:"music",color:"#f0ad2d",desc:"Smooth. Soft. Sailing.",quality:"128",stream:"https://listen.181fm.com/181-yachtrock_128k.mp3",relayId:"181-yachtrock"},
  {name:"Good Time Oldies",group:"music",color:"#ffd36f",desc:"More good times.",quality:"128",stream:"https://listen.181fm.com/181-goodtime_128k.mp3",relayId:"181-goodtime"},
  {name:"Soul",display:"Soul",group:"music",color:"#a66cff",desc:"Classic soul. Timeless groove.",quality:"128",stream:"https://listen.181fm.com/181-soul_128k.mp3",relayId:"181-soul"},
  {name:"The Breeze",group:"music",color:"#2ad1df",desc:"Relax. Unwind. Breathe.",quality:"128",stream:"https://listen.181fm.com/181-breeze_128k.mp3",relayId:"181-breeze"},
  {name:"Classical",group:"music",color:"#ddd1ff",desc:"Timeless masterworks.",quality:"128",stream:"https://listen.181fm.com/181-classical_128k.mp3",relayId:"181-classical"},

  {name:"Mocha",group:"disney",color:"#b7794b",desc:"Relaxing lo-fi Disney music.",quality:"LIVE",stream:"https://playerservices.streamtheworld.com/api/livestream-redirect/SP_R2670862_SC"},
  {name:"Rope Drop",group:"disney",color:"#f4b942",desc:"Disney rides, attractions, and show audio.",quality:"LIVE",stream:"https://playerservices.streamtheworld.com/api/livestream-redirect/SP_R3956488_SC"},
  {name:"Atmospheres",group:"disney",color:"#55b7d9",desc:"Disney park background music and atmosphere.",quality:"LIVE",stream:"https://playerservices.streamtheworld.com/api/livestream-redirect/SP_R3956612_SC"},
  {name:"Loop'd",group:"disney",color:"#7b68ee",desc:"Disney park music loops.",quality:"LIVE",stream:"https://playerservices.streamtheworld.com/api/livestream-redirect/SP_R4852369_SC"},
  {name:"Seasons",group:"disney",color:"#d85c5c",desc:"Seasonal Disney music throughout the year.",quality:"LIVE",stream:"https://playerservices.streamtheworld.com/api/livestream-redirect/SP_R2809833_SC"},
  {name:"Spa Day",group:"disney",color:"#64c7a5",desc:"Relaxing Disney music for unwinding.",quality:"LIVE",stream:"https://playerservices.streamtheworld.com/api/livestream-redirect/SP_R3956254_SC"},

  {name:"The Ramsey Show",group:"podcasts",color:"#ffd02c",desc:"Latest full episode.",quality:"PODCAST",stream:"",podcastId:"77001367"},
  {name:"Insight for Living",group:"podcasts",color:"#6bd8ff",desc:"Biblical teaching with Chuck Swindoll.",quality:"",stream:""},
  {name:"Southeast Christian",group:"podcasts",color:"#70d979",desc:"Messages from Southeast Christian Church.",quality:"",stream:""},
  {name:"Brian Buffini",group:"podcasts",color:"#ff9b52",desc:"Business, motivation, and real estate.",quality:"",stream:""}
];

const RELAY = "https://coachdon-metadata.74p875syc7.workers.dev";
const lists = {
  music: document.getElementById("musicList"),
  disney: document.getElementById("disneyList"),
  podcasts: document.getElementById("podcastList")
};
const audio = document.getElementById("radioAudio");
let selected = stations.findIndex(s => s.name === "Super 70s");
let playing = false;
let metadataTimer = null;
let metadataToken = 0;
const podcastCache = new Map();
let podcastLoadToken = 0;

function labelOf(station){ return station.display || station.name; }

function render(){
  Object.values(lists).forEach(el => el.innerHTML = "");
  stations.forEach((station,index)=>{
    const row = document.createElement("button");
    row.className = "station-row" + (index === selected ? " active" : "");
    row.style.setProperty("--station-color", station.color);
    row.innerHTML = `
      <span class="station-copy">
        <span class="station-name"><span class="playing-mark">▶</span>${labelOf(station)}</span>
        <span class="station-desc">${station.desc}</span>
      </span>`;
    row.addEventListener("click",()=>choose(index,true));
    lists[station.group].appendChild(row);
  });
}

function updateMetadata(artist,song){
  document.getElementById("artist").textContent = artist || "";
  document.getElementById("song").textContent = song || "";
  document.getElementById("miniSong").textContent = song || "Live Radio";
  document.getElementById("miniArtist").textContent = artist || "";
  const miniStation = document.getElementById("miniStation");
  if (miniStation) miniStation.textContent = labelOf(stations[selected]);
}

function setMetadataLabels(first,second){
  const firstLabel = document.getElementById("artistLabel");
  const secondLabel = document.getElementById("songLabel");
  if(firstLabel) firstLabel.textContent = first;
  if(secondLabel) secondLabel.textContent = second;
}

function stripHtml(value=""){
  const el = document.createElement("div");
  el.innerHTML = value;
  return (el.textContent || "").replace(/\s+/g," ").trim();
}

function formatPodcastDate(value){
  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString([], {weekday:"short",month:"short",day:"numeric"});
}

function durationFromItem(item){
  return item.itunes?.duration ||
         item["itunes:duration"] ||
         item.duration ||
         "";
}

function normalizePodcastItem(item){
  const enclosure =
    item.enclosure?.url ||
    item.enclosure?.link ||
    item.enclosure ||
    item.link ||
    "";
  return {
    title: stripHtml(item.title || "Latest Episode"),
    audio: typeof enclosure === "string" ? enclosure : "",
    date: item.pubDate || item.isoDate || item.published || "",
    duration: durationFromItem(item),
    description: stripHtml(item.description || item.content || "")
  };
}

async function fetchPodcastViaApple(station){
  const lookupUrl = `https://itunes.apple.com/lookup?id=${encodeURIComponent(station.podcastId)}`;
  const lookupResponse = await fetch(lookupUrl,{cache:"no-store"});
  if(!lookupResponse.ok) throw new Error(`Apple lookup HTTP ${lookupResponse.status}`);
  const lookup = await lookupResponse.json();
  const feedUrl = lookup.results?.[0]?.feedUrl;
  if(!feedUrl) throw new Error("Podcast feed not found");

  try{
    const feedResponse = await fetch(feedUrl,{cache:"no-store"});
    if(!feedResponse.ok) throw new Error(`RSS HTTP ${feedResponse.status}`);
    const xmlText = await feedResponse.text();
    const xml = new DOMParser().parseFromString(xmlText,"text/xml");
    const item = xml.querySelector("item");
    if(!item) throw new Error("No podcast episodes found");
    return {
      title: stripHtml(item.querySelector("title")?.textContent || "Latest Episode"),
      audio: item.querySelector("enclosure")?.getAttribute("url") || "",
      date: item.querySelector("pubDate")?.textContent || "",
      duration: item.getElementsByTagName("itunes:duration")[0]?.textContent || "",
      description: stripHtml(item.querySelector("description")?.textContent || "")
    };
  }catch(directError){
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const proxyResponse = await fetch(proxyUrl,{cache:"no-store"});
    if(!proxyResponse.ok) throw directError;
    const proxyData = await proxyResponse.json();
    if(proxyData.status !== "ok" || !proxyData.items?.length) throw directError;
    return normalizePodcastItem(proxyData.items[0]);
  }
}

async function loadPodcast(station,autoplay=false){
  const token = ++podcastLoadToken;
  setMetadataLabels("Show","Latest Episode");
  updateMetadata(station.name,"Loading newest episode…");

  try{
    let episode = podcastCache.get(station.podcastId);
    if(!episode){
      episode = await fetchPodcastViaApple(station);
      if(!episode.audio) throw new Error("Episode audio URL missing");
      podcastCache.set(station.podcastId,episode);
    }
    if(token !== podcastLoadToken || stations[selected] !== station) return;

    station.stream = episode.audio;
    station.episodeTitle = episode.title;
    const details = [formatPodcastDate(episode.date), episode.duration].filter(Boolean).join(" • ");
    document.getElementById("displayDescription").textContent =
      details || "Latest full episode";
    updateMetadata(station.name,episode.title);

    if(autoplay) await playSelected();
  }catch(error){
    if(token !== podcastLoadToken || stations[selected] !== station) return;
    updateMetadata(station.name,"Episode feed could not connect");
    document.getElementById("displayDescription").textContent =
      "The Ramsey Show feed is temporarily unavailable.";
    console.warn("Podcast feed:",error);
  }
}

function choose(index,autoplay=false){
  selected = (index + stations.length) % stations.length;
  const station = stations[selected];
  document.documentElement.style.setProperty("--accent", station.color);
  document.getElementById("displayStation").textContent = labelOf(station);
  document.getElementById("displayDescription").textContent = station.desc;
  const stationMeta = document.getElementById("stationMeta");
  if (stationMeta) stationMeta.textContent = labelOf(station);
  render();

  if(station.podcastId){
    loadPodcast(station,autoplay);
    return;
  }

  setMetadataLabels("Artist","Song");
  startMetadata(station);
  if(autoplay) playSelected();
}

async function fetchRelay(station,token){
  try{
    const response = await fetch(
      `${RELAY}/metadata?station=${encodeURIComponent(station.relayId)}`,
      {cache:"no-store"}
    );
    const data = await response.json();
    if(!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`);
    if(token !== metadataToken) return;
    updateMetadata(data.artist || labelOf(station), data.title || "Live Radio");
  }catch(error){
    if(token !== metadataToken) return;
    updateMetadata(labelOf(station),"Live Radio");
    console.warn("CoachDon relay:",error);
  }
}

function startMetadata(station){
  metadataToken++;
  const token = metadataToken;
  if(metadataTimer) clearInterval(metadataTimer);
  metadataTimer = null;

  if(station.relayId){
    updateMetadata("Checking now playing…","One moment…");
    fetchRelay(station,token);
    metadataTimer = setInterval(()=>fetchRelay(station,token),20000);
  }else{
    updateMetadata(
      station.name === "K-LOVE" ? "K-LOVE" : labelOf(station),
      station.stream ? "Live Radio" :
      (station.group === "podcasts" ? "Podcast feed setup needed" : "Stream setup needed")
    );
  }
}

async function playSelected(){
  const station = stations[selected];
  if(station.podcastId && !station.stream){
    await loadPodcast(station,true);
    return;
  }
  if(!station.stream){
    playing = false;
    document.getElementById("playButton").textContent = "▶";
    return;
  }
  if(audio.src !== station.stream) audio.src = station.stream;
  try{
    await audio.play();
    playing = true;
    document.getElementById("playButton").textContent = "Ⅱ";
    render();
  }catch(error){
    playing = false;
    document.getElementById("playButton").textContent = "▶";
    console.warn("Station could not connect:",error);
  }
}

document.getElementById("playButton").addEventListener("click",()=>{
  if(playing){
    audio.pause();
    playing=false;
    document.getElementById("playButton").textContent="▶";
    render();
  }else{
    playSelected();
  }
});
document.getElementById("previousButton").addEventListener("click",()=>choose(selected-1,true));
document.getElementById("nextButton").addEventListener("click",()=>choose(selected+1,true));
document.getElementById("volumeSlider").addEventListener("input",e=>audio.volume=Number(e.target.value));

function updateClock(){
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});
  document.getElementById("date").textContent =
    now.toLocaleDateString([], {weekday:"short",month:"short",day:"numeric"});
}

audio.volume=.75;
setInterval(updateClock,30000);
updateClock();
render();
choose(selected,false);