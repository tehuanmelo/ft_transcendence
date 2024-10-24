// pongInit.js

function gameInit() {
    const usernameElement = document.querySelector('meta[name="username"]');
    const username = usernameElement ? usernameElement.getAttribute('content') : null;

    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');

    const gameModes = [
        { mode: '1v1', isLoggedIn: true, players: 2 },
        { mode: '2v2', isLoggedIn: true, players: 4 },
        { mode: 'guest', isLoggedIn: false, players: 2 },
        { mode: 'tournament', isLoggedIn: true, players: 4 },
    ];

    const selectedMode = gameModes.find(gameMode => gameMode.mode === mode);
    if (!selectedMode) {
        getPage('404');
        return;
    }

    const isLoggedIn = (username !== null);
    if (selectedMode.isLoggedIn && !isLoggedIn) {
        getPage('404');
        return;
    }
    else if (!selectedMode.isLoggedIn && isLoggedIn) {
        getPage('404');
        return;
    }

    const modalTitle = document.getElementById('pongRegisterModalLabel');
    modalTitle.textContent = selectedMode.mode;
    if (selectedMode.mode === 'guest' || selectedMode.mode === 'tournament')
        modalTitle.textContent = selectedMode.mode[0].toUpperCase() + selectedMode.mode.slice(1);

    handleGameRegisterModal(selectedMode, username, selectedMode.mode === 'tournament');
}

function handleGameRegisterModal(mode, username, isTournament) {
    const pongRegisterModal = new bootstrap.Modal('#pongRegisterModal');
    const playerInputs = [
        { divId: 'player1Div', inputId: 'player1Input', visible: isTournament || !mode.isLoggedIn },
        { divId: 'player2Div', inputId: 'player2Input', visible: true },
        { divId: 'player3Div', inputId: 'player3Input', visible: mode.players === 4 },
        { divId: 'player4Div', inputId: 'player4Input', visible: mode.players === 4 },
    ];

    let playerNames = [];
    if (mode.isLoggedIn && !isTournament)
        playerNames.push(username);

    const gameRegisterForm = document.getElementById('gameRegisterForm');
    generateGameRegisterForm(gameRegisterForm, playerInputs, isTournament);

    // Game settings handlers
    handleDifficultyDropdown();
    handleScoreSlider();

    pongRegisterModal.show();

    gameRegisterForm.addEventListener('submit', (event) => {
        event.preventDefault();

        playerInputs.forEach(({ inputId, visible }) => {
            if (visible) {
                const playerName = document.getElementById(inputId).value.trim();
                if (playerName) playerNames.push(playerName);
            }
        });

        pongRegisterModal.hide();

        updatePlayerDisplay(playerNames, !isTournament);
        launchGame(playerNames, isTournament);
    });
}

function updatePlayerDisplay(playerNames, isNotTournament) {
    document.getElementById('player1name').innerText = truncateName(playerNames[0]);
    document.getElementById('player2name').innerText = truncateName(playerNames[1]);
    if (playerNames.length === 4 && isNotTournament) {
        document.getElementById('player3name').innerText = truncateName(playerNames[2]);
        document.getElementById('player4name').innerText = truncateName(playerNames[3]);
    }
}

function truncateName(name) {
    return name.length > 5 ? `${name.slice(0, 5)}.` : name;
}

function handleDifficultyDropdown() {
    const difficultyDropdown = document.querySelector('#gameSettings .dropdown-toggle');
    const dropdownItems = document.querySelectorAll('#gameSettings .dropdown-item');

    dropdownItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();

            const selectedDiff = event.target.textContent;

            if (selectedDiff in gameConfig) {
                g_PADDLE_SPEED = gameConfig[selectedDiff].paddleSpeed;
                g_BALL_SPEED = gameConfig[selectedDiff].ballSpeed;
            }
            else if (selectedDiff === "Custom")
                document.getElementById("customConfig").style.display = "block";
            else {
                alert('Invalid difficulty level selected');
                getPage('404');
            }

            difficultyDropdown.textContent = selectedDiff;
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

function generateGameRegisterForm(gameRegisterForm, playerInputs, isTournament) {
    gameRegisterForm.innerHTML = '';

    // Create fields depending on visibility
    playerInputs.forEach(({ divId, inputId, visible }) => {
        if (visible) {
            // Create the div element for the input field
            const playerDiv = document.createElement('div');
            playerDiv.className = 'mb-1';
            playerDiv.id = divId;

            // Create the label element
            const label = document.createElement('label');
            label.htmlFor = inputId;
            label.className = 'form-label silk-heavy';
            label.textContent = `${inputId[0].toUpperCase() + inputId.slice(1, -6)} ${inputId.slice(6, -5)}`;
            if (!(isTournament && divId === 'player4Div'))
                label.textContent += '*';

            // Create the input field
            const input = document.createElement('input');
            input.type = 'text';
            input.id = inputId;
            input.className = 'form-control';
            input.required = true;
            input.pattern = '[a-zA-Z0-9_]+';
            input.maxLength = 20;
            input.placeholder = 'Enter your name here';
            if (isTournament && divId === 'player4Div')
                input.placeholder += ' (Optional)';

            // Append elements to the div
            playerDiv.appendChild(label);
            playerDiv.appendChild(input);

            // Append the div to the form container
            gameRegisterForm.appendChild(playerDiv);
        }
    });
}
