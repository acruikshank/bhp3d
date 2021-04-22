import './style.css'
import { zfn, panelGeometry } from './panels.js'
import { Animations } from './animations.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'
import * as dat from 'dat.gui'

/**
 * kr quantech ultra 120
 * TODO:
 * 2. Add page 5 with robot
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
 const page0ZOffset = 1.3
 
 const cameraX = 0
 const cameraY = -1.19
 const cameraZ = .14
 
 const camera2X = -3.549
 const camera2Y = 0.46
 const camera2Z = 4.5758
 
 const floorColor = 0xaaaaaa
 const windowColor = 0x000000
 
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
// material.wireframe = true
// material.normalScale = 10
gui.addColor({matColor: material.color.getHex()}, 'matColor')
    .onChange((c)=>material.color.setHex(c))
gui.add(material, 'metalness').min(0).max(1).step(.0001)
gui.add(material, 'roughness').min(0).max(1).step(.0001)

const sideMaterial = new THREE.MeshStandardMaterial({color: matColor})
sideMaterial.transparent = true
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
floorMaterial.transparent = true

const windowMaterial = new THREE.MeshStandardMaterial({color: windowColor})
const windowGui = gui.addFolder('window')
windowGui.addColor({windowColor: windowMaterial.color.getHex()}, 'windowColor')
    .onChange((c)=>windowMaterial.color.setHex(c))
windowMaterial.metalness = 0.4
windowMaterial.roughness = 0.3
windowMaterial.transparent = true
windowMaterial.opacity = 0
windowGui.add(windowMaterial, 'metalness').min(0).max(1).step(.0001)
windowGui.add(windowMaterial, 'roughness').min(0).max(1).step(.0001)

/**
 * Objects
 */

const startObjects = new Date();

const rotation = {x: 0.244, y: .296, z: 0}
const rotGui = gui.addFolder('rotation')
const rOnChange = ()=>{
    cutout1.rotation.set(rotation.x, rotation.y, rotation.z)
    cutout2Group.rotation.set(rotation.x, rotation.y, rotation.z)
    cutout3.rotation.set(rotation.x, rotation.y, rotation.z)
}

const cutout1 = new THREE.Mesh(    
    panelGeometry(panelWidth/3, 2.1, .2, 512, 256, 0, zfn(-0.666,-1,2/3,2.1)),
    sideMaterial
)
cutout1.position.set(objectX-panelWidth/3,objectY,objectZ - page0ZOffset)

const cutout2 = new THREE.Mesh(    
    // panelGeometry(panelWidth/3, 2.1, .2, 512, 128, 0, zfn(-3,-1,6,2)),
    panelGeometry(panelWidth/3, 2.1, .2, 512, 256, 0, zfn(-0,-1,2/3,2.1)),
    material
)

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

const matrixCutout = new THREE.Mesh(    
    panelGeometry(panelWidth/3, 2.1, .2, 128, 128, 12.55, zfn(-0,-1,2/3,2.1)),
    matrixMat
)

const floorGeometry = new THREE.BoxBufferGeometry(12, .075, 1)
const floor1 = new THREE.Mesh(floorGeometry, floorMaterial)
floor1.position.set(0, 1.05, -.75)
const floor3 = new THREE.Mesh(floorGeometry, floorMaterial)
floor3.position.set(0, -1.05, -.75)

const buildingGroup = new THREE.Group()
buildingGroup.visible = false
buildingGroup.add(floor1, floor3, cutout4, cutout5)

const windowGeometry = new THREE.BoxBufferGeometry(.49, 1, .02)
Array(24).fill().forEach((_,i)=>Array(2).fill().forEach((_,j) => {
    const window = new THREE.Mesh(windowGeometry, windowMaterial)
    window.position.set(-5.5 + .5*i, -.5+j, -.3)
    buildingGroup.add(window)
}))


const sectionGeometry = new THREE.BoxBufferGeometry(2/3, 2, .3)
const section1 = new THREE.Mesh(material, sectionGeometry)

const cutout2Group = new THREE.Group();
cutout2Group.add(cutout2)
cutout2Group.add(infillCutout)
cutout2Group.add(matrixCutout)
cutout2Group.position.set(objectX,objectY,objectZ - page0ZOffset)

