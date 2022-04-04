// utils functions
const cloneObject = (object) => JSON.parse(JSON.stringify(object));
const getRandomNum = () => Math.floor(Math.random() * 10);
const getRandomBool = () => (getRandomNum() % 2 === 0 ? true : false);

// board and ships template
const INITIAL_GAME_BOARD_TEMPLATE = [
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

const INITIAL_SHIPS_TEMPLATE = [
  { name: "carrier", cells: 5 },
  { name: "battleship", cells: 4 },
  { name: "destroyer", cells: 3 },
  { name: "submarine", cells: 3 },
  { name: "patrol", cells: 2 },
];

// init game state
const GAME_STATE = {
  placeShips: true,
  playerTurn: false,
  isVerticalShip: false,
  round: 0,
};

// init player board and ships
let playerBoard = cloneObject(INITIAL_GAME_BOARD_TEMPLATE);
let playerShips = cloneObject(INITIAL_SHIPS_TEMPLATE);

// init computer board and ships
let computerBoard = cloneObject(INITIAL_GAME_BOARD_TEMPLATE);
let computerShips = cloneObject(INITIAL_SHIPS_TEMPLATE);

const moveToGameScreenBtn = document.getElementById("game-screen-btn");
const moveToGameScreen = () => {
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
moveToGameScreenBtn.addEventListener("click", moveToGameScreen);

const renderGameBoard = (board, playerType) => {
  const boardDOM = document.getElementById(`${playerType}-board`);
  boardDOM.innerHTML = "";

  const isComputer = playerType === "computer";
  const isPlayer = playerType === "player";

  const rowsHTML = board.map((row, rowIndex) => {
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
    });

    if (isPlayer)
      return `<div class="row" ondrop="dropShipOnBoard(event)" ondragover="allowDrop(event)">
          ${cells.join("\n")}
        </div>`;

    return `<div class="row">${cells.join("\n")}</div>`;
  });

  boardDOM.innerHTML += boardDOM.innerHTML + rowsHTML.join("\n");
};
renderGameBoard(playerBoard, "player");

const renderShips = (ships) => {
  const shipsContainerDOM = document.getElementById("ships");
  shipsContainerDOM.innerHTML = "";

  let shipsTempHTML = "";

  for (let ship in ships) {
    let shipCellsHTML = "";
    for (let i = 1; i <= ships[ship].cells; i++) {
      shipCellsHTML += `<div class="ship-cell"></div>`;
    }

    shipsTempHTML += `<div class="ship ${
      GAME_STATE.isVerticalShip ? "orizontal" : "vertical"
    }" data-cells=${ships[ship].cells} data-name=${
      ships[ship].name
    } draggable="true" ondragstart="dragShipOnBoard(event)">${shipCellsHTML}</div>`;
  }
  shipsContainerDOM.innerHTML += shipsContainerDOM.innerHTML + shipsTempHTML;
};
renderShips(playerShips);

const renderShipAlign = () => {
  const shipsContainerDOM = document.getElementById("ships");
  const shipDOM = document.querySelectorAll(".ship");

  GAME_STATE.isVerticalShip = !GAME_STATE.isVerticalShip;
  if (GAME_STATE.isVerticalShip) {
    shipsContainerDOM.classList.add("vertical");
    shipsContainerDOM.classList.remove("orizontal");
    shipDOM.forEach((ship) => {
      ship.classList.add("orizontal");
      ship.classList.remove("vertical");
    });
  } else {
    shipsContainerDOM.classList.add("orizontal");
    shipsContainerDOM.classList.remove("vertical");
    shipDOM.forEach((ship) => {
      ship.classList.add("vertical");
      ship.classList.remove("orizontal");
    });
  }
};

const placeShipOnBoard = (ship, rowIndex, cellIndex, isRandomly) => {
  const { shipName, shipCells } = ship;
  const isVertical = isRandomly || GAME_STATE.isVerticalShip;
  const hasSpace = isVertical
    ? shipCells + rowIndex <= 10
    : shipCells + cellIndex <= 10;
  let hasShip = false;
  if (!hasSpace) return alertBox("Not enought space to place ship here.");

  if (typeof isRandomly !== "undefined") GAME_STATE.isVerticalShip = isRandomly;

  if (GAME_STATE.isVerticalShip) {
    let newRowIndex = rowIndex;

    playerBoard.forEach((row, index) => {
      if (index >= newRowIndex && index <= rowIndex + shipCells - 1) {
        newRowIndex += 1;
        if (playerBoard[index][cellIndex].ship) hasShip = true;
      }
    });

    for (let i = rowIndex; i < shipCells + rowIndex; i++) {
      if (hasShip) return alertBox("A ship has already been placed here.");
      playerBoard[i][cellIndex] = { ship: true, hit: false }; //
      playerShips = playerShips.filter((ship) => ship.name !== shipName);
    }
  } else {
    playerBoard[rowIndex].forEach((cell, index) => {
      if (index >= cellIndex && index <= cellIndex + shipCells - 1) {
        if (cell.ship) hasShip = true;
      }
    });

    for (let i = cellIndex; i < shipCells + cellIndex; i++) {
      if (hasShip) return alertBox("A ship has already been placed here.");
      playerBoard[rowIndex][i] = { ship: true, hit: false }; //
      playerShips = playerShips.filter((ship) => ship.name !== shipName);
    }
  }

  renderGameBoard(playerBoard, "player");
  renderShips(playerShips);

  if (playerShips.length === 0) {
    GAME_STATE.placeShips = false;
    GAME_STATE.playerTurn = true;
  }
};

