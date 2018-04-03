import { Wave } from "./wave"
import { RippleModel } from "./ripple"
import { PropagationSpringModel } from "./propagation_spring_model"

interface Point {
  x: number,
  y: number,
  z?: number,
}

export class Engine {
  private width = window.innerWidth
  private height = window.innerHeight

  private readonly ROWS = 50
  private readonly COLUMNS = 50
  private readonly PLANE_WIDTH = 100
  private readonly PLANE_HEIGHT = 100
  private readonly CELL_HEIGHT = this.PLANE_HEIGHT / this.ROWS
  private readonly CELL_WIDTH = this.PLANE_WIDTH / this.COLUMNS

  private propagationSpringModel: PropagationSpringModel
  private rippleModel: RippleModel

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

    this.propagationSpringModel = new PropagationSpringModel(this.ROWS, this.COLUMNS)
    this.initRandomHeightmap()
    this.rippleModel = new RippleModel(this.ROWS, this.COLUMNS)

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
    this.propagationSpringModel.iterate()
    this.propagationSpringModel.iteratePropagation()

    // TODO: Add floating point rounding method

    // TODO: run this at half time step
    this.rippleModel.iterate()
    const rippleHeightMap = this.rippleModel.getHeightMap();
    for(let i = 0; i < this.ROWS ; i++) {
      for(let j = 0 ; j < this.COLUMNS ; j++) {
        // TODO: maybe don't merge. keep a separate springModel heightmap and a ripplemodel heightmap
        // and render the matrix addition
        this.propagationSpringModel.heightMap[i][j] += rippleHeightMap[i][j]
      }
    }

    this.applyHeightmapToGeometry()
    this.applyWavesToGeometry()

    this.digestGeometry()
  }

  private applyHeightmapToGeometry() {
    const heightMap = this.propagationSpringModel.heightMap
    let rowNum = heightMap.length
    while(rowNum--) {
      const row = heightMap[rowNum]
      let colNum = row.length
      while(colNum--) {
        const height = this.propagationSpringModel.heightMap[rowNum][colNum]
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
          const currHeight = this.propagationSpringModel.heightMap[y][x]
          const aggregate = z + currHeight
          this.updateVertex(verticeIndex, aggregate)
        }
      }
      // State step wave, removing from collection if reached end of lifecycle.
      if(wave.step()) {
        this.waves.splice(numWaves, 1)
      }
    }
  }

  /** Return -1, 0, 1 */
  private getRandomDirection(): number{
    return  Math.floor(3 * Math.random()) - 1
  }

  private initRandomHeightmap() {
    // TODO: decouple the engine's heightmap from spring model.
    const heightMap = this.propagationSpringModel.heightMap
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
      // this.waves.push( new Wave({x: columnIndex, y: rowIndex}) )
      this.rippleModel.applyImpression(rowIndex, columnIndex)

      this.iterate()
    }
  }

  private getVerticeIndex(rowIndex, columnIndex) {
    const index = rowIndex * (this.COLUMNS + 1) + columnIndex;
    const maxIndex = (this.COLUMNS + 1) * (this.ROWS + 1);
    if(index > maxIndex)
      return -1
    return index;
  }
}