// scene.add(sphere, plane, torus)
scene.add(cutout1, cutout2Group, cutout3, buildingGroup)

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
directionalLight.target = cutout2Group
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
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
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
const opInEase = x => 1-Math.pow(1-x, 2)

const pages = [{
    // page 0 (everything offscreen)
    duration: 3,
    complete: () => {
        console.log("PAGE 0")
        buildingGroup.visible = false
    },
    params: [
        {o: cutout1.position,      p: {x:objectX-panelWidth/3, y:objectY, z:objectZ - page0ZOffset}},
        {o: cutout2Group.position, p: {x:objectX,              y:objectY, z:objectZ - page0ZOffset}},
        {o: cutout3.position,      p: {x:objectX+panelWidth/3, y:objectY, z:objectZ - page0ZOffset}}
    ]
}, {
    // page 1 (hover above panel)
    duration: 3,
    complete: () => { 
        console.log("PAGE 1")
        buildingGroup.visible = true
    },
    params: [
    {o: camera.position,       p: {x:cameraX, y:cameraY, z:cameraZ}},
    {o: cutout1.position,      p: {x:objectX-panelWidth/3, y:objectY, z:objectZ}},
    {o: cutout2Group.position, p: {x:objectX,              y:objectY, z:objectZ}},
    {o: cutout3.position,      p: {x:objectX+panelWidth/3, y:objectY, z:objectZ}},
    {o: floorMaterial,         p: {opacity:0}},
    {o: side2Material,         p: {opacity:0}},
    {o: windowMaterial,        p: {opacity:0}},
    {o: cutout1.rotation,      p: {x:0, y:0, z:0}},
    {o: cutout2Group.rotation, p: {x:0, y:0, z:0}},
    {o: cutout3.rotation,      p: {x:0, y:0, z:0}},
    ]
}, {
    // page 2 (pull away from building)
    duration: 3,
    complete: () => console.log("PAGE 2"),
    params: [
    {o: camera.position,       p: {x:page2Camera.x, y:page2Camera.y, z:page2Camera.z}, ease:page2Ease},
    {o: cutout1.position,      p: {x:objectX-panelWidth/3, y:objectY, z:objectZ}},
    {o: cutout2Group.position, p: {x:objectX,              y:objectY, z:objectZ}},
    {o: cutout3.position,      p: {x:objectX+panelWidth/3, y:objectY, z:objectZ}},
    {o: cutout1.rotation,      p: {x:0, y:0, z:0}},
    {o: cutout2Group.rotation, p: {x:0, y:0, z:0}},
    {o: cutout3.rotation,      p: {x:0, y:0, z:0}},
    {o: floorMaterial,         p: {opacity:1}},
    {o: side2Material,         p: {opacity:1}},
    {o: windowMaterial,        p: {opacity:.5}},
    ]
}, {
    // page 3 (close up of panel sections)
    duration: 1,
    complete: () => console.log("PAGE 3"),
    params: [
    {o: camera.position,       p: {x:0, y:.2, z:8}, ease:page2Ease},
    {o: cutout1.position,      p: {x:-2.5,       y:hoverHeight, z:hoverDepth}},
    {o: cutout1.rotation,      p: {x:rotation.x, y:rotation.y,  z:rotation.z}},
    {o: cutout2Group.position, p: {x: 0,         y:hoverHeight, z:hoverDepth}},
    {o: cutout2Group.rotation, p: {x:rotation.x, y:rotation.y,  z:rotation.z}},
    {o: cutout3.position,      p: {x: 2.5,       y:hoverHeight, z:hoverDepth}},
    {o: cutout3.rotation,      p: {x:rotation.x, y:rotation.y,  z:rotation.z}},

    {o: cutout2.position,      p: {x:0,      z:0}},
    {o: cutout2.rotation,      p: {x:0, y:0, z:0}},
    {o: matrixCutout.position, p: {x:0,      z:0}},
    {o: matrixCutout.rotation, p: {x:0, y:0, z:0}},
    {o: infillCutout.position, p: {x:0,      z:0}},
    {o: infillCutout.rotation, p: {x:0, y:0, z:0}},

    {o: floorMaterial,         p: {opacity:0}},
    {o: side2Material,         p: {opacity:0}},
    {o: windowMaterial,        p: {opacity:0}},
    {o: matrixMat,             p: {opacity:0}},
    {o: infillMat,             p: {opacity:0}},
    {o: sideMaterial,          p: {opacity:1}},
    ]
}, {
    // page 4a (panel breaks into components)
    duration: 1,
    complete: () => {},
    params: [
    {o: camera.position,       p: {x:0, y:.2, z:8, ease:page2Ease}},
    {o: cutout1.position,      p: {x:-2.5, y:hoverHeight, z:hoverDepth}},
    {o: cutout1.rotation,      p: {x:rotation.x, y:rotation.y, z:rotation.z}},
    {o: cutout2Group.position, p: {x: 0, y:hoverHeight, z:hoverDepth}},
    {o: cutout2Group.rotation, p: {x:0, y:0, z:0}},
    {o: cutout3.position,      p: {x: 2.5, y:hoverHeight, z:hoverDepth}},
    {o: cutout3.rotation,      p: {x:rotation.x, y:rotation.y, z:rotation.z}},

    {o: cutout2.position,      p: {x: .75, z:.75}},
    {o: matrixCutout.position, p: {x: -.75, z:-.75}},

    {o: matrixMat,             p: {opacity:1}, ease:opInEase},
    {o: infillMat,             p: {opacity:1}, ease:opInEase},
    {o: sideMaterial,          p: {opacity:0}, ease:opInEase},
    ]
}, {
    // page 4b (three sections of panel)
    duration: 1,
    complete: () => {},
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
})

