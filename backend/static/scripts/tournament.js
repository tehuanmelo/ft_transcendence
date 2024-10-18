// tournamentInit.js

//TODO rework this entire file

let selectedMode = 'Medium'; // Default value
let scoreToWin = 7; // Default score
let currentRound = 0; // Track the current round
let matches = []; // Store the current matches

function startTournament(players) {
    startGame(players, true);
}

function handleDropdown() {
    const modeDropdown = document.querySelector('#tournamentSettings .dropdown-toggle');
    const dropdownItems = document.querySelectorAll('#tournamentSettings .dropdown-item');

    dropdownItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();

            selectedMode = event.target.textContent;
            modeDropdown.textContent = selectedMode; // Update the displayed text on the button
        });
    });
}

function handleScoreSlider() {
    const scoreSlider = document.getElementById('scoreSlider');
    scoreSlider.addEventListener('input', (event) => {
        scoreToWin = event.target.value;
        document.getElementById('scoreDisplay').innerText = scoreToWin;
    });
}

function tournamentInit() {
    // TODO select tournament settings (difficulty and score to win)
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
