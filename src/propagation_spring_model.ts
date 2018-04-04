import { SpringModel } from "./spring_model"

/**
 * SpringModel models each point in the plane as an independent spring without lateral interaction.
 * PropagationSpringModel has points pull on neighbors making wave oscillate laterally.
 */
export class PropagationSpringModel extends SpringModel {

  private propagationModelBuffers: {
    leftDelta: number[],
    rightDelta: number[],
    topDelta: number[],
    bottomDelta: number[],
  }

  // Physics parameters.
  private S = 0.0005 // Wave spread.
  private BACK_PROPAGATIONS = 4

  constructor(ROWS: number, COLUMNS: number) {
    super(ROWS, COLUMNS)
    this.propagationModelBuffers = {
      leftDelta: new Array(ROWS * COLUMNS),
      rightDelta: new Array(ROWS * COLUMNS),
      topDelta: new Array(ROWS * COLUMNS),
      bottomDelta: new Array(ROWS * COLUMNS)
    }
  }

  public iteratePropagation() {
    const indexer = this.indexer
    const heightMap = this.heightMap
    const velocityMap = this.velocityMap 

    let {
      leftDelta,
      rightDelta,
      topDelta,
      bottomDelta,
    } = this.propagationModelBuffers
    // Clear deltas.
    leftDelta = leftDelta.fill(0)
    rightDelta = rightDelta.fill(0)
    topDelta = topDelta.fill(0)
    bottomDelta = bottomDelta.fill(0)

    for(let l = 0 ; l < this.BACK_PROPAGATIONS; l++) {
      // Horizontal propagation
      for(let i = 0 ; i < heightMap.length; i++) {
        const heightRow = heightMap[i]
        const rowVelocity = velocityMap[i]
        // Left velocity propagation.
        for(let j = 1; j < heightRow.length; j++) {
          leftDelta[indexer(i, j)] = this.roundDecimal(this.S * (heightRow[j] - heightRow[j-1]))
          rowVelocity[j] += leftDelta[indexer(i, j)]
          if(rowVelocity[j] < 0 ) {
            rowVelocity[j] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[j]))            
          } else if (rowVelocity[j] > 0 ) {
            rowVelocity[j] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[j]))
          }
        }
        // Right velocity propagation.
        for(let j = 0; j < heightRow.length - 1; j++) {
          rightDelta[indexer(i, j)] = this.roundDecimal(this.S * (heightRow[j] - heightRow[j+1]))
          rowVelocity[j] += rightDelta[indexer(i, j)]
          if(rowVelocity[j] < 0 ) {
            rowVelocity[j] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[j]))
          } else if (rowVelocity[j] > 0 ) {
            rowVelocity[j] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[j]))
          }
        }
        // Left height propagation
        for(let j = 1; j < heightRow.length; j++) {
          heightMap[i][j-1] += leftDelta[indexer(i, j)]
        }
        // Right height propagation
        for(let j = 0; j < heightRow.length - 1; j++) {
          heightMap[i][j+1] += rightDelta[indexer(i, j)]
        }
      }
      // End Horizontal propagation.
      // Vertical propagation.
      for(let j = 0 ; j < heightMap[0].length; j++) {
        for(let i = 1; i < heightMap.length; i++) {
          topDelta[indexer(i, j)] = this.roundDecimal(this.S * ( heightMap[i][j] - heightMap[i-1][j] ))
          velocityMap[i][j] += topDelta[indexer(i, j)]
          if(velocityMap[i][j] < 0) {
            velocityMap[i][j] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[i][j]))            
          } else if (velocityMap[i][j] > 0) {
            velocityMap[i][j] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[i][j]))            
          }
        }
        for(let i = 0; i < heightMap.length - 1; i++) {
          bottomDelta[indexer(i, j)] = this.S * ( heightMap[i][j] - heightMap[i+1][j] )
          velocityMap[i][j] += bottomDelta[indexer(i, j)]
          if(velocityMap[i][j] < 0) {
            velocityMap[i][j] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[i][j]))            
          } else if (velocityMap[i][j] > 0) {
            velocityMap[i][j] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[i][j]))            
          }
        }
        for(let i = 1; i < heightMap.length; i++) {
          heightMap[i-1][j] += topDelta[indexer(i, j)]
        }
        for(let i = 0; i < heightMap.length - 1; i++) {
          heightMap[i+1][j] += bottomDelta[indexer(i, j)]
        }
      }
      // End vertical propagation
    }
  }
}