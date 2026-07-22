const cards = [...document.querySelectorAll('.hotspot')];
const panel = document.getElementById('playerPanel');
const title = document.getElementById('playerTitle');
const subtitle = document.getElementById('playerSubtitle');
const icon = document.getElementById('playerIcon');
const play = document.getElementById('playButton');
let currentIndex = 0;
let playing = false;

function selectCard(index, openPanel = true) {
  currentIndex = (index + cards.length) % cards.length;
  cards.forEach((card, i) => card.classList.toggle('selected', i === currentIndex));
  const card = cards[currentIndex];
  title.textContent = card.dataset.name;
  subtitle.textContent = card.dataset.subtitle;
  icon.textContent = card.dataset.icon;
  if (openPanel) panel.classList.add('open');
}

cards.forEach((card, index) => {
  card.addEventListener('click', () => selectCard(index, true));
});

document.getElementById('closePlayer').addEventListener('click', () => {
  panel.classList.remove('open');
});

document.getElementById('prevButton').addEventListener('click', () => selectCard(currentIndex - 1));
document.getElementById('nextButton').addEventListener('click', () => selectCard(currentIndex + 1));

play.addEventListener('click', () => {
  playing = !playing;
  play.textContent = playing ? 'Ⅱ' : '▶';
  play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
});

function updateTheme() {
  const hour = new Date().getHours();
  document.body.classList.toggle('evening', hour >= 17 && hour < 20);
  document.body.classList.toggle('night', hour >= 20 || hour < 6);
}
updateTheme();
setInterval(updateTheme, 60000);

selectCard(0, false);
