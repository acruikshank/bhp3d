import './style.css'
import { zfn, panelGeometry } from './panels.js'
import { Animations } from './animations.js'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { Title, ContentPane } from './content'
import * as THREE from 'three'
import * as dat from 'dat.gui'

/**
 * TODO:
 * 1. [Done] create page between 3 and 4 where leftmost panel moves to center
 * 2. [Done] Add visibility to matrix and infill for page 4, and set position and rotation to that of cutout1
 * 3. [Done] use texture section from cutout 1 for infill and matrix
 * 4. [Done] Add last page with robot (kr quantech ultra 120)
 * 5. Add animation by fraction option. (with slider)
 * 6. Have animation respond to screen aspect. Update animation on resize.
 * 7. Tune aspect ratios
 * 8. Portrait aspect carosel
 * 9. Add text screens.
 * 10. Add text animations based on fraction.
 * 11. Tie fraction to scroll.
 * 12. [Done] Fix pop for materials fading in an out
 * 13. Lazy generate panel geometry
 * 14. Garbage collect
 * 15. [Done] Better matrix and infill textures
 * 16. Create minimized THREE.js build
 */

/**
 * Parameters
 */

 const matColor = 0x383838
 const metalness = .8434
 const roughness = .5
 const displacement = .473
 const objectX = 0
 const objectY = 0
 const objectZ = -0.19
 const alColor = 0x273561
 const hoverHeight = 1
 const hoverDepth = 2
 const panelWidth = 2.42
 const page0ZOffset = .5
 
 const cameraX = 0
 const cameraY = -1.19
 const cameraZ = .14
 
 const camera2X = -3.549
 const camera2Y = 0.46
 const camera2Z = 4.5758
 
 const floorColor = 0x111111
 const windowColor = 0x000000
 const groundColor = 0x111111
 const rotation = {x: -.1, y: .3, z: 0}

/**
 * Debug
 */
const gui = new dat.GUI()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const matrixTexture = textureLoader.load('./textures/matrix.png')
matrixTexture.wrapS = matrixTexture.wrapT = THREE.RepeatWrapping
const matrixNormalTexture = textureLoader.load('./textures/matrix_normal.png')
matrixNormalTexture.wrapS = matrixNormalTexture.wrapT = THREE.RepeatWrapping
const infillTexture = textureLoader.load('./textures/infill.png')
infillTexture.wrapS = infillTexture.wrapT = THREE.RepeatWrapping

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Materials
 */

const material = new THREE.MeshStandardMaterial({color: matColor})
material.metalness = metalness
material.roughness = roughness
gui.addColor({matColor: material.color.getHex()}, 'matColor')
    .onChange((c)=>material.color.setHex(c))
gui.add(material, 'metalness').min(0).max(1).step(.0001)
gui.add(material, 'roughness').min(0).max(1).step(.0001)

const sideMaterial = new THREE.MeshStandardMaterial({color: matColor})
sideMaterial.transparent = false
sideMaterial.metalness = metalness
sideMaterial.roughness = roughness
sideMaterial.opacity = 1

const side2Material = sideMaterial.clone()

const matrixMat = new THREE.MeshStandardMaterial({color: 0xd9d6d6})
matrixMat.side = THREE.DoubleSide
matrixMat.transparent = true
matrixMat.map = matrixTexture
matrixMat.normalMap = matrixNormalTexture
matrixMat.metalness = .31
matrixMat.roughness = .63
matrixMat.opacity = 0
const matrixMatFolder = gui.addFolder('matrix mat')
matrixMatFolder.addColor({matColor: matrixMat.color.getHex()}, 'matColor')
    .onChange((c)=>matrixMat.color.setHex(c))
matrixMatFolder.add(matrixMat, 'metalness').min(0).max(1).step(.0001)
matrixMatFolder.add(matrixMat, 'roughness').min(0).max(1).step(.0001)

const matrix2Mat = matrixMat.clone()

const infillMat = new THREE.MeshStandardMaterial({color: 0xe6e6e6})
infillMat.side = THREE.DoubleSide
infillMat.transparent = true
infillMat.map = infillTexture
infillMat.normalMap = matrixNormalTexture
gui.add(infillMat, 'displacementScale').min(-.1).max(0).step(.0001)
infillMat.metalness = .45
infillMat.roughness = 1
infillMat.opacity = 0
const infillMatFolder = gui.addFolder('infill mat')
infillMatFolder.addColor({matColor: infillMat.color.getHex()}, 'matColor')
    .onChange((c)=>infillMat.color.setHex(c))
