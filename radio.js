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

  {name:"Main Street USA",group:"disney",color:"#d65cff",desc:"Rope-drop test using Sorcerer Radio Mocha.",quality:"LIVE",stream:"https://samcloud.spacial.com/api/listen?sid=100903&m=sc&rid=177361"},
  {name:"Adventureland",group:"disney",color:"#64d46d",desc:"Adventureland button test using the verified Sorcerer Radio stream.",quality:"LIVE",stream:"https://samcloud.spacial.com/api/listen?sid=100903&m=sc&rid=177361"},
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

function choose(index,autoplay=false){
  selected = (index + stations.length) % stations.length;
  const station = stations[selected];
  document.documentElement.style.setProperty("--accent", station.color);
  document.getElementById("displayStation").textContent = labelOf(station);
  document.getElementById("displayDescription").textContent = station.desc;
  const stationMeta = document.getElementById("stationMeta");
  if (stationMeta) stationMeta.textContent = labelOf(station);
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