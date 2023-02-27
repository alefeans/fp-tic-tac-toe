import { List } from "immutable";
import {
  INITIAL_MARK,
  getMark,
  markToRow,
  getPlayerInput,
  isInvalidPosition,
  buildInitialBoard,
  isMarkedPosition,
  inputToBoardPosition,
  setPosition,
  isGameOver,
} from "./index";

describe("Board game", () => {
  it("Should return a 3x3 matrix board game", () => {
    const board = buildInitialBoard();
    const numberOfRows = board.size;
    expect(numberOfRows).toBe(3);
    board.forEach((row) => {
      expect(row.size).toBe(3);
    });
  });

  it("Should return a board game filled with the initial mark '-'", () => {
    const board = buildInitialBoard();
    board.forEach((row) => {
      row.forEach((column) => {
        expect(column).toBe(INITIAL_MARK);
      });
    });
  });
});

describe("Player input", () => {
  it("Should transform player input to a number", () => {
    const playerInput = getPlayerInput(() => "8");
    expect(playerInput).toBe(8);
  });

  it("Should ignore extra characters", () => {
    const playerInput = getPlayerInput(() => " 8 test");
    expect(playerInput).toBe(8);
  });

  it("Should map valid user input to a board position", () => {
    const playerInput = getPlayerInput(() => "0");
    expect(inputToBoardPosition(playerInput)).toEqual([0, 0]);
  });

  it("Should map invalid user input to undefined", () => {
    const negativeInput = getPlayerInput(() => "-1");
    const upperboundInput = getPlayerInput(() => "9");
    expect(inputToBoardPosition(negativeInput)).toBe(undefined);
    expect(inputToBoardPosition(upperboundInput)).toBe(undefined);
  });

  it("Should check for invalid input", () => {
    const validInput = getPlayerInput(() => "0");
    const validPosition = inputToBoardPosition(validInput);
    expect(isInvalidPosition(validPosition)).toBe(false);

    const negativeInput = getPlayerInput(() => "-1");
    const invalidPosition = inputToBoardPosition(negativeInput);
    expect(isInvalidPosition(invalidPosition)).toBe(true);
  });

  it("Should set position in the board preserving immutability", () => {
    const mark = getMark();
    const board = buildInitialBoard();
    const input = getPlayerInput(() => "0");
    const position = inputToBoardPosition(input);
    const markedBoard = setPosition(board, position, mark);
    expect(markedBoard).not.toEqual(board);
    expect(markedBoard.get(0).get(0)).toBe(mark);
  });

  it("Should check for already marked position", () => {
    const mark = getMark();
    const board = buildInitialBoard();
    const playerOnePosition = inputToBoardPosition(getPlayerInput(() => "0"));
    const markedBoard = setPosition(board, playerOnePosition, mark);
    const playerTwoPosition = inputToBoardPosition(getPlayerInput(() => "0"));
    expect(isMarkedPosition(markedBoard, playerTwoPosition)).toBe(true);

    const playerTwoSecondPosition = inputToBoardPosition(getPlayerInput(() => "1"));
    expect(isMarkedPosition(markedBoard, playerTwoSecondPosition)).toBe(false);
  });

  it("Should use a different mark every time (X/O)", () => {
    const firstMark = getMark();
    const secondMark = getMark();
    expect(firstMark).not.toBe(secondMark);
  });
});

describe("Game over", () => {
  it("Should end game when a row is filled with same mark character", () => {
    const board = buildInitialBoard();
    expect(isGameOver(board)).toBe(false);

    const sameMarkRow = markToRow(getMark());
    const firstRowVictory = board.set(0, sameMarkRow);
    expect(isGameOver(firstRowVictory)).toBe(true);

    const secondRowVictory = board.set(1, sameMarkRow);
    expect(isGameOver(secondRowVictory)).toBe(true);

    const thirdRowVictory = board.set(2, sameMarkRow);
    expect(isGameOver(thirdRowVictory)).toBe(true);
  });

  it("Should end game when a column is filled with same mark character", () => {
    const mark = getMark();
    const board = buildInitialBoard();
    const firstColumnMark = List([mark, INITIAL_MARK, INITIAL_MARK]);
    const firstColumnVictory = board.set(0, firstColumnMark).set(1, firstColumnMark).set(2, firstColumnMark);
    expect(isGameOver(firstColumnVictory)).toBe(true);

    const secondColumnMark = List([INITIAL_MARK, mark, INITIAL_MARK]);
    const secondColumnVictory = board.set(0, secondColumnMark).set(1, secondColumnMark).set(2, secondColumnMark);
    expect(isGameOver(secondColumnVictory)).toBe(true);

    const thirdColumnMark = List([INITIAL_MARK, INITIAL_MARK, mark]);
    const thirdColumnVictory = board.set(0, thirdColumnMark).set(1, thirdColumnMark).set(2, thirdColumnMark);
    expect(isGameOver(thirdColumnVictory)).toBe(true);
  });

  it("Should end game when a diagonal is filled with same mark character", () => {
    const mark = getMark();
    const board = buildInitialBoard();
    const firstColumnMark = List([mark, INITIAL_MARK, INITIAL_MARK]);
    const secondColumnMark = List([INITIAL_MARK, mark, INITIAL_MARK]);
    const thirdColumnMark = List([INITIAL_MARK, INITIAL_MARK, mark]);
    const firstDiagonalVictory = board.set(0, firstColumnMark).set(1, secondColumnMark).set(2, thirdColumnMark);
    expect(isGameOver(firstDiagonalVictory)).toBe(true);

    const secondDiagonalVictory = board.set(0, thirdColumnMark).set(1, secondColumnMark).set(2, firstColumnMark);
    expect(isGameOver(secondDiagonalVictory)).toBe(true);
  });

  it("Should end game when there are no space left and no winner", () => {
    const markOne = getMark();
    const markTwo = getMark();
    const board = buildInitialBoard();
    const firstRow = List([markTwo, markOne, markTwo]);
    const secondRow = List([markTwo, markOne, markOne]);
    const thirdRow = List([markOne, markTwo, markOne]);
    const drawBoard = board.set(0, firstRow).set(1, secondRow).set(2, thirdRow);
    expect(isGameOver(drawBoard)).toBe(true);

    const unfilledLastColumn = List([markOne, markTwo, INITIAL_MARK]);
    const noDrawBoard = board.set(0, firstRow).set(1, secondRow).set(2, unfilledLastColumn);
    expect(isGameOver(noDrawBoard)).toBe(false);
  });
});