infillMatFolder.add(infillMat, 'metalness').min(0).max(1).step(.0001)
infillMatFolder.add(infillMat, 'roughness').min(0).max(1).step(.0001)

const floorMaterial = new THREE.MeshStandardMaterial({color: floorColor})
const floorGui = gui.addFolder('floor')
floorGui.addColor({floorColor: floorMaterial.color.getHex()}, 'floorColor')
    .onChange((c)=>floorMaterial.color.setHex(c))
floorGui.add(floorMaterial, 'metalness').min(0).max(1).step(.0001)
floorGui.add(floorMaterial, 'roughness').min(0).max(1).step(.0001)
floorMaterial.opacity = 0
floorMaterial.depthWrite = false
floorMaterial.transparent = true

const windowMaterial = new THREE.MeshStandardMaterial({color: windowColor})
const windowGui = gui.addFolder('window')
windowGui.addColor({windowColor: windowMaterial.color.getHex()}, 'windowColor')
    .onChange((c)=>windowMaterial.color.setHex(c))
windowMaterial.metalness = 0.4
windowMaterial.roughness = 0.3
windowMaterial.transparent = true
windowMaterial.opacity = 0
windowMaterial.depthWrite = false
windowGui.add(windowMaterial, 'metalness').min(0).max(1).step(.0001)
windowGui.add(windowMaterial, 'roughness').min(0).max(1).step(.0001)

const groundMaterial = new THREE.MeshBasicMaterial({color: groundColor})
const groundGui = gui.addFolder('ground')
groundGui.addColor({groundColor: groundMaterial.color.getHex()}, 'groundColor')
    .onChange((c)=>groundMaterial.color.setHex(c))
groundMaterial.opacity = 0
groundMaterial.transparent = true

const robotMat = new THREE.MeshStandardMaterial({color: 0x252525})
robotMat.metalness = 0
robotMat.roughness = .71
robotMat.transparent = true
robotMat.opacity = 0
const robotMatGui = gui.addFolder('robotMat')
robotMatGui.addColor({matColor: robotMat.color.getHex()}, 'matColor')
    .onChange((c)=>robotMat.color.setHex(c))
    robotMatGui.add(robotMat, 'metalness').min(0).max(1).step(.0001)
    robotMatGui.add(robotMat, 'roughness').min(0).max(1).step(.0001)


/**
 * Objects
 */

const startObjects = new Date();

const rotGui = gui.addFolder('rotation')
const rOnChange = ()=>{
    cutout1.rotation.set(rotation.x, rotation.y, rotation.z)
    cutout2.rotation.set(rotation.x, rotation.y, rotation.z)
    cutout3.rotation.set(rotation.x, rotation.y, rotation.z)
}

const cutout1 = new THREE.Mesh(    
    panelGeometry(panelWidth/3, 2.1, .2, 512, 256, 0, zfn(-0.666,-1,2/3,2.1)),
    material
)
cutout1.position.set(objectX-panelWidth/3,objectY,objectZ - page0ZOffset)

const cutout2 = new THREE.Mesh(    
    panelGeometry(panelWidth/3, 2.1, .2, 512, 256, 0, zfn(-0,-1,2/3,2.1)),
    sideMaterial
)
cutout2.position.set(objectX,objectY,objectZ - page0ZOffset)

const cutout3 = new THREE.Mesh(    
    panelGeometry(panelWidth/3, 2.1, .2, 512, 256, 0, zfn(0.666,-1,2/3,2.1)),
    sideMaterial
)
cutout3.position.set(objectX+panelWidth/3,objectY,objectZ - page0ZOffset)

const gap = .5
const cutout4 = new THREE.Mesh(    
    panelGeometry(panelWidth, 2.1, .2, 256, 256, 0, zfn(-2.666-gap,-1,2,2.1)),
    side2Material
)
cutout4.position.set(objectX-panelWidth-gap,objectY,objectZ)

const cutout5 = new THREE.Mesh(    
    panelGeometry(panelWidth, 2.1, .2, 256, 256, 0, zfn(1.666+gap,-1,2,2.1)),
    side2Material
)
cutout5.position.set(objectX+panelWidth+gap,objectY,objectZ)

