import { getSingleBufferRowMajorMatrixIndexer} from "./utilities"

/**
 * A heightfield based ripple model which updates points with average of neighbors from previous
 * iteration + delta from previous iteration.
 * 
 * Reference: http://matthias-mueller-fischer.ch/talks/GDC2008.pdf
 */
export class RippleModel {
  // Row-major 1-d represenration of 2-d matrix.
  private readonly heightField: number[]
  private readonly heightField_prev: number[]

  // Physics constants:
  // Dampening value between 0 and 1 inclusive.
  private readonly D = .95

  private indexer: (i, j) => number

  constructor(private readonly M, private readonly N) {
    this.heightField = (new Array(M * N)).fill(0)
    this.heightField_prev = (new Array(M * N)).fill(0)
    this.indexer = getSingleBufferRowMajorMatrixIndexer(N)
  }

  iterate() {
    {
      const indexer = this.indexer
      const N = this.N
      let i = this.M
      while(i--) {
        let j = N
        while(j--) {
          const index = indexer(i, j)
          const elements = [
            this.heightField_prev[indexer(Math.min(i+1, this.M-1), j)],
            this.heightField_prev[indexer(Math.max(i-1, 0), j)],
            this.heightField_prev[indexer(i, Math.max(j-1, 0))],
            this.heightField_prev[indexer(i, Math.min(j+1, this.N-1))],
            this.heightField_prev[indexer(Math.min(i+1, this.M-1), Math.max(j-1, 0))],
            this.heightField_prev[indexer(Math.min(i+1, this.M-1), Math.min(j+1, this.N-1))],
            this.heightField_prev[indexer(Math.max(i-1, 0), Math.max(j-1, 0))],
            this.heightField_prev[indexer(Math.max(i-1, 0), Math.min(j+1, this.N-1))],
          ]
          // TODO: Don't give each each neighbor equal weight
          this.heightField[index] += (elements.reduce((total, num) => total + num) / 8) - this.heightField_prev[index]
          this.heightField[i] *= this.D
        }
      }
    }
    {
      let i = this.heightField.length
      while(i--) this.heightField_prev[i] += this.heightField[i]
    }
  }

  /**
   * @return copy of height buffer
   */
  getHeightBuffer() {
    let i = this.heightField.length
    const heightBuffer = (new Array(i))
    while(i--)
      heightBuffer[i] = this.heightField[i]
    return heightBuffer
  }

  public applyImpression(rowIndex, columnIndex) {
    const index = this.indexer(rowIndex, columnIndex)
    if(this.heightField_prev[index] < 0) {
      this.heightField_prev[index] -= 10
    } else {
      this.heightField_prev[index] += 10
    }
  }
}