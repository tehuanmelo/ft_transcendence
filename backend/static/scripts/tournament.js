// tournament.js - code for PONG tournament

function registerPlayers(players) {
    console.log('Players registered:', players);
}

function updateTournamentTable(players) {
    const tableBody = document.getElementById('tournament-body');
    tableBody.innerHTML = ''; // Clear existing table content

    let matchNumber = 1;

    for (let i = 0; i < players.length; i += 2) {
        const row = document.createElement('tr');

        // Player 1 and Player 2
        const player1 = players[i];
        const player2 = players[i + 1] || "Bye"; // Handle case where there's an odd number of players

        // Match row elements
        const matchCell = document.createElement('td');
        matchCell.textContent = matchNumber++;

        const player1Cell = document.createElement('td');
        player1Cell.textContent = player1;

        const player2Cell = document.createElement('td');
        player2Cell.textContent = player2;

        const winnerCell = document.createElement('td');
        winnerCell.textContent = ''; // Initially, no winner is selected

        // Append cells to row
        row.appendChild(matchCell);
        row.appendChild(player1Cell);
        row.appendChild(player2Cell);
        row.appendChild(winnerCell);

        // Append row to table body
        tableBody.appendChild(row);
    }
}

function tournamentInit() {
    // select tournament settings (difficulty and score to win)
    const tournamentModal = new bootstrap.Modal('#tournamentModal');
    tournamentModal.show();

    const tournamentForm = document.getElementById('tournament-form');
    tournamentForm.addEventListener('submit', (event) => {
        event.preventDefault();

        tournamentForm.classList.remove('was-validated');

        const alias1 = document.getElementById('alias1').value.trim();
        const alias2 = document.getElementById('alias2').value.trim();
        const alias3 = document.getElementById('alias3').value.trim();
        const alias4 = document.getElementById('alias4').value.trim();

        const players = [alias1, alias2, alias3, alias4];

        tournamentForm.classList.add('was-validated');

        registerPlayers(players);

        updateTournamentTable(players);

        tournamentModal.hide();
        document.getElementById('tournament').style.display = 'block';
    });
}
