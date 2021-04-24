import './style.css'
import { zfn, panelGeometry } from './panels.js'
import { Animations } from './animations.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'
import * as dat from 'dat.gui'

/**
 * TODO:
 * 1. [Done] create page between 3 and 4 where leftmost panel moves to center
 * 2. Add visibility to matrix and infill for page 4, and set position and rotation to that of cutout1
 * 3. use texture section from cutout 1 for infill and matrix
 * 4. Add last 5 with robot (kr quantech ultra 120)
 * 5. Add animation by fraction option. (with slider)
 * 6. Have animation respond to screen aspect. Update animation on resize.
 * 7. Tune aspect ratios
 * 8. Portrait aspect carosel
 * 9. Add text screens.
 * 10. Add text animations based on fraction.
 * 11. Tie fraction to scroll.
 * 12. [Done] Fix pop for materials fading in an out
 * 13. Lazy load panels
 * 14. Garbage collect
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
 
 const floorColor = 0xaaaaaa
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

const matrixMat = new THREE.MeshStandardMaterial({color: 0x999999})
matrixMat.side = THREE.DoubleSide
matrixMat.transparent = true
matrixMat.map = matrixTexture
matrixMat.metalness = 0
matrixMat.roughness = 1
matrixMat.opacity = 0

const infillMat = new THREE.MeshStandardMaterial({color: 0x999999})
infillMat.side = THREE.DoubleSide
infillMat.transparent = true
infillMat.map = infillTexture
infillMat.metalness = 0
infillMat.roughness = 1
infillMat.opacity = 0

const floorMaterial = new THREE.MeshStandardMaterial({color: 0x111111})
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
    panelGeometry(panelWidth/3, 2.1, .2, 128, 128, 13.1, zfn(-0,-1,2/3,2.1)),
    infillMat
)
infillCutout.visible = false

const matrixCutout = new THREE.Mesh(    
    panelGeometry(panelWidth/3, 2.1, .2, 128, 128, 12.55, zfn(-0,-1,2/3,2.1)),
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

// const cutout2Group = new THREE.Group();
// cutout2Group.add(cutout2)
// cutout2Group.add(infillCutout)
// cutout2Group.add(matrixCutout)

// scene.add(sphere, plane, torus)
scene.add(cutout1, cutout2, cutout3, infillCutout, matrixCutout, buildingGroup)

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
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // postprocessing.composer.setSize( width, height );
})

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

const power2out = x => 1-Math.pow(1-x, 2)
const power4out = x => 1-Math.pow(1-x, 4)
const power6out = x => 1-Math.pow(1-x, 6)
const power8out = x => 1-Math.pow(1-x, 8)
const power16out = x => 1-Math.pow(1-x, 16)

const pop = x => 0

const pages = [{
    // page 0 then (hover above panel)
    duration: .2, //3,
    complete: () => {
        console.log("PAGE 0")
        buildingGroup.visible = false
        console.log(camera.rotation)
    },
    params: [
        {o: camera.rotation,    p: {x:1.4536875822280313,   y: 0,           z: 0}, ease: power4out},
        {o: cutout1.position,   p: {x:objectX-panelWidth/3, y:objectY - 3,  z:objectZ - page0ZOffset}, ease: power4out},
        {o: cutout2.position,   p: {x:objectX,              y:objectY - 3,  z:objectZ - page0ZOffset}, ease: power4out},
        {o: cutout3.position,   p: {x:objectX+panelWidth/3, y:objectY - 3,  z:objectZ - page0ZOffset}, ease: power4out}
    ]
}, {
    // page 1 then (pull away from building)
    duration: .2, //5,
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
    ]
}, {
    // page 2 zoom out of building
    duration: .2,// 3,
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
    ]
}, {
    // page 3 (close up of panel sectionss)
    duration: 1,
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

    {o: groundMaterial,         p: {opacity:0}, ease: power4out},
    {o: floorMaterial,          p: {opacity:0}, ease: power4out},
    {o: side2Material,          p: {opacity:0}, ease: power4out},
    {o: windowMaterial,         p: {opacity:0}, ease: power4out},
    {o: sideMaterial,           p: {opacity:1}},
    ]
}, {
    // page 4 (cutout 1 in center)
    /*
    x: -0.7304821030593593
y: 1.1187980781742106
z: 8.35859461224657

_x: -0.22098739913953544
_y: 0.16429818330975826
_z: 0.036728282249148994
*/
    duration: 1,
    complete: () => {
        console.log("PAGE 4")
        buildingGroup.visible = false
        cutout2.visible = true
        cutout3.visible = true
        matrixCutout.visible = true
        infillCutout.visible = true
    },
    params: [
    {o: camera.position,        p: {x: -0.73, y: 1.12, z: 8.36}},
    {o: camera.rotation,        p: {x: -0.221, y: 0.164, z: 0.038}},
    {o: cutout1.position,       p: {x:-1.5,       y:hoverHeight - .25, z:hoverDepth + 2}},
    {o: cutout1.rotation,       p: {x:rotation.x, y:rotation.y,        z:rotation.z}},
    {o: cutout2.position,       p: {x: -.1,       y:hoverHeight,       z:hoverDepth}},
    {o: cutout2.rotation,       p: {x:rotation.x, y:rotation.y,        z:rotation.z}},
    {o: cutout3.position,       p: {x: 1.5,       y:hoverHeight + .25, z:hoverDepth - 2}},
    {o: cutout3.rotation,       p: {x:rotation.x, y:rotation.y,        z:rotation.z}},

    {o: matrixCutout.position,  p: {x:-1.5,       y:hoverHeight - .25, z:hoverDepth + 2}},
    {o: matrixCutout.rotation,  p: {x:rotation.x, y:rotation.y,        z:rotation.z}},
    {o: infillCutout.position,  p: {x:-1.5,       y:hoverHeight - .25, z:hoverDepth + 2}},
    {o: infillCutout.rotation,  p: {x:rotation.x, y:rotation.y,        z:rotation.z}},

    {o: matrixMat,              p: {opacity:0}, ease: power4out},
    {o: infillMat,              p: {opacity:0}, ease: power4out},
    {o: sideMaterial,           p: {opacity:0}},
    ]
}, {
    // page 5a (panel breaks into components)
    duration: 1,
    complete: () => { 
        console.log("PAGE 5a")
        cutout2.visible = false
        cutout3.visible = false
    },
    params: [
    // {o: camera.position,    p: {x:0, y:.2, z:8, ease:page2Ease}},
    // {o: cutout1.position,   p: {x:-2.5, y:hoverHeight, z:hoverDepth}},
    // {o: cutout1.rotation,   p: {x:rotation.x, y:rotation.y, z:rotation.z}},

    {o: cutout1.position, p: {x:-.5,       y:hoverHeight - .5, z:hoverDepth + 3}},
    {o: infillCutout.position, p: {x:-1.5,       y:hoverHeight - .5, z:hoverDepth+2.5}},
    {o: matrixCutout.position, p: {x:-2.75,       y:hoverHeight - .5, z:hoverDepth+2}},

    {o: infillCutout.rotation,  p: {x:rotation.x, y:rotation.y,        z:rotation.z}},
    {o: matrixCutout.rotation,  p: {x:rotation.x, y:rotation.y,        z:rotation.z}},

    {o: matrixMat,          p: {opacity:1}, ease:power2out},
    {o: infillMat,          p: {opacity:1}, ease:power2out},
    ]
}, {
    // page 5b (three sections of panel)
    duration: 1,
    complete: () => {
    },
    params: [
    {o: cutout2.position,      p: {x:2.5, z:0}},
    {o: matrixCutout.position, p: {x:-2.5, z:-.75}},

    {o: cutout2.rotation,      p: {x:rotation.x, y:rotation.y, z:rotation.z}},
    {o: infillCutout.rotation, p: {x:rotation.x, y:rotation.y, z:rotation.z}},
    {o: matrixCutout.rotation, p: {x:rotation.x, y:rotation.y, z:rotation.z}},
    ]
}]

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.addEventListener('change', ()=>{
    // page2Camera.set(camera.position.x, camera.position.y, camera.position.z)
    page2CameraGui.updateDisplay()
    console.log("camera position", camera.position)
    console.log("camera rotation", camera.rotation)
})

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

const tick = () =>
{    
    // Update controls
    // controls.update()

    animations.update(clock.getElapsedTime())

    // Render
    renderer.render(scene, camera)
    // postprocessing.composer.render( 0.1 );

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

animations.transitionToPage(3, clock.getElapsedTime())

