import { RippleModel } from "./ripple_model"
import { PropagationSpringModel } from "./propagation_spring_model"

const EVENT_KEYS = {
  ITERATE: 'x',
  RUN: 'y',
  RANDOM: 'z',
};

export class Engine {
  private width = window.innerWidth
  private height = window.innerHeight

  private readonly ROW_VERTICES = this.ROWS + 1
  private readonly COLUMN_VERTICES = this.COLUMNS + 1
  private readonly NUM_VERTICES = this.ROW_VERTICES * this.COLUMN_VERTICES
  private readonly PLANE_WIDTH = 100
  private readonly PLANE_HEIGHT = 100
  private readonly CELL_HEIGHT = this.PLANE_HEIGHT / this.ROWS
  private readonly CELL_WIDTH = this.PLANE_WIDTH / this.COLUMNS

  private propagationSpringModel: PropagationSpringModel
  private rippleModel: RippleModel

  private heightMap: number[]

  private scene: THREE.Scene
  private camera: THREE.Camera
  private renderer: THREE.WebGLRenderer
  private controls: THREE.OrbitControls
  private raycaster: THREE.Raycaster

  // For identification of raycaster intersect.
  private planeUUID: string
  private geometry: THREE.Geometry

  constructor (
    private readonly ROWS,
    private readonly COLUMNS,
  ) {
    console.assert(this.ROWS > 0)
    console.assert(this.COLUMNS > 0)

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

    this.propagationSpringModel = new PropagationSpringModel(this.ROWS + 1 , this.COLUMNS + 1)
    this.heightMap = (new Array(this.ROW_VERTICES * this.COLUMN_VERTICES)).fill(0)
    this.initRandomHeightmap()
    this.rippleModel = new RippleModel(this.ROWS + 1, this.COLUMNS + 1)

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
    const rippleHeightBuffer = this.rippleModel.getHeightBuffer();
    this.heightMap = this.propagationSpringModel.getHeightBuffer()
    let i = this.heightMap.length
    while(i--)
      this.heightMap[i] += rippleHeightBuffer[i]

    this.digestGeometry()
  }

  private digestGeometry() {
    const heightMap = this.heightMap
    let i = heightMap.length
    while(i--)
      this.geometry.vertices[i].z = this.heightMap[i]
    this.geometry.verticesNeedUpdate = true;
  }

  private initRandomHeightmap() {
    this.propagationSpringModel.initRandomHeight()
    this.heightMap = this.propagationSpringModel.getHeightBuffer()
    this.digestGeometry()
  }

  private animate() {
    requestAnimationFrame(() => { this.animate() })
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  private addEventListeners() {
    window.addEventListener('mouseup', (e) => { this.handleMouseup(e) } , false );
    window.addEventListener('keyup', (e) => { this.handleKeyUp(e) } , false );
  }

  private handleKeyUp({ key }) {
    key = key.toLowerCase()
    switch(key) {
      case EVENT_KEYS.ITERATE: {
        this.iterate()
        break
      }
      case EVENT_KEYS.RUN: {
        setInterval(() => { this.iterate() }, 100)
        break
      }
      case EVENT_KEYS.RANDOM: {
        this.initRandomHeightmap()
        break
      }
      default: {}
    }
  }

  private handleMouseup({ clientX , clientY }) {
    const mouse = {
      x: 2 * ( clientX / this.width ) - 1,
      y: -2 * ( clientY / this.height ) + 1,
    }
    this.raycaster.setFromCamera(mouse, this.camera)
    const planeIntersect =  this.raycaster.intersectObjects( this.scene.children )
        .find(({ object: { uuid }}) => uuid === this.planeUUID)
    if(planeIntersect) {
      const { point: { x, y } } = planeIntersect

      // Translate coordinates to vertices' indexing.
      const columnIndex = Math.round( x / this.CELL_WIDTH ) + ( this.COLUMNS / 2 )
      const rowIndex = -1 * Math.round( y / this.CELL_HEIGHT ) + ( this.ROWS / 2 )
      this.rippleModel.applyImpression(rowIndex, columnIndex)

      this.iterate()
    }
  }
}