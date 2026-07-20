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

  // DParkRadio currently maintains four official channels. The themed rows
  // below intentionally share those four reliable feeds.
  {name:"Main Street USA",group:"disney",color:"#d65cff",desc:"Holiday and Main Street atmosphere.",playlist:"https://dparkradio.com/ch3.pls",art:"main-street.png"},
  {name:"Adventureland",group:"disney",color:"#64d46d",desc:"Jungle rhythms and island music.",playlist:"https://dparkradio.com/ch2.pls",art:"adventureland.png"},
  {name:"Frontierland",group:"disney",color:"#e3a34d",desc:"Western classics and bluegrass.",playlist:"https://dparkradio.com/ch2.pls",art:"frontierland.png"},
  {name:"Tomorrowland",group:"disney",color:"#5bc4ff",desc:"Retro-futuristic park atmosphere.",playlist:"https://dparkradio.com/ch1.pls",art:"tomorrowland.png"},
  {name:"Fantasyland",group:"disney",color:"#ff82c8",desc:"Classic melodies and storybook magic.",playlist:"https://dparkradio.com/ch1.pls",art:"fantasyland.png"},
  {name:"Future World",group:"disney",color:"#7e8fff",desc:"Classic EPCOT optimism.",playlist:"https://dparkradio.com/ch2.pls",art:"future-world.png"},
  {name:"World Showcase",group:"disney",color:"#52d6c8",desc:"Music from around the world.",playlist:"https://dparkradio.com/ch2.pls",art:"world-showcase.png"},
  {name:"Hollywood Studios",group:"disney",color:"#ff6868",desc:"Movie magic and nighttime spectaculars.",playlist:"https://dparkradio.com/ch1.pls",art:"hollywood-studios.png"},
  {name:"Animal Kingdom",group:"disney",color:"#8bcf72",desc:"Nature-inspired park ambience.",playlist:"https://dparkradio.com/ch2.pls",art:"animal-kingdom.png"},
  {name:"Resort TV",group:"disney",color:"#7bc9ef",desc:"Resort loops and vacation atmosphere.",playlist:"https://dparkradio.com/ch4.pls",art:"resort-tv.png"},
  {name:"Pixar",group:"disney",color:"#65a9ff",desc:"Disney and Pixar favorites.",playlist:"https://dparkradio.com/ch1.pls",art:"pixar.png"},
  {name:"Villains",group:"disney",color:"#b95de3",desc:"Disney's darker side.",playlist:"https://dparkradio.com/ch3.pls",art:"villains.png"},

  {name:"The Ramsey Show",group:"podcasts",color:"#ffd02c",desc:"Newest available episode.",rss:"https://feeds.megaphone.fm/RAMSEYSHOW",art:"ramsey.png"},
  {name:"Insight for Living",group:"podcasts",color:"#6bd8ff",desc:"Newest daily broadcast with Chuck Swindoll.",rss:"https://feeds2.feedburner.com/InsightForLivingDailyBroadcast",art:"insight.png"},
  {name:"Southeast Christian",group:"podcasts",color:"#70d979",desc:"Newest message from Southeast Christian Church.",rss:"https://my.southeastchristian.org/sermonsRSSFeed",art:"southeast.png"},
  {name:"Brian Buffini",group:"podcasts",color:"#ff9b52",desc:"Newest episode of The Brian Buffini Show.",rss:"https://feeds.acast.com/public/shows/61a7bc4c981ee80013e20d42",art:"buffini.png"}
];

const RELAY = "https://coachdon-metadata.74p875syc7.workers.dev";
const RSS_API = "https://api.rss2json.com/v1/api.json?rss_url=";
const RAW_PROXY = "https://api.allorigins.win/raw?url=";

const lists = {
  music: document.getElementById("musicList"),
  disney: document.getElementById("disneyList"),
  podcasts: document.getElementById("podcastList")
};
const audio = document.getElementById("radioAudio");
const nowPane = document.querySelector(".now-pane");
const visualPanel = document.getElementById("visualPanel");
const stationArtwork = document.getElementById("stationArtwork");
const metadataMain = document.getElementById("metadataMain");

let selected = stations.findIndex(s => s.name === "Super 70s");
let playing = false;
let metadataTimer = null;
let metadataToken = 0;
let loadToken = 0;

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
  if(miniStation) miniStation.textContent = labelOf(stations[selected]);
}

