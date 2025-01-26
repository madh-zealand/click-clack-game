const CONFIG = {
    scorePerHit: 100,
    penaltyPerMiss: 50,
    initialTime: 30,
    buttonDisableDelay: 3000,
};

const Game = {
    hits: 0,
    misses: 0,
    timeLeft: CONFIG.initialTime,
    started: false,
    timer: null,

    /**
     * Update the UI based on the current game state.
     */
    updateUI() {
        UI.message.textContent = this.started ? '' : 'Start playing';
        UI.timer.textContent = this.timeLeft.toString();
        UI.score.textContent = this.calculateScore().toString();
    },

    /**
     * Calculate the total score based on hits and misses.
     * @returns {number} The total score.
     */
    calculateScore() {
        return this.hits * CONFIG.scorePerHit - this.misses * CONFIG.penaltyPerMiss;
    },

    /**
     * Start the game and initialize the timer.
     */
    start() {
        this.started = true;
        this.timer = setInterval(() => {
            this.timeLeft -= 1;
            this.updateUI();

            if (this.timeLeft <= 0) {
                this.end();
            }
        }, 1000);
    },

    /**
     * End the game and display the game over screen.
     */
    end() {
        this.started = false;
        clearInterval(this.timer);
        UI.message.textContent = 'Game over';
        UI.gameOverScore.textContent = this.calculateScore().toString();
        UI.gameOverOverlay.style.display = 'flex';
        disableButtonsTemporarily();
        initializeNameInput();
    },
};

const UI = {
    timer: document.querySelector('.timer--value'),
    score: document.querySelector('.score--value'),
    gameOverOverlay: document.querySelector('.game-over-overlay'),
    gameOverScore: document.querySelector('.game-over-score'),
    nameInput: document.querySelector('.submit-name-input'),
    submitButton: document.querySelector('.submit-button'),
    exitButton: document.querySelector('.exit-button'),
    message: document.querySelector('.status-message'),
    cells: document.querySelectorAll('.cell'),
};

/**
 * Set up all event listeners for the game.
 */
function setupEventListeners() {
    UI.cells.forEach((cell) =>
        cell.addEventListener('click', () => handleCellClick(cell))
    );
    UI.submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        submitScore();
    });
}

/**
 * Initialize the name input with a generated name.
 */
function initializeNameInput() {
    UI.nameInput.value = generateRandomName();
    UI.nameInput.select();
}

/**
 * Temporarily disable buttons to prevent spamming.
 */
function disableButtonsTemporarily() {
    UI.submitButton.setAttribute('disabled', '1');
    UI.exitButton.setAttribute('disabled', '1');

    setTimeout(() => {
        UI.submitButton.removeAttribute('disabled');
        UI.exitButton.removeAttribute('disabled');
    }, CONFIG.buttonDisableDelay);
}

/**
 * Submit the score to the server.
 */
function submitScore() {
    fetch('/', {
        method: 'POST',
        body: JSON.stringify({
            player: UI.nameInput.value,
            score: Game.calculateScore(),
        }),
    })
        .then((response) => {
            if (!response.ok) throw new Error('Failed to submit score');
            return response.json();
        })
        .then(() => (window.location.href = '/?page=highscore'))
        .catch((error) => {
            console.error(error);
        });
}

/**
 * Handle cell click events.
 * @param {HTMLElement} cell - The clicked cell.
 */
function handleCellClick(cell) {
    if (!Game.started) {
        Game.start();
    }
    if (!cell.classList.contains('target')) {
        registerMiss(cell);
    } else {
        registerHit(cell);
    }
    Game.updateUI();
}

/**
 * Register a miss and animate the cell.
 * @param {HTMLElement} cell - The clicked cell.
 */
function registerMiss(cell) {
    Game.misses += 1;
    animateCell(cell, 'miss');
}

/**
 * Register a hit and add a new target.
 * @param {HTMLElement} cell - The clicked cell.
 */
function registerHit(cell) {
    Game.hits += 1;
    cell.classList.remove('target');
    addTarget();
    animateCell(cell, 'hit');
}

/**
 * Animate cell on hit or miss.
 * @param {HTMLElement} cell - The cell to animate.
 * @param {string} type - The type of animation (hit/miss).
 */
function animateCell(cell, type) {
    cell.classList.add(type);
    cell.addEventListener('transitionend', () => cell.classList.remove(type), { once: true });
}

/**
 * Add a new target randomly on the grid.
 */
function addTarget() {
    let index;
    do {
        index = randomBetween(0, UI.cells.length - 1);
    } while (UI.cells[index].classList.contains('target'));

    UI.cells[index].classList.add('target');
}

/**
 * Generate a random integer between min and max (inclusive).
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} A random integer.
 */
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random name.
 * @returns {string} A random name.
 */
function generateRandomName() {
    const firstPart = ['Turbo', 'Fluffy', 'Mega', 'Captain', 'Hyper', 'Grumpy', 'Sassy'];
    const secondPart = ['Banana', 'Muffin', 'Penguin', 'Noodle', 'Taco', 'Spoon', 'Sloth'];
    return `${firstPart[randomBetween(0, firstPart.length - 1)]}${secondPart[randomBetween(0, secondPart.length - 1)]}`;
}

/**
 * Initialize game setup.
 */
function initializeGame() {
    setupEventListeners();
    UI.cells.item(44).classList.add('target');
    UI.cells.item(55).classList.add('target');
    Game.updateUI();
}

// Initialize game on load
initializeGame();
