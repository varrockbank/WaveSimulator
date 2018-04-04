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

/**
 * @param m number of columns
 * @param i row number
 * @param j column number
 * @return index into ( m x n ) matrix represented with a 1-d buffer
 */
export function getSingleBufferRowMajorMatrixIndex(m, i, j) {
  return i * m + j
}

