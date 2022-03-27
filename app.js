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
  // { name: "carrier", cells: 5 },
  // { name: "battleship", cells: 4 },
  // { name: "destroyer", cells: 3 },
  { name: "submarine", cells: 3 },
  { name: "patrol", cells: 2 },
];

// game state
const gameState = {
  placeShips: true,
  playerTurn: false,
};

// init player board and ships
let playerBoard = cloneObject(initialGameBoardTemplate);
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
    const hasMissedHit = (cell) => cell.miss === true;

    const cells = row.map(
      (cell, cellIndex) =>
        `<div id="${rowIndex}${cellIndex}" class="cell ${
          hasShip(cell) ? "ship-cell" : ""
        } ${hasHittedShip(cell) ? "hit" : ""} ${
          hasMissedHit(cell) ? "miss" : ""
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
    computerBoard[rowIndex][cellIndex] = { miss: true };
  }

  renderComputerBoard(computerBoard);
  gameState.playerTurn = false;
  computerHit();
};

const placeShip = (ship, rowIndex, cellIndex) => {
  const { shipName, shipCells } = ship;
  console.log(
    `place ${shipName} with ${shipCells} cells at row ${rowIndex} at cell ${cellIndex}`
  );
  if (shipCells + cellIndex > 10) {
    console.log("not enought space to place ship here");
  } else {
    
    let discard = false;
    for (let i = cellIndex; i < shipCells + cellIndex; i++) {

      const playerBoardCopy = cloneObject(playerBoard);
      if(!playerBoardCopy[rowIndex][i].ship) {
        playerBoardCopy[rowIndex][i] = { ship: true, hit: false };
      } else {
        discard = true;
      }

      if(!discard) {
        playerBoard = playerBoardCopy;
        playerShips = playerShips.filter((ship) => ship.name !== shipName);
      }
    }

    // remove placed ship from player ships array
    renderGameBoard(playerBoard);
    renderShips(playerShips);

    if (playerShips.length === 0) {
      // if no more ships, start game
      gameState.placeShips = false;
      gameState.playerTurn = true;
    }
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

// TODO: unduplicate this function
const renderComputerBoard = (board) => {
  const boardDOM = document.getElementById("computer-board");
  boardDOM.innerHTML = "";

  const rowsDOM = board.map((row, rowIndex) => {
    const hasShip = (cell) => cell.ship === true;
    const hasHittedShip = (cell) => cell.hit === true;
    const hasMissedHit = (cell) => cell.miss === true;

    const cells = row.map(
      (cell, cellIndex) =>
        `<div id="${rowIndex}${cellIndex}" class="cell ${
          hasHittedShip(cell) ? "hit" : ""
        } ${hasMissedHit(cell) ? "miss" : ""}" onclick="onCellClick(this)">${
          hasShip(cell) ? "ship" : ""
        } ${rowIndex} ${cellIndex}</div>`
    );

    return `<div class="row">${cells.join("\n")}</div>`;
  });

  boardDOM.innerHTML += boardDOM.innerHTML + rowsDOM.join("\n");
};

const placeComputerShips = (computerBoard) => {
  const computerShips = JSON.parse(JSON.stringify(initialShipsTemplate));
  const randomRowIndex = Math.floor(Math.random() * 10);
  const randomCellIndex = Math.floor(Math.random() * 10);

  for (let i = 0; i < computerShips.length; i++) {
    const randomRowIndex = Math.floor(Math.random() * 10);
    let randomCellIndex = Math.floor(Math.random() * 10);
    const shipCells = computerShips[i].cells;

    while (shipCells + randomCellIndex > 10) {
      randomCellIndex = Math.floor(Math.random() * 10);
    }

    for (let i = randomCellIndex; i < shipCells + randomCellIndex; i++) {
      if (computerBoard[randomRowIndex][i].ship) {
        console.log("ship already exist");
      } else {
        // FIXME: check all board cells before placing a ship cell
        computerBoard[randomRowIndex][i] = {
          ship: true,
          hit: false,
        };
      }
    }
  }
  renderComputerBoard(computerBoard);
};

placeComputerShips(computerBoard);

const computerHit = () => {
  const rowIndex = Math.floor(Math.random() * 10);
  const cellIndex = Math.floor(Math.random() * 10);
  const hittedCell = playerBoard[rowIndex][cellIndex];
  if (hittedCell.ship) {
    playerBoard[rowIndex][cellIndex] = { ship: true, hit: true };
  } else {
    playerBoard[rowIndex][cellIndex] = { ...playerBoard[rowIndex][cellIndex], miss: true };
  }

  gameState.playerTurn = true;
  renderGameBoard(playerBoard);
  checkGameOver();
};

const checkGameOver = () => {
  const totalShipCells = 2;
  let computerHit = 0;
  let playerHit = 0;
  computerBoard.forEach(row => row.forEach(cell => cell.hit && playerHit++));
  playerBoard.forEach(row => row.forEach(cell => cell.hit && computerHit++));
  
  if(playerHit === totalShipCells) return console.log('player won')
  if(computerHit === totalShipCells) return console.log('computer won')
}



// TODO: add restart game
