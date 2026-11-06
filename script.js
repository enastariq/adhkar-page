const bubbles = document.querySelectorAll('.bubble');
const modeButtons = document.querySelectorAll('.mode-btn');
const timeWords = document.querySelectorAll('.time-word');
const pageTitle = document.querySelector('.page-title');

let currentAudio = null;
let activeBubble = null;
let currentMode = 'morning'; // 'morning' or 'evening'

// Helper function to stop audio and reset the button highlight
function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  if (activeBubble) {
    activeBubble.classList.remove('is-playing');
  }
  currentAudio = null;
  activeBubble = null;
}

// 1. Handle Morning / Evening Toggle Click
modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const selectedMode = btn.getAttribute('data-mode');
    if (selectedMode === currentMode) return;

    currentMode = selectedMode;

    // Stop any playing audio when switching modes
    stopCurrentAudio();

    // Update active visual on the corner toggle buttons
    modeButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    // Swap all dynamic words between Morning and Evening
    timeWords.forEach((word) => {
      word.textContent = word.getAttribute(`data-${currentMode}`);
    });

    // Optional: Update the main header title to match the selected mode
    if (pageTitle) {
      pageTitle.textContent = currentMode === 'morning' ? 'أذكار الصباح' : 'أذكار المساء';
    }
  });
});

// 2. Handle Bubble Click to Play Audio
bubbles.forEach((bubble) => {
  bubble.addEventListener('click', () => {
    // Pick the evening audio if we are in evening mode AND the bubble has one; otherwise use default
    const eveningAudio = bubble.getAttribute('data-audio-evening');
    const defaultAudio = bubble.getAttribute('data-audio');
    
    const audioPath = (currentMode === 'evening' && eveningAudio) 
      ? eveningAudio 
      : defaultAudio;

    if (!audioPath) return;

    // Pause if clicking the same bubble that's currently playing
    if (activeBubble === bubble) {
      stopCurrentAudio();
      return;
    }

    stopCurrentAudio();

    currentAudio = new Audio(audioPath);
    activeBubble = bubble;
    bubble.classList.add('is-playing');

    currentAudio.play().catch((error) => {
      console.warn(`Could not play ${audioPath}. Check your audio/ folder!`, error);
      bubble.classList.remove('is-playing');
      activeBubble = null;
    });

    // Check if this specific bubble has data-repeat="50" (all others default to 1)
    let playCount = 1;
    const maxRepeats = Number(bubble.dataset.repeat) || 1;

    currentAudio.addEventListener('ended', () => {
      if (playCount < maxRepeats) {
        playCount++;
        currentAudio.currentTime = 0; // Rewind to start
        currentAudio.play();          // Play again
      } else {
        stopCurrentAudio();           // Done! Remove highlight
      }
    });
  });
});