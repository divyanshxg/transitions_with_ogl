import { Renderer, Camera, Transform, Plane, Vec3 } from 'ogl'
import "./style.css"
import gsap from 'gsap'
import normalizeWheel from 'normalize-wheel'
import { isMobileDevice, lerp } from './utils/utils'
import { imageArray } from './utils/assets'
import Media from './Media'

export default class App {
  constructor() {
    this.images = imageArray
    this.isMobile = isMobileDevice()
    this.scroll = {
      ease: 0.05,
      current: 0,
      target: 0,
    };

    this.distanceEase = 1
    this.transition = {
      current: "flat",
      next: "flat"
    }
    this.initiateChange = false

    // this object contains the position of sphere, flat  and slider
    this.positions = {}
    this.onSlider = false
    this.createRenderer()
    this.createCamera()
    this.createScene()
    this.createGeometry()


    this.onResize()

    this.createPositions() // filling the positions object
    this.createMedia()
    // pos                         //planes
    // this.totalWidth = 0;
    this.update()

    this.addEventListeners()
  }

  createRenderer() {
    this.renderer = new Renderer({
      dpr: 2, antialias: true
    })

    this.gl = this.renderer.gl
    this.gl.clearColor(0.79607843137, 0.79215686274, 0.74117647058, 1)

    document.body.appendChild(this.gl.canvas)
  }

  createCamera() {
    this.camera = new Camera(this.gl)
    this.camera.fov = 30
    this.camera.position.z = 50
  }

  createScene() {
    this.scene = new Transform()
  }

  createGeometry() {
    this.geometry = new Plane(this.gl, {
      width: 1,
      height: 1,
      widthSegments: 30,
      heightSegments: 30
    })
  }

  /*
   * Medias
   */
  createMedia() {
    this.medias = this.images.map((image, index) => {
      return new Media({
        renderer: this.renderer,
        scene: this.scene,
        index: index,
        length: this.images.length,
        geometry: this.geometry,
        image: image,
        gl: this.gl,
        division: this.isMobile ? 2 : 1,
        positions: {
          sphere: this.positions.sphere[index],
          flat: this.positions.flat[index],
          slider: this.positions.slider[index],
        }
      })
    })
  }

  /*
   * POSITIONS 
   */

  createPositions() {

    this.createSpherePositions()
    this.createSliderPositions()
    this.createFlatPositions()

  }
  sphericalCoordinates(sphereRadius, phi, theta) {

    let x = sphereRadius * Math.cos(theta) * Math.sin(phi)
    let y = sphereRadius * Math.sin(theta) * Math.sin(phi)
    let z = sphereRadius * Math.cos(phi)

    return new Vec3(x, y, z)

  }
  createSpherePositions() {

    this.spherePositions = []
    for (let i = 0; i < this.images.length; i++) {
      const phi = Math.acos(-1 + (2 * i) / this.images.length);
      const theta = Math.sqrt(this.images.length * Math.PI) * phi;
      this.spherePositions.push(this.sphericalCoordinates(this.isMobile ? 6 : 13, phi, theta))

    }
    this.positions["sphere"] = this.spherePositions

  }

  createSliderPositions() {

    this.sliderPositions = []
    for (let i = 0; i < this.images.length; i++) {
      const xPos = -200 * (i) / this.images.length
      this.sliderPositions.push(new Vec3(xPos, 0, 0))
    }
    this.positions["slider"] = this.sliderPositions
    // Calculate total width
    // const length = this.images.length;
    // const sideBySide = length * 12 * 20
    this.totalWidth = 7700 // experimentation
    // const xSpan = (200 * (length - 1)) / length;
    // const planeWidth = 6 * this.screen.width / this.viewport.width; // Scale from Media class
    // this.totalWidth = xSpan * 0.1 + planeWidth; // Adjust scaling factor as needed
  }
  createFlatPositions() {

    this.flatPositions = []
    this.flatPositions.push(new Vec3(0, 0, 0))
    for (let i = 1; i < this.images.length; i++) {
      this.flatPositions.push(new Vec3(0, 0, -i * 0.05))
    }
    this.positions["flat"] = this.flatPositions;

  }

  /*
   * Annimations
   */

  // Load and Hover Annimations
  onLoad() {
    this.medias.forEach(media => {
      media.setFlat(2, 0.8)
    })
  }

  onHover() {
    if (this.transition.current == "flat") {
      this.medias.forEach(media => {
        media.onHover()
      })
    }
  }

  onHoverLeave() {
    if (this.transition.current == "flat") {
      this.medias.forEach(media => {
        media.onHoverLeave()
      })
    }
  }


  initiateTransition(nextShape) {
    this.scroll.current = 0;
    this.scroll.target = 0;
    if (this.transition.current == nextShape) return;
    this.transition.next = nextShape

    let duration = 2.0
    let delay = 0.4
    let resetDuration = 0.4
    let offset = 0
    if (this.transition.current == "flat" && nextShape == "sphere") {
      this.medias.forEach(media => {
        media.flatToSphere(delay, resetDuration)
      })
    }
    if (this.transition.current == "flat" && nextShape == "slider") {
      this.medias.forEach(media => {
        media.flatToSlider(delay, resetDuration)
      })
    }
    if (this.transition.current == "sphere" && nextShape == "flat") {
      this.medias.forEach(media => {
        media.sphereToFlat(delay, resetDuration)
      })
    }
    if (this.transition.current == "sphere" && nextShape == "slider") {
      this.medias.forEach(media => {
        media.sphereToSlider(delay, resetDuration)
      })
    }
    if (this.transition.current == "slider" && nextShape == "flat") {
      this.medias.forEach(media => {
        media.sliderToFlat(delay, resetDuration)
      })
    }
    if (this.transition.current == "slider" && nextShape == "sphere") {
      this.medias.forEach(media => {
        media.sliderToSphere(delay, resetDuration)
      })
    }

    delay = delay + resetDuration

    if (nextShape == "sphere") {
      this.medias.forEach(media => {
        media.setSphere(duration - delay, delay)
      })
      this.distanceEase = 1

    }
    if (nextShape == "flat") {
      this.medias.forEach(media => {
        media.setFlat(duration - delay, delay)
      })

    }
    if (nextShape == "slider") {

      this.medias.forEach(media => {
        media.setSlider(duration - delay, delay)
      })

    }


    this.transition.current = nextShape

  }

