/// <reference types='../typings/three' /> 

import { Engine } from './engine'

const init = (): void => {
  const engine: Engine = new Engine()

}

window.onload = init