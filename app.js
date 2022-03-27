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
let playerShips = cloneObject(initialShipsTemplate);

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
        }" onclick="onCellClick(this)">${
          hasShip(cell) ? "ship" : ""
        } ${rowIndex} ${cellIndex}</div>`
    );
    const rowDOM = `<div class="row" ondrop="drop(event)" ondragover="allowDrop(event)">
    ${cells.join("\n")}</div>`;
    return rowDOM;
  });

  boardDOM.innerHTML += boardDOM.innerHTML + rowsDOM.join("\n");
};
renderGameBoard(playerBoard);

const renderShips = (ships) => {
  const shipsContainerDOM = document.getElementById("ships");
  shipsContainerDOM.innerHTML = "";

  let shipsDOM = "";

  for (let ship in ships) {
    let shipCells = "";
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
    // TODO: upadte an object to display a blue cell or something on hit miss
  }

  // TODO: render computer board here
  gameState.playerTurn = false;
  // TODO: must call a function for computer hit
};

const placeShip = (ship, rowIndex, cellIndex) => {
  const { shipName, shipCells } = ship;
  console.log(
    `place ${shipName} with ${shipCells} cells at row ${rowIndex} at cell ${cellIndex}`
  );

  if (shipCells + cellIndex > 10) {
    console.log("not enought space to place ship here");
  } else {
    // place object on every cell
    // TODO:  check if there's already a ship there
    for (let i = cellIndex; i < shipCells + cellIndex; i++) {
      playerBoard[rowIndex][i] = { ship: true, hit: false };
    }

    // remove placed ship from player ships array
    playerShips = playerShips.filter((ship) => ship.name !== shipName);
    renderGameBoard(playerBoard);
    renderShips(playerShips);

    if (playerShips.length === 0) {
      // if no more ships, start game
      gameState.placeShips = false;
      gameState.playerTurn = true;
      playerReady();
    }
  }
};

const playerReady = () => {
  if (gameState.playerTurn) {
    console.log("my turn");
  }
};

const allowDrop = (e) => e.preventDefault();

const drag = (e) => {
  const shipCells = e.target.dataset.cells;
  const shipName = e.target.dataset.name;
  e.dataTransfer.setData("shipCells", shipCells);
  e.dataTransfer.setData("shipName", shipName);
};

const drop = (e) => {
  e.preventDefault();
  const shipCells = parseInt(e.dataTransfer.getData("shipCells"));
  const shipName = e.dataTransfer.getData("shipName");
  const row = parseInt(e.target.id[0]);
  const cell = parseInt(e.target.id[1]);

  placeShip({ shipCells, shipName }, row, cell);
};

// TODO: generate and render computer board and ships
