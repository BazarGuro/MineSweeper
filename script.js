// Глобальные переменные
let boardSize = 10; // Размер игрового поля (10x10 по умолчанию)
let selectedAmoundOfMines = 10; // Количество мин на поле
let grid = []; // Двумерный массив, представляющий игровое поле
let isGameOver = false; // Флаг, указывающий, закончена ли игра
let revealedCellsCount = 0; // Счётчик открытых клеток
let flaggedCellsCount = 0; // Счётчик помеченных флагами клеток

// Элементы DOM:
const board = document.getElementById("board"); // Контейнер игрового поля
const explosionSound = document.getElementById("gameOverSound"); // Звук взрыва
const dialog = document.getElementById("dialog"); // Диалоговое окно
const dialogMessage = document.getElementById("dialogMessage"); // Сообщение в диалоге
const dialogButton = document.getElementById("dialogButton"); // Кнопка в диалоге


document.getElementById("startGame").addEventListener("click", () => {
  // Получаем выбранные пользователем настройки
  boardSize = parseInt(document.getElementById("boardSize").value)
  selectedAmoundOfMines = parseInt(document.getElementById("mineCount").value)

  startGame() // Запускаем игру
});

// Функция запуска игры
function startGame() {
  // Сброс состояния игры
  isGameOver = false;
  revealedCellsCount = 0;
  flaggedCellsCount = 0;
  grid = [];
  board.innerHTML = "";

  // Установка размера сетки CSS
  board.style.gridTemplateColumns = `repeat(${boardSize}, 30px)`;

  // Основные этапы создания игры:
  createBoard(); // Создаём игровое поле
  placedMines(); // Расставляем мины
  calculateNeighbours(); // Подсчитываем мины вокруг каждой клетки
}

// Функция создания игрового поля
function createBoard() {
  for (let row = 0; row < boardSize; row++) {
    const rowArr = []; // Массив для текущей строки

    for (let col = 0; col < boardSize; col++) {
      // Создаём элемент клетки
      const cell = document.createElement("div");
      cell.classList.add("cell");

      // Объект с данными клетки
      const cellData = {
        element: cell, // DOM-элемент
        row: row, // Номер строки
        col: col, // Номер столбца
        isMine: false, // Является ли миной
        mineCount: 0, // Количество мин вокруг
        isFlagged: false, // Помечена ли флагом
        isRevealed: false // Открыта ли
      }

      // Обработчики событий:
      cell.addEventListener("click", () => revealCell(cellData)); // ЛКМ - открыть
      cell.addEventListener("contextmenu", (e) => { // ПКМ - поставить флаг
        e.preventDefault();
        toggleFlag(cellData);
      });

      rowArr.push(cellData); // Добавляем клетку в строку
      board.appendChild(cell); // Добавляем клетку на доску
    }

    grid.push(rowArr); // Добавляем строку в сетку
  }
}

// Функция расстановки мин
function placedMines() {
  let minesPlaced = 0; // Счётчик установленных мин

  while (minesPlaced < selectedAmoundOfMines) {
    // Случайные координаты
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);

    // Если в клетке ещё нет мины, ставим её
    if (!grid[row][col].isMine) {
      grid[row][col].isMine = true;
      minesPlaced++;
    }
  }
}

// Функция подсчета мин вокруг
function calculateNeighbours() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      // Пропускаем клетки с минами
      if (grid[row][col].isMine) {
        continue;
      }

      let mineCount = 0; // Счётчик мин вокруг

      // Проверяем все 8 соседних клеток
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          const newRow = row + r;
          const newCol = col + c;

          // Проверяем, что координаты в пределах поля
          if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
            if (grid[newRow][newCol].isMine) {
              mineCount++;
            }
          }
        }
      }
      grid[row][col].mineCount = mineCount; // Сохраняем количество мин вокруг
    }
  }
}

// Функция открытия клетки
function revealCell(cellData) {
  // Если игра окончена, клетка открыта или помечена флагом - ничего не делаем
  if (isGameOver || cellData.isRevealed || cellData.isFlagged) {
    return;
  }

  const cell = cellData.element;

  // Отмечаем клетку как открытую
  cellData.isRevealed = true;
  revealedCellsCount++;
  cell.classList.add("revealed");

  // Если это мина - конец игры
  if (cellData.isMine) {
    isGameOver = true;
    explosionSound.play(); // Проигрываем звук взрыва
    revealAllMines(); // Показываем все мины
    showDialog("Игра окончена! Вы проиграли.");
    return;
  }

  // Если вокруг есть мины - показываем их количество
  if (cellData.mineCount > 0) {
    cell.textContent = cellData.mineCount;
  } else {
    // Если мин вокруг нет - рекурсивно открываем соседей
    revealNeighbours(cellData.row, cellData.col);
  }

  checkWin(); // Проверяем, не выиграл ли игрок
}

// Показывает все мины на поле
function revealAllMines() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cellData = grid[row][col];

      if (cellData.isMine) {
        cellData.element.classList.add("revealed");
        cellData.element.classList.add("mine");
      }
    }
  }
}

// Переключает флаг на клетке
function toggleFlag(cellData) {
  if (isGameOver || cellData.isRevealed) {
    return;
  }

  const cell = cellData.element;

  if (cellData.isFlagged) {
    // Убираем флаг
    cellData.isFlagged = false;
    cell.classList.remove("flagged");
    flaggedCellsCount--;
  } else {
    // Ставим флаг
    cellData.isFlagged = true;
    cell.classList.add("flagged");
    flaggedCellsCount++;
  }

  checkWin(); // Проверяем победу после изменения флагов
}

// Проверяет, выиграл ли игрок
function checkWin() {
  const totalCells = boardSize * boardSize;
  const nonMineCells = totalCells - selectedAmoundOfMines;

  // Если все клетки без мин открыты - победа
  if (revealedCellsCount === nonMineCells) {
    isGameOver = true;
    showDialog("Поздравляем! Вы выиграли!");
  }
}

// Показывает диалоговое окно с сообщением
function showDialog(message) {
  dialogMessage.textContent = message;
  dialog.showModal();
}

// Обработчик кнопки в диалоге
dialogButton.addEventListener("click", () => {
  dialog.close();
});

// Рекурсивно открывает соседние пустые клетки
function revealNeighbours(row, col) {
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      const newRow = row + r;
      const newCol = col + c;

      // Проверяем границы поля
      if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
        const neighbours = grid[newRow][newCol];

        // Если клетка не открыта, не мина и не помечена флагом
        if (!neighbours.isRevealed && !neighbours.isMine && !neighbours.isFlagged) {
          neighbours.isRevealed = true;
          revealedCellsCount++;
          neighbours.element.classList.add("revealed");

          if (neighbours.mineCount === 0) {
            // Если вокруг нет мин - продолжаем рекурсивно
            revealNeighbours(newRow, newCol);
          } else {
            // Показываем количество мин вокруг
            neighbours.element.textContent = neighbours.mineCount;
          }
        }
      }
    }
  }
}
