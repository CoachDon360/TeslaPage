const cards = [...document.querySelectorAll('.card')];
const title = document.getElementById('selectionTitle');
const subtitle = document.getElementById('selectionSubtitle');
const playButton = document.getElementById('playButton');
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const volumeSlider = document.getElementById('volumeSlider');
const homeButton = document.getElementById('homeButton');
const audio = document.getElementById('audioPlayer');
const toast = document.getElementById('toast');
const focusRing = document.getElementById('focusRing');

let currentIndex = 4;
let isPlaying = false;
let toastTimer;

/*
  Add final stream or page links here later.

  Examples:
  streamUrl: "https://example.com/live.mp3"
  pageUrl: "classic-attractions.html"
*/
const destinations = {
  "Around the Parks":       { streamUrl: "", pageUrl: "" },
  "Resort Collection":     { streamUrl: "", pageUrl: "" },
  "EPCOT":                 { streamUrl: "", pageUrl: "" },
  "Park Atmospheres":      { streamUrl: "", pageUrl: "" },
  "Classic Attractions":   { streamUrl: "", pageUrl: "" },
  "Disney Loops":          { streamUrl: "", pageUrl: "" },
  "Nighttime Spectaculars":{ streamUrl: "", pageUrl: "" },
  "Seasonal Magic":        { streamUrl: "", pageUrl: "" }
};

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1400);
}

function positionFocusRing(card) {
  const boardRect = document.querySelector('.artboard').getBoundingClientRect();
  const rect = card.getBoundingClientRect();
  focusRing.style.left = `${rect.left - boardRect.left}px`;
  focusRing.style.top = `${rect.top - boardRect.top}px`;
  focusRing.style.width = `${rect.width}px`;
  focusRing.style.height = `${rect.height}px`;
  focusRing.classList.add('show');
  setTimeout(() => focusRing.classList.remove('show'), 420);
}

function selectCard(index, activate = false) {
  currentIndex = (index + cards.length) % cards.length;
  const card = cards[currentIndex];

  cards.forEach((item, i) => item.classList.toggle('selected', i === currentIndex));
  title.textContent = card.dataset.title;
  subtitle.textContent = card.dataset.subtitle;
  positionFocusRing(card);

  if (!activate) return;

  const destination = destinations[card.dataset.title];

  if (destination?.pageUrl) {
    window.location.href = destination.pageUrl;
    return;
  }

  if (destination?.streamUrl) {
    if (audio.src !== destination.streamUrl) {
      audio.src = destination.streamUrl;
    }
    audio.play()
      .then(() => {
        isPlaying = true;
        playButton.setAttribute('aria-label', 'Pause');
      })
      .catch(() => showToast('Tap play to begin'));
    return;
  }

  showToast(`${card.dataset.title} selected`);
}

cards.forEach((card, index) => {
  card.addEventListener('click', () => selectCard(index, true));
});

previousButton.addEventListener('click', () => selectCard(currentIndex - 1, false));
nextButton.addEventListener('click', () => selectCard(currentIndex + 1, false));

playButton.addEventListener('click', () => {
  const card = cards[currentIndex];
  const destination = destinations[card.dataset.title];

  if (!destination?.streamUrl) {
    isPlaying = !isPlaying;
    playButton.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    showToast(isPlaying ? `Playing ${card.dataset.title}` : 'Paused');
    return;
  }

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});

audio.addEventListener('play', () => {
  isPlaying = true;
  playButton.setAttribute('aria-label', 'Pause');
});

audio.addEventListener('pause', () => {
  isPlaying = false;
  playButton.setAttribute('aria-label', 'Play');
});

volumeSlider.addEventListener('input', () => {
  audio.volume = Number(volumeSlider.value) / 100;
  showToast(`Volume ${volumeSlider.value}%`);
});

homeButton.addEventListener('click', () => {
  window.location.href = 'index.html';
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') selectCard(currentIndex - 1, false);
  if (event.key === 'ArrowRight') selectCard(currentIndex + 1, false);
  if (event.key === 'Enter') selectCard(currentIndex, true);
  if (event.key === ' ') {
    event.preventDefault();
    playButton.click();
  }
});

window.addEventListener('resize', () => focusRing.classList.remove('show'));

selectCard(currentIndex, false);
audio.volume = Number(volumeSlider.value) / 100;
