import { makeRowOrderMatrix } from "./utilities"

/**
 * A heightfield based ripple model which updates points with average of neighbors from previous
 * iteration + delta from previous iteration.
 * 
 * Reference: http://matthias-mueller-fischer.ch/talks/GDC2008.pdf
 */
export class RippleModel {
  private rippleHeightMap: number[][]
  private rippleHeightMap_prev: number[][]
    
  constructor(private readonly ROWS, private readonly COLUMNS) {
    this.rippleHeightMap = makeRowOrderMatrix(ROWS, COLUMNS)
    this.rippleHeightMap_prev = makeRowOrderMatrix(ROWS, COLUMNS)
  }

  iterate() {
    for(let i = 0; i < this.ROWS; i++) {
      for(let j = 0 ; j < this.COLUMNS; j++) {
        const elements = [
          this.rippleHeightMap_prev[Math.min(i+1, this.ROWS-1)][j],
          this.rippleHeightMap_prev[Math.max(i-1, 0)][j],
          this.rippleHeightMap_prev[i][Math.max(j-1, 0)],
          this.rippleHeightMap_prev[i][Math.min(j+1, this.COLUMNS-1)],
          this.rippleHeightMap_prev[Math.min(i+1, this.ROWS-1)][Math.max(j-1, 0)],
          this.rippleHeightMap_prev[Math.min(i+1, this.ROWS-1)][Math.min(j+1, this.COLUMNS-1)],
          this.rippleHeightMap_prev[Math.max(i-1, 0)][Math.max(j-1, 0)],
          this.rippleHeightMap_prev[Math.max(i-1, 0)][Math.min(j+1, this.COLUMNS-1)],
        ]
        // TODO: Don't give each each neighbor equal weight
        this.rippleHeightMap[i][j] += (elements.reduce((total, num) => total + num) / 8) - this.rippleHeightMap_prev[i][j]
        this.rippleHeightMap[i][j] *= .95
      }
    }
    for(let i = 0; i < this.ROWS ; i++) {
      for(let j = 0 ; j < this.COLUMNS ; j++) {
        this.rippleHeightMap_prev[i][j] += this.rippleHeightMap[i][j]
      }
    }
  }

  public getHeightMap() {
    return this.rippleHeightMap
  }

  public applyImpression(rowIndex, columnIndex) {
    if(this.rippleHeightMap_prev[rowIndex][columnIndex] < 0) {
      this.rippleHeightMap_prev[rowIndex][columnIndex] -= 10
    } else {
      this.rippleHeightMap_prev[rowIndex][columnIndex] += 10
    }
  }
}