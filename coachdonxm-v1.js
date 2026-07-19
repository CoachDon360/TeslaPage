const RELAY = "https://coachdon-metadata.74p875syc7.workers.dev";

const stations = [
  {name:"K-LOVE",group:"music",color:"#38b5ff",desc:"Positive. Encouraging.",quality:"AAC",stream:"https://maestro.emfcdn.com/stream_for/k-love/iheart/aac"},
  {name:"Super 70s",display:"SUPER ’70s",group:"music",color:"#ff8b18",desc:"The soundtrack of the 70s.",quality:"128",stream:"https://listen.181fm.com/181-70s_128k.mp3",relayId:"181-70s"},
  {name:"Awesome 80s",display:"AWESOME ’80s",group:"music",color:"#f14db8",desc:"Turn it up.",quality:"128",stream:"https://listen.181fm.com/181-awesome80s_128k.mp3"},
  {name:"Lite 80s",display:"LITE ’80s",group:"music",color:"#b87cff",desc:"The softer side of the 80s.",quality:"128",stream:"https://listen.181fm.com/181-lite80s_128k.mp3"},
  {name:"Star 90s",display:"STAR ’90s",group:"music",color:"#8dd03a",desc:"The biggest hits of the 90s.",quality:"128",stream:"https://listen.181fm.com/181-star90s_128k.mp3"},
  {name:"Lite 90s",display:"LITE ’90s",group:"music",color:"#5ac6ff",desc:"Smooth 90s favorites.",quality:"128",stream:"https://listen.181fm.com/181-lite90s_128k.mp3"},
  {name:"Yacht Rock",display:"the yacht",group:"music",color:"#f0ad2d",desc:"Smooth. Soft. Sailing.",quality:"128",stream:"https://listen.181fm.com/181-yachtrock_128k.mp3"},
  {name:"Good Time Oldies",group:"music",color:"#ffd36f",desc:"More good times.",quality:"128",stream:"https://listen.181fm.com/181-goodtime_128k.mp3"},
  {name:"Soul",display:"181.fm SOUL",group:"music",color:"#a66cff",desc:"Classic soul. Timeless groove.",quality:"128",stream:"https://listen.181fm.com/181-soul_128k.mp3"},
  {name:"The Breeze",group:"music",color:"#2ad1df",desc:"Relax. Unwind. Breathe.",quality:"128",stream:"https://listen.181fm.com/181-breeze_128k.mp3"},
  {name:"Classical",group:"music",color:"#ddd1ff",desc:"Timeless masterworks.",quality:"128",stream:"https://listen.181fm.com/181-classical_128k.mp3"},

  {name:"Main Street USA",group:"disney",color:"#d65cff",desc:"Classic park atmosphere.",quality:"",stream:""},
  {name:"Adventureland",group:"disney",color:"#64d46d",desc:"Jungle rhythms and island music.",quality:"",stream:""},
  {name:"Frontierland",group:"disney",color:"#e3a34d",desc:"Western classics and bluegrass.",quality:"",stream:""},
  {name:"Tomorrowland",group:"disney",color:"#5bc4ff",desc:"Retro-futuristic atmosphere.",quality:"",stream:""},
  {name:"Fantasyland",group:"disney",color:"#ff82c8",desc:"Classic melodies and storybook magic.",quality:"",stream:""},
  {name:"Future World",group:"disney",color:"#7e8fff",desc:"Classic EPCOT optimism.",quality:"",stream:""},
  {name:"World Showcase",group:"disney",color:"#52d6c8",desc:"Music from around the world.",quality:"",stream:""},
  {name:"Hollywood Studios",group:"disney",color:"#ff6868",desc:"Movie magic and boulevard atmosphere.",quality:"",stream:""},
  {name:"Animal Kingdom",group:"disney",color:"#8bcf72",desc:"Nature-inspired park ambience.",quality:"",stream:""},
  {name:"Resort TV",group:"disney",color:"#7bc9ef",desc:"Resort loops and vacation atmosphere.",quality:"",stream:""},
  {name:"Pixar",group:"disney",color:"#65a9ff",desc:"Music from Pixar films and lands.",quality:"",stream:""},
  {name:"Villains",group:"disney",color:"#b95de3",desc:"Disney's darker side.",quality:"",stream:""},

  {name:"The Ramsey Show",group:"podcasts",color:"#ffd02c",desc:"Money, work, and life.",quality:"",stream:""},
  {name:"Insight for Living",group:"podcasts",color:"#6bd8ff",desc:"Biblical teaching with Chuck Swindoll.",quality:"",stream:""},
  {name:"Southeast Christian",group:"podcasts",color:"#70d979",desc:"Messages from Southeast Christian Church.",quality:"",stream:""},
  {name:"Brian Buffini",group:"podcasts",color:"#ff9b52",desc:"Business, motivation, and real estate.",quality:"",stream:""}
];

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
const favorites = new Set(JSON.parse(localStorage.getItem("coachdonxmFavorites") || "[]"));

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
      </span>
      <span class="row-heart">${favorites.has(station.name) ? "♥" : "♡"}</span>
      <span class="row-quality">${station.quality || ""}</span>`;
    row.addEventListener("click", event=>{
      if(event.target.classList.contains("row-heart")){
        toggleFavorite(station.name);
        event.stopPropagation();
        return;
      }
      choose(index, true);
    });
    lists[station.group].appendChild(row);
  });
}

function setStatus(text,mode=""){
  document.getElementById("statusText").textContent = text;
  const dot = document.getElementById("statusDot");
  dot.className = "status-dot " + mode;
}

function updateMetadata(artist,song){
  document.getElementById("artist").textContent = artist || "";
  document.getElementById("song").textContent = song || "";
  document.getElementById("miniSong").textContent = song || "Live Radio";
  document.getElementById("miniArtist").textContent = artist || labelOf(stations[selected]);
}

function choose(index,autoplay=false){
  selected = (index + stations.length) % stations.length;
  const station = stations[selected];
  document.documentElement.style.setProperty("--accent", station.color);
  document.getElementById("displayStation").textContent = labelOf(station);
  document.getElementById("displayDescription").textContent = station.desc;
  document.getElementById("artTitle").innerHTML = labelOf(station).replace(" ","<br>");
  document.getElementById("miniArt").textContent = labelOf(station).replace(/[^A-Za-z0-9’']/g," ").split(/\s+/).slice(0,2).join(" ");
  document.getElementById("provider").textContent = station.relayId ? "181.FM" : station.group === "podcasts" ? "PODCAST" : "LIVE RADIO";
  document.getElementById("quality").textContent = station.quality ? `${station.quality} kbps` : "";
  document.getElementById("favoriteButton").textContent = favorites.has(station.name) ? "♥" : "♡";
  document.getElementById("panelFavorite").textContent = favorites.has(station.name) ? "♥" : "♡";
  document.getElementById("favoriteButton").classList.toggle("on",favorites.has(station.name));
  document.getElementById("panelFavorite").classList.toggle("on",favorites.has(station.name));
  render();
  startMetadata(station);
  if(autoplay) playSelected();
}

async function fetchRelay(station,token){
  try{
    const response = await fetch(`${RELAY}/metadata?station=${encodeURIComponent(station.relayId)}`,{cache:"no-store"});
    const data = await response.json();
    if(!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`);
    if(token !== metadataToken) return;
    updateMetadata(data.artist || "SUPER 70s", data.title || "Live on 181.FM");
    setStatus("LIVE METADATA","live");
  }catch(error){
    if(token !== metadataToken) return;
    updateMetadata("SUPER 70s","Live on 181.FM");
    setStatus("AUDIO LIVE","live");
    console.warn("CoachDon relay:",error);
  }
}

