
const stations = [{"id": "klove", "name": "K-LOVE", "group": "music", "accent": "#1ea7ff", "tagline": "Positive. Encouraging.", "stream": "https://emf-hls.streamguys1.com/klove-live-aac/playlist.m3u8"}, {"id": "super70s", "name": "Super 70s", "group": "music", "accent": "#ff9f1a", "tagline": "The soundtrack of the 70s.", "stream": "https://listen.181fm.com/181-70s_128k.mp3"}, {"id": "awesome80s", "name": "Awesome 80s", "group": "music", "accent": "#ff3b9d", "tagline": "Turn it up.", "stream": "https://listen.181fm.com/181-awesome80s_128k.mp3"}, {"id": "lite80s", "name": "Lite 80s", "group": "music", "accent": "#ff5ca8", "tagline": "The softer side of the 80s.", "stream": "https://listen.181fm.com/181-lite80s_128k.mp3"}, {"id": "star90s", "name": "Star 90s", "group": "music", "accent": "#ffe20a", "tagline": "The biggest hits of the 90s.", "stream": "https://listen.181fm.com/181-star90s_128k.mp3"}, {"id": "lite90s", "name": "Lite 90s", "group": "music", "accent": "#27d9d2", "tagline": "Smooth 90s favorites.", "stream": "https://listen.181fm.com/181-lite90s_128k.mp3"}, {"id": "yachtrock", "name": "Yacht Rock", "group": "music", "accent": "#19a8ff", "tagline": "Smooth. Soft. Sailing.", "stream": "https://listen.181fm.com/181-yachtrock_128k.mp3"}, {"id": "oldies", "name": "Good Time Oldies", "group": "music", "accent": "#ffd37a", "tagline": "More good times.", "stream": "https://listen.181fm.com/181-goodtime_128k.mp3"}, {"id": "soul", "name": "Soul", "group": "music", "accent": "#a947ff", "tagline": "Classic soul. Timeless groove.", "stream": "https://listen.181fm.com/181-soul_128k.mp3"}, {"id": "cinema", "name": "Cinema", "group": "music", "accent": "#ff3548", "tagline": "Music from the movies.", "stream": "https://listen.181fm.com/181-cinemasoundtracks_128k.mp3"}, {"id": "breeze", "name": "The Breeze", "group": "music", "accent": "#24d3c2", "tagline": "Relax. Unwind. Breathe.", "stream": "https://listen.181fm.com/181-breeze_128k.mp3"}, {"id": "classical", "name": "Classical", "group": "music", "accent": "#f0c879", "tagline": "Timeless masterworks.", "stream": "https://listen.181fm.com/181-classical_128k.mp3"}, {"id": "dpark", "name": "DParkRadio", "group": "disney", "accent": "#77d72e", "tagline": "Disney parks audio.", "stream": ""}, {"id": "sorcerer", "name": "Sorcerer Radio", "group": "disney", "accent": "#a947ff", "tagline": "All Disney music, all day.", "stream": ""}, {"id": "disneyhits", "name": "Disney Hits", "group": "disney", "accent": "#ff4cb7", "tagline": "All the favorites.", "stream": ""}, {"id": "disneyparks", "name": "Disney Parks", "group": "disney", "accent": "#19a8ff", "tagline": "The magic of the parks.", "stream": ""}, {"id": "disneychill", "name": "Disney Chill", "group": "disney", "accent": "#21d8d4", "tagline": "Relaxing Disney vibes.", "stream": ""}, {"id": "disneyclassics", "name": "Disney Classics", "group": "disney", "accent": "#ff9f1a", "tagline": "Timeless Disney.", "stream": ""}, {"id": "disneykids", "name": "Disney Kids", "group": "disney", "accent": "#7bdc27", "tagline": "Fun for the little ones.", "stream": ""}];
const audio = document.getElementById('audio');
const musicList = document.getElementById('musicList');
const disneyList = document.getElementById('disneyList');
const playButton = document.getElementById('playButton');
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const favoriteButton = document.getElementById('favoriteButton');
const volumeSlider = document.getElementById('volumeSlider');
const equalizer = document.querySelector('.equalizer');
let selectedIndex = Math.max(0, stations.findIndex(s => s.id === 'soul'));
let favorites = new Set(JSON.parse(localStorage.getItem('radioFavorites') || '[]'));
let isPlaying = false;

