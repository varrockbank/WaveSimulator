import { makeRowOrderMatrix, getSingleBufferRowMajorMatrixIndexer } from "./utilities"

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

  getHeightMap() {
    const heightMap = makeRowOrderMatrix(this.ROWS, this.COLUMNS)
    const indexer = this.indexer
    let i = this.ROWS
    while(i--) {
      let j = this.COLUMNS
      while(j--) heightMap[i][j] = this.heightMap[indexer(i, j)]
    }
    return heightMap
  }
}