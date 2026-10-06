// Все рисунки для игры (12 штук)
const allImages = [
    'images/img1.jpg',
    'images/img2.jpg',
    'images/img3.jpg',
    'images/img4.jpg',
    'images/img5.jpg',
    'images/img6.jpg',
    'images/img7.jpg',
    'images/img8.jpg',
    'images/img9.jpg',
    'images/img10.jpg',
    'images/img11.jpg',
    'images/img12.jpg'
];

// Настройки уровней
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

// Элементы
const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const pairsFoundDisplay = document.getElementById('pairs-found');
const pairsTotalDisplay = document.getElementById('pairs-total');
const winMessage = document.getElementById('win-message');
const finalMoves = document.getElementById('final-moves');
const restartBtn = document.getElementById('restart-btn');
const levelBtns = document.querySelectorAll('.level-btn');
const soundToggle = document.getElementById('sound-toggle');

// Звуки
const bgMusic = document.getElementById('bg-music');
const clickSound = document.getElementById('click-sound');
const matchSound = document.getElementById('match-sound');
const winSound = document.getElementById('win-sound');

// Установка громкости
bgMusic.volume = 0.2;
clickSound.volume = 0.5;
matchSound.volume = 0.6;
winSound.volume = 0.7;

// Перемешивание массива
function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Воспроизведение звука
function playSound(audio) {
    if (!soundEnabled) return;
    audio.currentTime = 0;
    audio.play().catch(e => console.log('Звук не воспроизведён:', e));
}

// Запуск игры
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

    // Запускаем фоновую музыку
    if (soundEnabled && bgMusic.paused) {
        bgMusic.play().catch(e => console.log('Фон не запущен:', e));
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

// Переворот карточки
function flipCard(card) {
    if (lockBoard) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;

    playSound(clickSound); // Звук клика

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

// Проверка совпадения
function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.image === card2.dataset.image;

    if (isMatch) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        pairsFound++;
        pairsFoundDisplay.textContent = pairsFound;
        flippedCards = [];

        playSound(matchSound); // Звук совпадения

        if (pairsFound === levels[currentLevel].pairs) {
            setTimeout(() => {
                finalMoves.textContent = moves;
                winMessage.classList.add('active');
                playSound(winSound); // Звук победы
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

// Обработчики кнопок
levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        startGame(parseInt(btn.dataset.level));
    });
});

restartBtn.addEventListener('click', () => {
    startGame(currentLevel);
});

// Переключение звука
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

// Запуск игры при загрузке
startGame(1);

// Запуск фоновой музыки после первого клика (браузеры блокируют автозапуск)
document.addEventListener('click', function startBgMusic() {
    if (soundEnabled && bgMusic.paused) {
        bgMusic.play().catch(e => console.log(e));
    }
    document.removeEventListener('click', startBgMusic);
}, { once: true });