const infillCutout = new THREE.Mesh(    
    panelGeometry(panelWidth/3, 2.1, .2, 128, 128, 13.1, zfn(-0.666,-1,2/3,2.1)),
    infillMat
)
infillCutout.visible = false

const matrixCutout = new THREE.Mesh(    
    panelGeometry(panelWidth/3, 2.1, .2, 128, 128, 12.55, zfn(-0.666,-1,2/3,2.1)),
    matrixMat
)
matrixCutout.visible = false

const floorGeometry = new THREE.BoxBufferGeometry(12, .075, 1)
const floor1 = new THREE.Mesh(floorGeometry, floorMaterial)
floor1.position.set(0, 1.05, -.75)
floor1.renderOrder=2
const floor3 = new THREE.Mesh(floorGeometry, floorMaterial)
floor3.position.set(0, -1.05, -.75)
floor3.renderOrder = 3

const buildingGroup = new THREE.Group()
buildingGroup.visible = false
buildingGroup.add(floor1, floor3, cutout4, cutout5)

const windowGeometry = new THREE.BoxBufferGeometry(.49, 1, .02)
Array(24).fill().forEach((_,i)=>Array(2).fill().forEach((_,j) => {
    const window = new THREE.Mesh(windowGeometry, windowMaterial)
    window.position.set(-5.5 + .5*i, -.5+j, -.3)
    window.renderOrder = 5
    buildingGroup.add(window)
}))

const groundGeometry = new THREE.PlaneBufferGeometry(200, 50)
const ground = new THREE.Mesh(groundGeometry, groundMaterial)
ground.rotation.x = -Math.PI/2
ground.position.set(50, -1.4, 22)
ground.renderOrder = 1
buildingGroup.add(ground)

scene.add(cutout1, cutout2, cutout3, infillCutout, matrixCutout, buildingGroup)

const robotScene = new THREE.Group()
robotScene.visible = false

const matrixCutout2 = new THREE.Mesh(    
    panelGeometry(panelWidth/3, 1.1, .2, 128, 64, 12.55, zfn(-0.999,-1,2/3,2.1)),
    matrix2Mat
)
robotScene.add(matrixCutout2)

const trackGeometry = new THREE.BoxBufferGeometry(5, .1, .7)
const track1 = new THREE.Mesh(trackGeometry, robotMat)
track1.position.set(1, -.05, -2)
robotScene.add(track1)

scene.add(robotScene)

class Rotator {
    constructor(obj, pivotPoint, axis, parent) {
        this.obj = obj
        this.pivotPoint = pivotPoint;
        axis.normalize()
        this.axis = axis
        this._angle = 0

        this.obj.parent = parent
        parent.children.push(this.obj)
    }

    get angle() {
        return this._angle
    }

    set angle(angle) {
        const delta = this._angle - angle
        this._angle = angle
 
        this.obj.position.sub(this.pivotPoint)
        this.obj.position.applyAxisAngle(this.axis, delta)
        this.obj.position.add(this.pivotPoint)
        this.obj.rotateOnAxis(this.axis, delta)
    }
}
 