const clock = new THREE.Clock()
clock.start()

let page = 0

const animations = new Animations(pages)
gui.add({page0: ()=>animations.transitionToPage(0, clock.getElapsedTime())}, "page0")
gui.add({page1: ()=>animations.transitionToPage(1, clock.getElapsedTime())}, "page1")
gui.add({page2: ()=>animations.transitionToPage(2, clock.getElapsedTime())}, "page2")
gui.add({page3: ()=>animations.transitionToPage(3, clock.getElapsedTime())}, "page3")
gui.add({page4a: ()=>animations.transitionToPage(4, clock.getElapsedTime())}, "page4a")
gui.add({page4b: ()=>animations.transitionToPage(5, clock.getElapsedTime())}, "page4b")

const tick = () =>
{    
    // Update controls
    controls.update()

    animations.update(clock.getElapsedTime())

    // Render
    renderer.render(scene, camera)
    // postprocessing.composer.render( 0.1 );

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

animations.transitionToPage(1, clock.getElapsedTime())

// const to1 = {a: 0, b: 0}
// const to2 = {a: 0, b: 0, c:0}
// const to3 = {b: 0, c: 0}
// const testA = new Animations([{
//     duration: 1000,
//     complete: () => console.log('page 0'),
//     params: [
//         {o: to1, p: {a: 0, b: 0}},
//         {o: to2, p: {a: 0, b: 0, c: 0}},
//     ]
// },{
//     duration: 2000,
//     complete: () => console.log('page 1'),
//     params: [
//         {o: to1, p: {a: 10, b: 10}},
//         {o: to2, p: {a: 1, b: 2, c: 3}},
//         {o: to3, p: {b: 0, c: 0}}
//     ]
// },{
//     duration: 0,
//     complete: () => console.log('page 2'),
//     params: [
//         {o: to2, p: {c: 6}},
//         {o: to3, p: {b: 8, c: 8}}
//     ]
// }])

// testA.transitionToPage(2, 0)
// testA.update(200)
// console.log(200, to1, to2, to3)
// testA.update(500)
// console.log(500, to1, to2, to3)
// testA.update(999)
// console.log(999, to1, to2, to3)
// testA.update(1002)
// console.log(1002, to1, to2, to3)
// testA.update(1500)
// console.log(1500, to1, to2, to3)
// testA.update(2000)
// console.log(2000, to1, to2, to3)
// testA.update(3500)
// console.log(3500, to1, to2, to3)

// console.log('transition back')
// testA.transitionToPage(0, 4000)
// testA.update(4500)
// console.log(4500, to1, to2, to3)
// testA.update(5000)
// console.log(5000, to1, to2, to3)
// testA.update(5500)
// console.log(5500, to1, to2, to3)
// testA.update(6000)
// console.log(6000, to1, to2, to3)
// testA.update(6500)
// console.log(6500, to1, to2, to3)
// testA.update(7200)
// console.log(7200, to1, to2, to3)
