import { makeRowOrderMatrix, getSingleBufferRowMajorMatrixIndexer, getRandomDirection} from "./utilities"

/**
 * Models water surface as springs along the z-axis.
 *
 * Lower dimensional variant: https://gamedevelopment.tutsplus.com/tutorials/make-a-splash-with-dynamic-2d-water-effects--gamedev-236
 */
export class SpringModel {
  public heightMap: number[]
  public velocityMap: number[]

  // Physics parameters.
  protected readonly K = 0.03 // Hooke's constant
  protected readonly D = 0.025 // Dampening Factor
  protected readonly TERMINAL_VELOCITY = 1.5

  protected indexer: (i, j) => number

  constructor(protected readonly ROWS, protected readonly COLUMNS) {
    this.heightMap = (new Array(ROWS * COLUMNS)).fill(0)
    this.velocityMap =  (new Array(ROWS * COLUMNS)).fill(0)
    this.indexer = getSingleBufferRowMajorMatrixIndexer(COLUMNS)
  }

  iterate() {
    const indexer = this.indexer
    const heightMap = this.heightMap
    const velocityMap = this.velocityMap

    let rowNum = this.ROWS
    while(rowNum--) {
      let colNum = this.COLUMNS
      while(colNum--) {
        const index = indexer(rowNum, colNum)
        const velocity = velocityMap[index]
        heightMap[index] += velocity

        const targetHeight = 0
        const height = heightMap[index]
        const x = height - targetHeight
        const acceleration = (-1 * this.K * x) - ( this.D * velocity)
        velocityMap[index] += this.roundDecimal(acceleration)
        velocityMap[index] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[index]))
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
    let i = this.heightMap.length
    const heightBuffer = (new Array(i))
    while(i--)
      heightBuffer[i] = this.heightMap[i]
    return heightBuffer
  }

  initRandomHeight() {
    const indexer = this.indexer
    const numCols = this.COLUMNS
    const numRows = this.ROWS
    const heightMap = this.heightMap
    // Seed the first cell.
    heightMap[indexer(0, 0)] = Math.floor(10 * Math.random()) * getRandomDirection()
    // Random walk along first row.
    for(let j = 1 ; j < numCols ; j++) {
      const neighborHeight = heightMap[indexer(0, j-1)]
      heightMap[indexer(0, j)] = neighborHeight + getRandomDirection()
    }
    // Random walk along first column.
    for(let i = 1 ; i < numRows ; i++) {
      const neighborHeight = heightMap[indexer(i-1, 0)]
      heightMap[indexer(i, 0)] = neighborHeight + getRandomDirection()
    }
    // Loop over inner cells, assigning height as +-1 from midpoint of top and left neighbor
    for(let i = 1 ; i < numRows ; i++) {
      for(let j = 1 ; j < numCols ; j++) {
        const topNeighbor = heightMap[indexer(i-1, j)]
        const leftNeighbor = heightMap[indexer(i, j-1)]
        const midpoint = ( topNeighbor + leftNeighbor ) / 2
        heightMap[indexer(i, j)] =Math.round(midpoint) + getRandomDirection()
      }
    }
  }
}