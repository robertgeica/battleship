// utils functions
const cloneObject = (object) => JSON.parse(JSON.stringify(object));

const startGame = () => {
  const boards = document.getElementById("boards");
  const ships = document.getElementById("ships");
  const startScreen = document.getElementById("start-screen");
  const shipAlign = document.getElementById("ship-align");

  boards.classList.remove("hide");
  ships.classList.remove("hide");
  startScreen.classList.add("hide");
  startScreen.removeAttribute("id");
  shipAlign.classList.remove("hide");
  shipAlign.classList.add("ship-align");
};
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
let playerBoard = cloneObject(initialGameBoardTemplate);
let playerShips = cloneObject(initialShipsTemplate);

// init computer board and ships
let computerBoard = cloneObject(initialGameBoardTemplate);
let computerShips = cloneObject(initialShipsTemplate);

let isVerticalShip = false;

const renderGameBoard = (board, playerType) => {
  const boardDOM = document.getElementById(`${playerType}-board`);
  boardDOM.innerHTML = "";

  const isComputer = playerType === "computer";
  const isPlayer = playerType === "player";

  const rowsDOM = board.map((row, rowIndex) => {
    const hasShip = (cell) => cell.ship === true;
    const hasHittedShip = (cell) => cell.hit === true;
    const hasMissedHit = (cell) => cell.miss === true;

    const cells = row.map((cell, cellIndex) => {
      const hit = hasHittedShip(cell) ? "hit" : "";
      const miss = hasMissedHit(cell) ? "miss" : "";
      const shipCell = hasShip(cell) ? "ship-cell" : "";
      const computerClass = isComputer ? "computer-cell" : "";

      return `
        <div 
          id="${rowIndex}${cellIndex}" 
          class="cell ${hit} ${miss} ${shipCell} ${computerClass}" 
          ${isComputer ? "onclick='onCellClick(this)'" : ""}
        >
        </div>
        `;
      // ${rowIndex} ${cellIndex}
    });

    // if player board allow drag and drop
    if (isPlayer)
      return `<div class="row" ondrop="drop(event)" ondragover="allowDrop(event)">
    ${cells.join("\n")}</div>`;

    return `<div class="row">${cells.join("\n")}</div>`;
  });

  boardDOM.innerHTML += boardDOM.innerHTML + rowsDOM.join("\n");
};
renderGameBoard(playerBoard, "player");

const shipAlign = () => {
  const shipsContainerDOM = document.getElementById("ships");
  const shipDOM = document.querySelectorAll(".ship");

  isVerticalShip = !isVerticalShip;
  if (isVerticalShip) {
    shipsContainerDOM.classList.add("v");
    shipsContainerDOM.classList.remove("o");
    shipDOM.forEach((ship) => {
      ship.classList.add("o");
      ship.classList.remove("v");
    });
  } else {
    shipsContainerDOM.classList.add("o");
    shipsContainerDOM.classList.remove("v");
    shipDOM.forEach((ship) => {
      ship.classList.add("v");
      ship.classList.remove("o");
    });
  }
};
const renderShips = (ships) => {
  const shipsContainerDOM = document.getElementById("ships");

  shipsContainerDOM.innerHTML = "";

  let shipsDOM = "";

  for (let ship in ships) {
    let shipCells = "";
    for (let i = 1; i <= ships[ship].cells; i++) {
      shipCells += `<div class="ship-cell"></div>`; //${i}
    }

    shipsDOM += `<div class="ship ${isVerticalShip ? "o" : "v"}" data-cells=${ships[ship].cells} data-name=${ships[ship].name} draggable="true" ondragstart="drag(event)">${shipCells}</div>`;
  }
  shipsContainerDOM.innerHTML += shipsContainerDOM.innerHTML + shipsDOM;
};
renderShips(playerShips);

