import { Mesh, Program, Texture, Vec2, Vec3 } from "ogl";
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import gsap from "gsap";

export default class Media {
  constructor({ renderer, scene, geometry, image, gl, index, positions, length }) {
    this.renderer = renderer;
    this.scene = scene;
    this.image = image;
    this.geometry = geometry;
    this.gl = gl;
    this.index = index
    this.positions = positions
    this.length = length
    this.scale = new Vec2(4, 4)
    this.isFirst = true;


    this.createMesh()
  }
  createMesh() {
    const img = new Image()
    const texture = new Texture(this.gl)
    img.src = this.image
    img.onload = (_) => {
      this.program.uniforms.uImageSizes.value = new Vec2(img.naturalWidth, img.naturalWidth)
      texture.image = img
    }
    texture.minFilter = this.gl.LINEAR
    texture.magFilter = this.gl.LINEAR


    this.program = new Program(this.gl, {
      vertex: vertex,
      fragment: fragment,
      cullFace: false,
      uniforms: {
        uImageSizes: {
          value: new Vec2()
        },
        uTexture: {
          value: texture
        },
        uPlaneSizes: {
          value: this.scale
        },
        uStrength: {
          value: 0.0
        },
        shape: {
          value: 1
        }
      }
    })

    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    })
    this.mesh.scale.set(this.scale.x, this.scale.y)
    this.mesh.setParent(this.scene)
  }

  /*
  *  Setting Mesh Positions 
  */


  setSphere(duration, delay, offset) {

    gsap.to(this.mesh.scale, {
      x: 4,
      y: 4,
      duration: duration,
      ease: "power4.inOut",
      delay: delay
    })

    gsap.to(this.mesh.rotation, {
      x: 0,
      z: 0,
      y: 0,
      duration: duration,
      ease: "power4.inOut",
      delay: delay

    })
    gsap.to(this.program.uniforms.uPlaneSizes.value, {
      x: 4,
      y: 4,
      duration: duration,
      ease: "power4.inOut",
      delay: delay

    })

    gsap.to(this.mesh.position, {
      x: this.positions.sphere[0],
      y: this.positions.sphere[1],
      z: this.positions.sphere[2],
      delay: delay,
      duration: duration,
      onUpdate: () => {
        this.mesh.lookAt([0, 0, 0])
      }
    })
  }

  setSlider(duration, delay, offset) {
    gsap.to(this.mesh.scale, {
      x: 6,
      y: 1.67 * 6,
      duration: duration,
      ease: "power4.inOut",
      delay: delay
    })

    gsap.to(this.mesh.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: duration,
      ease: "power4.inOut",
      delay: delay,

    })

    gsap.to(this.program.uniforms.uPlaneSizes.value, {
      x: 4,
      y: 1.67 * 4,
      duration: duration,
      ease: "power4.inOut",
      delay: delay

    })

    gsap.to(this.mesh.position, {
      x: this.positions.slider[0],
      y: this.positions.slider[1],
      z: this.positions.slider[2] - this.index * 0.02,
      duration: duration,
      delay: delay,
      stagger: 0.1,
      onUpdate: () => {
        this.mesh.lookAt([0, 0, 10000])
      },

    })
  }
  setFlat(duration, delay, offset) {
    this.angle = 2 * Math.PI * (this.index - 1) / this.length


    gsap.to(this.mesh.rotation, {
      y: 0,
      x: 0,
      duration: duration,
      ease: "power4.inOut",
      delay: this.isFirst ? delay : delay

    })

    if (this.index == 0) {
      gsap.to(this.mesh.scale, {
        x: 5,
        y: 1.67 * 4,
        duration: duration,
        ease: this.isFirst ? "power4.inOut" : "power4.out",
        delay: this.isFirst ? delay - 0.4 : delay


      })
      gsap.to(this.program.uniforms.uPlaneSizes.value, {
        x: 5,
        y: 1.67 * 4,
        duration: duration,
        ease: this.isFirst ? "power4.inOut" : "power4.out",
        delay: this.isFirst ? delay - 0.4 : delay
      })
      gsap.to(this.mesh.position, {
        x: this.positions.flat[0],
        y: this.positions.flat[1],
        z: this.positions.flat[2],
        duration: duration,
        delay: this.isFirst ? delay - 0.4 : delay,
        onUpdate: () => {
          this.mesh.lookAt([0, 0, 1000])
        }
      })

      gsap.to(this.mesh.rotation, {
        z: 0,
        duration: duration,
        ease: "power4.inOut",
        delay: this.isFirst ? delay - 0.4 : delay,
      })
    }
    else {
      gsap.to(this.mesh.scale, {
        x: 2,
        y: 1.67 * 5,
        duration: duration,
        ease: "power4.inOut",
        delay: delay,


      })

      gsap.to(this.program.uniforms.uPlaneSizes.value, {
        x: 2,
        y: 1.67 * 5,
        duration: duration,
        ease: "power4.inOut",
        delay: delay,

      })

      gsap.to(this.mesh.position, {
        x: this.positions.flat[0],
        y: this.positions.flat[1],
        z: this.positions.flat[2],
        duration: duration,
        delay: delay,
        onUpdate: () => {
          this.mesh.lookAt([0, 0, 1])
        },
      })
      gsap.to(this.mesh.rotation, {
        z: this.angle,
        duration: duration,
        ease: "power4.inOut",
        delay: delay,

      })
    }
    this.isFirst = false;


  }

  /*
   *Intermediate transitions
   */

  resetScene(duration) {
    // console.log("hii")
    gsap.to(this.scene.position, {
      x: 0,
      duration: duration,
      ease: "none"
    })
    const rotation = this.scene.rotation.y
    gsap.to(this.scene.rotation, {
      y: 0,
      duration: duration,
      ease: "none"
    })
  }



  flatToSphere(duration, resetDuration) {

    this.resetScene(resetDuration)

    gsap.to(this.program.uniforms.uPlaneSizes.value, {
      x: 1,
      y: 1,
      duration: duration,
      ease: "power4.inOut",
      delay: resetDuration
    })
    gsap.to(this.mesh.scale, {
      x: 1,
      y: 1,
      duration: duration,
      ease: "power4.inOut",
      delay: resetDuration
    })
    gsap.to(this.mesh.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: duration,
      ease: "power4.inOut",
      delay: resetDuration

    })
  }
  flatToSlider(duration, resetDuration) {
    this.resetScene(resetDuration)
    gsap.to(this.mesh.scale, {
      x: 8,
      y: 14,
      duration: duration,
      ease: "power4.inOut",
      delay: resetDuration

    })
    gsap.to(this.program.uniforms.uPlaneSizes.value, {
      x: 8,
      y: 14,
      duration: duration,
      ease: "power4.inOut",
      delay: resetDuration

    })
    gsap.to(this.mesh.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: duration,
      ease: "power4.inOut",
      delay: resetDuration

    })
  }
  sphereToFlat(duration, resetDuration) {
    this.resetScene(resetDuration)
    if (this.index == 0) {
      gsap.to(this.mesh.scale, {
        x: 15,
        y: 10,
        duration: duration,
        ease: "power4.inOut",
        delay: resetDuration

      })
      gsap.to(this.program.uniforms.uPlaneSizes.value, {
        x: 15,
        y: 10,
        duration: duration,
        ease: "power4.inOut",
        delay: resetDuration
      })
      gsap.to(this.mesh.position, {
        z: 10,
        duration: duration,
        ease: "power4.inOut",
        delay: resetDuration
      })
    } else {

      gsap.to(this.mesh.scale, {
        x: 2,
        y: 2,
        duration: duration,
        ease: "power4.inOut",
        delay: resetDuration
      })
      gsap.to(this.program.uniforms.uPlaneSizes.value, {
        x: 2,
        y: 2,
        duration: duration,
        ease: "power4.inOut",
        delay: resetDuration,
      })
      gsap.to(this.mesh.position, {
        z: 0,
        x: 0,
        y: 0,
        duration: duration,
        ease: "power4.inOut",
        delay: resetDuration,
      })
    }
  }
  sphereToSlider(duration, resetDuration) {
    this.resetScene(resetDuration)
    gsap.to(this.mesh.scale, {
      x: 5,
      y: 5,
      duration: duration,
      ease: "power4.inOut",
      delay: resetDuration,
    })
    gsap.to(this.program.uniforms.value, {
      x: 5,
      y: 5,
      duration: duration,
      delay: resetDuration,
      ease: "power4.inOut"
    })
    gsap.to(this.mesh.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: duration,
      ease: "power4.inOut",
      delay: resetDuration
    })
    gsap.to(this.mesh.position, {
      x: 0,
      y: 0,
      z: -this.index * 1,
      duration: duration,
      ease: "power4.inOut",
      delay: resetDuration
    })
  }
  sliderToFlat(duration, resetDuration) {
    this.resetScene(resetDuration)
    gsap.to(this.mesh.position, {
      x: 0,
      y: 0,
      z: -this.index,
      duration: duration,
      ease: "power4.inOut",
      delay: resetDuration

    })
  }
  sliderToSphere(duration, resetDuration) {
    this.resetScene(resetDuration)
    gsap.to(this.mesh.position, {
      x: 0,
      y: 0,
      z: -this.index * 0.1,
      duration: duration,
      ease: "power4.inOut",
      delay: resetDuration
    })
    gsap.to(this.mesh.scale, {
      x: 1,
      y: 1,
      duration: duration,
      ease: "power4.inOut",
      delay: resetDuration
    })
  }

  /*
  * Hover Animations
  */

  onHover() {

    if (this.index != 0) {
      let angle = 2.0 * Math.PI * (this.index - 1) / this.length


      gsap.to(this.mesh.position, {
        y: this.index == 0 ? 0 : -10 * Math.cos(angle),
        duration: 0.7,
        ease: "power4.inOut",
        delay: this.index * 0.03
      })

      gsap.to(this.mesh.position, {
        x: this.index == 0 ? 0 : 10 * Math.sin(angle),
        duration: 0.7,
        ease: "power4.inOut",
        delay: this.index * 0.03
      })
    }
  }

  onHoverLeave() {
    // this.setFlat(0.7, 0.01)
    gsap.to(this.mesh.position, {
      x: 0,
      duration: 0.7,
      ease: "power4.inOut",
      delay: this.index * 0.02
    })

    gsap.to(this.mesh.position, {
      y: 0,
      duration: 0.7,
      ease: "power4.inOut",
      delay: this.index * 0.02
    })
  }



  update(shape, factor) {

    if (shape == "sphere") {
      this.program.uniforms.uStrength.value = Math.max(0.0, Math.abs(factor))
      this.program.uniforms.shape.value = 1
    }

    if (shape == "slider") {
      this.program.uniforms.uStrength.value = -factor
      this.program.uniforms.shape.value = 2
    }

    if (shape == "flat") {
      this.program.uniforms.shape.value = 3
      this.program.uniforms.uStrength.value = 0
    }

  }

}
