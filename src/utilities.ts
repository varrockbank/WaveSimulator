/**
 * @param rows Number of rows
 * @param columns number of columns
 * @return row-order zero matrix
 */
export function makeRowOrderMatrix(rows: number, columns): number[][] {
  const matrix = new Array(rows);
  while(rows--)
    matrix[rows] = (new Array(columns)).fill(0)
  return matrix
}