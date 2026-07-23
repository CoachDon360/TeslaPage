(() => {
  'use strict';
  const artboard=document.querySelector('.artboard');
  const artwork=document.getElementById('artwork');
  const cards=[...document.querySelectorAll('.card')];
  const seasonalCard=document.getElementById('seasonalCard');
  const title=document.getElementById('selectionTitle');
  const subtitle=document.getElementById('selectionSubtitle');
  const playButton=document.getElementById('playButton');
  const previousButton=document.getElementById('previousButton');
  const nextButton=document.getElementById('nextButton');
  const volumeSlider=document.getElementById('volumeSlider');
  const homeButton=document.getElementById('homeButton');
  const audio=document.getElementById('audioPlayer');
  const toast=document.getElementById('toast');
  const developerPanel=document.getElementById('developerPanel');
  const developerHotspot=document.getElementById('developerHotspot');
  const closeDeveloper=document.getElementById('closeDeveloper');
  const timePreview=document.getElementById('timePreview');
  const seasonPreview=document.getElementById('seasonPreview');
  const transitionPreview=document.getElementById('transitionPreview');
  const seasonIcon=document.getElementById('seasonIcon');
  const seasonName=document.getElementById('seasonName');
  const seasonDates=document.getElementById('seasonDates');

  const seasons={
    cozy:{name:'Cozy Disney',icon:'🔥',dates:'January 6 – February 28/29',subtitle:'Warm resort music and peaceful winter ambience'},
    spring:{name:'Spring at Disney',icon:'🌸',dates:'March 1 – May 31',subtitle:'Flower & Garden music and bright springtime atmosphere'},
    summer:{name:'Summer Fun',icon:'☀️',dates:'June 1 – August 31',subtitle:'Beach resorts, water parks and sunny Disney sounds'},
    halloween:{name:'Halloween',icon:'🎃',dates:'September 1 – October 31',subtitle:'Spooky park loops, villains and Halloween celebration'},
    christmas:{name:'Christmas',icon:'🎄',dates:'November 1 – January 5',subtitle:'Disney holiday music and Christmas celebration'}
  };
  const themeImages={morning:'atmousepheres-morning.png',day:'atmousepheres-final.png',night:'atmousepheres-night.png'};
  let currentIndex=4,isPlaying=false,timer,clickCount=0,clickTimer;

  function showToast(message){clearTimeout(timer);toast.textContent=message;toast.classList.add('show');timer=setTimeout(()=>toast.classList.remove('show'),1500)}
  function automaticTimeTheme(now=new Date()){const h=now.getHours();return h>=6&&h<10?'morning':h>=10&&h<18?'day':'night'}
  function automaticSeason(now=new Date()){
    const m=now.getMonth()+1,d=now.getDate();
    if((m===11)||(m===12)||(m===1&&d<=5))return 'christmas';
    if(m===1||m===2)return 'cozy';
    if(m>=3&&m<=5)return 'spring';
    if(m>=6&&m<=8)return 'summer';
    return 'halloween';
  }
  function imageExists(src){return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(true);img.onerror=()=>resolve(false);img.src=src+'?v=2.0.0'})}
  async function applyTheme(){
    const time=timePreview.value==='auto'?automaticTimeTheme():timePreview.value;
    const season=seasonPreview.value==='auto'?automaticSeason():seasonPreview.value;
    artboard.dataset.timeTheme=time;artboard.dataset.season=season;
    document.documentElement.style.setProperty('--theme-transition',`${transitionPreview.value}ms`);
    const desired=themeImages[time];
    if(desired!==artwork.getAttribute('src') && await imageExists(desired)){artwork.style.opacity='0';setTimeout(()=>{artwork.src=desired;artwork.style.opacity='1'},220)}
    else if(time==='day' && artwork.getAttribute('src')!=='atmousepheres-final.png'){artwork.src='atmousepheres-final.png'}
    const info=seasons[season];seasonIcon.textContent=info.icon;seasonName.textContent=info.name;seasonDates.textContent=info.dates;
    seasonalCard.dataset.subtitle=info.subtitle;seasonalCard.setAttribute('aria-label',`Seasonal Magic: ${info.name}`);
    if(cards[currentIndex]===seasonalCard){title.textContent=info.name;subtitle.textContent=info.subtitle}
    document.querySelector('meta[name="theme-color"]').content=time==='night'?'#020b20':time==='morning'?'#3f79ae':'#0a2f69';
  }
  function selectCard(index,activate=false){currentIndex=(index+cards.length)%cards.length;const card=cards[currentIndex];cards.forEach((c,i)=>c.classList.toggle('selected',i===currentIndex));title.textContent=card===seasonalCard?seasons[artboard.dataset.season].name:card.dataset.title;subtitle.textContent=card.dataset.subtitle;if(activate)showToast(`${title.textContent} selected`)}

  cards.forEach((card,index)=>card.addEventListener('click',()=>selectCard(index,true)));
  previousButton.addEventListener('click',()=>selectCard(currentIndex-1));
  nextButton.addEventListener('click',()=>selectCard(currentIndex+1));
  playButton.addEventListener('click',()=>{isPlaying=!isPlaying;playButton.setAttribute('aria-label',isPlaying?'Pause':'Play');showToast(isPlaying?`Playing ${title.textContent}`:'Paused')});
  volumeSlider.addEventListener('input',()=>{audio.volume=Number(volumeSlider.value)/100;showToast(`Volume ${volumeSlider.value}%`)});
  homeButton.addEventListener('click',()=>{window.location.href='index.html'});
  document.addEventListener('keydown',event=>{if(event.key==='ArrowLeft')selectCard(currentIndex-1);if(event.key==='ArrowRight')selectCard(currentIndex+1);if(event.key==='Enter')selectCard(currentIndex,true);if(event.key===' '){event.preventDefault();playButton.click()}});

  developerHotspot.addEventListener('click',()=>{clickCount++;clearTimeout(clickTimer);clickTimer=setTimeout(()=>clickCount=0,900);if(clickCount>=3){developerPanel.hidden=false;clickCount=0}});
  closeDeveloper.addEventListener('click',()=>developerPanel.hidden=true);
  [timePreview,seasonPreview,transitionPreview].forEach(control=>control.addEventListener('change',()=>{applyTheme();showToast('Preview updated')}));

  selectCard(currentIndex);audio.volume=Number(volumeSlider.value)/100;applyTheme();
  setInterval(()=>{if(timePreview.value==='auto'||seasonPreview.value==='auto')applyTheme()},60000);
})();
