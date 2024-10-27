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
            cellDiv.className = 'cell';
            cellDiv.textContent = cell;
            cellDiv.addEventListener('click', () => makeMove(rowIndex, colIndex));
            boardDiv.appendChild(cellDiv);
        });
    });
    gameContainer.appendChild(boardDiv);
    document.getElementById('ttt').style.display = 'block';
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
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

