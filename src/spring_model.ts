import { getSingleBufferRowMajorMatrixIndexer, getRandomDirection} from "./utilities"

/**
 * Models water surface as springs along the z-axis.
 *
 * Lower dimensional variant: https://gamedevelopment.tutsplus.com/tutorials/make-a-splash-with-dynamic-2d-water-effects--gamedev-236
 */
export class SpringModel {
  protected readonly heightField: number[]
  protected readonly velocityField: number[]

  // Physics parameters.
  protected readonly K = 0.03 // Hooke's constant
  protected readonly D = 0.025 // Dampening Factor
  protected readonly TERMINAL_VELOCITY = 1.5

  protected readonly indexer: (i, j) => number

  constructor(
    protected readonly ROWS,
    protected readonly COLUMNS,
  ) {
    this.heightField = (new Array(ROWS * COLUMNS)).fill(0)
    this.velocityField =  (new Array(ROWS * COLUMNS)).fill(0)
    this.indexer = getSingleBufferRowMajorMatrixIndexer(COLUMNS)
  }

  iterate() {
    const indexer = this.indexer
    const heightField = this.heightField
    const velocityField = this.velocityField

    let rowNum = this.ROWS
    while(rowNum--) {
      let colNum = this.COLUMNS
      while(colNum--) {
        const index = indexer(rowNum, colNum)
        const velocity = velocityField[index]
        heightField[index] += velocity

        const targetHeight = 0
        const height = heightField[index]
        const x = height - targetHeight
        const acceleration = (-1 * this.K * x) - ( this.D * velocity)
        velocityField[index] += this.roundDecimal(acceleration)
        velocityField[index] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[index]))
      }
    }
  }

  // TODO: refactor into utility
  protected roundDecimal(num) {
    return Math.round(num * 10000) / 10000
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

  initRandomHeight() {
    const indexer = this.indexer
    const numCols = this.COLUMNS
    const numRows = this.ROWS
    const heightField = this.heightField
    // Seed the first cell.
    heightField[indexer(0, 0)] = Math.floor(10 * Math.random()) * getRandomDirection()
    // Random walk along first row.
    for(let j = 1 ; j < numCols ; j++) {
      const neighborHeight = heightField[indexer(0, j-1)]
      heightField[indexer(0, j)] = neighborHeight + getRandomDirection()
    }
    // Random walk along first column.
    for(let i = 1 ; i < numRows ; i++) {
      const neighborHeight = heightField[indexer(i-1, 0)]
      heightField[indexer(i, 0)] = neighborHeight + getRandomDirection()
    }
    // Loop over inner cells, assigning height as +-1 from midpoint of top and left neighbor
    for(let i = 1 ; i < numRows ; i++) {
      for(let j = 1 ; j < numCols ; j++) {
        const topNeighbor = heightField[indexer(i-1, j)]
        const leftNeighbor = heightField[indexer(i, j-1)]
        const midpoint = ( topNeighbor + leftNeighbor ) / 2
        heightField[indexer(i, j)] =Math.round(midpoint) + getRandomDirection()
      }
    }
  }
}