function setArtMode(station){
  const useArt = Boolean(station.art);
  nowPane.classList.toggle("art-mode", useArt);
  visualPanel.hidden = !useArt;
  metadataMain.hidden = useArt;
  if(useArt){
    stationArtwork.src = station.art;
    stationArtwork.alt = `${labelOf(station)} artwork`;
  }else{
    stationArtwork.removeAttribute("src");
    stationArtwork.alt = "";
  }
}

function choose(index,autoplay=false){
  selected = (index + stations.length) % stations.length;
  loadToken++;
  const station = stations[selected];
  document.documentElement.style.setProperty("--accent", station.color);
  document.getElementById("displayStation").textContent = labelOf(station);
  document.getElementById("displayDescription").textContent = station.desc;
  setArtMode(station);
  render();
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
  }else if(station.group === "podcasts"){
    updateMetadata(labelOf(station),"Loading newest episode…");
  }else if(station.group === "disney"){
    updateMetadata(labelOf(station),"Disney Parks Radio");
  }else{
    updateMetadata(station.name === "K-LOVE" ? "K-LOVE" : labelOf(station),"Live Radio");
  }
}

function firstPlaylistUrl(text){
  const match = text.match(/^\s*File\d+\s*=\s*(https?:\/\/\S+)/im);
  return match ? match[1].trim() : "";
}

async function resolveDisney(station,token){
  if(station.stream) return station.stream;
  const proxyUrl = RAW_PROXY + encodeURIComponent(station.playlist);
  const response = await fetch(proxyUrl,{cache:"no-store"});
  if(!response.ok) throw new Error(`Playlist HTTP ${response.status}`);
  const text = await response.text();
  if(token !== loadToken) throw new Error("Selection changed");
  const stream = firstPlaylistUrl(text);
  if(!stream) throw new Error("No audio address found in playlist");
  station.stream = stream;
  return stream;
}

async function resolvePodcast(station,token){
  // Cache for the session; a page refresh checks again for a newer episode.
  if(station.stream) return station.stream;
  const response = await fetch(RSS_API + encodeURIComponent(station.rss),{cache:"no-store"});
  if(!response.ok) throw new Error(`Podcast HTTP ${response.status}`);
  const data = await response.json();
  if(token !== loadToken) throw new Error("Selection changed");
  if(data.status !== "ok" || !data.items || !data.items.length){
    throw new Error(data.message || "No podcast episodes found");
  }
  const item = data.items[0];
  const stream =
    (item.enclosure && (item.enclosure.link || item.enclosure.url)) ||
    item.audio || "";
  if(!stream) throw new Error("Latest episode has no audio file");
  station.stream = stream;
  station.episodeTitle = item.title || "Latest episode";
  updateMetadata(labelOf(station),station.episodeTitle);
  return stream;
}

async function getPlayableUrl(station,token){
  if(station.group === "disney") return resolveDisney(station,token);
  if(station.group === "podcasts") return resolvePodcast(station,token);
  return station.stream;
}

async function playSelected(){
  const station = stations[selected];
  const token = loadToken;
  try{
    if(station.group === "podcasts"){
      document.getElementById("miniSong").textContent = "Loading newest episode…";
    }else if(station.group === "disney"){
      document.getElementById("miniSong").textContent = "Connecting to Disney Parks Radio…";
    }
    const stream = await getPlayableUrl(station,token);
    if(token !== loadToken) return;
    if(!stream) throw new Error("No stream configured");
    if(audio.src !== stream) audio.src = stream;
    await audio.play();
    playing = true;
    document.getElementById("playButton").textContent = "Ⅱ";
    if(station.group === "disney"){
      updateMetadata(labelOf(station),"Disney Parks Radio");
    }else if(station.group === "podcasts"){
      updateMetadata(labelOf(station),station.episodeTitle || "Latest episode");
    }
    render();
  }catch(error){
    if(token !== loadToken) return;
    playing = false;
    document.getElementById("playButton").textContent = "▶";
    updateMetadata(labelOf(station),"Could not connect — tap again");
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

audio.addEventListener("ended",()=>{
  playing=false;
  document.getElementById("playButton").textContent="▶";
});
audio.addEventListener("error",()=>{
  playing=false;
  document.getElementById("playButton").textContent="▶";
});

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
