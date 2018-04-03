// This resulted in really funky waves

import { Wave } from "../wave";

interface Point {
  x: number,
  y: number,
  z?: number,
}

export class Engine {
  private width = window.innerWidth
  private height = window.innerHeight

  // Physics parameters.
  private K = 0.03 // "Hooke's constant"
  private D = 0.025 // Dampening Factor
  private S = 0.001 // Wave spread.
  private BACK_PROPAGATIONS = 4
  private TERMINAL_VELOCITY = 1.5

  private readonly ROWS = 50
  private readonly COLUMNS = 50
  private readonly PLANE_WIDTH = 100
  private readonly PLANE_HEIGHT = 100
  private readonly CELL_HEIGHT = this.PLANE_HEIGHT / this.ROWS
  private readonly CELL_WIDTH = this.PLANE_WIDTH / this.COLUMNS

  private heightMap: number[][]
  // Given coordinate stores Average of neighbors
  private heightMapAverage: number[][]
  private velocityMap: number[][]
  
  private propagationModelBuffers: {
    leftDelta: number[][],
    rightDelta: number[][],
    topDelta: number[][],
    bottomDelta: number[][],
  }

  // Key press to trigger a simulation cycle.
  private readonly ITERATION_TRIGGER_KEY = 'x';
  private readonly AUTOMATIC_TRIGGER_KEY = 'y';
  private readonly RANDOM_WALK_TRIGGER_KEY = 'z';

  private scene: THREE.Scene
  private camera: THREE.Camera
  private renderer: THREE.WebGLRenderer
  private controls: THREE.OrbitControls
  private raycaster: THREE.Raycaster

  // For identification of raycaster intersect.
  private planeUUID: string
  private geometry: THREE.Geometry

  private waves: Wave[] = []

