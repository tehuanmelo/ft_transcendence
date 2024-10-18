// tournamentInit.js

//TODO rework this entire file

let selectedMode = 'Medium'; // Default value
let scoreToWin = 7; // Default score

function startTournament(players) {
    startGame(players, true);
}

function handleDropdown() {
    const difficultyDropdown = document.querySelector('#tournamentSettings .dropdown-toggle');
    const dropdownItems = document.querySelectorAll('#tournamentSettings .dropdown-item');

    dropdownItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();

            selectedMode = event.target.textContent;

            if (selectedMode in gameConfig) {
                g_PADDLE_SPEED = gameConfig[selectedMode].paddleSpeed;
                g_BALL_SPEED = gameConfig[selectedMode].ballSpeed;
            }
            else if (selectedMode === "Custom")
                document.getElementById("customConfig").style.display = "block";
            else
                console.error('Invalid difficulty level selected');

            difficultyDropdown.textContent = selectedMode;
        });
    });
}

function handleScoreSlider() {
    const scoreSlider = document.getElementById('scoreSlider');
    scoreSlider.addEventListener('input', (event) => {
        g_SCORE_TO_WIN = parseInt(event.target.value, 10);
        document.getElementById('scoreDisplay').innerText = g_SCORE_TO_WIN;
    });
}

function tournamentInit() {
    const tournamentModal = new bootstrap.Modal('#tournamentModal');
    tournamentModal.show();

    const playerInputs = ['alias1', 'alias2', 'alias3', 'alias4'];

    let players = [];
    const tournamentForm = document.getElementById('tournamentForm');

    handleDropdown();
    handleScoreSlider();
    tournamentForm.addEventListener('submit', (event) => {
        event.preventDefault();

        tournamentForm.classList.remove('was-validated');

        let allValid = true;
        playerInputs.forEach((inputId) => {
            const inputField = document.getElementById(inputId);
            if (inputField.checkValidity()) {
                inputField.classList.remove('is-invalid');
                inputField.classList.add('is-valid');
            }
            else {
                allValid = false;
                inputField.classList.add('is-invalid');
            }
        });

        playerInputs.forEach((inputId) => {
            const alias = document.getElementById(inputId).value.trim();
            if (alias) players.push(alias);
        });

        if (!allValid) return;
        tournamentForm.classList.add('was-validated');

        startTournament(players);

        tournamentModal.hide();
    });
}
