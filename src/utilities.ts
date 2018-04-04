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
 * @return function for indexing into 1-d buffer representing ( m x n ) matrix
 */
export function getSingleBufferRowMajorMatrixIndexer(m) {
  return (i, j) => i * m + j
}

  /**
   * @return Random number in [-1, 0, 1]
   */
  export function getRandomDirection(): number {
    return Math.floor(3 * Math.random()) - 1
  }
