/* --- 1. SELECCIÓN DE ELEMENTOS DEL DOM --- */
// Elementos del Juego
const player = document.getElementById('player');
const enemie = document.getElementById('enemie');
const gameArea = document.getElementById('game-area');
const pauseOverlay = document.getElementById('pause-overlay');
const startButton = document.getElementById('start-button');
const gameMusic = document.getElementById('game-music');

// Elementos del Formulario de Configuración
const settingsForm = document.getElementById('settings-form');
const settingsButton = document.getElementById('settings-toggle-button');
const settingsArea = document.getElementById('settings-area');

// Controles del Formulario
const playerSpeedInput = document.getElementById('player-speed');
const enemieSpeedInput = document.getElementById('enemie-speed');
const darkModeInput = document.getElementById('dark-mode');
const enemieImageSelect = document.getElementById('enemie-image');
const musicTrackSelect = document.getElementById('music-track');
const musicVolumeInput = document.getElementById('music-volume');

/* --- 2. ESTADO Y CONFIGURACIÓN DEL JUEGO --- */
// Posiciones
let playerPosition = { x: 100, y: 100 };
let enemiePosition = { x: 300, y: 300 };

// Configuración de Velocidad
let playerSpeed = 40;
let enemieSpeed = 1;

// Configuración de Gráficos
let currentEnemieImageUrl = 'ASSETS/domori.png';
const lightBgColor = '#f0f0f0';
const darkBgColor = '#333333';

// Configuración de Audio
let currentMusicTrack = 'ASSETS/MUSIC/track1.mp3';
let currentVolume = 0.5;

// Variables de Estado
let isPaused = false;
let gameStarted = false;
let animationFrameId;

/* --- 3. INICIALIZACIÓN --- */
// Esta función establece los valores iniciales y prepara el juego.
function initializeGame() {
    // Establecer valores iniciales en el formulario
    playerSpeedInput.value = playerSpeed;
    enemieSpeedInput.value = enemieSpeed;
    darkModeInput.checked = false; 
    enemieImageSelect.value = currentEnemieImageUrl;
    musicTrackSelect.value = currentMusicTrack;
    musicVolumeInput.value = currentVolume;

    // Aplicar estilos y audio inicial
    gameArea.style.backgroundColor = lightBgColor;
    enemie.style.backgroundImage = `url('${currentEnemieImageUrl}')`;
    gameMusic.src = currentMusicTrack;
    gameMusic.volume = currentVolume;

    // Reiniciar posiciones visuales y overlays
    updatePositions();
    pauseOverlay.classList.remove('visible');
    
    // El juego no inicia hasta que se presiona START
}

// Arrancar la inicialización al cargar la página
initializeGame();

/* --- 4. EVENT LISTENERS (ESCUCHADORES DE EVENTOS) --- */
// Inicia el juego
startButton.addEventListener('click', () => {
    if (!gameStarted && !isPaused) {
        console.log("¡Juego Iniciado!");
        gameStarted = true;
        playMusic();
        gameLoop();
    }
});

// Aplica los cambios del formulario de configuración
settingsForm.addEventListener('submit', (event) => {
    event.preventDefault(); 

    // Actualizar Velocidades
    playerSpeed = parseFloat(playerSpeedInput.value);
    enemieSpeed = parseFloat(enemieSpeedInput.value);

    // Actualizar Modo Oscuro
    if (darkModeInput.checked) {
        gameArea.style.backgroundColor = darkBgColor;
    } else {
        gameArea.style.backgroundColor = lightBgColor;
    }

    // Actualizar Enemigo
    currentEnemieImageUrl = enemieImageSelect.value;
    enemie.style.backgroundImage = `url('${currentEnemieImageUrl}')`;

    // Actualizar Música y Volumen
    currentVolume = musicVolumeInput.value;
    gameMusic.volume = currentVolume;
    
    const newTrack = musicTrackSelect.value;
    if (newTrack !== currentMusicTrack) {
        currentMusicTrack = newTrack;
        gameMusic.src = currentMusicTrack;
        if (gameStarted) {
            playMusic();
        }
    }

    alert('¡Configuración actualizada!');
    settingsArea.classList.remove('visible');
    
    if (isPaused) {
        togglePause(); 
    }
});

