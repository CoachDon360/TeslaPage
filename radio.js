(() => {
  "use strict";

  const STATIONS = [
    {id:"klove",group:"music",name:"K-LOVE",art:"K-LOVE",desc:"Positive & Encouraging",color:"#35aef3",streams:["https://maestro.emfcdn.com/stream_for/k-love/web/aac"]},
    {id:"70s",group:"music",name:"Super 70s",art:"70s",desc:"The soundtrack of the 70s.",color:"#ff8b18",relay:"181-70s",streams:["https://listen.181fm.com/181-70s_128k.mp3"]},
    {id:"80s",group:"music",name:"Awesome 80s",art:"80s",desc:"The biggest hits of the 80s.",color:"#ef4bb9",relay:"181-awesome80s",streams:["https://listen.181fm.com/181-awesome80s_128k.mp3"]},
    {id:"lite80s",group:"music",name:"Lite 80s",art:"LITE 80s",desc:"The softer side of the 80s.",color:"#48bff5",streams:["https://listen.181fm.com/181-lite80s_128k.mp3"]},
    {id:"90s",group:"music",name:"90s",art:"90s",desc:"The 90s are all that.",color:"#8dcc35",relay:"181-star90s",streams:["https://listen.181fm.com/181-star90s_128k.mp3"]},
    {id:"lite90s",group:"music",name:"Lite 90s",art:"LITE 90s",desc:"The lighter side of the 90s.",color:"#9a74ff",streams:["https://listen.181fm.com/181-lite90s_128k.mp3"]},
    {id:"yacht",group:"music",name:"Yacht Rock",art:"YACHT",desc:"Smooth sailing favorites.",color:"#f1ad27",relay:"181-yachtrock",streams:["https://listen.181fm.com/181-yachtrock_128k.mp3"]},
    {id:"oldies",group:"music",name:"Good Time Oldies",art:"OLDIES",desc:"50s, 60s and 70s favorites.",color:"#f6c968",relay:"181-goodtime",streams:["https://listen.181fm.com/181-goodtime_128k.mp3","https://listen.181fm.com/181-greatoldies_128k.mp3"]},
    {id:"soul",group:"music",name:"Soul",art:"SOUL",desc:"Classic soul favorites.",color:"#c56ff0",streams:["https://listen.181fm.com/181-soul_128k.mp3"]},
    {id:"breeze",group:"music",name:"The Breeze",art:"BREEZE",desc:"Easy listening for the road.",color:"#23d3e5",streams:["https://listen.181fm.com/181-breeze_128k.mp3"]},
    {id:"classical",group:"music",name:"Classical",art:"CLASSICAL",desc:"Timeless orchestral favorites.",color:"#e4d7ff",streams:["https://listen.181fm.com/181-classical_128k.mp3"]},

    {id:"dpark",group:"disney",name:"DParkRadio",art:"DPARK",desc:"Park music, attractions and shows.",color:"#f14c60",streams:["https://cheetah.streemlion.com/dparkradio"]},
    {id:"sorcerer",group:"disney",name:"Sorcerer Radio",art:"SORCERER",desc:"All Disney music, all day.",color:"#7ed957",streams:["https://26343.live.streamtheworld.com/SP_R3765675_SC"]},

    {id:"ramsey",group:"podcast",name:"The Ramsey Show",art:"RAMSEY",desc:"Money, debt and life.",color:"#24a6df",url:"https://www.ramseysolutions.com/shows/the-ramsey-show"},
    {id:"insight",group:"podcast",name:"Insight for Living",art:"IFL",desc:"Bible teaching with Chuck Swindoll.",color:"#80b8e8",url:"https://insight.org/broadcasts"},
    {id:"southeast",group:"podcast",name:"Southeast Christian",art:"SECC",desc:"Messages from Southeast Christian Church.",color:"#f1b949",url:"https://www.southeastchristian.org/messages"},
    {id:"buffini",group:"podcast",name:"Brian Buffini",art:"BUFFINI",desc:"The Good Life podcast.",color:"#f07b35",url:"https://www.buffiniandcompany.com/podcast/"}
  ];

  const el = id => document.getElementById(id);
  const audio = el("radioAudio");
  const playButton = el("playButton");
  const artist = el("artist");
  const song = el("song");
  const miniSong = el("miniSong");
  const miniArtist = el("miniArtist");
  let currentIndex = 1;
  let currentStreamIndex = 0;
  let metadataTimer = null;

  function render() {
    const groups = {music:el("musicList"), disney:el("disneyList"), podcast:el("podcastList")};
    Object.values(groups).forEach(node => node.innerHTML = "");

    STATIONS.forEach((station,index) => {
      const button = document.createElement("button");
      button.className = "station-row";
      button.type = "button";
      button.dataset.index = index;
      button.style.setProperty("--station-color",station.color);
      button.innerHTML = `<span class="station-name"><span class="playing-mark">▶</span>${station.name}</span>
                          <span class="station-desc">${station.desc}</span>`;
      button.addEventListener("click",() => selectStation(index,true));
      groups[station.group].appendChild(button);
    });
    markActive();
  }

  function markActive() {
    document.querySelectorAll(".station-row").forEach(row => {
      row.classList.toggle("active",Number(row.dataset.index) === currentIndex);
    });
  }

  function updateDisplay(station) {
    el("displayStation").textContent = station.name;
    el("displayDescription").textContent = station.desc;
    el("displayStation").style.color = station.color;
    el("miniArt").textContent = station.art;
    el("miniArt").style.color = station.color;
    el("miniStation").textContent = station.name;
    artist.textContent = "—";
    song.textContent = station.group === "podcast" ? "Tap the station to open the latest episodes." : "Live stream";
    miniSong.textContent = station.group === "podcast" ? "Open latest episodes" : "Ready to play";
    miniArtist.textContent = "—";
  }

  async function selectStation(index, autoplay=false) {
    currentIndex = (index + STATIONS.length) % STATIONS.length;
    currentStreamIndex = 0;
    const station = STATIONS[currentIndex];
    markActive();
    updateDisplay(station);
    stopMetadata();

    if (station.url) {
      audio.pause();
      playButton.textContent = "▶";
      if (autoplay) window.open(station.url,"_blank","noopener");
      return;
    }

    audio.src = station.streams[0];
    if (autoplay) await safePlay();
    startMetadata(station);
  }

  async function safePlay() {
    try {
      await audio.play();
      playButton.textContent = "❚❚";
    } catch (error) {
      miniSong.textContent = "Tap play to begin";
      playButton.textContent = "▶";
    }
  }

  function togglePlay() {
    const station = STATIONS[currentIndex];
    if (station.url) {
      window.open(station.url,"_blank","noopener");
      return;
    }
    if (audio.paused) safePlay();
    else {
      audio.pause();
      playButton.textContent = "▶";
    }
  }

  function nextStation(direction) {
    selectStation(currentIndex + direction,true);
  }

  function stopMetadata() {
    if (metadataTimer) clearInterval(metadataTimer);
    metadataTimer = null;
  }

  async function fetchMetadata(station) {
    if (!station.relay) return;
    try {
      const response = await fetch(`https://coachdon-metadata.netlify.app/.netlify/functions/metadata?station=${encodeURIComponent(station.relay)}`, {cache:"no-store"});
      if (!response.ok) return;
      const data = await response.json();
      if (!data || !data.ok) return;
      artist.textContent = data.artist || "—";
      song.textContent = data.title || "Live stream";
      miniSong.textContent = data.title || "Live stream";
      miniArtist.textContent = data.artist || "—";
    } catch (_) {
      // Keep the stream playing even when metadata is temporarily unavailable.
    }
  }

  function startMetadata(station) {
    fetchMetadata(station);
    if (station.relay) metadataTimer = setInterval(() => fetchMetadata(station),30000);
  }

  audio.addEventListener("play",() => playButton.textContent = "❚❚");
  audio.addEventListener("pause",() => playButton.textContent = "▶");
  audio.addEventListener("error",async () => {
    const station = STATIONS[currentIndex];
    if (!station.streams || currentStreamIndex + 1 >= station.streams.length) {
      miniSong.textContent = "Station did not answer";
      return;
    }
    currentStreamIndex += 1;
    audio.src = station.streams[currentStreamIndex];
    await safePlay();
  });

  playButton.addEventListener("click",togglePlay);
  el("previousButton").addEventListener("click",() => nextStation(-1));
  el("nextButton").addEventListener("click",() => nextStation(1));
  el("volumeSlider").addEventListener("input",event => audio.volume = Number(event.target.value));

  function updateClock() {
    const now = new Date();
    el("clock").textContent = now.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});
    el("date").textContent = now.toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"});
  }

  render();
  audio.volume = .75;
  selectStation(currentIndex,false);
  updateClock();
  setInterval(updateClock,1000);
})();