const objLoader = new OBJLoader();
objLoader.load('./kr_120.obj', (root) => {
    root.scale.set(.0075,.0075,.0075)
    root.rotation.y = -Math.PI/2
    root.position.z = -2
    root.position.x = -.5

    const xAxis = new THREE.Vector3(1,0,0)
    const yAxis = new THREE.Vector3(0,1,0)
    const zAxis = new THREE.Vector3(0,0,1)
    const rotators = [
        [1,0, new THREE.Vector3(0,0,0), yAxis], 
        [2,1, new THREE.Vector3(75,59,0), zAxis],
        [3,2, new THREE.Vector3(75,194,0), zAxis], 
        [4,3, new THREE.Vector3(232,190,1), xAxis], 
        [5,4, new THREE.Vector3(257,190,-35), zAxis]].map(r => new Rotator(root.children[r[0]], r[2], r[3], root.children[r[1]]))

    root.children[0].material = robotMat
    const rF = gui.addFolder("robot")
    rotators.forEach((r,i)=>{ r.obj.material = robotMat })
    rotators[0].angle = -0.31
    rF.add(rotators[0], "angle").min(-1).max(1).step(.001)
    rotators[1].angle = 0.316
    rF.add(rotators[1], "angle").min(0).max(1).step(.001)
    rotators[2].angle = 0.041
    rF.add(rotators[2], "angle").min(-1).max(1).step(.0001)
    rotators[3].angle = 0
    rotators[4].angle = 1.143
    rF.add(rotators[4], "angle").min(.5).max(1.8).step(.0001)

    rF.add({leftCam: () => {camera.position.set(-6.863, 0.637, 4.156); camera.rotation.set(-0.709, -1.224, -0.679)}}, "leftCam")
    rF.add({frontCam: () => {camera.position.set(-4.960, 0.573, 5.337); camera.rotation.set(-0.045, 0.025, 0.001)}}, "frontCam")
    rF.add({backCam: () => {camera.position.set(-4.981, 0.532, 3.354); camera.rotation.set(-3.040, -0.037, -3.138)}}, "backCam")
      
    rF.add({dump: () => console.log(rotators.map(r=>r.angle))}, "dump");

    // top right to left
    const topPositions = [
        [-0.44, 0.253, -0.021, 0, 1.40],
        [-0.41, 0.219, 0.024,  0, 1.40],
        [-0.37, 0.2,   0.042,  0, 1.40],
        [-0.335,0.18,  0.065,  0, 1.4],
        [-0.3,  0.165, 0.083,  0, 1.4148],
        [-0.255,0.14,  0.108,  0, 1.40],
        [-0.218,0.117, 0.1367, 0, 1.4],
        [-0.179,0.061, 0.195,  0, 1.3268],
        [-0.14, 0.061, 0.195,  0, 1.34],
        [-0.1,  0.061, 0.195,  0, 1.34],
        [-0.06, 0.061, 0.195,  0, 1.3708]]

    // bottom right to left
    const bottomPositions = [
        [-0.443, 0.275, 0.005, 0, 1.3561],
        [-0.409, 0.264, 0.023, 0, 1.3854],
        [-0.373, 0.275, 0.011, 0, 1.45],
        [-0.333, 0.25,  0.04,  0, 1.46],
        [-0.295, 0.208, 0.0916,0, 1.40],
        [-0.26,  0.129, 0.175, 0, 1.2975],
        [-0.22,  0.129, 0.175, 0, 1.341],
        [-0.18,  0.129, 0.175, 0, 1.3561],
        [-0.138, 0.12,  0.185, 0, 1.3708],
        [-0.095, 0.1,   0.207, 0, 1.3415],
        [-0.05,  0.08,  0.2269,0, 1.3122]]
    
    const lerp = (a,b,x) => a + x*(b-a)

    let position = 0
    setInterval(() => {
        let fraction = position % 1
        let index = Math.floor(position) % 30
        let startRot, endRot

        if (index < 20) {
            if (index&0x1) {
                startRot = bottomPositions[(index+1)>>0x1]
                endRot = topPositions[(index+1)>>0x1]
            } else {
                startRot = topPositions[index>>0x1]
                endRot = bottomPositions[(index>>0x1)+1]
            }
        } else {
            startRot = topPositions[30 - index]
            endRot = topPositions[29 - index]
        }
        position += .05
        rotators.forEach((r,i) => r.angle = lerp(startRot[i], endRot[i], fraction))
        renderer.render(scene, camera)
    }, 50)

    topPositions[0].forEach((a,i)=>rotators[i].angle = a)
    rF.add({"topRot":0}, "topRot").min(0).max(9).step(1).onChange(v=>topPositions[v].forEach((a,i)=>rotators[i].angle = a))
    rF.add({"botRot":0}, "botRot").min(0).max(9).step(1).onChange(v=>bottomPositions[v].forEach((a,i)=>rotators[i].angle = a))

    robotScene.add(root);
    window.robot = root
});

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(alColor, 0.5)
const ambientFolder = gui.addFolder('ambient')
ambientFolder.addColor({color: ambientLight.color.getHex()}, 'color')
    .onChange((c)=>ambientLight.color.setHex(c))
ambientFolder.add(ambientLight, 'intensity').min(0).max(1).step(.01)
scene.add(ambientLight)

