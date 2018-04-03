/**
 * Models as water surface as springs along the z-axis.
 *
 * Lower dimensional variant: https://gamedevelopment.tutsplus.com/tutorials/make-a-splash-with-dynamic-2d-water-effects--gamedev-236
 */

export class SpringModel {
  public heightMap: number[][]
  public velocityMap: number[][]

  // Physics parameters.
  private readonly K = 0.03 // "Hooke's constant"
  private readonly D = 0.025 // Dampening Factor
  private readonly TERMINAL_VELOCITY = 1.5

  constructor(private readonly ROWS, private readonly COLUMNS) {
    let numRows = this.ROWS + 1
    const numCols = this.COLUMNS + 1
    const heightMap = new Array(numRows);
    const velocityMap = new Array(numRows);
    while(numRows--) {
        heightMap[numRows] = (new Array(numCols)).fill(0)
        velocityMap[numRows] = (new Array(numCols)).fill(0)
    }
    this.heightMap = heightMap
    this.velocityMap = velocityMap
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
  private roundDecimal(num) {
    return Math.round(num * 10000) / 10000
  }
}