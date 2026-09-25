const TIME_CONFIG = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
};

let timeLeft = TIME_CONFIG.focus;
let timerId = null;
let currentMode = 'focus';
let sessionsCompleted = 0;

const display = document.getElementById('time-left');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const sessionDisplay = document.getElementById('session-count');

// Initialize
function init() {
    loadStats();
    updateDisplay();
    setMode('focus');
}

function loadStats() {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('zenFocusStats') || '{}');
    
    if (saved.date === today) {
        sessionsCompleted = saved.count || 0;
    } else {
        sessionsCompleted = 0;
        saveStats();
    }
    updateStatsDisplay();
}

function saveStats() {
    const today = new Date().toDateString();
    localStorage.setItem('zenFocusStats', JSON.stringify({
        date: today,
        count: sessionsCompleted
    }));
}

function updateStatsDisplay() {
    sessionDisplay.textContent = `Sessions today: ${sessionsCompleted}`;
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.title = `${display.textContent} - ZenFocus`;
}

function setMode(mode) {
    currentMode = mode;
    timeLeft = TIME_CONFIG[mode];
    
    // UI Updates
    document.body.className = `mode-${mode}`;
    modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    pauseTimer();
    updateDisplay();
}

function toggleTimer() {
    if (timerId) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    startPauseBtn.textContent = 'Pause';
    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
    startPauseBtn.textContent = 'Start';
}

function resetTimer() {
    pauseTimer();
    timeLeft = TIME_CONFIG[currentMode];
    updateDisplay();
}

function completeSession() {
    pauseTimer();
    
    if (currentMode === 'focus') {
        sessionsCompleted++;
        saveStats();
        updateStatsDisplay();
        alert('Focus session complete! Take a break.');
    } else {
        alert('Break over! Time to focus.');
    }
    
    resetTimer();
}

// Event Listeners
startPauseBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

init();