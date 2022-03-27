// utils functions
const cloneObject = (object) => JSON.parse(JSON.stringify(object));

// board and ships template
const initialGameBoardTemplate = [
  [[], [], [], [], [], [], [], [], [], []],
  [[], [], [], [], [], [], [], [], [], []],
  [[], [], [], [], [], [], [], [], [], []],
  [[], [], [], [], [], [], [], [], [], []],
  [[], [], [], [], [], [], [], [], [], []],
  [[], [], [], [], [], [], [], [], [], []],
  [[], [], [], [], [], [], [], [], [], []],
  [[], [], [], [], [], [], [], [], [], []],
  [[], [], [], [], [], [], [], [], [], []],
  [[], [], [], [], [], [], [], [], [], []],
];

const initialShipsTemplate = [
  { name: "carrier", cells: 5 },
  { name: "battleship", cells: 4 },
  { name: "destroyer", cells: 3 },
  { name: "submarine", cells: 3 },
  { name: "patrol", cells: 2 },
];

// game state
const gameState = {
  placeShips: true,
  playerTurn: false,
};

// init player board and ships
const playerBoard = cloneObject(initialGameBoardTemplate);
const playerShips = cloneObject(initialShipsTemplate);

// init computer board and ships
const computerBoard = cloneObject(initialGameBoardTemplate);
const computerShips = cloneObject(initialShipsTemplate);

// render game grid board
const renderGameBoard = (board) => {
  const boardDOM = document.getElementById("board");
  boardDOM.innerHTML = "";

  const rowsDOM = board.map((row, rowIndex) => {
    const hasShip = (cell) => cell.ship === true;
    const hasHittedShip = (cell) => cell.hit === true;

    const cells = row.map(
      (cell, cellIndex) =>
        `<div id="${rowIndex}${cellIndex}" class="cell ${
          hasHittedShip(cell) ? "hit" : "not-hit"
        }" onclick="onCellClick(this)">${hasShip(
          cell
        )} ${rowIndex} ${cellIndex}</div>`
    );
    const rowDOM = `<div class="row" ondrop="drop(event)" ondragover="allowDrop(event)">${cells.join(
      "\n"
    )}</div>`;

    return rowDOM;
  });
  boardDOM.innerHTML += boardDOM.innerHTML + rowsDOM;
};
renderGameBoard(playerBoard);


const renderShips = (ships) => {
  const shipsContainerDOM = document.getElementById("ships");
  shipsContainerDOM.innerHTML = "";

  let shipsDOM;

  for (let ship in ships) {
    let shipCells;
    for (let i = 1; i <= ships[ship].cells; i++) {
      shipCells += `<div class="ship-cell">${i}</div>`;
    }
    shipsDOM += `<div class="ship" data-cells=${ships[ship].cells} data-name=${ships[ship].name} draggable="true" ondragstart="drag(event)">${shipCells}</div>`;
  }
  shipsContainerDOM.innerHTML += shipsContainerDOM.innerHTML + shipsDOM;
};
renderShips(playerShips);


const onCellClick = (cell) => {
  if (!gameState.playerTurn) return console.log("wait for your turn");
  const rowIndex = cell.id[0];
  const cellIndex = cell.id[1];
  const clickedCell = computerBoard[rowIndex][cellIndex];

  if (clickedCell.ship) {
    computerBoard[rowIndex][cellIndex] = { ship: true, hit: true };
  } else {
    // upadte an object to display a blue cell or something on hit miss
  }

  // must render computer board here
  gameState.playerTurn = false;
  // must call a function for computer hit
};