import { SpringModel } from "./spring_model";

export class PropagationSpringModel extends SpringModel {

  private propagationModelBuffers: {
    leftDelta: number[][],
    rightDelta: number[][],
    topDelta: number[][],
    bottomDelta: number[][],
  }

  // Physics parameters.
  private S = 0.0005 // Wave spread.
  private BACK_PROPAGATIONS = 4

  constructor(ROWS: number, COLUMNS: number) {
    super(ROWS, COLUMNS)
    const leftDelta = new Array(this.ROWS + 1);
    const rightDelta = new Array(this.ROWS + 1);
    for(let i = 0 ; i < this.ROWS + 1; i++) {
      leftDelta[i] = (new Array(this.COLUMNS + 1)).fill(0)
      rightDelta[i] = (new Array(this.COLUMNS + 1)).fill(0)
    }
    const topDelta = new Array(this.COLUMNS + 1);
    const bottomDelta = new Array(this.COLUMNS + 1);
    for(let i = 0 ; i < this.COLUMNS + 1; i++) {
      topDelta[i] = (new Array(this.ROWS + 1)).fill(0)
      bottomDelta[i] = (new Array(this.ROWS + 1)).fill(0)
    }
    this.propagationModelBuffers = {
      leftDelta,
      rightDelta,
      topDelta,
      bottomDelta
    }
  }

  public iteratePropagation() {
    const heightMap = this.heightMap
    const velocityMap = this.velocityMap 

    const {
      leftDelta,
      rightDelta,
      topDelta,
      bottomDelta,
    } = this.propagationModelBuffers
    // Clear deltas.
    for(let i = 0 ; i < this.ROWS + 1; i++) {
      leftDelta[i] = leftDelta[i].fill(0)
      rightDelta[i] = rightDelta[i].fill(0)
    }
    for(let i = 0 ; i < this.COLUMNS + 1; i++) {
      topDelta[i] = topDelta[i].fill(0)
      bottomDelta[i] = bottomDelta[i].fill(0)
    }

    for(let l = 0 ; l < this.BACK_PROPAGATIONS; l++) {
      // Horizontal propagation
      for(let i = 0 ; i < heightMap.length; i++) {
        const heightRow = heightMap[i]
        const rowVelocity = velocityMap[i]
        // Left velocity propagation.
        for(let j = 1; j < heightRow.length; j++) {
          leftDelta[i][j] = this.roundDecimal(this.S * (heightRow[j] - heightRow[j-1]))
          rowVelocity[j] += leftDelta[i][j]
          if(rowVelocity[j] < 0 ) {
            rowVelocity[j] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[j]))            
          } else if (rowVelocity[j] > 0 ) {
            rowVelocity[j] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[j]))
          }
        }
        // Right velocity propagation.
        for(let j = 0; j < heightRow.length - 1; j++) {
          rightDelta[i][j] = this.roundDecimal(this.S * (heightRow[j] - heightRow[j+1]))
          rowVelocity[j] += rightDelta[i][j]
          if(rowVelocity[j] < 0 ) {
            rowVelocity[j] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[j]))
          } else if (rowVelocity[j] > 0 ) {
            rowVelocity[j] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[j]))
          }
        }
        // Left height propagation
        for(let j = 1; j < heightRow.length; j++) {
          heightMap[i][j-1] += leftDelta[i][j]
        }
        // Right height propagation
        for(let j = 0; j < heightRow.length - 1; j++) {
          heightMap[i][j+1] += rightDelta[i][j]
        }
      }
      // End Horizontal propagation.
      // Vertical propagation.
      for(let j = 0 ; j < heightMap[0].length; j++) {
        for(let i = 1; i < heightMap.length; i++) {
          topDelta[i][j] = this.roundDecimal(this.S * ( heightMap[i][j] - heightMap[i-1][j] ))
          velocityMap[i][j] += topDelta[i][j]
          if(velocityMap[i][j] < 0) {
            velocityMap[i][j] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[i][j]))            
          } else if (velocityMap[i][j] > 0) {
            velocityMap[i][j] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[i][j]))            
          }
        }
        for(let i = 0; i < heightMap.length - 1; i++) {
          bottomDelta[i][j] = this.S * ( heightMap[i][j] - heightMap[i+1][j] )
          velocityMap[i][j] += bottomDelta[i][j]
          if(velocityMap[i][j] < 0) {
            velocityMap[i][j] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[i][j]))            
          } else if (velocityMap[i][j] > 0) {
            velocityMap[i][j] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[i][j]))            
          }
        }
        for(let i = 1; i < heightMap.length; i++) {
          heightMap[i-1][j] += topDelta[i][j]
        }
        for(let i = 0; i < heightMap.length - 1; i++) {
          heightMap[i+1][j] += bottomDelta[i][j]
        }
      }
      // End vertical propagation
    }
  }
}