const hemiLight = new THREE.HemisphereLight( 0x313641, 0xf2f2f2, 1 );
const hemiFolder = gui.addFolder("hemi light")
hemiFolder.addColor({sky: hemiLight.color.getHex()}, "sky").onChange((c)=>hemiLight.color = new THREE.Color(c))
hemiFolder.addColor({ground: hemiLight.groundColor.getHex()}, "ground").onChange((c)=>hemiLight.groundColor = new THREE.Color(c))
hemiFolder.add(hemiLight, 'intensity').min(0).max(1).step(.01)
scene.add(hemiLight)

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set(.67,-0.21,4.5)
const directionalGui = gui.addFolder("directional light")
directionalGui.add(directionalLight.position, 'x').min(-5).max(5).step(.01)
directionalGui.add(directionalLight.position, 'y').min(-5).max(5).step(.01)
directionalGui.add(directionalLight.position, 'z').min(-5).max(5).step(.01)
directionalGui.add(directionalLight, 'intensity').min(0).max(1).step(.01)
directionalGui.addColor({color: directionalLight.color.getHex()}, "color").onChange((c)=>directionalLight.color = new THREE.Color(c))
directionalLight.target = cutout2
scene.add( directionalLight );

/**
 * Text content
 */

const panes = document.querySelectorAll('.content-pane')
const content = Array(panes.length).fill().map((_,i) => new ContentPane(panes[i]))

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    scroll: document.getElementById("scroll").offsetHeight - window.innerHeight
}

const resize = () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.scroll = document.getElementById("scroll").offsetHeight - window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    content.forEach(c=>c.resize(sizes.width, sizes.height))
    // postprocessing.composer.setSize( width, height );
}

window.addEventListener('resize', resize)
window.addEventListener('load', resize)


/**
 * Camera
 */

// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 200)
global.cam = camera
camera.position.x = cameraX
camera.position.y = cameraY
camera.position.z = cameraZ

const cameraGui = gui.addFolder('cameraPosition')
cameraGui.add(camera.position,'x',-3,3,.01)
cameraGui.add(camera.position,'y',-3,3,.01)
cameraGui.add(camera.position,'z',-3,3,.01)

scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x1f2126)

/**
 * Animate
 */

rotGui.add(rotation, 'x').min(-Math.PI/4).max(Math.PI/4).step(.001).onChange(rOnChange)
rotGui.add(rotation, 'y').min(-Math.PI/4).max(Math.PI/4).step(.001).onChange(rOnChange)
rotGui.add(rotation, 'z').min(-Math.PI/4).max(Math.PI/4).step(.001).onChange(rOnChange)

const page2Camera = new THREE.Vector3(camera2X, camera2Y, camera2Z)
const page2CameraGui = gui.addFolder('page 2 camera')
page2CameraGui.add(page2Camera,'x',-3,3,.01).onChange(()=>camera.position.x = page2Camera.x)
page2CameraGui.add(page2Camera,'y',-3,3,.01).onChange(()=>camera.position.y = page2Camera.y)
page2CameraGui.add(page2Camera,'z',0,6,.01).onChange(()=>camera.position.z = page2Camera.z)

const page2EaseExp = 2
const page2Ease = x=>x<.5?.5*Math.pow(2*x,page2EaseExp):1-.5*Math.pow(2-2*x, page2EaseExp)

const power2in = x => Math.pow(x, 2)
const power4in = x => Math.pow(x, 4)
const power6in = x => Math.pow(x, 6)
const power8in = x => Math.pow(x, 8)
const power16in = x => Math.pow(x, 16)

const power2out = x => 1-Math.pow(1-x, 2)
const power4out = x => 1-Math.pow(1-x, 4)
const power6out = x => 1-Math.pow(1-x, 6)
const power8out = x => 1-Math.pow(1-x, 8)
const power16out = x => 1-Math.pow(1-x, 16)

const pop = x => 0