const placeShipsRandomlyBtn = document.getElementById(
  "place-ships-randomly-btn"
);
const placeShipOnBoardRandomly = () => {
  while (playerShips.length > 0) {
    playerShips.forEach((ship) => {
      const isRandomly = getRandomBool();
      const { name, cells } = ship;
      const row = getRandomNum();
      const cell = getRandomNum();

      placeShipOnBoard(
        { shipName: name, shipCells: cells },
        row,
        cell,
        isRandomly
      );
    });
  }
};
placeShipsRandomlyBtn.addEventListener("click", placeShipOnBoardRandomly);

const allowDrop = (e) => e.preventDefault();

const dragShipOnBoard = (e) => {
  const shipCells = e.target.dataset.cells;
  const shipName = e.target.dataset.name;
  e.dataTransfer.setData("shipCells", shipCells);
  e.dataTransfer.setData("shipName", shipName);
};

const dropShipOnBoard = (e) => {
  e.preventDefault();
  const shipCells = parseInt(e.dataTransfer.getData("shipCells"));
  const shipName = e.dataTransfer.getData("shipName");
  const row = parseInt(e.target.id[0]);
  const cell = parseInt(e.target.id[1]);

  placeShipOnBoard({ shipCells, shipName }, row, cell);
};

const onCellClick = (cell) => {
  if (GAME_STATE.placeShips) return alertBox("Place your ships first");
  if (!GAME_STATE.playerTurn) return alertBox("Wait for your turn.");
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
  GAME_STATE.playerTurn = false;
  computerHit();
};

// computer place ships and cell hit/click
const placeComputerShips = (computerBoard) => {
  const placeShipVertical = () => {
    for (let i = 0; i < computerShips.length; i++) {
      let randomRowIndex = getRandomNum();
      let randomCellIndex = getRandomNum();
      const shipCells = computerShips[i].cells;

      while (shipCells + randomRowIndex > 10) {
        randomRowIndex = getRandomNum();
      }
      let hasSpace = false;
      let hasShip = false;
      computerBoard.forEach((row, index) => {
        if (
          index >= randomRowIndex &&
          index <= randomRowIndex + shipCells - 1
        ) {
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

  const placeShipOrizontal = () => {
    for (let i = 0; i < computerShips.length; i++) {
      const randomRowIndex = getRandomNum();
      let randomCellIndex = getRandomNum();
      const shipCells = computerShips[i].cells;

      while (shipCells + randomCellIndex > 10) {
        randomCellIndex = getRandomNum();
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
    getRandomBool() ? placeShipVertical() : placeShipOrizontal();
  }

  renderGameBoard(computerBoard, "computer");
};
placeComputerShips(computerBoard);

const computerHit = () => {
  const rowIndex = getRandomNum();
  const cellIndex = getRandomNum();
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
  GAME_STATE.playerTurn = true;
  renderGameBoard(playerBoard, "player");
  checkGameOver();
};

const checkGameOver = () => {
  GAME_STATE.round = GAME_STATE.round + 1;
  let totalShipCells = 0;
  Object.values(INITIAL_SHIPS_TEMPLATE).forEach(
    (ship) => (totalShipCells += ship.cells)
  );
  if (GAME_STATE.round >= totalShipCells) {
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
      alertBox(`${playerWon ? "Player won!" : "Computer won"}`);
      restartGame();
    }
  }
};

const restartGame = () => {
  const restartBtn = document.getElementById("restart-btn");
  restartBtn.classList.remove("hide");
  restartBtn.classList.add("show");
  restartBtn.addEventListener("click", () => window.location.reload());
};

const notificationContainer = document.getElementById("notification-container");
const notificationMessage = document.getElementById("notification-message");
const alertBox = (message) => {
  notificationContainer.classList.add("visible-animation");
  notificationMessage.innerHTML = `${message}.`;

  setTimeout(() => {
    notificationContainer.classList.remove("visible-animation");
  }, 3000);
};
