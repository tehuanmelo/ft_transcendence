// tictactoe.js

let gameId = null;
let currentPlayer = 'X';
let gameEnded = false;

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

function renderBoard(board) {
    if (!board) return;

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

            if (!gameEnded)
                cellDiv.style.cursor = currentPlayer === 'X' ? 'url(/static/images/cursor-x.svg), auto' : 'url(/static/images/cursor-o.svg), auto';
            else
                cellDiv.style.cursor = 'default';

            boardDiv.appendChild(cellDiv);
        });
    });
    gameContainer.appendChild(boardDiv);
    document.getElementById('ttt').style.display = 'flex';
    document.getElementById('current-player').textContent = `Current Player: ${currentPlayer}`;
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
            gameEnded = false;
            renderBoard(data.board);
            document.getElementById('result').textContent = '';
            document.getElementById('player2-name').textContent = formData.get('opponent_name');
            document.getElementById('current-player').textContent = `Current Player: ${currentPlayer}`;
            // TODO handle data.error
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function makeMove(rowIndex, colIndex) {
    if (gameEnded) return;

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
            if (data.winner) {
                document.getElementById('result').textContent = `${data.winner} wins!`;
                gameEnded = true;
            }
            else if (data.draw) {
                document.getElementById('result').textContent = `It's a draw!`;
                gameEnded = true;
            }
            else
                document.getElementById('result').textContent = '';

            currentPlayer = data.current_player;
            renderBoard(data.board);
            document.getElementById('current-player').textContent = `Current Player: ${currentPlayer}`;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
