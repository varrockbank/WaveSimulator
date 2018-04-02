export interface Epicenter {
  readonly x: number,
  readonly y: number,
}

/**
 * A wave is represented as a time sequenced set of height impressions relative to an epicenter. 
 * This implementation uses pre-determined static values for the sequence.
 * The alternative is modeling the wave as a sum of forces eminating from the epicenter 
 * which reduces down to some mass constant and acceleration vectors, and dynamically updating
 * the system. This is computationally expensive and tricky to get a good model, especially
 * in a discrete space lacking sufficient granularity. Plus, this computation is mostly 
 * deterministic, give or take floating point errors, for some given mass M and the fact that
 * center-of-mass for the wave is fixed relative to the outer system. A convenient heuristic to 
 * keep in mind is that this force, atleast in the abstract, should be conservative. In other words,
 * whatever implementation, static or dynamic, should ensure the total force does not increase, 
 * as this will ensure the simulation to diverges.
 */
export class Wave {
  private stage = 0
  private states = [
    [
      {
        x_offset: 0,
        y_offset: 0,
        z: 10
      },
    ],
    [
      {
        x_offset: -1,
        y_offset: 0,
        z: 5
      },
      {
        x_offset: 1,
        y_offset: 0,
        z: 5
      },
      {
        x_offset: 0,
        y_offset: 1,
        z: 5
      },
      {
        x_offset: 0,
        y_offset: -1,
        z: 5
      },
    ],
    [
      {
        x_offset: -1,
        y_offset: -1,
        z: 3
      },
      {
        x_offset: 1,
        y_offset: 1,
        z: 3
      },
      {
        x_offset: -1,
        y_offset: 1,
        z: 3
      },
      {
        x_offset: 1,
        y_offset: -1,
        z: 3
      }
    ],
    [
      {
        x_offset: -1,
        y_offset: -2,
        z: 1
      },
      {
        x_offset: 1,
        y_offset: -2,
        z: 1
      },
      {
        x_offset: -1,
        y_offset: 2,
        z: 1
      },
      {
        x_offset: 1,
        y_offset: 2,
        z: 1
      },

      {
        x_offset: -2,
        y_offset: -1,
        z: 1
      },
      {
        x_offset: -2,
        y_offset: 1,
        z: 1
      },
      {
        x_offset: 2,
        y_offset: -1,
        z: 1
      },
      {
        x_offset: 2,
        y_offset: 1,
        z: 1
      },
    ],
  ]
  private numStates: number;

  constructor(private readonly epicenter: Epicenter) {
    this.numStates = this.states.length
  }

  getPoints() {
    const {x, y} = this.epicenter
    const state = this.states[this.stage]
    return !state ? [] : state.map(relativePoint => {
      return {
        x: x + relativePoint.x_offset,
        y: y + relativePoint.y_offset,
        z: relativePoint.z
      }
    })
  }

  /**
   * @return Whether reached end of lifecycle.
   */
  step(): boolean {
    this.stage++
    return this.stage >= this.numStates
  }
}