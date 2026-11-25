/** Return the next bounded cell for keyboard navigation in a square grid. */
export function getNextGridCell(row, col, key, gridSize = 20) {
  if (
    !Number.isInteger(row)
    || !Number.isInteger(col)
    || !Number.isInteger(gridSize)
    || gridSize < 1
    || row < 0
    || col < 0
    || row >= gridSize
    || col >= gridSize
  ) return null;

  let nextRow = row;
  let nextCol = col;
  switch (key) {
    case 'ArrowUp':
      nextRow = Math.max(0, row - 1);
      break;
    case 'ArrowDown':
      nextRow = Math.min(gridSize - 1, row + 1);
      break;
    case 'ArrowLeft':
      nextCol = Math.max(0, col - 1);
      break;
    case 'ArrowRight':
      nextCol = Math.min(gridSize - 1, col + 1);
      break;
    case 'Home':
      nextCol = 0;
      break;
    case 'End':
      nextCol = gridSize - 1;
      break;
    default:
      return null;
  }

  return nextRow === row && nextCol === col ? null : { row: nextRow, col: nextCol };
}
