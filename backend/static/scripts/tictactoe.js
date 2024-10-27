// tictactoe.js

function tictactoeInit() {
    // Show the modal automatically when the page loads
    let opponentModal = new bootstrap.Modal(document.getElementById('opponentModal'));
    opponentModal.show();

    document.getElementById('opponentForm').addEventListener('submit', function (event) {
        event.preventDefault();
        startGame();
        opponentModal.hide();
    });
}

let gameId = null;
let currentPlayer = 'X';

function renderBoard(board) {
    const gameContainer = document.getElementById('game');
    gameContainer.innerHTML = '';

    const boardDiv = document.createElement('div');
    boardDiv.className = 'board';
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = `cell ${cell}`;
            cellDiv.textContent = cell;

            // Only add click listener to empty cells
            if (cell === "")
                cellDiv.addEventListener('click', () => makeMove(rowIndex, colIndex));

            boardDiv.appendChild(cellDiv);
        });
    });
    gameContainer.appendChild(boardDiv);
    document.getElementById('ttt').style.display = 'flex';
}

function startGame() {
    const form = document.getElementById('opponentForm');
    const formData = new FormData(form);

    fetch('/ttt/create/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': formData.get('csrfmiddlewaretoken')
        },
        body: JSON.stringify({ opponent_name: formData.get('opponent_name') })
    })
        .then(response => response.json())
        .then(data => {
            gameId = data.game_id;
            currentPlayer = data.current_player;
            renderBoard(data.board);
            // TODO handle data.error
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function makeMove(rowIndex, colIndex) {
    fetch(`/ttt/move/${gameId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value
        },
        body: JSON.stringify({
            row: rowIndex,
            col: colIndex,
            player: currentPlayer
        })
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            renderBoard(data.board);
            currentPlayer = data.current_player;
            if (data.winner)
                alert(`${data.winner} wins!`)
            // TODO handle data.error
            // TODO handle game draw
        })
        .catch(error => {
            console.error('Error:', error);
        });
}