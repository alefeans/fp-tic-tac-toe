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

export const getPlayerInput = (inputReader) =>
  pipe("Choose your position (0-8 left to right): ", inputReader, parseInt);

export const inputToBoardPosition = (position) => (position < 0 ? undefined : POSITION_LOOKUP.get(position));

const playerInputToBoardPosition = () => pipe(terminalReader, getPlayerInput, inputToBoardPosition);

export const setPosition = (board, [row, column], mark) => {
  const newRow = board.get(row).set(column, mark);
  return board.set(row, newRow);
};

const alternateMark = () => {
  let mark = "X";
  return () => {
    mark = mark === "O" ? "X" : "O";
    return mark;
  };
};

export const getMark = alternateMark();

// Game rules
export const isInvalidPosition = (position) => position === undefined;

export const isMarkedPosition = (board, [row, column]) => board.get(row).get(column) !== INITIAL_MARK;

const hasInitialMark = (seq) => seq.includes(INITIAL_MARK);

const hasSameMark = (seq) => seq.toSet().size === 1;

const hasSamePlayerMark = (seq) => !hasInitialMark(seq) && hasSameMark(seq);

const rowVictory = (board) => board.filter((row) => hasSamePlayerMark(row)).size >= 1;

const transposeBoard = (board) => board.first().map((col, i) => board.map((row) => row.get(i)));

const columnVictory = (board) => pipe(board, transposeBoard, rowVictory);

const getDiagonal = (board) => board.map((row, index) => row.get(index));

const diagonalVictory = (board) => {
  const firstDiagonal = getDiagonal(board);
  const secondDiagonal = getDiagonal(board.reverse());
  return hasSamePlayerMark(firstDiagonal) || hasSamePlayerMark(secondDiagonal);
};

const isVictory = (board) => rowVictory(board) || columnVictory(board) || diagonalVictory(board);

const isDraw = (board) => board.filter((row) => hasInitialMark(row)).size === 0;

export const isGameOver = (board) => isVictory(board) || isDraw(board);

const invalidPositionMessage = () => console.log("Please, choose a valid position.");

// Impure imperative layer
const getInputPosition = (board) => {
  let position = playerInputToBoardPosition();
  while (isInvalidPosition(position) || isMarkedPosition(board, position)) {
    invalidPositionMessage();
    position = playerInputToBoardPosition();
  }
  return position;
};

const startGame = (board) => {
  while (!isGameOver(board)) {
    board = showBoard(setPosition(board, getInputPosition(board), getMark()));
  }
};

const endGameMessage = () => console.log("Game over!");

const main = () => pipe(buildInitialBoard(), showBoard, startGame, endGameMessage);

if (process.argv.includes("main")) {
  main();

