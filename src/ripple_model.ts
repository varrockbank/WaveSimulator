import { makeRowOrderMatrix ,  getSingleBufferRowMajorMatrixIndex as flatIndex} from "./utilities"

/**
 * A heightfield based ripple model which updates points with average of neighbors from previous
 * iteration + delta from previous iteration.
 * 
 * Reference: http://matthias-mueller-fischer.ch/talks/GDC2008.pdf
 */
export class RippleModel {
  // Row-major 1-d represenration of 2-d matrix.
  private rippleHeightMap: number[]
  private rippleHeightMap_prev: number[]
    
  constructor(private readonly ROWS, private readonly COLUMNS) {
    this.rippleHeightMap = (new Array(ROWS * COLUMNS)).fill(0)
    this.rippleHeightMap_prev = (new Array(ROWS * COLUMNS)).fill(0)
  }

  iterate() {
    for(let i = 0; i < this.ROWS; i++) {
      for(let j = 0 ; j < this.COLUMNS; j++) {
        const index = flatIndex(this.COLUMNS, i, j)
        const elements = [
          this.rippleHeightMap_prev[flatIndex(this.COLUMNS, Math.min(i+1, this.ROWS-1), j)],
          this.rippleHeightMap_prev[flatIndex(this.COLUMNS, Math.max(i-1, 0), j)],
          this.rippleHeightMap_prev[flatIndex(this.COLUMNS, i, Math.max(j-1, 0))],
          this.rippleHeightMap_prev[flatIndex(this.COLUMNS, i, Math.min(j+1, this.COLUMNS-1))],
          this.rippleHeightMap_prev[flatIndex(this.COLUMNS, Math.min(i+1, this.ROWS-1), Math.max(j-1, 0))],
          this.rippleHeightMap_prev[flatIndex(this.COLUMNS, Math.min(i+1, this.ROWS-1), Math.min(j+1, this.COLUMNS-1))],
          this.rippleHeightMap_prev[flatIndex(this.COLUMNS, Math.max(i-1, 0), Math.max(j-1, 0))],
          this.rippleHeightMap_prev[flatIndex(this.COLUMNS, Math.max(i-1, 0), Math.min(j+1, this.COLUMNS-1))],
        ]
        // TODO: Don't give each each neighbor equal weight
        this.rippleHeightMap[index] += (elements.reduce((total, num) => total + num) / 8) - this.rippleHeightMap_prev[index]
        this.rippleHeightMap[index] *= .95
      }
    }
    for(let i = 0; i < this.ROWS ; i++) {
      for(let j = 0 ; j < this.COLUMNS ; j++) {
        const index = flatIndex(this.COLUMNS, i, j)
        this.rippleHeightMap_prev[index] += this.rippleHeightMap[index]
      }
    }
  }

  public getHeightMap() {
    const heightMap = makeRowOrderMatrix(this.ROWS, this.COLUMNS)
    for(let i = 0; i < this.ROWS; i++) {
      for(let j = 0 ; j < this.COLUMNS; j++) {
        heightMap[i][j] = this.rippleHeightMap[flatIndex(this.COLUMNS, i, j)]
      }
    }
    return heightMap
  }

  public applyImpression(rowIndex, columnIndex) {
    const index = flatIndex(this.COLUMNS, rowIndex, columnIndex)
    if(this.rippleHeightMap_prev[index] < 0) {
      this.rippleHeightMap_prev[index] -= 10
    } else {
      this.rippleHeightMap_prev[index] += 10
    }
  }
}