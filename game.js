let players = [];
let selectedPlayers = [];
let assignedRows = Array(10).fill(null);
let currentPlayerIndex = 0;
let currentGameType = 'goals';  // Default game type

// Row labels and multipliers
const rowLabels = [
  'Career', 'Career', 'Career x2', 'Career x2', 'Career x3',
  'Career x3', 'Career x3', 'Career x4', 'Career x4', 'Career x4'
];

const rowMultipliers = [1, 1, 2, 2, 3, 3, 3, 4, 4, 4];

// Game target values for each type
const gameTargets = {
  goals: 10000,        // Goal target for Goals game
  ucl: 50,             // Target for UCL Titles
  age: 500             // Target for Age game
};

// Function to update the game type
document.getElementById('gameType').addEventListener('change', function(event) {
  currentGameType = event.target.value;
  if (selectedPlayers.length > 0) {
    renderPlayerAssignment();  // Re-render when game type changes
  }
});

fetch('players.txt')
  .then(response => response.text())
  .then(data => {
    players = data.trim().split('\n').map(line => {
      const [name, ucl, goals, age] = line.split(',');
      return {
        name,
        ucl: parseInt(ucl),
        goals: parseInt(goals),
        age: parseInt(age)
      };
    });
  });

function startGame() {
  selectedPlayers = [...players].sort(() => 0.5 - Math.random()).slice(0, 10);
  assignedRows = Array(10).fill(null);
  currentPlayerIndex = 0;

  // Set the goal target based on the selected game type
  goalTarget = gameTargets[currentGameType];

  renderPlayerAssignment();
}

function renderPlayerAssignment() {
  const gameContainer = document.getElementById('game');
  gameContainer.innerHTML = '';

  if (currentPlayerIndex < selectedPlayers.length) {
    const playerInfo = document.createElement('div');
    playerInfo.innerHTML = `<h3 style="color: orange;">Current Player (${currentPlayerIndex + 1}/10): ${selectedPlayers[currentPlayerIndex].name}</h3>`;
    gameContainer.appendChild(playerInfo);
  }

  const board = document.createElement('div');
  board.innerHTML = `<h3>Assign Players to Rows</h3>`;

  for (let i = 0; i < 10; i++) {
    const row = document.createElement('div');
    row.style.padding = '4px 8px';
    row.style.margin = '2px 0';
    row.style.fontSize = '14px';
    row.style.borderRadius = '6px';
    row.style.backgroundColor = '#d0e0ff';

    const assigned = assignedRows[i];
    let content = `<strong>${rowLabels[i]} (Row ${i + 1})</strong>`;

    if (assigned) {
      let statValue = 0;
      let statText = '';

      switch (currentGameType) {
        case 'goals':
          statValue = assigned.goals;
          statText = `Goals: ${assigned.goals}`;
          break;
        case 'ucl':
          statValue = assigned.ucl;
          statText = `UCL Titles: ${assigned.ucl}`;
          break;
        case 'age':
          statValue = assigned.age;
          statText = `Age: ${assigned.age}`;
          break;
      }

      content += `: ${assigned.name} (+${statValue * rowMultipliers[i]} ${currentGameType})`;
      row.style.backgroundColor = '#d0e0ff';
    }

    row.innerHTML = content;

    if (!assigned && currentPlayerIndex < selectedPlayers.length) {
      const btn = document.createElement('button');
      btn.textContent = 'Assign here';
      btn.style.marginLeft = '10px';
      btn.style.padding = '6px 12px';
      btn.style.fontSize = '12px';
      btn.style.backgroundColor = '#4CAF50';
      btn.style.color = 'white';
      btn.style.border = 'none';
      btn.style.borderRadius = '4px';
      btn.style.cursor = 'pointer';
      btn.style.transition = 'background-color 0.3s';
      btn.onclick = () => {
        assignedRows[i] = selectedPlayers[currentPlayerIndex];
        btn.disabled = true;
        btn.style.backgroundColor = '#ADD8E6';
        currentPlayerIndex++;
        renderPlayerAssignment();
      };
      row.appendChild(btn);
    }

    board.appendChild(row);
  }

  gameContainer.appendChild(board);

  if (currentPlayerIndex >= selectedPlayers.length) {
    renderFinalResults();
  }
}
function goToHome() {
  window.location.href = 'index.html'; // reloads the current page
}

function renderFinalResults() {
  const gameContainer = document.getElementById('game');
  const resultDiv = document.createElement('div');
  resultDiv.innerHTML = `<h2>Game Over</h2><p>Goal Target: ${goalTarget}</p>`;

  let total = 0;
  assignedRows.forEach((player, i) => {
    const rowDiv = document.createElement('div');
    rowDiv.style.padding = '4px 8px';
    rowDiv.style.margin = '2px 0';
    rowDiv.style.fontSize = '14px';
    rowDiv.style.borderRadius = '6px';
    rowDiv.style.backgroundColor = '#ffe0e0';

    if (player) {
      let earned = 0;
      switch (currentGameType) {
        case 'goals':
          earned = player.goals * rowMultipliers[i];
          break;
        case 'ucl':
          earned = player.ucl * rowMultipliers[i];
          break;
        case 'age':
          earned = player.age * rowMultipliers[i];
          break;
      }

      total += earned;
      rowDiv.innerHTML = `<strong>${rowLabels[i]} (Row ${i + 1})</strong>: ${player.name} | ${earned}`;
      rowDiv.style.backgroundColor = '#d0e0ff';
    } else {
      rowDiv.innerHTML = `<strong>${rowLabels[i]} (Row ${i + 1})</strong>: No player assigned.`;
      rowDiv.style.backgroundColor = '#ffe0e0';
    }
    resultDiv.appendChild(rowDiv);
  });

  const totalText = document.createElement('p');
  totalText.innerHTML = `<strong style="color: orange;">Total: ${total}</strong>`;
  resultDiv.appendChild(totalText);

  const resultText = document.createElement('h3');
  resultText.textContent = total >= goalTarget ? 'You Win!' : 'You Lose!';
  resultText.style.color = total >= goalTarget ? 'green' : 'red';
  resultDiv.appendChild(resultText);

  const restartBtn = document.createElement('button');
  restartBtn.textContent = 'Play Again';
  restartBtn.onclick = goToHome;
  resultDiv.appendChild(restartBtn);

  gameContainer.appendChild(resultDiv);
}
