import { makeRowOrderMatrix } from "./utilities"

/**
 * Models water surface as springs along the z-axis.
 *
 * Lower dimensional variant: https://gamedevelopment.tutsplus.com/tutorials/make-a-splash-with-dynamic-2d-water-effects--gamedev-236
 */
export class SpringModel {
  public heightMap: number[][]
  public velocityMap: number[][]

  // Physics parameters.
  protected readonly K = 0.03 // Hooke's constant
  protected readonly D = 0.025 // Dampening Factor
  protected readonly TERMINAL_VELOCITY = 1.5

  constructor(protected readonly ROWS, protected readonly COLUMNS) {
    this.heightMap = makeRowOrderMatrix(ROWS, COLUMNS)
    this.velocityMap = makeRowOrderMatrix(ROWS, COLUMNS)
  }

  iterate() {
    const heightMap = this.heightMap
    const velocityMap = this.velocityMap

    console.assert(heightMap.length == velocityMap.length)
    let rowNum = heightMap.length
    while(rowNum--) {
      const heightRow = heightMap[rowNum]
      const velocityRow = velocityMap[rowNum]
      console.assert(heightRow.length == velocityRow.length)
      let colNum = heightRow.length
      while(colNum--) {
        const velocity = velocityRow[colNum]
        heightRow[colNum] += velocity

        const targetHeight = 0
        const height = heightRow[colNum]
        const x = height - targetHeight
        const acceleration = (-1 * this.K * x) - ( this.D * velocity)
        velocityRow[colNum] += this.roundDecimal(acceleration)
        velocityRow[colNum] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityRow[colNum]))
      }
    }
  }

  // TODO: refactor into utility
  protected roundDecimal(num) {
    return Math.round(num * 10000) / 10000
  }
}