const pages = [{
    // page 0 then (hover above panel)
    duration: 3,
    complete: () => {
        console.log("PAGE 0")
        buildingGroup.visible = false
        console.log(camera.rotation)
    },
    params: [
        {o: camera.rotation,    p: {x:1.4536875822280313,   y: 0,           z: 0}, ease: power4out},
        {o: cutout1.position,   p: {x:objectX-panelWidth/3, y:objectY - 3,  z:objectZ - page0ZOffset}, ease: power4out},
        {o: cutout2.position,   p: {x:objectX,              y:objectY - 3,  z:objectZ - page0ZOffset}, ease: power4out},
        {o: cutout3.position,   p: {x:objectX+panelWidth/3, y:objectY - 3,  z:objectZ - page0ZOffset}, ease: power4out},

        {o: content[0], p: {opacity: 1}}
    ]
}, {
    // page 1 then (pull away from building)
    duration: 5,
    complete: () => { 
        console.log("PAGE 1")
        buildingGroup.visible = true
        side2Material.transparent = false
        console.log(camera.rotation)
    },
    params: [
        {o: camera.position,  p: {x:cameraX}, ease: power2in},
        {o: camera.position,  p: {z:cameraZ}, ease: power2out},
        {o: camera.position,  p: {y:cameraY}, ease: power2out},
        {o: camera.rotation,  p: {x:1.4}, ease: power4out},
        {o: camera.rotation,  p: {y:0, z:0}},
        {o: cutout1.position, p: {x:objectX-panelWidth/3, y:objectY, z:objectZ}},
        {o: cutout2.position, p: {x:objectX,              y:objectY, z:objectZ}},
        {o: cutout3.position, p: {x:objectX+panelWidth/3, y:objectY, z:objectZ}},
        {o: floorMaterial,    p: {opacity:0}, ease: power4out},
        {o: side2Material,    p: {opacity:0}, ease: power4out},
        {o: windowMaterial,   p: {opacity:0}, ease: power4out},
        {o: groundMaterial,   p: {opacity:0}, ease: power4out},
        {o: cutout1.rotation, p: {x:0, y:0, z:0}},
        {o: cutout2.rotation, p: {x:0, y:0, z:0}},
        {o: cutout3.rotation, p: {x:0, y:0, z:0}},

        {o: content[0], p: {opacity: 1}, ease: power16out},
        {o: content[1], p: {opacity: 0}, ease: power16in},
    ]
}, {
    // page 2 zoom out of building
    duration: 3,
    complete: () => {
        console.log("PAGE 2")
        buildingGroup.visible = true
        side2Material.transparent = true
        sideMaterial.transparent = false
        console.log(camera.rotation)
    },
    params: [
        {o: camera.position,    p: {x:-4.75, y:0.50, z:4.05}, ease:power2out},  
        {o: camera.rotation,    p: {x: -0.23, y: -0.757, z: -0.194}, ease:power2out},
        {o: cutout1.position,   p: {x:objectX-panelWidth/3, y:objectY, z:objectZ}},
        {o: cutout2.position,   p: {x:objectX,              y:objectY, z:objectZ}},
        {o: cutout3.position,   p: {x:objectX+panelWidth/3, y:objectY, z:objectZ}},
        {o: cutout1.rotation,   p: {x:0, y:0, z:0}},
        {o: cutout2.rotation,   p: {x:0, y:0, z:0}},
        {o: cutout3.rotation,   p: {x:0, y:0, z:0}},
        {o: floorMaterial,      p: {opacity:1}, ease: power4out},
        {o: side2Material,      p: {opacity:1}, ease: power2out},
        {o: windowMaterial,     p: {opacity:.5}, ease: power4out},
        {o: groundMaterial,     p: {opacity:1}, ease: power2out},

        {o: content[0], p: {opacity: 0}},
        {o: content[1], p: {opacity: 1}, ease: power4out},
        {o: content[2], p: {opacity: 0}, ease: power4in},
    ]
}, {
    // page 3 (close up of panel sectionss)
    duration: 2,
    complete: () => {
        console.log("PAGE 3")
        sideMaterial.transparent = true
        matrixCutout.visible = false
        infillCutout.visible = false
    },
    params: [
        {o: camera.position,        p: {x: -2.00, y: 2.25, z: 8}, ease: power4in},
        {o: camera.rotation,        p: {x: -0.300, y: -0.0, z: -0.0}, ease: power4in},
        {o: cutout1.position,       p: {x:-1.5,       y:hoverHeight - .25, z:hoverDepth + 2}},
        {o: cutout1.rotation,       p: {x:rotation.x, y:rotation.y,        z:rotation.z}},
        {o: cutout2.position,       p: {x: -.1,       y:hoverHeight,       z:hoverDepth}},
        {o: cutout2.rotation,       p: {x:rotation.x, y:rotation.y,        z:rotation.z}},
        {o: cutout3.position,       p: {x: 1.5,       y:hoverHeight + .25, z:hoverDepth - 2}},
        {o: cutout3.rotation,       p: {x:rotation.x, y:rotation.y,        z:rotation.z}},

        {o: groundMaterial,         p: {opacity:0}},
        {o: floorMaterial,          p: {opacity:0}},
        {o: side2Material,          p: {opacity:0}},
        {o: windowMaterial,         p: {opacity:0}},
        {o: sideMaterial,           p: {opacity:1}, ease: power2out},

        {o: content[1], p: {opacity: 0}},
        {o: content[2], p: {opacity: 1}, ease: power16out},
        {o: content[3], p: {opacity: 0}, ease: power16in},
    ]
}, {
    // page 4 (cutout 1 in center)
    duration: 2,
    complete: () => {
        console.log("PAGE 4")
        buildingGroup.visible = false
        cutout2.visible = true
        cutout3.visible = true
        matrixCutout.visible = true
        infillCutout.visible = true        
    },
    params: [
        {o: camera.position,        p: {x: 0.27, y: 1.62, z: 8.36}},
        {o: camera.rotation,        p: {x: -0.221, y: 0.164, z: 0.038}},
        {o: cutout1.position,       p: {x:-1.5,       y:hoverHeight - .25, z:hoverDepth + 2}, ease: power4out},
        {o: cutout1.rotation,       p: {x:rotation.x, y:rotation.y,        z:rotation.z}, ease: power4out},
        {o: cutout2.position,       p: {x: -.1,       y:hoverHeight,       z:hoverDepth}},
        {o: cutout2.rotation,       p: {x:rotation.x, y:rotation.y,        z:rotation.z}},
        {o: cutout3.position,       p: {x: 1.5,       y:hoverHeight + .25, z:hoverDepth - 2}},
        {o: cutout3.rotation,       p: {x:rotation.x, y:rotation.y,        z:rotation.z}},

        {o: matrixCutout.position,  p: {x:-1.5,       y:hoverHeight - .25, z:hoverDepth + 2}, ease: power4out},
        {o: matrixCutout.rotation,  p: {x:rotation.x, y:rotation.y,        z:rotation.z}, ease: power4out},
        {o: infillCutout.position,  p: {x:-1.5,       y:hoverHeight - .25, z:hoverDepth + 2}, ease: power4out},
        {o: infillCutout.rotation,  p: {x:rotation.x, y:rotation.y,        z:rotation.z}, ease: power4out},

        {o: matrixMat,              p: {opacity:0}, ease: power4out},
        {o: infillMat,              p: {opacity:0}, ease: power4out},
        {o: sideMaterial,           p: {opacity:0}},

        {o: content[2], p: {opacity: 0}},
        {o: content[3], p: {opacity: 1}, ease: power4out},
    ]
}, {
    // page 5a (panel breaks into components)
    duration: 1,
    complete: () => { 
        console.log("PAGE 5a")
        cutout2.visible = false
        cutout3.visible = false
        robotScene.visible = false
        material.transparent = false        
    },
    params: [
        {o: camera.position,        p: {x: -0.73, y: 1.12, z: 8.56}},
        {o: camera.rotation,        p: {x: -0.26, y: 0.164, z: 0.038}},

        {o: cutout1.position,       p: {x:-.5,      y:hoverHeight - .5, z:hoverDepth + 3}},
        {o: infillCutout.position,  p: {x:-1.5,     y:hoverHeight - .5, z:hoverDepth+2.5}},
        {o: matrixCutout.position,  p: {x:-2.75,    y:hoverHeight - .5, z:hoverDepth+2}},

        {o: cutout1.rotation,       p: {x:rotation.x, y:rotation.y,     z:rotation.z}},
        {o: infillCutout.rotation,  p: {x:rotation.x, y:rotation.y,     z:rotation.z}},
        {o: matrixCutout.rotation,  p: {x:rotation.x, y:rotation.y,     z:rotation.z}},

        {o: matrixMat,              p: {opacity:1}},
        {o: infillMat,              p: {opacity:1}},
        {o: material,               p: {opacity:1}},

        {o: content[3], p: {opacity: 0}},
        {o: content[4], p: {opacity: 0}, ease: power16in},
    ]
}, {
    // page 5b (three sections of panel)
    duration: 3,
    complete: () => {
        robotScene.visible = true
        robotScene.position.x=matrixCutout.position.x - 2
        robotScene.position.z=matrixCutout.position.z
        material.transparent = true
    },
    params: [
        {o: camera.position,        p: {y: 1.12, z: 8.56}, ease: power4in},
        {o: camera.position,        p:{x: -0.73}, ease: power2out},
        {o: camera.rotation,        p: {x: -0.26, y: 0.164, z: 0.038}},

        {o: cutout1.position,       p: {x:-0,      y:hoverHeight - .5, z:hoverDepth+1.75}},
        {o: infillCutout.position,  p: {x:-1.5,    y:hoverHeight - .5, z:hoverDepth+2}},
        {o: matrixCutout.position,  p: {x:-3,    y:hoverHeight - .5, z:hoverDepth+2.25}},

        {o: cutout1.rotation,       p: {y:rotation.y - .3}},
        {o: matrixCutout.rotation,  p: {x: rotation.x, y:rotation.y}},

        {o: matrix2Mat,             p: {opacity:0}, ease: power4out},
        {o: robotMat,               p: {opacity:0}, ease: power4out},
        {o: infillMat,              p: {opacity:1}, ease: power4out},
        {o: material,               p: {opacity:1}, ease: power4out},

        {o: content[4], p: {opacity: 1}, ease: power16out},
        {o: content[5], p: {opacity: 0}, ease: power16in},
    ]
}, {
    // page 6 (robot constructing panel)
    duration: 2,
    complete: () => {
        console.log("PAGE 6")
    },
    params: [
        {o: camera.position,        p: {x: -6.485, y: 1.934, z: 8.660}},
        {o: camera.rotation,        p: {x: -0.359, y: -0.609, z: -0.211}},

        {o: matrixCutout.position,  p: {x:-3,    y:hoverHeight - .5, z:hoverDepth+2.25}},
        {o: matrixCutout.rotation,  p: {x: 0, y:0}},

        {o: infillMat,              p: {opacity:0}},
        {o: material,               p: {opacity:0}},
        {o: matrix2Mat,             p: {opacity:1}},
        {o: robotMat,               p: {opacity:1}},

        {o: content[4], p: {opacity: 0}},
        {o: content[5], p: {opacity: 1}},
    ]
}]

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true
// controls.addEventListener('change', ()=>{
//     page2CameraGui.updateDisplay()
//     console.log(`camera pos, x: ${camera.position.x.toFixed(3)}, y: ${camera.position.y.toFixed(3)}, z: ${camera.position.z.toFixed(3)}  
//     rot: x: ${camera.rotation.x.toFixed(3)}, y: ${camera.rotation.y.toFixed(3)}, z: ${camera.rotation.z.toFixed(3)}`)
// })

