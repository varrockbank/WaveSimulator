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

export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
};