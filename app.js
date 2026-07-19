(() => {
const C=window.COACHDON_STATIONS,$=id=>document.getElementById(id),app=$("app"),audio=$("audio"),play=$("play"),notice=$("notice");
let current=-1,playing=false,streamIndex=0,metaTimer=null,lastMeta=0,ageTimer=null;
const favorites=new Set(JSON.parse(localStorage.getItem("cdxm-favorites")||"[3,6,7,8]"));
function row(c){const b=document.createElement("button");b.className="channel";b.dataset.n=c.n;b.innerHTML=`<div class="num">${String(c.n).padStart(2,"0")}</div><div class="logo ${c.lc}">${c.logo}</div><div class="info"><div class="name">${c.name}</div><div class="desc">${c.desc}</div></div><span class="fav ${favorites.has(c.n)?"on":""}" data-fav="${c.n}">${favorites.has(c.n)?"★":"☆"}</span><div class="health"><span class="dot"></span><span class="quality">${c.q}</span></div>`;b.onclick=e=>{if(e.target.dataset.fav){e.stopPropagation();toggleFav(c.n,e.target)}else select(C.indexOf(c),true)};return b}
C.forEach(c=>app.append(row(c)));
function toggleFav(n,el){favorites.has(n)?favorites.delete(n):favorites.add(n);localStorage.setItem("cdxm-favorites",JSON.stringify([...favorites]));el.classList.toggle("on",favorites.has(n));el.textContent=favorites.has(n)?"★":"☆"}
function toast(t){notice.textContent=t;notice.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>notice.classList.remove("show"),2500)}
function status(kind,label,age){const bar=$("livebar");bar.className="livebar "+kind;$("liveState").textContent=label;if(age)$("liveAge").textContent=age}
function paint(){document.querySelectorAll(".channel").forEach(x=>{x.classList.toggle("active",+x.dataset.n===C[current]?.n);x.classList.toggle("live",playing&&+x.dataset.n===C[current]?.n)});if(current<0)return;const c=C[current];$("pname").textContent=c.name;$("plogo").textContent=c.logo;$("plogo").className="plogo logo "+c.lc;$("liveQuality").textContent=c.q==="AAC"?"AAC":c.q==="POD"?"POD":`${c.q} kbps`;play.textContent=playing?"❚❚":"▶"}
async function refreshMeta(){if(current<0||!playing)return;const c=C[current],m=await CoachDonMetadata.fetch(c);if(m){$("track").textContent=m.title;$("artist").textContent=m.artist;lastMeta=Date.now();status("live","LIVE","Updated now")}else{status("wait","LIVE","Metadata unavailable");if(!$("track").textContent||$("track").textContent==="Connecting…")$("track").textContent=c.n===7?"Live on 181.FM":c.desc}}
function beginMeta(){clearInterval(metaTimer);lastMeta=0;refreshMeta();metaTimer=setInterval(refreshMeta,20000)}
function select(i,autoplay=false){current=(i+C.length)%C.length;streamIndex=0;const c=C[current];$("track").textContent=autoplay?"Connecting…":c.desc;$("artist").textContent="";status("wait","CONNECTING","Waiting for stream");paint();if(autoplay)start()}
async function start(){const c=C[current];if(!c){select(0,true);return}if(c.podcast){toast("Podcast shortcut is not connected in this build.");return}const streams=c.streams||[];if(!streams.length){status("offline","OFFLINE","No stream configured");return}audio.src=streams[streamIndex];try{await audio.play()}catch(e){status("offline","OFFLINE","Tap station to reconnect")}}
audio.addEventListener("playing",()=>{playing=true;status("live","LIVE","Checking metadata");paint();beginMeta()});
audio.addEventListener("waiting",()=>status("wait","BUFFERING","Waiting for stream"));
audio.addEventListener("stalled",()=>status("wait","BUFFERING","Waiting for stream"));
audio.addEventListener("pause",()=>{playing=false;status("","PAUSED","Not updating");paint()});
audio.addEventListener("error",()=>{const c=C[current];if(c?.streams&&streamIndex<c.streams.length-1){streamIndex++;status("wait","CONNECTING","Trying backup stream");start()}else{playing=false;status("offline","OFFLINE","Tap station to reconnect");paint()}});
play.onclick=()=>{if(current<0)select(0,true);else if(audio.paused)start();else audio.pause()};
$("prev").onclick=()=>select(current-1,true);$("next").onclick=()=>select(current+1,true);
function tick(){const d=new Date();$("clock").textContent=d.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});$("date").textContent=d.toLocaleDateString([],{weekday:"long",month:"short",day:"numeric"})}tick();setInterval(tick,1000);
ageTimer=setInterval(()=>{if(!lastMeta)return;const s=Math.floor((Date.now()-lastMeta)/1000);$("liveAge").textContent=s<5?"Updated now":`Updated ${s} sec ago`},1000);
})();