  /**
   * Events.
   */
  onTouchDown(event) {

    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientX : event.clientX;
  }

  onTouchMove(event) {
    if (!this.isDown) return;

    const y = event.touches ? event.touches[0].clientX : event.clientX;
    const distance = (this.start - y) * 2;

    if (this.initiateChange) {
      this.scroll.target = (this.scroll.position + distance);
    }
  }

  onTouchUp(event) {

    this.isDown = false;
  }

  onWheel(event) {
    const normalized = normalizeWheel(event);
    const speed = normalized.pixelY;

    if (this.initiateChange) {
      this.scroll.target += speed;
    }


  }

  /**
   * Resize.
   */
  onResize() {
    this.screen = {
      height: window.innerHeight,
      width: window.innerWidth
    }

    this.renderer.setSize(this.screen.width, this.screen.height)

    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height
    })

    const fov = this.camera.fov * (Math.PI / 180)
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect
    // console.log(width)

    this.viewport = {
      height,
      width
    }
  }

  /**
   * Update.
   */
  update() {
    this.renderer.render({
      scene: this.scene,
      camera: this.camera
    })

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease,
    );


    if (this.transition.current == "sphere") {

      this.initiateChange = true
      this.scene.rotation.y = -(this.scroll.current / (1000 * (this.isMobile ? 0.3 : 1))) % 2 * Math.PI
    }

    if (this.transition.current == "slider") {
      this.scroll.current = gsap.utils.clamp(-this.totalWidth, 0, this.scroll.current);
      this.scroll.target = gsap.utils.clamp(-this.totalWidth, 0, this.scroll.target);
      let width = this.totalWidth * (this.isMobile ? 0.1 : 1)
      // let mapped = gsap.utils.mapRange(0, width, 1, 0, this.scroll.current);
      let mapped = gsap.utils.mapRange(-width, 0, -1, 0, this.scroll.current)
      let endMap = gsap.utils.mapRange(0, -width, 1, 0, this.scroll.current)

      let clamped = gsap.utils.clamp(0, 1, Math.abs(mapped))
      let endClamped = gsap.utils.clamp(0, 1, Math.abs(endMap))



      this.distanceEase = clamped
      // console.log(clamped)
      if (this.scroll.current < 0.1) {
        //mapping range
        this.initiateChange = true
        this.scene.position.x = -this.scroll.current / (40 * (this.isMobile ? 0.3 : 1))
        // console.log(this.scene.position.x)
        this.scene.position.x *= (this.distanceEase)
        // console.log(this.scene.position.x, this.distanceEase)
        // console.log(this.scene.position.x)
        // console.log(this.scene.position.x)
      } else {
        this.scroll.target = 0
        this.scroll.current = 0
      }
    }

    // console.log(this.scroll.current)
    if (this.transition.current == "flat") {
      this.initiateChange = false;
    }
    // console.log(this.scene.rotation.y, this.scene.position.x, this.scroll.current)

    let factor = (this.scroll.current - this.scroll.target) / 2000
    this.medias.forEach(media => {
      // console.log(this.transition.current)
      media.update(this.transition.current, this.distanceEase * factor * (this.isMobile ? 5 : 2))
    })

    window.requestAnimationFrame(this.update.bind(this))
  }

  /**
   * Listeners.
   */
  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this))

    window.addEventListener('mousewheel', this.onWheel.bind(this))
    window.addEventListener('wheel', this.onWheel.bind(this))

    window.addEventListener('mousedown', this.onTouchDown.bind(this))
    window.addEventListener('mousemove', this.onTouchMove.bind(this))
    window.addEventListener('mouseup', this.onTouchUp.bind(this))

    window.addEventListener('touchstart', this.onTouchDown.bind(this))
    window.addEventListener('touchmove', this.onTouchMove.bind(this))
    window.addEventListener('touchend', this.onTouchUp.bind(this))
  }
}

const app = new App()


window.addEventListener("DOMContentLoaded", () => {
  app.onLoad()
})
// Initializations 
const selects = Array.from(document.querySelectorAll(".p"))
const panel_select = document.querySelector(".panel_select")
const hover_box = document.querySelector(".hover_box")

selects.forEach((select, idx) => {

  select.addEventListener("click", movePanel)
})

let initalX = selects[0].getBoundingClientRect().left

function movePanel(e) {
  const latest = e.target
  let newX = latest.getBoundingClientRect().left
  gsap.to(panel_select, {
    x: newX - initalX,
    duration: 0.6,
    ease: "elastic.out(1,0.4)"
  })

  app.initiateTransition(e.target.dataset.shape)
  // app.initTransition(e.target.dataset.shape)
}



/////////////////////////////////////
// FLAT hover
/////////////////////////////////////
hover_box.addEventListener("mouseover", () => {

  app.onHover()
  // app.hoverOnFlat()

})
hover_box.addEventListener("mouseleave", () => {

  app.onHoverLeave()
  // app.hoverLeaveonFlat()

})

