const gameBoard = document.getElementById('game-board');
const movesElement = document.getElementById('moves');
const timeElement = document.getElementById('time');
const livesElement = document.getElementById('lives');
const bestTimeElement = document.getElementById('best-time');

const allEmojis = ['🍎', '🍊', '🍇', '🍉', '🍌', '🍒', '🍓', '🥝', '🍍', '🥭', '🥑', '🌽'];
let firstCard, secondCard;
let hasFlippedCard = false;
let lockBoard = false;
let moves = 0, matchCount = 0, seconds = 0, lives = 10;
let timer, currentLevel = 'medium', isTimeAttack = false;
let peekLeft = 1, freezeLeft = 1;

const levels = {
    easy: { pairs: 6, class: 'easy' },
    medium: { pairs: 8, class: 'medium' },
    hard: { pairs: 12, class: 'hard' }
};

// --- Is function ko script.js mein replace kar do ---

function startGame(level) {
    currentLevel = level; // Level update karein
    isTimeAttack = document.getElementById('timeAttackMode').checked;
    
    // UI: Active button ka color badlein
    document.querySelectorAll('.btn-level').forEach(btn => {
        btn.classList.remove('active');
        // Button ke text ke hisab se match karein
        if(btn.innerText.toLowerCase() === level.toLowerCase()) {
            btn.classList.add('active');
        }
    });

    // Reset Stats
    [moves, matchCount, peekLeft, freezeLeft] = [0, 0, 1, 1];
    lives = 10;
    
    // Time Attack Check
    if (isTimeAttack) {
        if(level === 'easy') seconds = 30;
        else if(level === 'medium') seconds = 45;
        else seconds = 60;
        timeElement.style.color = "#e74c3c";
    } else {
        seconds = 0;
        timeElement.style.color = "white";
    }
    
    movesElement.innerText = moves;
    livesElement.innerText = lives;
    timeElement.innerText = seconds + 's';
    
    // Powerup UI Reset
    const pBtn = document.getElementById('btn-peek');
    const fBtn = document.getElementById('btn-freeze');
    pBtn.disabled = false; pBtn.innerText = "👁️ Peek (1)";
    fBtn.disabled = false; fBtn.innerText = "❄️ Freeze (1)";

    // Best Score Load
    let best = localStorage.getItem(`best-${level}`);
    bestTimeElement.innerText = best ? best + 's' : '-';

    clearInterval(timer);
    renderCards(levels[level]); // Yahan grid update hogi
    startTimer();
}

function renderCards(config) {
    // Board ki class badlein (easy, medium, hard)
    gameBoard.className = `memory-game ${config.class}`;
    gameBoard.innerHTML = '';
    
    // Level ke hisab se emojis lein
    const gameEmojis = allEmojis.slice(0, config.pairs);
    const deck = [...gameEmojis, ...gameEmojis].sort(() => Math.random() - 0.5);

    deck.forEach(emoji => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.innerHTML = `<div class="front-face">${emoji}</div><div class="back-face">?</div>`;
        card.onclick = flipCard;
        gameBoard.appendChild(card);
    });
}

function startTimer() {
    timer = setInterval(() => {
        isTimeAttack ? seconds-- : seconds++;
        timeElement.innerText = seconds + 's';
        if (isTimeAttack && seconds <= 0) gameOver(false);
    }, 1000);
}

function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flip');
    document.getElementById('flipSound').play();

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    movesElement.innerText = moves;
    checkMatch();
}

function checkMatch() {
    let isMatch = firstCard.innerHTML === secondCard.innerHTML;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    document.getElementById('matchSound').play();
    matchCount++;
    if (matchCount === levels[currentLevel].pairs) gameOver(true);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    lives--;
    livesElement.innerText = lives;
    if (lives <= 0) gameOver(false);

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function usePowerUp(type) {
    if (type === 'peek' && peekLeft > 0) {
        peekLeft--;
        document.getElementById('btn-peek').disabled = true;
        const cards = document.querySelectorAll('.memory-card:not(.flip)');
        cards.forEach(c => c.classList.add('flip'));
        setTimeout(() => {
            cards.forEach(c => c.classList.remove('flip'));
        }, 1200);
    } else if (type === 'freeze' && freezeLeft > 0 && isTimeAttack) {
        freezeLeft--;
        document.getElementById('btn-freeze').disabled = true;
        clearInterval(timer);
        setTimeout(startTimer, 5000);
    }
}

function gameOver(won) {
    clearInterval(timer);
    if (won) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        document.getElementById('winSound').play();
        localStorage.setItem(`best-${currentLevel}`, seconds);
        alert("You Won! 🎉");
    } else {
        alert("Game Over! 💀");
    }
    startGame(currentLevel);
}

startGame('medium');