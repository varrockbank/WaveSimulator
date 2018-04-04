/// <reference types='../typings/three' /> 

import { Engine } from './engine'

const init = (): void => {
  const numRows = 50
  const numColumns = 50
  const engine: Engine = new Engine(numRows, numColumns)
}

window.onload = init