// Muestra/oculta el panel de configuración
settingsButton.addEventListener('click', () => {
    settingsArea.classList.toggle('visible');
    
    // Solo pausar/despausar si el juego ya ha iniciado
    if (gameStarted) {
        if (settingsArea.classList.contains('visible')) {
            if (!isPaused) {
                togglePause();
            }
        } else {
            if (isPaused) {
                togglePause();
            }
        }
    }
});

// Maneja las entradas de teclado (Movimiento y Pausa)
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (!gameStarted) return; // No pausar si el juego no ha iniciado
        
        if (settingsArea.classList.contains('visible')) {
            settingsArea.classList.remove('visible');
            if (isPaused) {
                togglePause();
            }
        } else {
            togglePause();
        }
        return; 
    }
    
    // No mover si el juego está pausado o no ha iniciado
    if (isPaused || !gameStarted) return;
    
    switch (event.key) {
        case 'ArrowUp':
            if (playerPosition.y > 0) playerPosition.y -= playerSpeed;
            break;
        case 'ArrowDown':
            if (playerPosition.y < gameArea.clientHeight - 50) playerPosition.y += playerSpeed;
            break;
        case 'ArrowLeft':
            if (playerPosition.x > 0) playerPosition.x -= playerSpeed;
            break;
        case 'ArrowRight':
            if (playerPosition.x < gameArea.clientWidth - 50) playerPosition.x += playerSpeed;
            break;
    }
    updatePositions();
});

/* --- 5. LÓGICA CENTRAL DEL JUEGO --- */
// Bucle principal del juego
function gameLoop() {
    if (isPaused || !gameStarted) return; // No correr si está pausado o terminado
    
    moveEnemie();
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Mueve al enemigo hacia el jugador
function moveEnemie() {
    if (enemiePosition.x < playerPosition.x) {
        enemiePosition.x += enemieSpeed;
    } else if (enemiePosition.x > playerPosition.x) {
        enemiePosition.x -= enemieSpeed;
    }
    if (enemiePosition.y < playerPosition.y) {
        enemiePosition.y += enemieSpeed;
    } else if (enemiePosition.y > playerPosition.y) {
        enemiePosition.y -= enemieSpeed;
    }
    
    updatePositions();
    checkCollision();
}

// Revisa si el jugador y el enemigo colisionaron
function checkCollision() {
    if (Math.abs(playerPosition.x - enemiePosition.x) < 50 &&
        Math.abs(playerPosition.y - enemiePosition.y) < 50 &&
        !isPaused && gameStarted) { 
        
        // Detener el juego
        cancelAnimationFrame(animationFrameId);
        gameStarted = false;
        
        // Detener la música
        gameMusic.pause();
        gameMusic.currentTime = 0;

        alert('¡enemie te atrapó!');
        
        // Reiniciar posiciones
        playerPosition = { x: 100, y: 100 };
        enemiePosition = { x: 300, y: 300 };
        updatePositions(); 
        
        // El juego ahora espera a que se presione START de nuevo
    }
}

// Actualiza la posición visual de los personajes en la pantalla
function updatePositions() {
    player.style.transform = `translate(${playerPosition.x}px, ${playerPosition.y}px)`;
    enemie.style.transform = `translate(${enemiePosition.x}px, ${enemiePosition.y}px)`;
}

/* --- 6. FUNCIONES UTILITARIAS --- */
// Pausa o reanuda el juego (llamado por Escape y el menú)
function togglePause() {
    if (!gameStarted) return;
    isPaused = !isPaused; 

    if (isPaused) {
        // Pausar
        cancelAnimationFrame(animationFrameId);
        pauseOverlay.classList.add('visible'); 
        gameMusic.pause(); 
        console.log("Juego Pausado (por Jugador)");
    } else {
        // Reanudar
        console.log("Juego Reanudado");
        pauseOverlay.classList.remove('visible'); 
        playMusic(); 
        gameLoop();
    }
}

// Reproduce la pista de música seleccionada
function playMusic() {
    if (currentMusicTrack === "none") {
        gameMusic.pause();
    } else {
        // El .catch() evita errores si el navegador bloquea el autoplay
        gameMusic.play().catch(error => console.log("Se necesita interacción para reproducir música."));
    }
}