const onCellClick = (cell) => {
  if (gameState.placeShips) return alertBox("Place your ships first");
  if (!gameState.playerTurn) return alertBox("Wait for your turn.");
  const rowIndex = cell.id[0];
  const cellIndex = cell.id[1];
  const clickedCell = computerBoard[rowIndex][cellIndex];

  if (clickedCell.miss || clickedCell.hit)
    return alertBox("You already hit this cell.");
  if (clickedCell.ship) {
    computerBoard[rowIndex][cellIndex] = { ship: true, hit: true };
  } else {
    computerBoard[rowIndex][cellIndex] = { miss: true };
  }

  renderGameBoard(computerBoard, "computer");
  gameState.playerTurn = false;
  computerHit();
};

const placeShip = (ship, rowIndex, cellIndex, isRandomly) => {
  const { shipName, shipCells } = ship;
  const isVertical = isRandomly || isVerticalShip;
  const hasSpace = isVertical
    ? shipCells + rowIndex <= 10
    : shipCells + cellIndex <= 10;
  let hasShip = false;
  if (!hasSpace) {
    return alertBox("Not enought space to place ship here.");
  }

  if (typeof isRandomly !== "undefined") {
    isVerticalShip = isRandomly;
  }

  if (isVerticalShip) {
    let newRowIndex = rowIndex;

    playerBoard.forEach((row, index) => {
      if (index >= newRowIndex && index <= rowIndex + shipCells - 1) {
        newRowIndex += 1;
        if (playerBoard[index][cellIndex].ship) hasShip = true;
      }
    });

    for (let i = rowIndex; i < shipCells + rowIndex; i++) {
      if (hasShip) return alertBox("A ship has already been placed here.");
      playerBoard[i][cellIndex] = { ship: true, hit: false }; //[i][cellIndex]
      // console.log(
      //   `place ${shipName} with ${shipCells} cells at cell ${cellIndex} at row ${rowIndex}`
      // );
      playerShips = playerShips.filter((ship) => ship.name !== shipName);
    }
  } else {
    playerBoard[rowIndex].forEach((cell, index) => {
      if (index >= cellIndex && index <= cellIndex + shipCells - 1) {
        if (cell.ship) hasShip = true;
      }
    });

    for (let i = cellIndex; i < shipCells + cellIndex; i++) {
      // i < shipCells + cellIndex
      if (hasShip) return alertBox("A ship has already been placed here.");

      playerBoard[rowIndex][i] = { ship: true, hit: false };
      console.log(
        `place ${shipName} with ${shipCells} cells at row ${rowIndex} at cell ${cellIndex}`,
        hasSpace
      );
      playerShips = playerShips.filter((ship) => ship.name !== shipName);
    }
  }

  // remove placed ship from player ships array
  renderGameBoard(playerBoard, "player");
  renderShips(playerShips);

  if (playerShips.length === 0) {
    // if no more ships, start game
    gameState.placeShips = false;
    gameState.playerTurn = true;
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

const randomlyPlace = () => {
  playerShips.forEach((ship) => {
    const randomBoolean =
      Math.floor(Math.random() * 10) % 2 === 0 ? true : false;
    const { name, cells } = ship;
    const row = Math.floor(Math.random() * 10);
    const cell = Math.floor(Math.random() * 10);
    placeShip({ shipName: name, shipCells: cells }, row, cell, randomBoolean);
  });
};
const placeComputerShips = (computerBoard) => {
  const placeVertical = () => {
    for (let i = 0; i < computerShips.length; i++) {
      let randomRowIndex = Math.floor(Math.random() * 10);
      let randomCellIndex = Math.floor(Math.random() * 10);
      const shipCells = computerShips[i].cells;

      while (shipCells + randomRowIndex > 10) {
        randomRowIndex = Math.floor(Math.random() * 10);
      }
      let hasSpace = false;
      let hasShip = false;
      computerBoard.forEach((row, index) => {
        if (
          index >= randomRowIndex &&
          index <= randomRowIndex + shipCells - 1
        ) {
          // console.log(
          //   `Ship cells: ${shipCells}.\nRow index: ${randomRowIndex}.\nCell index: ${randomCellIndex}.\nIndex: ${index}`
          // );

          hasSpace = shipCells <= shipCells + randomRowIndex;

          if (row[randomCellIndex].ship) hasShip = true;
        }
      });

      if (hasSpace && !hasShip) {
        for (let j = randomRowIndex; j < shipCells + randomRowIndex; j++) {
          computerBoard[j][randomCellIndex] = {
            ship: true,
            hit: false,
          };
        }
        computerShips = computerShips.filter(
          (ship) => ship.name !== computerShips[i].name
        );
        ships = ships - 1;
      }
    }
  };

  const place = () => {
    let randomCellIndex = Math.floor(Math.random() * 10);
    for (let i = 0; i < computerShips.length; i++) {
      const randomRowIndex = Math.floor(Math.random() * 10);
      const shipCells = computerShips[i].cells;

      while (shipCells + randomCellIndex > 10) {
        randomCellIndex = Math.floor(Math.random() * 10);
      }

      let hasSpace = false;
      let hasShip = false;

      computerBoard[randomRowIndex].forEach((cell, index) => {
        if (index >= randomCellIndex) {
          let availableSpace = index + randomCellIndex;
          hasSpace =
            shipCells <= index + randomCellIndex ||
            availableSpace === 0 ||
            availableSpace === 1;

          if (cell.ship) hasShip = true;
        }
      });

      if (hasSpace && !hasShip) {
        for (let j = randomCellIndex; j < shipCells + randomCellIndex; j++) {
          computerBoard[randomRowIndex][j] = {
            ship: true,
            hit: false,
          };
        }
        computerShips = computerShips.filter(
          (ship) => ship.name !== computerShips[i].name
        );
        ships = ships - 1;
      }
    }
  };

  while (computerShips.length !== 0) {
    const vertical = Math.floor(Math.random() * 10) % 2 === 0 ? true : false;

    vertical ? placeVertical() : place();
  }

  renderGameBoard(computerBoard, "computer");
};

placeComputerShips(computerBoard);

const computerHit = () => {
  const rowIndex = Math.floor(Math.random() * 10);
  const cellIndex = Math.floor(Math.random() * 10);
  const hittedCell = playerBoard[rowIndex][cellIndex];

  if (hittedCell.miss || hittedCell.hit) return computerHit();

  if (hittedCell.ship) {
    playerBoard[rowIndex][cellIndex] = { ship: true, hit: true };
  } else {
    playerBoard[rowIndex][cellIndex] = {
      ...playerBoard[rowIndex][cellIndex],
      miss: true,
    };
  }
  gameState.playerTurn = true;
  renderGameBoard(playerBoard, "player");
  checkGameOver();
};

const checkGameOver = () => {
  let totalShipCells = 17;
  let computerHit = 0;
  let playerHit = 0;

  computerBoard.forEach((row) =>
    row.forEach((cell) => cell.hit && playerHit++)
  );
  playerBoard.forEach((row) =>
    row.forEach((cell) => cell.hit && computerHit++)
  );

  const playerWon = playerHit === totalShipCells;
  const computerWon = computerHit === totalShipCells;

  if (playerWon || computerWon) {
    document.getElementById("player-board").classList = "disable-click";
    document.getElementById("computer-board").classList = "disable-click";
  }
  if (playerWon) {
    alertBox("Player won!");
    restartGame();
  }
  if (computerWon) {
    console.log("Computer won!");
    restartGame();
  }
};

const restartGame = () => {
  const restartBtn = document.getElementById("restart-btn");
  restartBtn.classList.remove("hide");
  restartBtn.classList.add("show");
  restartBtn.addEventListener("click", () => window.location.reload());
};



// notifications
const notificationContainer = document.getElementById("notification-container");
const notificationMessage = document.getElementById("notification-message");
const alertBox = (message) => {
  notificationContainer.classList.add("visible-animation");
  notificationMessage.innerHTML = `${message}.`;

  setTimeout(() => {
    notificationContainer.classList.remove("visible-animation");
  }, 3000);
};
