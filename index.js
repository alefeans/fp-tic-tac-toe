import prompt from "prompt-sync";
import { List } from "immutable";

export const INITIAL_MARK = "-";
const POSITION_LOOKUP = List([
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 1],
  [1, 2],
  [2, 0],
  [2, 1],
  [2, 2],
]);

// Useful functional helper
const pipe = (arg, ...fns) => (fns ? fns.reduce((result, fn) => fn(result), arg) : arg);

// Board game building
export const markToRow = (char) => List(char.repeat(3).split(""));

const rowToRows = (row) => row.map((char) => markToRow(char));

export const buildInitialBoard = () => pipe(INITIAL_MARK, markToRow, rowToRows);

const showBoard = (board) => {
  board.toJS().map((row) => console.log(row.join(" | ")));
  return board;
};

// User input
const terminalReader = prompt({ sigint: true });

export const getPlayerInput = (reader) => pipe("Choose your position (1-9 left to right): ", reader, parseInt);

export const inputToBoardPosition = (input) => (input < 1 ? undefined : POSITION_LOOKUP.get(input - 1));

const playerInputToBoardPosition = () => pipe(terminalReader, getPlayerInput, inputToBoardPosition);

export const setPosition = (board, [row, column], mark) =>
  pipe(
    board.get(row),
    (oldRow) => oldRow.set(column, mark),
    (newRow) => board.set(row, newRow)
  );

const alternateMark = () => {
  let mark = "X";
  return () => {
    mark = mark === "O" ? "X" : "O";
    return mark;
  };
};

export const getMark = alternateMark();

// Game rules
const isMarkedPosition = (board, [row, column]) => board.get(row).get(column) !== INITIAL_MARK;

export const isInvalidPosition = (board, position) => position === undefined || isMarkedPosition(board, position);

const hasInitialMark = (seq) => seq.includes(INITIAL_MARK);

const hasSameMark = (seq) => seq.toSet().size === 1;

const hasSamePlayerMark = (seq) => !hasInitialMark(seq) && hasSameMark(seq);

const isRowVictory = (board) => board.filter((row) => hasSamePlayerMark(row)).size >= 1;

const transposeBoard = (board) => board.first().map((_, i) => board.map((row) => row.get(i)));

const isColumnVictory = (board) => pipe(board, transposeBoard, isRowVictory);

const getDiagonal = (board) => board.map((row, index) => row.get(index));

const isDiagonalVictory = (board) => {
  const firstDiagonal = getDiagonal(board);
  const secondDiagonal = getDiagonal(board.reverse());
  return hasSamePlayerMark(firstDiagonal) || hasSamePlayerMark(secondDiagonal);
};

const isVictory = (board) => isRowVictory(board) || isColumnVictory(board) || isDiagonalVictory(board);

const isDraw = (board) => board.filter((row) => hasInitialMark(row)).size === 0;

export const isGameOver = (board) => isVictory(board) || isDraw(board);

const showInvalidPositionMessage = () => console.log("Please, choose a valid position.");

// Impure imperative layer
const getInputPosition = (board) => {
  let position = playerInputToBoardPosition();
  while (isInvalidPosition(board, position)) {
    showInvalidPositionMessage();
    position = playerInputToBoardPosition();
  }
  return position;
};

const startGame = (board) => {
  let mark;
  while (!isGameOver(board)) {
    mark = getMark();
    board = showBoard(setPosition(board, getInputPosition(board), mark));
  }
  return [board, mark];
};

export const endGameResult = ([board, mark]) => (isVictory(board) ? `Player ${mark} won!` : "Draw!");

const showEndGameResult = (result) => console.log(result);

const main = () => pipe(buildInitialBoard(), showBoard, startGame, endGameResult, showEndGameResult);

if (process.argv.includes("main")) {
  main();
}
