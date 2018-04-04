import { SpringModel } from "./spring_model"

/**
 * SpringModel models each point in the plane as an independent spring without lateral interaction.
 * PropagationSpringModel has points pull on neighbors making wave oscillate laterally.
 */
export class PropagationSpringModel extends SpringModel {
  private readonly propagationModelBuffers: {
    readonly leftDelta: number[],
    readonly rightDelta: number[],
    readonly topDelta: number[],
    readonly bottomDelta: number[],
  }

  // Physics parameters.
  private readonly S = 0.0005 // Wave spread.
  private readonly BACK_PROPAGATIONS = 4

  constructor(
    ROWS: number, 
    COLUMNS: number,
  ) {
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
    const heightField = this.heightField
    const velocityField = this.velocityField 

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
      for(let i = 0 ; i < this.N; i++) {
        // Left velocity propagation.
        for(let j = 1; j < this.M; j++) {
          const index = indexer(i, j)
          leftDelta[index] = this.roundDecimal(this.S * (heightField[index] - heightField[indexer(i, j-1)]))
          velocityField[index] += leftDelta[index]
          // Clamp to 0.
          if(velocityField[index] < 0 ) {
            velocityField[index] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[index]))
          } else if (velocityField[index] > 0 ) {
            velocityField[index] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[index]))
          }
        }
        // Right velocity propagation.
        for(let j = 0; j < this.M - 1; j++) {
          const index = indexer(i, j)
          rightDelta[index] = this.roundDecimal(this.S * (heightField[index] - heightField[indexer(i, j+1)]))
          velocityField[index] += rightDelta[index]
          if(velocityField[index] < 0 ) {
            velocityField[index] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[index]))
          } else if (velocityField[index] > 0 ) {
            velocityField[index] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[index]))
          }
        }
        // Left height propagation
        for(let j = 1; j < this.M-1; j++) {
          heightField[indexer(i, j-1)] += leftDelta[indexer(i, j)]
        }
        // Right height propagation
        for(let j = 0; j < this.M - 1; j++) {
          heightField[indexer(i, j+1)] += rightDelta[indexer(i, j)]
        }
      }
      // End Horizontal propagation.
      // Vertical propagation.
      for(let j = 0 ; j < this.M; j++) {
        for(let i = 1; i < this.N ; i++) {
          const index = indexer(i, j)
          topDelta[index] = this.roundDecimal(this.S * ( heightField[index] - heightField[indexer(i-1, j)] ))
          velocityField[index] += topDelta[index]
          if(velocityField[index] < 0) {
            velocityField[index] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[index]))
          } else if (velocityField[index] > 0) {
            velocityField[index] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[index]))
          }
        }
        for(let i = 0; i < this.N - 1; i++) {
          const index = indexer(i, j)
          bottomDelta[index] = this.S * ( heightField[index] - heightField[indexer(i+1, j)] )
          velocityField[index] += bottomDelta[index]
          if(velocityField[index] < 0) {
            velocityField[index] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[index]))
          } else if (velocityField[index] > 0) {
            velocityField[index] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[index]))
          }
        }
        for(let i = 1; i < this.N; i++) {
          heightField[indexer(i-1, j)] += topDelta[indexer(i, j)]
        }
        for(let i = 0; i < this.N - 1; i++) {
          heightField[indexer(i+1, j)] += bottomDelta[indexer(i, j)]
        }
      }
      // End vertical propagation
    }
  }
}