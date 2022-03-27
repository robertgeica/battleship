// utils functions
const cloneObject = object => JSON.parse(JSON.stringify(object));

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

let initialShipsTemplate = [
  { name: "carrier", cells: 5 },
  { name: "battleship", cells: 4 },
  { name: "destroyer", cells: 3 },
  { name: "submarine", cells: 3 },
  { name: "patrol", cells: 2 },
];