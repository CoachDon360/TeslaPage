
const items = [{"id": "klove", "name": "K-LOVE", "group": "music", "accent": "#0094E1", "tagline": "Positive. Encouraging.", "stream": "https://emf-hls.streamguys1.com/klove-live-aac/playlist.m3u8"}, {"id": "super70s", "name": "Super 70s", "group": "music", "accent": "#0094E1", "tagline": "The soundtrack of the 70s.", "stream": "https://listen.181fm.com/181-70s_128k.mp3"}, {"id": "awesome80s", "name": "Awesome 80s", "group": "music", "accent": "#0094E1", "tagline": "Turn it up.", "stream": "https://listen.181fm.com/181-awesome80s_128k.mp3"}, {"id": "lite80s", "name": "Lite 80s", "group": "music", "accent": "#0094E1", "tagline": "The softer side of the 80s.", "stream": "https://listen.181fm.com/181-lite80s_128k.mp3"}, {"id": "star90s", "name": "Star 90s", "group": "music", "accent": "#0094E1", "tagline": "The biggest hits of the 90s.", "stream": "https://listen.181fm.com/181-star90s_128k.mp3"}, {"id": "lite90s", "name": "Lite 90s", "group": "music", "accent": "#0094E1", "tagline": "Smooth 90s favorites.", "stream": "https://listen.181fm.com/181-lite90s_128k.mp3"}, {"id": "yachtrock", "name": "Yacht Rock", "group": "music", "accent": "#0094E1", "tagline": "Smooth. Soft. Sailing.", "stream": "https://listen.181fm.com/181-yachtrock_128k.mp3"}, {"id": "oldies", "name": "Good Time Oldies", "group": "music", "accent": "#0094E1", "tagline": "More good times.", "stream": "https://listen.181fm.com/181-goodtime_128k.mp3"}, {"id": "soul", "name": "Soul", "group": "music", "accent": "#0094E1", "tagline": "Classic soul. Timeless groove.", "stream": "https://listen.181fm.com/181-soul_128k.mp3"}, {"id": "cinema", "name": "Cinema", "group": "music", "accent": "#0094E1", "tagline": "Music from the movies.", "stream": "https://listen.181fm.com/181-cinemasoundtracks_128k.mp3"}, {"id": "breeze", "name": "The Breeze", "group": "music", "accent": "#0094E1", "tagline": "Relax. Unwind. Breathe.", "stream": "https://listen.181fm.com/181-breeze_128k.mp3"}, {"id": "classical", "name": "Classical", "group": "music", "accent": "#0094E1", "tagline": "Timeless masterworks.", "stream": "https://listen.181fm.com/181-classical_128k.mp3"}, {"id": "dpark", "name": "DParkRadio", "group": "disney", "accent": "#D65A54", "tagline": "Disney parks audio.", "stream": ""}, {"id": "sorcerer", "name": "Sorcerer Radio", "group": "disney", "accent": "#D65A54", "tagline": "All Disney music, all day.", "stream": ""}, {"id": "disneyhits", "name": "Disney Hits", "group": "disney", "accent": "#D65A54", "tagline": "All the favorites.", "stream": ""}, {"id": "disneyparks", "name": "Disney Parks", "group": "disney", "accent": "#D65A54", "tagline": "The magic of the parks.", "stream": ""}, {"id": "ramsey", "name": "The Ramsey Show", "group": "podcasts", "accent": "#9B5DE5", "tagline": "Money, work, and life.", "stream": "", "kind": "podcast"}, {"id": "insight", "name": "Insight for Living", "group": "podcasts", "accent": "#9B5DE5", "tagline": "Biblical teaching with Chuck Swindoll.", "stream": "", "kind": "podcast"}, {"id": "southeast", "name": "Southeast Christian", "group": "podcasts", "accent": "#9B5DE5", "tagline": "Messages from Southeast Christian Church.", "stream": "", "kind": "podcast"}, {"id": "buffini", "name": "Brian Buffini", "group": "podcasts", "accent": "#9B5DE5", "tagline": "Business, motivation, and real estate.", "stream": "", "kind": "podcast"}];
const audio = document.getElementById('audio');
const listTargets = {
  music: document.getElementById('musicList'),
  disney: document.getElementById('disneyList'),
  podcasts: document.getElementById('podcastList')
};
const playButton = document.getElementById('playButton');
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const favoriteButton = document.getElementById('favoriteButton');
const volumeSlider = document.getElementById('volumeSlider');
let selectedIndex = Math.max(0, items.findIndex(s => s.id === 'soul'));
let favorites = new Set(JSON.parse(localStorage.getItem('radioFavorites') || '[]'));
let isPlaying = false;

