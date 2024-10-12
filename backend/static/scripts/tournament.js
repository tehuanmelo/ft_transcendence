// tournament.js - code for PONG tournament

function registerPlayers(players) {
    console.log('Players registered:', players);
}

function updateTournamentBracket(players) {
    const bracket = document.getElementById('tournament-bracket');
    bracket.innerHTML = ''; // Clear existing bracket

    // Simple representation of the bracket
    players.forEach(player => {
        const playerElem = document.createElement('div');
        playerElem.textContent = player;
        playerElem.classList.add('bracket-player');
        bracket.appendChild(playerElem);
    });

    // Optionally update tournament progress
    updateTournamentProgress([]);
}

function updateTournamentProgress(matches) {
    const progressList = document.getElementById('progress-list');
    progressList.innerHTML = ''; // Clear existing progress

    matches.forEach(match => {
        const matchElem = document.createElement('li');
        matchElem.textContent = `${match.player1} vs ${match.player2} - ${match.status}`;
        progressList.appendChild(matchElem);
    });
}


function tournamentInit() {
    // select tournament settings (difficulty and score to win)
    const tournamentModal = new bootstrap.Modal('#tournamentModal');
    tournamentModal.show();

    const tournamentForm = document.getElementById('tournament-form');
    tournamentForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Collect player aliases
        const alias1 = document.getElementById('alias1').value.trim();
        const alias2 = document.getElementById('alias2').value.trim();
        const alias3 = document.getElementById('alias3').value.trim();
        const alias4 = document.getElementById('alias4').value.trim();

        // Build the players array
        const players = [alias1, alias2, alias3, alias4];

        // Logic to register players and update the bracket
        registerPlayers(players);
        // updateTournamentBracket(players);

        // Close the modal after registration
        tournamentModal.hide();
    });
}