function startMetadata(station){
  metadataToken++;
  const token = metadataToken;
  if(metadataTimer) clearInterval(metadataTimer);
  metadataTimer = null;

  if(station.relayId){
    updateMetadata("SUPER 70s","Looking for the groove...");
    setStatus("CHECKING METADATA","wait");
    fetchRelay(station,token);
    metadataTimer = setInterval(()=>fetchRelay(station,token),20000);
  }else{
    updateMetadata(labelOf(station).toUpperCase(), station.stream ? "Live Radio" : (station.group === "podcasts" ? "Podcast feed setup needed" : "Stream setup needed"));
    setStatus(station.stream ? "READY" : "SETUP NEEDED",station.stream ? "" : "wait");
  }
}

async function playSelected(){
  const station = stations[selected];
  if(!station.stream){
    playing = false;
    document.getElementById("playButton").textContent = "▶";
    setStatus("SETUP NEEDED","wait");
    return;
  }
  if(audio.src !== station.stream) audio.src = station.stream;
  try{
    await audio.play();
    playing = true;
    document.getElementById("playButton").textContent = "Ⅱ";
    if(!station.relayId) setStatus("LIVE","live");
    render();
  }catch(error){
    playing = false;
    document.getElementById("playButton").textContent = "▶";
    setStatus("COULD NOT CONNECT","offline");
  }
}

function toggleFavorite(name){
  favorites.has(name) ? favorites.delete(name) : favorites.add(name);
  localStorage.setItem("coachdonxmFavorites",JSON.stringify([...favorites]));
  choose(selected,false);
}

document.getElementById("playButton").addEventListener("click",()=>{
  if(playing){
    audio.pause(); playing=false;
    document.getElementById("playButton").textContent="▶";
    setStatus("PAUSED","");
    render();
  }else playSelected();
});
document.getElementById("previousButton").addEventListener("click",()=>choose(selected-1,true));
document.getElementById("nextButton").addEventListener("click",()=>choose(selected+1,true));
document.getElementById("volumeSlider").addEventListener("input",e=>audio.volume=Number(e.target.value));
document.getElementById("favoriteButton").addEventListener("click",()=>toggleFavorite(stations[selected].name));
document.getElementById("panelFavorite").addEventListener("click",()=>toggleFavorite(stations[selected].name));

function updateClock(){
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});
  document.getElementById("date").textContent = now.toLocaleDateString([], {weekday:"short",month:"short",day:"numeric"});
}
audio.volume=.75;
setInterval(updateClock,30000);
updateClock();
render();
choose(selected,false);
