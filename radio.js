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

  {name:"DParkRadio Main",display:"DParkRadio Main",group:"disney",color:"#d65cff",desc:"Parades, attractions, fireworks and park favorites.",quality:"WEB",link:"https://dparkradio.com/music/"},
  {name:"DParkRadio Background",display:"DParkRadio Background",group:"disney",color:"#64d46d",desc:"Disney park background-area music.",quality:"WEB",link:"https://dparkradio.com/music/"},
  {name:"DParkRadio Main Street",display:"DParkRadio Main Street",group:"disney",color:"#e3a34d",desc:"Holiday and Main Street atmosphere.",quality:"WEB",link:"https://dparkradio.com/music/"},
  {name:"DParkRadio Resort TV",display:"DParkRadio Resort TV",group:"disney",color:"#5bc4ff",desc:"Guest TV and resort-vacation atmosphere.",quality:"WEB",link:"https://dparkradio.com/music/"},
  {name:"Sorcerer Radio",display:"Sorcerer Radio",group:"disney",color:"#ff82c8",desc:"All Disney music, all day long.",quality:"WEB",link:"https://srsounds.com/wp/listen/"},
  {name:"Park Audio",display:"Park Audio",group:"disney",color:"#7e8fff",desc:"Disney park atmosphere and area audio.",quality:"WEB",link:"https://srsounds.com/wp/listen/"},
  {name:"Disney Loops",display:"Disney Loops",group:"disney",color:"#52d6c8",desc:"Background loops from across Disney destinations.",quality:"WEB",link:"https://srsounds.com/wp/listen/"},
  {name:"Ride Audio",display:"Ride Audio",group:"disney",color:"#ff6868",desc:"Attractions, rides and park experiences.",quality:"WEB",link:"https://srsounds.com/wp/listen/"},
  {name:"Seasonal Disney",display:"Seasonal Disney",group:"disney",color:"#8bcf72",desc:"Disney holiday and seasonal music.",quality:"WEB",link:"https://srsounds.com/wp/listen/"},
  {name:"Relaxing Disney",display:"Relaxing Disney",group:"disney",color:"#7bc9ef",desc:"Calm Disney park ambience and relaxing audio.",quality:"WEB",link:"https://srsounds.com/wp/listen/"},
  {name:"Disney Coffeehouse",display:"Disney Coffeehouse",group:"disney",color:"#65a9ff",desc:"A softer coffeehouse take on Disney favorites.",quality:"WEB",link:"https://srsounds.com/wp/listen/"},
  {name:"WDW Resort TV",display:"WDW Resort TV",group:"disney",color:"#b95de3",desc:"The official Sorcerer Radio Resort TV page.",quality:"WEB",link:"https://srsounds.com/wp/listen/"},

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
        <span class="station-name"><span class="playing-mark">▶</span>${labelOf(station)}${station.link ? '<span class="web-mark">↗</span>' : ''}</span>
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

  // Disney rows are dependable links to the stations' official web players.
  // Stop local audio first so two sources cannot play at once.
  if(autoplay && station.link){
    audio.pause();
    playing = false;
    document.getElementById("playButton").textContent = "▶";
    window.location.href = station.link;
    return;
  }

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