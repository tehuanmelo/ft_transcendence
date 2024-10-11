document.getElementById('tournament-form').addEventListener('submit', (event) => {
    event.preventDefault();

    // Collect player aliases
    const alias = document.getElementById('alias').value.trim();
    const friend1 = document.getElementById('friend1').value.trim();
    const friend2 = document.getElementById('friend2').value.trim();
    const friend3 = document.getElementById('friend3').value.trim();

    // Build the players array
    const players = [alias, friend1];
    if (friend2) players.push(friend2);
    if (friend3) players.push(friend3);

    if (players.length < 2 || players.length > 4) {
        alert('You must have between 2 and 4 players to register!');
        return;
    }

    // Logic to register players and update the bracket
    registerPlayers(players);
    updateTournamentBracket(players);

    // Close the modal after registration
    const registrationModal = bootstrap.Modal.getInstance(document.getElementById('registrationModal'));
    registrationModal.hide();
});

function registerPlayers(players) {
    // Implement backend API call or logic to register players
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