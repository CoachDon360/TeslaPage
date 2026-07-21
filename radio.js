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
let metadataController = null;
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

function updateMetadata(artist,song,expectedStation=null){
  if(expectedStation && stations[selected] !== expectedStation) return;
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

function fetchPodcastViaApple(station){
  return new Promise((resolve,reject)=>{
    const callbackName = `coachDonPodcast_${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(()=>{
      cleanup();
      reject(new Error("Apple podcast lookup timed out"));
    },15000);

    function cleanup(){
      window.clearTimeout(timeout);
      try{ delete window[callbackName]; }catch(_){ window[callbackName] = undefined; }
      script.remove();
    }

    window[callbackName] = data=>{
      cleanup();
      try{
        const episodes = (data.results || [])
          .filter(item => item.kind === "podcast-episode" && item.episodeUrl)
          .sort((a,b)=>new Date(b.releaseDate || 0)-new Date(a.releaseDate || 0));

        const item = episodes[0];
        if(!item) throw new Error("No playable Ramsey episodes returned");

        resolve({
          title: stripHtml(item.trackName || item.episodeTitle || "Latest Episode"),
          audio: item.episodeUrl,
          date: item.releaseDate || "",
          duration: item.trackTimeMillis
            ? Math.round(item.trackTimeMillis / 1000)
            : "",
          description: stripHtml(item.description || item.shortDescription || "")
        });
      }catch(error){
        reject(error);
      }
    };

    script.onerror = ()=>{
      cleanup();
      reject(new Error("Apple podcast lookup could not connect"));
    };

    const params = new URLSearchParams({
      id: station.podcastId,
      entity: "podcastEpisode",
      limit: "25",
      sort: "recent",
      country: "US",
      callback: callbackName
    });

    script.src = `https://itunes.apple.com/lookup?${params.toString()}`;
    document.head.appendChild(script);
  });
}

async function loadPodcast(station,autoplay=false){
  const token = ++podcastLoadToken;
  setMetadataLabels("Show","Latest Episode");
  updateMetadata(station.name,"Loading newest episode…",station);

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
    const durationText = typeof episode.duration === "number"
      ? `${Math.floor(episode.duration/3600)}:${String(Math.floor((episode.duration%3600)/60)).padStart(2,"0")}:${String(episode.duration%60).padStart(2,"0")}`
      : episode.duration;
    const details = [formatPodcastDate(episode.date), durationText].filter(Boolean).join(" • ");
    document.getElementById("displayDescription").textContent =
      details || "Latest full episode";
    updateMetadata(station.name,episode.title,station);

    if(autoplay) await playSelected();
  }catch(error){
    if(token !== podcastLoadToken || stations[selected] !== station) return;
    updateMetadata(station.name,"Episode feed could not connect",station);
    document.getElementById("displayDescription").textContent =
      "The Ramsey Show episode list is temporarily unavailable.";
    console.warn("Podcast feed:",error);
  }
}

function choose(index,autoplay=false){
  stopMetadata();
  podcastLoadToken++;
  selected = (index + stations.length) % stations.length;
  const station = stations[selected];
  document.documentElement.style.setProperty("--accent", station.color);
  document.getElementById("displayStation").textContent = labelOf(station);
  document.getElementById("displayDescription").textContent = station.desc;
  const stationMeta = document.getElementById("stationMeta");
  if (stationMeta) stationMeta.textContent = labelOf(station);
  render();

  if(station.podcastId){
    if(!audio.paused){
      audio.pause();
      playing = false;
      document.getElementById("playButton").textContent = "▶";
    }
    audio.removeAttribute("src");
    audio.load();
    loadPodcast(station,autoplay);
    return;
  }

  setMetadataLabels("Artist","Song");
  startMetadata(station);
  if(autoplay) playSelected();
}

function stopMetadata(){
  metadataToken++;

  if(metadataTimer){
    clearInterval(metadataTimer);
    metadataTimer = null;
  }

  if(metadataController){
    metadataController.abort();
    metadataController = null;
  }
}

async function fetchRelay(station,token){
  if(token !== metadataToken || stations[selected] !== station) return;

  if(metadataController){
    metadataController.abort();
  }
  const controller = new AbortController();
  metadataController = controller;

  try{
    const response = await fetch(
      `${RELAY}/metadata?station=${encodeURIComponent(station.relayId)}`,
      {cache:"no-store", signal:controller.signal}
    );
    const data = await response.json();

    if(!response.ok || !data.ok){
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    if(
      controller.signal.aborted ||
      token !== metadataToken ||
      stations[selected] !== station
    ) return;

    updateMetadata(
      data.artist || labelOf(station),
      data.title || "Live Radio",
      station
    );
  }catch(error){
    if(error?.name === "AbortError") return;
    if(token !== metadataToken || stations[selected] !== station) return;

    updateMetadata(labelOf(station),"Live Radio",station);
    console.warn("CoachDon relay:",error);
  }finally{
    if(metadataController === controller){
      metadataController = null;
    }
  }
}

function startMetadata(station){
  stopMetadata();
  const token = metadataToken;

  if(station.relayId){
    updateMetadata("Checking now playing…","One moment…",station);
    fetchRelay(station,token);
    metadataTimer = setInterval(()=>{
      if(token !== metadataToken || stations[selected] !== station){
        stopMetadata();
        return;
      }
      fetchRelay(station,token);
    },20000);
    return;
  }

  updateMetadata(
    station.name === "K-LOVE" ? "K-LOVE" : labelOf(station),
    station.stream ? "Live Radio" :
    (station.group === "podcasts" ? "Podcast feed setup needed" : "Stream setup needed"),
    station
  );
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