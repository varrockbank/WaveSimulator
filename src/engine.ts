export class Engine {
  private width = window.innerWidth
  private height = window.innerHeight

  private readonly ROWS = 20
  private readonly COLUMNS = 20

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
    this.camera = new THREE.PerspectiveCamera(80, this.width / this.height, 1, 1000)
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
    
    const geometry = new THREE.PlaneGeometry(100, 100, this.ROWS, this.COLUMNS)
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
    this.updateGeometry()

    this.addEventListeners()
  }

  private animate() {
    requestAnimationFrame(() => { this.animate() })
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  private updateGeometry() {
    this.geometry.vertices[0].z = 50;
    this.geometry.verticesNeedUpdate = true;
  }

  private addEventListeners() {
    window.addEventListener('mouseup', (e) => { this.handleClick(e) } , false );
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
      console.log('x: ' + x + 'y: ' + y);
    }
  }
}