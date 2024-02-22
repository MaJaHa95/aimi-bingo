document.addEventListener('DOMContentLoaded', () => {
    const titles = [
      "Speaks 3+ languages", "Has traveled to more than 3 continents", "Likes to do art", "Has visited a national park", "Has met someone famous",
      "Has lived in a different region or country", "Enjoys cooking traditional dishes", "Has completed an endurance race", "Is left-handed", "Likes the same genre of music",
      "Has the same favorite childhood game / toy", "Has taken a dance class", "BINGO!", "Has gone camping in the past year", "Is the oldest sibling",
      "Loves podcasts", "Is involved in a social cause", "Can play a musical instrument or sing", "Shares the same birthday month", "Enjoys baking",
      "Enjoys gardening", "Has the same favorite sport team", "Has a pet", "Has the same favorite food", "Drives a hybrid car"
    ];
    const bingoContainer = document.getElementById('bingo-container');
  
    titles.forEach(title => {
      const cell = document.createElement('div');
      cell.textContent = title;
      cell.classList.add('bingo-cell');
      cell.addEventListener('click', () => {
        cell.classList.toggle('selected');
        checkBingo();
      });
      bingoContainer.appendChild(cell);
    });
  
    function checkBingo() {
      const cells = document.querySelectorAll('.bingo-cell');
      const selectedCells = [...cells].map(cell => cell.classList.contains('selected'));
      const gridSize = 5;
      let bingo = false;
  
      // Check rows and columns
      for (let i = 0; i < gridSize; i++) {
        let rowSelected = true;
        let colSelected = true;
        for (let j = 0; j < gridSize; j++) {
          if (!selectedCells[i * gridSize + j]) rowSelected = false;
          if (!selectedCells[j * gridSize + i]) colSelected = false;
        }
        if (rowSelected || colSelected) bingo = true;
      }
  
      // Check diagonals
      let diag1Selected = true;
      let diag2Selected = true;
      for (let i = 0; i < gridSize; i++) {
        if (!selectedCells[i * gridSize + i]) diag1Selected = false;
        if (!selectedCells[i * gridSize + (gridSize - i - 1)]) diag2Selected = false;
      }
      if (diag1Selected || diag2Selected) bingo = true;
  
      // If bingo, alert the user
      if (bingo) alert('Bingo!');
    }
  });
  