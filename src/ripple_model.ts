import { makeRowOrderMatrix,  getSingleBufferRowMajorMatrixIndex as flatIndex} from "./utilities"

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

  constructor(private readonly M, private readonly N) {
    this.heightField = (new Array(M * N)).fill(0)
    this.heightField_prev = (new Array(M * N)).fill(0)
  }

  iterate() {
    {
      let i = this.M
      while(i--) {
        let j = this.N
        while(j--) {
          const index = flatIndex(this.N, i, j)
          const elements = [
            this.heightField_prev[flatIndex(this.N, Math.min(i+1, this.M-1), j)],
            this.heightField_prev[flatIndex(this.N, Math.max(i-1, 0), j)],
            this.heightField_prev[flatIndex(this.N, i, Math.max(j-1, 0))],
            this.heightField_prev[flatIndex(this.N, i, Math.min(j+1, this.N-1))],
            this.heightField_prev[flatIndex(this.N, Math.min(i+1, this.M-1), Math.max(j-1, 0))],
            this.heightField_prev[flatIndex(this.N, Math.min(i+1, this.M-1), Math.min(j+1, this.N-1))],
            this.heightField_prev[flatIndex(this.N, Math.max(i-1, 0), Math.max(j-1, 0))],
            this.heightField_prev[flatIndex(this.N, Math.max(i-1, 0), Math.min(j+1, this.N-1))],
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

  public getHeightMap() {
    const heightMap = makeRowOrderMatrix(this.M, this.N)
    let i = this.M
    while(i--) {
      let j = this.N
      while(j--) heightMap[i][j] = this.heightField[flatIndex(this.N, i, j)]
    }
    return heightMap
  }

  public applyImpression(rowIndex, columnIndex) {
    const index = flatIndex(this.N, rowIndex, columnIndex)
    if(this.heightField_prev[index] < 0) {
      this.heightField_prev[index] -= 10
    } else {
      this.heightField_prev[index] += 10
    }
  }
}