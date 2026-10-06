// Все рисунки для игры (12 штук) — Стич заменён на маленького Дональда Дака
const allImages = [
    'images/img1.jpg',   // Пикачу
    'images/img2.jpg',   // Губка Боб
    'images/img3.jpg',   // Соник
    'images/img4.jpg',   // Марио
    'images/img5.jpg',   // Гринч
    'images/img6.jpg',   // Белоснежка
    'images/img7.jpg',   // Тигра
    'images/img8.jpg',   // маленький Дональд Дак ← ЗАМЕНА
    'images/img9.jpg',   // Дональд Дак
    'images/img10.jpg',  // Микки Маус
    'images/img11.jpg',  // Минни Маус
    'images/img12.jpg'   // Салли
];

const levels = {
    1: { pairs: 6, images: allImages.slice(0, 6) },
    2: { pairs: 8, images: allImages.slice(0, 8) },
    3: { pairs: 12, images: allImages.slice(0, 12) }
};

let currentLevel = 1;
let moves = 0;
let pairsFound = 0;
let flippedCards = [];
let lockBoard = false;
let soundEnabled = true;

const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const pairsFoundDisplay = document.getElementById('pairs-found');
const pairsTotalDisplay = document.getElementById('pairs-total');
const winMessage = document.getElementById('win-message');
const finalMoves = document.getElementById('final-moves');
const restartBtn = document.getElementById('restart-btn');
const levelBtns = document.querySelectorAll('.level-btn');
const soundToggle = document.getElementById('sound-toggle');

const bgMusic = document.getElementById('bg-music');
const clickSound = document.getElementById('click-sound');
const matchSound = document.getElementById('match-sound');
const winSound = document.getElementById('win-sound');

bgMusic.volume = 0.2;
clickSound.volume = 0.5;
matchSound.volume = 0.6;
winSound.volume = 0.7;

function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function playSound(audio) {
    if (!soundEnabled) return;
    audio.currentTime = 0;
    audio.play().catch(e => console.log(e));
}

function startGame(level) {
    currentLevel = level;
    moves = 0;
    pairsFound = 0;
    flippedCards = [];
    lockBoard = false;

    movesDisplay.textContent = '0';
    pairsFoundDisplay.textContent = '0';
    pairsTotalDisplay.textContent = levels[level].pairs;
    winMessage.classList.remove('active');

    if (soundEnabled && bgMusic.paused) {
        bgMusic.play().catch(e => console.log(e));
    }

    levelBtns.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.level) === level);
    });

    const images = levels[level].images;
    const cards = shuffle([...images, ...images]);

    gameBoard.innerHTML = '';
    gameBoard.className = `game-board level-${level}`;

    cards.forEach((imgSrc, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.image = imgSrc;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-back"></div>
                <div class="card-front">
                    <img src="${imgSrc}" alt="Карточка">
                </div>
            </div>
        `;

        card.addEventListener('click', () => flipCard(card));
        gameBoard.appendChild(card);
    });
}

function flipCard(card) {
    if (lockBoard) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;

    playSound(clickSound);

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.image === card2.dataset.image;

    if (isMatch) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        pairsFound++;
        pairsFoundDisplay.textContent = pairsFound;
        flippedCards = [];

        playSound(matchSound);

        if (pairsFound === levels[currentLevel].pairs) {
            setTimeout(() => {
                finalMoves.textContent = moves;
                winMessage.classList.add('active');
                playSound(winSound);
            }, 600);
        }
    } else {
        lockBoard = true;
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            lockBoard = false;
        }, 1000);
    }
}

levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        startGame(parseInt(btn.dataset.level));
    });
});

restartBtn.addEventListener('click', () => {
    startGame(currentLevel);
});

soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
        soundToggle.textContent = '🔊 Звук вкл';
        soundToggle.classList.remove('muted');
        if (bgMusic.paused) {
            bgMusic.play().catch(e => console.log(e));
        }
    } else {
        soundToggle.textContent = '🔇 Звук выкл';
        soundToggle.classList.add('muted');
        bgMusic.pause();
    }
});

startGame(1);

document.addEventListener('click', function startBgMusic() {
    if (soundEnabled && bgMusic.paused) {
        bgMusic.play().catch(e => console.log(e));
    }
    document.removeEventListener('click', startBgMusic);
}, { once: true });