function initials(name){
  const words=name.replace(/[^a-zA-Z0-9 ]/g,'').split(/\s+/).filter(Boolean);
  if(words.length===1) return words[0].slice(0,2).toUpperCase();
  return words.slice(0,2).map(w=>w[0]).join('').toUpperCase();
}
function renderLists(){
  musicList.innerHTML=''; disneyList.innerHTML='';
  stations.forEach((station,index)=>{
    const row=document.createElement('button');
    row.className='station-row'+(index===selectedIndex?' active':'');
    row.innerHTML=`<span class="station-name" style="color:${station.accent}">${station.name}</span><span class="heart ${favorites.has(station.id)?'saved':''}" style="color:${favorites.has(station.id)?station.accent:'#fff'}">${favorites.has(station.id)?'♥':'♡'}</span>`;
    row.addEventListener('click',e=>{
      if(e.target.classList.contains('heart')) toggleFavorite(station.id);
      else selectStation(index, true);
    });
    (station.group==='disney'?disneyList:musicList).appendChild(row);
  });
}
function selectStation(index, autoplay=false){
  selectedIndex=(index+stations.length)%stations.length;
  const s=stations[selectedIndex];
  document.documentElement.style.setProperty('--accent',s.accent);
  document.getElementById('stationMonogram').textContent=s.name;
  document.getElementById('stationTagline').textContent=s.tagline;
  document.getElementById('trackTitle').textContent=s.stream?'Live Radio':'Stream setup needed';
  document.getElementById('artistName').textContent=s.name;
  document.getElementById('miniTitle').textContent=s.name;
  document.getElementById('miniSubtitle').textContent=s.stream?'Tap play to listen':'Add stream URL in app.js';
  document.getElementById('miniCard').textContent=initials(s.name);
  document.getElementById('liveState').innerHTML=`<span></span> ${s.stream?'READY':'STREAM NEEDED'}`;
  favoriteButton.textContent=favorites.has(s.id)?'♥':'♡';
  renderLists();
  if(autoplay && isPlaying) playSelected();
}
async function playSelected(){
  const s=stations[selectedIndex];
  if(!s.stream){
    isPlaying=false; playButton.textContent='▶'; equalizer.classList.remove('playing');
    document.getElementById('liveState').innerHTML='<span style="background:#ff9f1a;box-shadow:0 0 14px #ff9f1a"></span> STREAM URL NEEDED';
    return;
  }
  if(audio.src!==s.stream) audio.src=s.stream;
  try{
    await audio.play();
    isPlaying=true; playButton.textContent='Ⅱ'; equalizer.classList.add('playing');
    document.getElementById('trackTitle').textContent='Playing Live';
    document.getElementById('liveState').innerHTML='<span></span> LIVE';
    document.getElementById('miniSubtitle').textContent='Playing live';
  }catch(err){
    isPlaying=false; playButton.textContent='▶'; equalizer.classList.remove('playing');
    document.getElementById('trackTitle').textContent='Station unavailable';
    document.getElementById('liveState').innerHTML='<span style="background:#ff3b4e;box-shadow:0 0 14px #ff3b4e"></span> COULD NOT CONNECT';
    document.getElementById('miniSubtitle').textContent='Try again or update stream URL';
  }
}
function toggleFavorite(id){
  favorites.has(id)?favorites.delete(id):favorites.add(id);
  localStorage.setItem('radioFavorites',JSON.stringify([...favorites]));
  favoriteButton.textContent=favorites.has(stations[selectedIndex].id)?'♥':'♡';
  renderLists();
}
playButton.addEventListener('click',()=>{
  if(isPlaying){audio.pause();isPlaying=false;playButton.textContent='▶';equalizer.classList.remove('playing');document.getElementById('liveState').innerHTML='<span style="background:#aab2bf;box-shadow:none"></span> PAUSED';}
  else playSelected();
});
previousButton.addEventListener('click',()=>{selectStation(selectedIndex-1,false);playSelected();});
nextButton.addEventListener('click',()=>{selectStation(selectedIndex+1,false);playSelected();});
favoriteButton.addEventListener('click',()=>toggleFavorite(stations[selectedIndex].id));
volumeSlider.addEventListener('input',()=>audio.volume=Number(volumeSlider.value));
audio.addEventListener('error',()=>{isPlaying=false;playButton.textContent='▶';equalizer.classList.remove('playing');});
document.getElementById('homeButton').addEventListener('click',()=>{ if(history.length>1) history.back(); });
function updateClock(){document.getElementById('clock').textContent=new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});}
setInterval(updateClock,30000); updateClock(); audio.volume=.75; selectStation(selectedIndex);
