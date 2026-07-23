const cards=[...document.querySelectorAll('.card')];
const title=document.getElementById('selectionTitle');
const subtitle=document.getElementById('selectionSubtitle');
const playButton=document.getElementById('playButton');
const previousButton=document.getElementById('previousButton');
const nextButton=document.getElementById('nextButton');
const volumeSlider=document.getElementById('volumeSlider');
const homeButton=document.getElementById('homeButton');
const audio=document.getElementById('audioPlayer');
const toast=document.getElementById('toast');
let currentIndex=4,isPlaying=false,timer;

function showToast(message){
  clearTimeout(timer);
  toast.textContent=message;
  toast.classList.add('show');
  timer=setTimeout(()=>toast.classList.remove('show'),1300);
}
function selectCard(index,activate=false){
  currentIndex=(index+cards.length)%cards.length;
  const card=cards[currentIndex];
  cards.forEach((c,i)=>c.classList.toggle('selected',i===currentIndex));
  title.textContent=card.dataset.title;
  subtitle.textContent=card.dataset.subtitle;
  if(activate) showToast(`${card.dataset.title} selected`);
}
cards.forEach((card,index)=>card.addEventListener('click',()=>selectCard(index,true)));
previousButton.addEventListener('click',()=>selectCard(currentIndex-1));
nextButton.addEventListener('click',()=>selectCard(currentIndex+1));
playButton.addEventListener('click',()=>{
  isPlaying=!isPlaying;
  playButton.setAttribute('aria-label',isPlaying?'Pause':'Play');
  showToast(isPlaying?`Playing ${cards[currentIndex].dataset.title}`:'Paused');
});
volumeSlider.addEventListener('input',()=>{
  audio.volume=Number(volumeSlider.value)/100;
  showToast(`Volume ${volumeSlider.value}%`);
});
homeButton.addEventListener('click',()=>{window.location.href='index.html';});
document.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft')selectCard(currentIndex-1);
  if(event.key==='ArrowRight')selectCard(currentIndex+1);
  if(event.key==='Enter')selectCard(currentIndex,true);
  if(event.key===' '){event.preventDefault();playButton.click();}
});
selectCard(currentIndex);
audio.volume=Number(volumeSlider.value)/100;