const clock = new THREE.Clock()
clock.start()

let page = 0

const animations = new Animations(pages)
gui.add({page0: ()=>animations.transitionToPage(0, clock.getElapsedTime())}, "page0")
gui.add({page1: ()=>animations.transitionToPage(1, clock.getElapsedTime())}, "page1")
gui.add({page2: ()=>animations.transitionToPage(2, clock.getElapsedTime())}, "page2")
gui.add({page3: ()=>animations.transitionToPage(3, clock.getElapsedTime())}, "page3")
gui.add({page4: ()=>animations.transitionToPage(4, clock.getElapsedTime())}, "page4")
gui.add({page5a: ()=>animations.transitionToPage(5, clock.getElapsedTime())}, "page5a")
gui.add({page5b: ()=>animations.transitionToPage(6, clock.getElapsedTime())}, "page5b")
gui.add({page6: ()=>animations.transitionToPage(7, clock.getElapsedTime())}, "page6")

// const tick = () =>
// {    
//     // Update controls
//     // controls.update()

//     animations.update(clock.getElapsedTime())

//     // Render
//     renderer.render(scene, camera)
//     // postprocessing.composer.render( 0.1 );

//     // Call tick again on the next frame
//     window.requestAnimationFrame(tick)
// }

// tick()
// renderer.render(scene, camera)

let autoScroll = 0
let userScroll = false


window.addEventListener('load', ()=> {
    document.addEventListener("scroll", e => {
        animations.set(window.scrollY*animations.totalDuration/sizes.scroll)
        renderer.render(scene, camera)        
    })

    let transitionStartTime = clock.getElapsedTime()
    let transitionDuration = animations.pages[0].duration
    let transitionStartScroll = 0
    let transitionEndScroll = parseInt(sizes.scroll * animations.pages[1].startTime / animations.pages[animations.pages.length-1].startTime)
    const transitionToPage = (e) => {
        const scrollPoint = parseInt((clock.getElapsedTime() - transitionStartTime) * (transitionEndScroll-transitionStartScroll)/transitionDuration)
        if (scrollPoint >= parseInt(transitionEndScroll)) {
            autoScroll = false
            return
        }

        window.scrollTo(0, scrollPoint)
        window.requestAnimationFrame(transitionToPage)
    }
    window.scroll(0, 0)
    transitionToPage()
})