  constructor () {
    // Instance Scene.
    this.scene = new THREE.Scene()
    // Instantiate Camera.
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000)
    this.camera.position.set(0, -70, 50)
    // Instantiate render.
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setClearColor( 0xfff6e6 )
    this.renderer.setSize(this.width, this.height)
    document.body.appendChild( this.renderer.domElement)
    // Instantiate controls.
    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement )
    // Instantiate raycaster.
    this.raycaster = new THREE.Raycaster()

    const texture = new THREE.TextureLoader().load( "textures/water.jpg")
    const geometry = new THREE.PlaneGeometry(this.PLANE_WIDTH, this.PLANE_HEIGHT, this.ROWS, this.COLUMNS)
    const material = new THREE.MeshPhongMaterial({
      color: 0x00EEEE,
      flatShading: true,
      shininess: 5,
      // map: texture,
    })

    const plane = new THREE.Mesh(geometry, material)
    plane.position.z = 20
    this.planeUUID = plane.uuid;
    this.geometry = plane.geometry as THREE.Geometry;
    this.scene.add(plane)
  
    const axes = new THREE.AxisHelper(100)
    this.scene.add(axes)

    this.animate()

    this.addEventListeners()

    this.initSpringModel()
    this.initPropagationModel()
    // this.initRandomHeightmap()

    this.renderer.gammaInput = true
    this.renderer.gammaOutput = true

    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.renderReverseSided = false

    // Hemisphere Light
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 )
    hemiLight.groundColor.setHSL( 0.1, 0.2, 0.2 )
    this.scene.add( hemiLight )

    // // Directional Light
    let d = 50
    let dirLight = new THREE.DirectionalLight( 0x000000, 0.5 )
    dirLight.color.setHSL( 0.1, 1, 0.95 )
    dirLight.position.set( -1, 1.75, 1 )
    dirLight.position.multiplyScalar( 30 )
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 2048
    dirLight.shadow.mapSize.height = 2048
    dirLight.shadow.camera.left = -d
    dirLight.shadow.camera.right = d
    dirLight.shadow.camera.top = d
    dirLight.shadow.camera.bottom = -d
    dirLight.shadow.camera.far = 3500
    dirLight.shadow.bias = -0.0001
    this.scene.add( dirLight )
  }

  private iterate() {
    this.updateSpringModel()
    this.zeroSpringModel()
    this.updatePropagationModel()

    this.averageHeightmap()
    this.applyHeightmapToGeometry()
    this.applyWavesToGeometry()

    this.digestGeometry()
  }
  
  private averageHeightmap() {
    let rowNum = this.ROWS
    while(rowNum--) {
      let colNum = this.COLUMNS
      while(colNum--) {
        let total = 0
        let n = 0
        if(rowNum > 0) {
          const neighborTopHeight = this.heightMap[rowNum-1][colNum]
          total += neighborTopHeight
          n++
        }
        if(rowNum < this.ROWS) {
          const neighborBottomHeight = this.heightMap[rowNum+1][colNum]
          total += neighborBottomHeight
          n++
        }
        if(colNum > 0) {
          const neighborLeftHeight = this.heightMap[rowNum][colNum-1]
          total += neighborLeftHeight
          n++
        }
        if(colNum < this.COLUMNS) {
          const neighborRightHeight = this.heightMap[rowNum][colNum+1]
          total += neighborRightHeight
          n++
        }
        const average =  (total / n);
        this.heightMapAverage[rowNum][colNum] = average
      }
    }
    rowNum = this.ROWS
    const left = .6
    const right = .5
    while(rowNum--) {
      let colNum = this.COLUMNS
      
      while(colNum--) {
        const weightAverage = this.heightMapAverage[rowNum][colNum] * left + right * this.heightMap[rowNum][colNum]
        this.heightMap[rowNum][colNum] = weightAverage
      }
    }
  }

  private applyHeightmapToGeometry() {
    const heightMap = this.heightMap
    let rowNum = heightMap.length
    while(rowNum--) {
      const row = heightMap[rowNum]
      let colNum = row.length
      while(colNum--) {
        const height = this.heightMap[rowNum][colNum]
        const verticeIndex = this.getVerticeIndex(rowNum, colNum)
        this.updateVertex(verticeIndex, height)
      }
    }
  }

  private applyWavesToGeometry() {
    let numWaves = this.waves.length
    while(numWaves--) {
      const wave = this.waves[numWaves]
      const points = wave.getPoints()
      let numPoints = points.length
      while(numPoints--)  {
        const {x, y, z} = points[numPoints]
        const verticeIndex = this.getVerticeIndex(y, x)
        // Avoid wave points outside boundary plane.
        if(verticeIndex >= 0) {
          const currHeight = this.heightMap[y][x]
          const aggregate = z + currHeight
          this.updateVertex(verticeIndex, aggregate)
          this.applyImpression(y, x, aggregate)
        }
      }
      // State step wave, removing from collection if reached end of lifecycle.
      if(wave.step()) {
        this.waves.splice(numWaves, 1)
      }
    }
  }

  private zeroSpringModel() {
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
        heightRow[colNum] = Math.abs(heightRow[colNum]) < .00001 ? 0 : heightRow[colNum]
        velocityRow[colNum] =  Math.abs(velocityRow[colNum]) < .00001 ? 0 : velocityRow[colNum]
      }
    }
  }

  private updateSpringModel() {
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

  private updatePropagationModel() {
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

  /** Return -1, 0, 1 */
  private getRandomDirection(): number{
    return  Math.floor(3 * Math.random()) - 1
  }
  
  private roundDecimal(num) {
    return Math.round(num * 10000) / 10000
  }

  private initSpringModel() {
    let numRows = this.ROWS + 1
    const numCols = this.COLUMNS + 1
    const heightMap = new Array(numRows);
    const velocityMap = new Array(numRows);
    const heightAverageMap = new Array(numRows)
    while(numRows--) {
      heightMap[numRows] = (new Array(numCols)).fill(0)
      heightAverageMap[numRows] = (new Array(numCols)).fill(0)
      velocityMap[numRows] = (new Array(numCols)).fill(0)
    }
    this.heightMap = heightMap
    this.heightMapAverage = heightAverageMap
    this.velocityMap = velocityMap
  }

  private initPropagationModel() {
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

  private initRandomHeightmap() {
    const heightMap = this.heightMap
    const numCols = this.COLUMNS + 1
    const numRows = this.ROWS + 1
    // Seed the first cell.
    heightMap[0][0] = Math.floor(5 * Math.random()) * this.getRandomDirection()
    // Random walk along first row.
    const firstRow = heightMap[0]
    for(let j = 1 ; j < numCols ; j++) {
      const neighborHeight = firstRow[j-1]
      firstRow[j] = neighborHeight + this.getRandomDirection()
    }
    // Random walk along first column.
    for(let i = 1 ; i < numRows ; i++) {
      const neighborHeight = heightMap[i-1][0];
      heightMap[i][0] = neighborHeight + this.getRandomDirection()
    }
    // Loop over inner cells, assigning height as +-1 from midpoint of top and left neighbor
    for(let i = 1 ; i < numRows ; i++) {
      const row = heightMap[i]
      const rowAbove = heightMap[i-1]
      for(let j = 1 ; j < numCols ; j++) {
        const topNeighbor = rowAbove[j]
        const leftNeighbor = row[j-1]
        const midpoint = ( topNeighbor + leftNeighbor ) /2
        heightMap[i][j] = Math.round(midpoint) + this.getRandomDirection()
      }
    }
    this.applyHeightmapToGeometry()
    this.digestGeometry()
  }

  private animate() {
    requestAnimationFrame(() => { this.animate() })
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  private updateVertex(verticeIndex, height?) {
    if(height != undefined && height != null) {
      this.geometry.vertices[verticeIndex].z = height;
    } else {
      this.geometry.vertices[verticeIndex].z++ 
    }
  }

  private digestGeometry() {
    this.geometry.verticesNeedUpdate = true;
  }

  private addEventListeners() {
    window.addEventListener('mouseup', (e) => { this.handleClick(e) } , false );
    window.addEventListener('keyup', (e) => { this.handleKeyUp(e) } , false );
  }

  private handleKeyUp( event ) {
    const { key } = event;
    if(key.toLowerCase() == this.ITERATION_TRIGGER_KEY) {
      this.iterate()
    }
    if(key.toLowerCase() == this.AUTOMATIC_TRIGGER_KEY) {
      setInterval(() => { this.iterate() }, 100)
    }
    if(key.toLowerCase() == this.RANDOM_WALK_TRIGGER_KEY) {
      this.initRandomHeightmap()
    }
  }

  private handleClick( event ) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    const x = ( event.clientX / window.innerWidth ) * 2 - 1;
    const y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    const mouse = {x, y};
    this.raycaster.setFromCamera(mouse, this.camera)
    const intersects = this.raycaster.intersectObjects( this.scene.children )
    const planeIntersect = intersects.find(intersect => intersect.object.uuid === this.planeUUID)
    if(planeIntersect) {
      const {
        point: {
          x,
          y
        }
      } = planeIntersect;

      // These are sequenced to match the vertices indexing.
      const columnIndex = Math.round(x / this.CELL_WIDTH) + (this.COLUMNS / 2);
      const rowIndex = -1 * Math.round(y / this.CELL_HEIGHT) + (this.ROWS / 2);
      this.waves.push( new Wave({x: columnIndex, y: rowIndex}) )

      this.iterate()
    }
  }

  private applyImpression(rowIndex, columnIndex, z) {
    this.heightMap[rowIndex][columnIndex] = z
    // const points = this.getRasterizedCircle({x: rowIndex, y: columnIndex})
    // points.filter(({x, y}) => x >= 0 && x < this.COLUMNS && y >= 0 && y <= this.ROWS)
    //   .forEach(point => {
    //     this.heightMap[point.x][point.y] = point.z
    //   });
  }

  private getVerticeIndex(rowIndex, columnIndex) {
    const index = rowIndex * (this.COLUMNS + 1) + columnIndex;
    const maxIndex = (this.COLUMNS + 1) * (this.ROWS + 1);
    if(index > maxIndex)
      return -1
    return index;
  }

  // TODO: Use midpoint circle algorithm
  private getRasterizedCircle(center: Point): Point[] {
    const summit = 6
    const points = []
    points.push({
      x: center.x,
      y: center.y,
      z: summit
    })
    points.push({
      x: center.x - 1,
      y: center.y,
      z: summit - 1
    })
    points.push({
      x: center.x + 1,
      y: center.y,
      z: summit - 1
    })
    points.push({
      x: center.x,
      y: center.y - 1,
      z: summit - 1
    })
    points.push({
      x: center.x,
      y: center.y + 1,
      z: summit - 1
    })
    points.push({
      x: center.x - 1,
      y: center.y - 1,
      z: summit - 2
    })
    points.push({
      x: center.x + 1,
      y: center.y + 1,
      z: summit - 2
    })
    points.push({
      x: center.x - 1,
      y: center.y + 1,
      z: summit - 2
    })
    points.push({
      x: center.x + 1,
      y: center.y - 1,
      z: summit - 2
    })
    return points
  }
}