function initials(name){
  const words=name.replace(/[^a-zA-Z0-9 ]/g,'').split(/\s+/).filter(Boolean);
  if(words.length===1) return words[0].slice(0,2).toUpperCase();
  return words.slice(0,2).map(w=>w[0]).join('').toUpperCase();
}
function renderLists(){
  Object.values(listTargets).forEach(el=>el.innerHTML='');
  items.forEach((item,index)=>{
    const row=document.createElement('button');
    row.className='station-row'+(index===selectedIndex?' active':'');
    row.innerHTML=`<span class="station-name">${item.name}</span><span class="now-indicator">▶</span>`;
    row.addEventListener('click',()=>selectItem(index,true));
    listTargets[item.group].appendChild(row);
  });
}
function selectItem(index, autoplay=false){
  selectedIndex=(index+items.length)%items.length;
  const item=items[selectedIndex];
  document.documentElement.style.setProperty('--accent',item.accent);
  document.getElementById('stationMonogram').textContent=item.group==='podcasts'?'PODCAST':item.name;
  document.getElementById('stationTagline').textContent=item.tagline;
  document.getElementById('eyebrow').textContent=item.group==='podcasts'?'PODCAST':'NOW PLAYING';
  document.getElementById('trackTitle').textContent=item.stream?'Live Radio':(item.group==='podcasts'?'Episode feed setup needed':'Stream setup needed');
  document.getElementById('artistName').textContent=item.name;
  document.getElementById('miniTitle').textContent=item.name;
  document.getElementById('miniSubtitle').textContent=item.stream?'Tap play to listen':(item.group==='podcasts'?'Podcast feed to connect':'Add stream URL in app.js');
  document.getElementById('miniCard').textContent=item.group==='podcasts'?'◉':initials(item.name);
  document.getElementById('liveState').innerHTML=`<span></span> ${item.stream?'READY':'SETUP NEEDED'}`;
  favoriteButton.textContent=favorites.has(item.id)?'♥':'♡';
  renderLists();
  if(autoplay && isPlaying) playSelected();
}
async function playSelected(){
  const item=items[selectedIndex];
  if(!item.stream){
    isPlaying=false; playButton.textContent='▶';
    document.getElementById('liveState').innerHTML='<span style="background:#f2c94c;box-shadow:0 0 14px #f2c94c"></span> SETUP NEEDED';
    return;
  }
  if(audio.src!==item.stream) audio.src=item.stream;
  try{
    await audio.play();
    isPlaying=true; playButton.textContent='Ⅱ';
    document.getElementById('trackTitle').textContent='Playing Live';
    document.getElementById('liveState').innerHTML='<span></span> LIVE';
    document.getElementById('miniSubtitle').textContent='Playing live';
  }catch(err){
    isPlaying=false; playButton.textContent='▶';
    document.getElementById('trackTitle').textContent='Station unavailable';
    document.getElementById('liveState').innerHTML='<span style="background:#ff5b62;box-shadow:0 0 14px #ff5b62"></span> COULD NOT CONNECT';
    document.getElementById('miniSubtitle').textContent='Try again or update stream URL';
  }
}
function toggleFavorite(id){
  favorites.has(id)?favorites.delete(id):favorites.add(id);
  localStorage.setItem('radioFavorites',JSON.stringify([...favorites]));
  favoriteButton.textContent=favorites.has(items[selectedIndex].id)?'♥':'♡';
}
playButton.addEventListener('click',()=>{
  if(isPlaying){audio.pause();isPlaying=false;playButton.textContent='▶';document.getElementById('liveState').innerHTML='<span style="background:#aab2bf;box-shadow:none"></span> PAUSED';}
  else playSelected();
});
previousButton.addEventListener('click',()=>{selectItem(selectedIndex-1,false);playSelected();});
nextButton.addEventListener('click',()=>{selectItem(selectedIndex+1,false);playSelected();});
favoriteButton.addEventListener('click',()=>toggleFavorite(items[selectedIndex].id));
volumeSlider.addEventListener('input',()=>audio.volume=Number(volumeSlider.value));
audio.addEventListener('error',()=>{isPlaying=false;playButton.textContent='▶';});
document.getElementById('homeButton').addEventListener('click',()=>{if(history.length>1)history.back();});
function updateClock(){document.getElementById('clock').textContent=new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});}
setInterval(updateClock,30000);updateClock();audio.volume=.75;selectItem(selectedIndex);
