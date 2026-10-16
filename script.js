"use strict";

function mergeLine(line) {
  const compact = line.filter((value) => value !== 0);
  const merged = [];
  let gainedScore = 0;

  for (let index = 0; index < compact.length; index += 1) {
    if (compact[index] === compact[index + 1]) {
      const combined = compact[index] * 2;
      merged.push(combined);
      gainedScore += combined;
      index += 1;
    } else {
      merged.push(compact[index]);
    }
  }

  while (merged.length < 4) {
    merged.push(0);
  }

  return { line: merged, score: gainedScore };
}

if (typeof document !== "undefined") {
  const boardElement = document.getElementById("board");
  const scoreElement = document.getElementById("score");
  const newGameButton = document.getElementById("new-game");
  const directionButtons = Array.from(document.querySelectorAll(".direction-button"));
  const messageElement = document.getElementById("message");
  const messageTitle = document.getElementById("message-title");
  const messageText = document.getElementById("message-text");
  const continueButton = document.getElementById("continue-game");
  const restartButton = document.getElementById("restart-game");

  let board = [];
  let score = 0;
  let victoryAcknowledged = false;
  let inputLocked = false;

  function addRandomTile() {
    const emptyIndexes = [];

    board.forEach((value, index) => {
      if (value === 0) {
        emptyIndexes.push(index);
      }
    });

    if (emptyIndexes.length === 0) {
      return;
    }

    const targetIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    board[targetIndex] = Math.random() < 0.9 ? 2 : 4;
  }

  function render() {
    boardElement.replaceChildren();

    board.forEach((value) => {
      const tile = document.createElement("div");
      const colorClass = value > 2048 ? "tile-high" : `tile-${value}`;
      tile.className = value === 0 ? "tile" : `tile ${colorClass}`;
      tile.setAttribute("role", "gridcell");
      tile.setAttribute("aria-label", value === 0 ? "빈 칸" : String(value));

      if (value !== 0) {
        tile.textContent = String(value);
        if (value >= 1024) {
          tile.classList.add("tile--small");
        }
      }

      boardElement.appendChild(tile);
    });

    scoreElement.textContent = String(score);
  }

  function setInputLocked(locked) {
    inputLocked = locked;
    directionButtons.forEach((button) => {
      button.disabled = locked;
    });
  }

  function hideMessage() {
    messageElement.hidden = true;
    setInputLocked(false);
  }

  function showMessage(type) {
    const isVictory = type === "victory";
    messageTitle.textContent = isVictory ? "2048 완성!" : "게임 오버";
    messageText.textContent = isVictory
      ? "계속 도전하거나 새 게임을 시작할 수 있어요."
      : "더 이상 움직일 수 있는 타일이 없어요.";
    continueButton.hidden = !isVictory;
    messageElement.hidden = false;
    setInputLocked(true);
    (isVictory ? continueButton : restartButton).focus();
  }

  function isGameOver() {
    if (board.includes(0)) {
      return false;
    }

    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        const index = row * 4 + column;
        if (column < 3 && board[index] === board[index + 1]) {
          return false;
        }
        if (row < 3 && board[index] === board[index + 4]) {
          return false;
        }
      }
    }

    return true;
  }

  function buildMovedBoard(direction) {
    const nextBoard = Array(16).fill(0);
    let gainedScore = 0;
    const isHorizontal = direction === "left" || direction === "right";
    const isReverse = direction === "right" || direction === "down";

    for (let outer = 0; outer < 4; outer += 1) {
      let sourceLine = [];

      for (let inner = 0; inner < 4; inner += 1) {
        const index = isHorizontal ? outer * 4 + inner : inner * 4 + outer;
        sourceLine.push(board[index]);
      }

      if (isReverse) {
        sourceLine = sourceLine.reverse();
      }

      const result = mergeLine(sourceLine);
      const movedLine = isReverse ? result.line.reverse() : result.line;
      gainedScore += result.score;

      for (let inner = 0; inner < 4; inner += 1) {
        const index = isHorizontal ? outer * 4 + inner : inner * 4 + outer;
        nextBoard[index] = movedLine[inner];
      }
    }

    return { board: nextBoard, score: gainedScore };
  }

  function move(direction) {
    if (inputLocked) {
      return;
    }

    const result = buildMovedBoard(direction);
    const changed = result.board.some((value, index) => value !== board[index]);

    if (!changed) {
      return;
    }

    board = result.board;
    score += result.score;
    addRandomTile();
    render();

    if (!victoryAcknowledged && board.some((value) => value >= 2048)) {
      victoryAcknowledged = true;
      showMessage("victory");
    } else if (isGameOver()) {
      showMessage("game-over");
    }
  }

  function startNewGame() {
    board = Array(16).fill(0);
    score = 0;
    victoryAcknowledged = false;
    messageElement.hidden = true;
    setInputLocked(false);
    addRandomTile();
    addRandomTile();
    render();
  }

  directionButtons.forEach((button) => {
    button.addEventListener("click", () => move(button.dataset.direction));
  });

  document.addEventListener("keydown", (event) => {
    const directionByKey = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right"
    };
    const direction = directionByKey[event.key];

    if (direction) {
      event.preventDefault();
      move(direction);
    }
  });

  continueButton.addEventListener("click", () => {
    hideMessage();
    if (isGameOver()) {
      showMessage("game-over");
    }
  });
  restartButton.addEventListener("click", startNewGame);
  newGameButton.addEventListener("click", startNewGame);

  startNewGame();
}
