import { useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import {
  DirectionalLight,
  HemisphereLight,
  Material,
  Mesh,
  MathUtils,
  NeutralToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Raycaster,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Texture,
  Vector2,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createBunny } from './bunnyModel'
import { createLily } from './lilyModel'
import { StoryBunny } from './StoryBunny'

const TARGET_X = 0.42
const TARGET_Y = 1.36
const MODEL_HEIGHT = 3.05
const MODEL_WIDTH = 2.5
const LILY_POSITION = { x: 1.18, z: 0.2 }
const FOV = 26
/** The idle scene only breathes, blinks and sways, so it renders at half rate until something interactive happens. */
const IDLE_FRAME_MS = 1000 / 30
const MAX_PIXEL_RATIO = 2
const MIN_PIXEL_RATIO = 1.25

function supportsWebGL() {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'))
  } catch {
    return false
  }
}

const afterPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)))
const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2
const bump = (t: number, start: number, end: number) => (t <= start || t >= end ? 0 : Math.sin(((t - start) / (end - start)) * Math.PI))

/** Interactive Three.js bunny and lily: follows the pointer, turns when dragged and hops when tapped. */
export default function BunnyStage({ onReady = () => {} }: { onReady?: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const boopRef = useRef<() => void>(() => {})
  const onReadyRef = useRef(onReady)
  const [failed] = useState(() => !supportsWebGL())
  const still = Boolean(useReducedMotion())

  useEffect(() => {
    onReadyRef.current = onReady
    if (failed) onReady()
  }, [failed, onReady])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      return
    }
    let pixelRatio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO)
    renderer.setPixelRatio(pixelRatio)
    renderer.setClearColor(0xffffff, 0)
    renderer.outputColorSpace = SRGBColorSpace
    renderer.toneMapping = NeutralToneMapping
    renderer.toneMappingExposure = 1.02
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFShadowMap
    renderer.shadowMap.autoUpdate = false
    const canvas = renderer.domElement
    canvas.className = 'bunny-canvas'
    host.appendChild(canvas)

    const scene = new Scene()
    const pmrem = new PMREMGenerator(renderer)
    let environment: Texture | undefined

    scene.add(new HemisphereLight('#FFFFFF', '#E6DCF5', 1.1))
    const key = new DirectionalLight('#FFF5EC', 2.1)
    key.position.set(2.4, 5, 3.6)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.radius = 6
    key.shadow.bias = -0.0004
    key.shadow.normalBias = 0.02
    Object.assign(key.shadow.camera, { left: -2, right: 2, top: 3.4, bottom: -1, near: 0.5, far: 14 })
    const rim = new DirectionalLight('#CDB9F4', 1.3)
    rim.position.set(-3, 2.6, -3.2)
    const fill = new DirectionalLight('#FFFFFF', 0.45)
    fill.position.set(-3, 1.5, 4)
    scene.add(key, rim, fill)

    const ground = new Mesh(new PlaneGeometry(8, 8), new ShadowMaterial({ color: '#3A2A5A', opacity: 0.1 }))
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const bunny = createBunny()
    scene.add(bunny.root)

    const lily = createLily(still)
    lily.root.position.set(LILY_POSITION.x, 0, LILY_POSITION.z)
    scene.add(lily.root)

    const camera = new PerspectiveCamera(FOV, 1, 0.1, 50)
    let rect = canvas.getBoundingClientRect()
    let rectStale = false
    /** Layout is read at most once per scroll or resize, and only when a pointer actually needs it. */
    const bounds = () => {
      if (rectStale) {
        rect = canvas.getBoundingClientRect()
        rectStale = false
      }
      return rect
    }
    let ready = false

    const render = () => {
      if (ready) renderer.render(scene, camera)
    }

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = host
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      const halfTan = Math.tan(MathUtils.degToRad(FOV / 2))
      const fitHeight = (MODEL_HEIGHT * 0.5 * 1.3) / halfTan
      const fitWidth = (MODEL_WIDTH * 0.5 * 1.15) / (halfTan * camera.aspect)
      const distance = Math.max(fitHeight, fitWidth)
      camera.position.set(TARGET_X, TARGET_Y + distance * 0.09, distance)
      camera.lookAt(TARGET_X, TARGET_Y, 0)
      camera.updateProjectionMatrix()
      rectStale = true
      renderer.shadowMap.needsUpdate = true
      render()
    }

    const pointer = { x: 0, y: 0, lastMove: -10 }
    const look = { x: 0, y: 0 }
    const drag = { active: false, id: -1, startX: 0, startY: 0, startAngle: 0, angle: 0, velocity: 0, lastT: 0, downT: 0, moved: false }
    let boopAt = -10
    let blushBoost = 0
    let nextBlink = 1.75
    let blinkAt = -10
    let nextTwitch = 1.3
    let twitchAt = -10
    let twitchEar = 0
    let start = performance.now()
    let last = start
    let lastRender = 0
    let shadowFrame = 0
    let frame = 0
    let visible = true
    let onScreen = true
    const pacing = { samples: 0, total: 0 }

    const elapsed = () => (performance.now() - start) / 1000

    const boop = () => {
      const t = elapsed()
      if (t - boopAt < 0.75) return
      boopAt = t
      blushBoost = 1
    }
    boopRef.current = boop

    const raycaster = new Raycaster()
    const ndc = new Vector2()
    const hitsBunny = (clientX: number, clientY: number) => {
      const rect = bounds()
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      return raycaster.intersectObjects(bunny.hitTargets, false).length > 0
    }

    const onWindowPointerMove = (event: PointerEvent) => {
      const rect = bounds()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height * 0.35
      pointer.x = MathUtils.clamp((event.clientX - cx) / (window.innerWidth * 0.5), -1, 1)
      pointer.y = MathUtils.clamp((event.clientY - cy) / (window.innerHeight * 0.5), -1, 1)
      pointer.lastMove = elapsed()

      if (drag.active && event.pointerId === drag.id) {
        const dx = event.clientX - drag.startX
        if (Math.abs(dx) + Math.abs(event.clientY - drag.startY) > 6) drag.moved = true
        const now = performance.now()
        const angle = drag.startAngle + dx * 0.011
        drag.velocity = ((angle - drag.angle) / Math.max(now - drag.lastT, 1)) * 1000
        drag.angle = angle
        drag.lastT = now
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      rectStale = true
      drag.active = true
      drag.id = event.pointerId
      drag.startX = event.clientX
      drag.startY = event.clientY
      drag.startAngle = drag.angle
      drag.lastT = drag.downT = performance.now()
      drag.velocity = 0
      drag.moved = false
      canvas.setPointerCapture(event.pointerId)
      canvas.classList.add('is-dragging')
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!drag.active || event.pointerId !== drag.id) return
      drag.active = false
      canvas.classList.remove('is-dragging')
      if (!drag.moved && performance.now() - drag.downT < 400 && hitsBunny(event.clientX, event.clientY)) boop()
      if (performance.now() - drag.lastT > 80) drag.velocity = 0
    }

    const onScroll = () => {
      rectStale = true
    }

    /** Step down the resolution once or twice if the GPU can't keep up; capable devices keep full sharpness. */
    const adaptResolution = (interval: number) => {
      if (pixelRatio <= MIN_PIXEL_RATIO) return
      pacing.samples++
      pacing.total += interval
      if (pacing.samples < 90) return
      if (pacing.total / pacing.samples > 26) {
        pixelRatio = Math.max(MIN_PIXEL_RATIO, pixelRatio - 0.5)
        renderer.setPixelRatio(pixelRatio)
        resize()
      }
      pacing.samples = 0
      pacing.total = 0
    }

    const tick = () => {
      frame = 0
      const now = performance.now()
      const t = (now - start) / 1000
      const sinceBoop = t - boopAt
      const hopping = !still && sinceBoop < 0.75
      const settling = Math.abs(drag.angle) > 0.002 || Math.abs(drag.velocity) > 0.02
      const active = t < 7.5 || drag.active || settling || hopping || blushBoost > 0 || t - pointer.lastMove < 1.5

      if (!active && now - lastRender < IDLE_FRAME_MS) {
        if (visible && onScreen) frame = requestAnimationFrame(tick)
        return
      }
      const interval = now - lastRender
      lastRender = now
      if (active && t > 1.5 && interval < 200) adaptResolution(interval)

      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const idle = t - pointer.lastMove > 2.6
      let targetX = pointer.x
      let targetY = pointer.y
      if (drag.active) {
        targetX = 0
        targetY = 0.1
      } else if (idle) {
        targetX = still ? 0 : Math.sin(t * 0.45) * 0.28
        targetY = still ? 0.05 : Math.sin(t * 0.31) * 0.12
      }
      look.x = MathUtils.damp(look.x, targetX, 5, dt)
      look.y = MathUtils.damp(look.y, targetY, 5, dt)

      if (!drag.active) {
        drag.velocity += (-38 * drag.angle - 7.5 * drag.velocity) * dt
        drag.angle += drag.velocity * dt
      }

      const intro = still ? 1 : MathUtils.clamp(t / 1.05, 0, 1)
      const pop = still ? 1 : easeOutBack(intro)
      bunny.root.scale.setScalar(Math.max(pop, 0.001))
      bunny.root.rotation.y = drag.angle + look.x * 0.18 + (still ? 0 : (1 - intro) * -0.9)

      let squash = 0
      let lift = 0
      if (hopping) {
        if (sinceBoop < 0.12) squash = -0.09 * bump(sinceBoop, 0, 0.24)
        else if (sinceBoop < 0.46) {
          const p = (sinceBoop - 0.12) / 0.34
          lift = Math.sin(p * Math.PI) * 0.36
          squash = 0.07 * Math.sin(p * Math.PI)
        } else squash = -0.07 * bump(sinceBoop, 0.46, 0.75)
      }
      const breathe = still ? 0 : Math.sin(t * 2.1) * 0.012
      bunny.body.position.y = lift + (still ? 0 : (1 - intro) * 0.4 * bump(intro, 0, 1))
      bunny.body.scale.set(1 - squash * 0.6 - breathe * 0.4, 1 + squash + breathe, 1 - squash * 0.6 - breathe * 0.4)

      bunny.head.rotation.y = MathUtils.damp(bunny.head.rotation.y, look.x * 0.55, 8, dt)
      bunny.head.rotation.x = MathUtils.damp(bunny.head.rotation.x, look.y * 0.3 - 0.04, 8, dt)
      const tilt = hopping ? Math.sin(sinceBoop * 9) * 0.06 : 0
      bunny.head.rotation.z = MathUtils.damp(bunny.head.rotation.z, -look.x * 0.1 + tilt, 6, dt)

      if (!still && t > nextTwitch) {
        twitchAt = t
        twitchEar = Math.random() < 0.5 ? 0 : 1
        nextTwitch = t + 3 + Math.random() * 4
      }
      for (let index = 0; index < 2; index++) {
        const ear = bunny.ears[index]
        const sway = still ? 0 : Math.sin(t * 1.4 + index * 1.7) * 0.025
        const twitch = index === twitchEar ? bump(t - twitchAt, 0, 0.32) * -0.28 : 0
        const flop = hopping ? -Math.sin(Math.min(sinceBoop / 0.6, 1) * Math.PI) * 0.35 : 0
        ear.rotation.x = MathUtils.damp(ear.rotation.x, -0.12 + twitch + flop - lift * 0.4, 18, dt)
        ear.rotation.z = MathUtils.damp(ear.rotation.z, bunny.earBase[index].z + sway + (index === 0 ? 1 : -1) * look.x * 0.06, 10, dt)
      }

      if (!still && t > nextBlink) {
        blinkAt = t
        nextBlink = t + 2.4 + Math.random() * 3 + (Math.random() < 0.2 ? -2.2 : 0)
      }
      const blink = bump(t - blinkAt, 0, 0.17)
      const happy = hopping ? bump(sinceBoop, 0.05, 0.9) : 0
      const lid = 1 - Math.max(blink, happy) * 0.88
      bunny.eyes[0].scale.y = lid
      bunny.eyes[1].scale.y = lid

      blushBoost = Math.max(0, blushBoost - dt * 0.6)
      bunny.blush.opacity = 0.48 + blushBoost * 0.4
      bunny.tail.rotation.y = still ? 0 : Math.sin(t * 2.4) * 0.12 + (hopping ? Math.sin(sinceBoop * 22) * 0.25 : 0)

      const sinceLanding = sinceBoop - 0.46
      const wobble = !still && sinceLanding > 0 && sinceLanding < 1.6 ? 0.03 * Math.sin(sinceLanding * 11) * Math.exp(-sinceLanding * 3) : 0
      lily.update(t, wobble)

      renderer.shadowMap.needsUpdate = active || ++shadowFrame % 2 === 0
      render()
      if (visible && onScreen) frame = requestAnimationFrame(tick)
    }

    const resume = () => {
      if (!ready || frame || !visible || !onScreen) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      resume()
    })
    intersectionObserver.observe(host)
    const onVisibility = () => {
      visible = document.visibilityState === 'visible'
      resume()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pointermove', onWindowPointerMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)

    let disposed = false
    const prepare = async () => {
      await afterPaint()
      if (disposed) return
      environment = pmrem.fromScene(new RoomEnvironment(), 0.04, 0.1, 100, { size: 128 }).texture
      pmrem.dispose()
      scene.environment = environment
      scene.environmentIntensity = 0.55
      resize()
      await renderer.compileAsync(scene, camera)
      if (disposed) return
      ready = true
      resize()
      start = performance.now()
      canvas.classList.add('is-ready')
      onReadyRef.current()
      resume()
    }
    void prepare()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onWindowPointerMove)
      window.removeEventListener('scroll', onScroll)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      boopRef.current = () => {}
      const materials = new Set<Material>()
      const textures = new Set<Texture>()
      scene.traverse((object) => {
        if (!(object instanceof Mesh)) return
        object.geometry.dispose()
        for (const material of [object.material].flat() as Material[]) {
          materials.add(material)
          for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value)
        }
      })
      materials.forEach((material) => material.dispose())
      textures.forEach((texture) => texture.dispose())
      environment?.dispose()
      pmrem.dispose()
      renderer.dispose()
      canvas.remove()
    }
  }, [still])

  if (failed) {
    return (
      <div className="bunny-stage bunny-stage--fallback">
        <StoryBunny />
      </div>
    )
  }

  return (
    <div
      ref={hostRef}
      className="bunny-stage"
      role="button"
      tabIndex={0}
      aria-label="A 3D bunny with a lavender bow beside a violet lily. Press Enter to say hi."
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          boopRef.current()
        }
      }}
    />
  )
}
