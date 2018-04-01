export class Engine {
  private width = window.innerWidth
  private height = window.innerHeight

  // Physics parameters.
  private K = 0.005; // "Hooke's constant"

  private readonly ROWS = 20
  private readonly COLUMNS = 20
  private readonly PLANE_WIDTH = 100
  private readonly PLANE_HEIGHT = 100
  private readonly CELL_HEIGHT = this.PLANE_HEIGHT / this.ROWS
  private readonly CELL_WIDTH = this.PLANE_WIDTH / this.COLUMNS

  private heightMap: number[][]
  private velocityMap: number[][]

  // Key press to trigger a simulation cycle.
  private readonly ITERATION_TRIGGER_KEY = 'x';
  private readonly AUTOMATIC_TRIGGER_KEY = 'y';

  private scene: THREE.Scene
  private camera: THREE.Camera
  private renderer: THREE.WebGLRenderer
  private controls: THREE.OrbitControls
  private raycaster: THREE.Raycaster

  // For identification of raycaster intersect.
  private planeUUID: string
  private geometry: THREE.Geometry

  constructor () {
    // Instance Scene.
    this.scene = new THREE.Scene()
    // Instantiate Camera.
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000)
    this.camera.position.set(0, -70, 50)
    // Instantiate render.
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setClearColor( 0xFFFFFF )
    this.renderer.setSize(this.width, this.height)
    document.body.appendChild( this.renderer.domElement)
    // Instantiate controls.
    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement )
    // Instantiate raycaster.
    this.raycaster = new THREE.Raycaster()
    
    const geometry = new THREE.PlaneGeometry(this.PLANE_WIDTH, this.PLANE_HEIGHT, this.ROWS, this.COLUMNS)
    const material = new THREE.MeshBasicMaterial({
        color: 0x333333, 
        wireframe: true
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

    this.initializeHeightMap()
    this.initializeRandomHeight()
  }

  private iterate() {
    const heightMap = this.heightMap
    const velocityMap = this.velocityMap

    // Move height at constant speed of 1 towards 0.
    for(let i = 0 ; i < heightMap.length; i++) {
      const rowHeight = heightMap[i]
      const rowVelocity = velocityMap[i]
      for(let j = 0 ; j < rowHeight.length; j++) {
        const targetHeight = 0
        const height = rowHeight[j]
        const x = height - targetHeight
        const acceleration = -1 * this.K * x
        rowHeight[j] += rowVelocity[j]
        rowVelocity[j] += acceleration

        const verticeIndex = this.getVerticeIndex(i, j)
        this.updateGeometry(verticeIndex, height)
      }
    }
    this.refreshGeometry()
  }

  /** Return -1, 0, 1 */
  private getRandomDirection(): number{
    return  Math.floor(3 * Math.random()) - 1
  }

  private initializeHeightMap() {
    const heightMap = new Array(this.ROWS+1);
    for(let i = 0 ; i < heightMap.length; i++) {
      heightMap[i] = (new Array(this.COLUMNS + 1)).fill(0)
    }
    this.heightMap = heightMap

    const velocityMap = new Array(this.ROWS+1);
    for(let i = 0 ; i < velocityMap.length; i++) {
      velocityMap[i] = (new Array(this.COLUMNS + 1)).fill(0)
    }
    this.velocityMap = velocityMap
  }

  private initializeRandomHeight() {
    const heightMap = this.heightMap
    // Seed the first cell.
    heightMap[0][0] = Math.floor(5 * Math.random()) * this.getRandomDirection()
    // Random walk along first row.
    for(let j = 1 ; j < this.COLUMNS + 1 ; j++) {
      const prev = heightMap[0][j-1];
      const height = prev + this.getRandomDirection()
      heightMap[0][j] = height
    }
    // Random walk along first column.
    for(let i = 1 ; i < this.ROWS + 1 ; i++) {
      const prev = heightMap[i-1][0];
      const height = prev + this.getRandomDirection()
      heightMap[i][0] = height
    }

    // Loop over inner rows, assigning height as +-1 from midpoint of top and left neighbor
    for(let j = 1 ; j < this.COLUMNS + 1 ; j++) {
      for(let i = 1 ; i < this.ROWS + 1 ; i++) {
        const topNeighbor = heightMap[i-1][j]
        const leftNeighbor = heightMap[i][j-1]
        const midpoint = ( topNeighbor + leftNeighbor ) /2
        heightMap[i][j] = Math.round(midpoint) + this.getRandomDirection()
      }
    }

    // Map heightMap to geometry
    for(let i = 0 ; i < heightMap.length; i++) {
      const row = heightMap[i]
      for(let j = 0 ; j < row.length; j++) {
        const height = row[j]
        const verticeIndex = this.getVerticeIndex(i, j)
        this.updateGeometry(verticeIndex, height)
      }
    }

    this.refreshGeometry()
  }

  private animate() {
    requestAnimationFrame(() => { this.animate() })
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  private updateGeometry(verticeIndex, height?) {
    if(height != undefined && height != null) {
      this.geometry.vertices[verticeIndex].z = height;
    } else {
      this.geometry.vertices[verticeIndex].z++ 
    }
  }

  private refreshGeometry() {
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
      const verticeIndex = this.getVerticeIndex(rowIndex, columnIndex);
      this.updateGeometry(verticeIndex)
      this.refreshGeometry()
    }
  }

  private getVerticeIndex(rowIndex, columnIndex) {
    return rowIndex * (this.COLUMNS + 1) + columnIndex;
  }
}