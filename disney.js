const cards=[...document.querySelectorAll(".destination-card")];
const title=document.getElementById("nowTitle");
const subtitle=document.getElementById("nowSubtitle");
const art=document.getElementById("albumArt");
const play=document.getElementById("playButton");
let selected=0;
let playing=false;

function selectCard(index){
  selected=(index+cards.length)%cards.length;
  cards.forEach((card,i)=>card.classList.toggle("selected",i===selected));
  const card=cards[selected];
  title.textContent=card.dataset.title;
  subtitle.textContent=card.dataset.subtitle;
  art.textContent=card.dataset.icon;
  playing=false;
  play.textContent="▶";
  play.setAttribute("aria-label","Play");
  card.scrollIntoView({behavior:"smooth",block:"nearest",inline:"nearest"});
}

cards.forEach((card,index)=>card.addEventListener("click",()=>selectCard(index)));
document.getElementById("previousButton").addEventListener("click",()=>selectCard(selected-1));
document.getElementById("nextButton").addEventListener("click",()=>selectCard(selected+1));
play.addEventListener("click",()=>{
  playing=!playing;
  play.textContent=playing?"Ⅱ":"▶";
  play.setAttribute("aria-label",playing?"Pause":"Play");
});

function updateClockAndTheme(){
  const now=new Date();
  document.getElementById("clock").textContent=now.toLocaleTimeString([],{
    hour:"numeric",minute:"2-digit"
  });
  const h=now.getHours();
  document.body.classList.toggle("evening",h>=17&&h<20);
  document.body.classList.toggle("night",h>=20||h<6);
}
updateClockAndTheme();
setInterval(updateClockAndTheme,30000);
