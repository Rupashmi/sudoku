const boardElement = document.getElementById('board');
const timeDisplay = document.getElementById('timer');
const statsElement = document.getElementById('stats');
const levelSelect = document.getElementById('difficulty');
let correctSolution = [];
let startTime = Date.now();
let timeTracker;
let totalWins = 0;
function updateStatsDisplay() {
  totalWins = +localStorage.getItem('completedPuzzles') || 0;
  statsElement.innerText = `Puzzles Completed: ${totalWins}`;
}
function showTimer() {
  const secondsPassed = Math.floor((Date.now() - startTime) / 1000);
  timeDisplay.innerText = `Time: ${secondsPassed}s`;
}
function canPlaceNumber(grid, row, col, value) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === value || grid[i][col] === value) return false;
  }
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxStartRow + i][boxStartCol + j] === value) return false;
    }
  }
  return true;
}
function fillBoard(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (let num of numbers) {
          if (canPlaceNumber(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillBoard(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function makeEmptyGrid() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function hideCells(solutionGrid, visible = 40) {
  const puzzleGrid = solutionGrid.map(row => row.slice());
  let toHide = 81 - visible;
  while (toHide > 0) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzleGrid[r][c] !== 0) {
      puzzleGrid[r][c] = 0;
      toHide--;
    }
  }
  return puzzleGrid;
}

function getCluesFromDifficulty(difficulty) {
  if (difficulty === 'easy') return 45;
  if (difficulty === 'medium') return 35;
  return 28;
}

function startNewGame() {
  clearInterval(timeTracker);
  boardElement.innerHTML = '';
  const chosenLevel = levelSelect.value;
  const baseGrid = makeEmptyGrid();
  fillBoard(baseGrid);
  correctSolution = baseGrid.map(row => row.slice());
  const puzzleGrid = hideCells(baseGrid, getCluesFromDifficulty(chosenLevel));
  startTime = Date.now();
  timeTracker = setInterval(showTimer, 1000);
  drawSudokuBoard(puzzleGrid);
}

function drawSudokuBoard(puzzle) {
  puzzle.forEach((row, rowIdx) => {
    row.forEach((num, colIdx) => {
      const square = document.createElement('input');
      square.setAttribute('data-row', rowIdx);
      square.setAttribute('data-col', colIdx);

      if (num !== 0) {
        square.value = num;
        square.classList.add('prefilled');
        square.disabled = true;
      } else {
        square.addEventListener('input', () => {
          square.classList.remove('invalid');
          const value = parseInt(square.value);
          if (isNaN(value) || value < 1 || value > 9) square.value = '';
        });
      }

      boardElement.appendChild(square);
    });
  });
}

function checkPlayerInput() {
  const cells = boardElement.querySelectorAll('input');
  let isCorrect = true;
  cells.forEach(input => {
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);
    const val = parseInt(input.value);

    if (!input.disabled && val !== correctSolution[row][col]) {
      input.classList.add('invalid');
      isCorrect = false;
    } else {
      input.classList.remove('invalid');
    }
  });

  if (isCorrect) {
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    alert(`🎉🏆 You solved it!! Time: ${totalTime}s`);
    totalWins++;
    localStorage.setItem('completedPuzzles', totalWins);
    updateStatsDisplay();
    startNewGame();
  } else {
    alert('❌❌❌ Incorrect cells. Please try again.');
  }
}
function clearUserInputs() {
  if (confirm("Clear the puzzle??")) {
    const changeableCells = boardElement.querySelectorAll('input:not(.prefilled)');
    changeableCells.forEach(cell => {
      cell.value = '';
      cell.classList.remove('invalid');
    });
  }
}
function showOneHint() {
  const squares = boardElement.querySelectorAll('input');
  for (let box of squares) {
    const row = parseInt(box.dataset.row);
    const col = parseInt(box.dataset.col);
    if (!box.disabled && box.value === '') {
      box.value = correctSolution[row][col];
      return;
    }
  }
}
function switchTheme() {
  document.body.classList.toggle('dark-mode');
}

window.checkSolution = checkPlayerInput;
window.confirmReset = clearUserInputs;
window.giveHint = showOneHint;
window.toggleTheme = switchTheme;
window.generatePuzzle = startNewGame;

updateStatsDisplay();
startNewGame();
