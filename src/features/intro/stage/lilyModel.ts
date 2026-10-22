import {
  BufferAttribute,
  BufferGeometry,
  CapsuleGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import { bake } from './bake'

export type Lily = {
  root: Group
  /** Advance the bloom and sway. `wobble` is an extra sideways lean in radians (e.g. when the bunny lands nearby). */
  update: (t: number, wobble: number) => void
}

const U = 18
const V = 8

/** Timing in seconds from scene start: outer tepals open first, inner ones follow, each slightly staggered. */
const BLOOM = { grow: 0.9, outer: 0.35, inner: 0.75, stagger: 0.12, duration: 2.4 }

const PETAL_STOPS: [number, string][] = [
  [0, '#EEE6F8'],
  [0.16, '#C9B3EE'],
  [0.34, '#4A2A80'],
  [0.62, '#6C46B5'],
  [1, '#B9A2E6'],
]

const LEAF_STOPS: [number, string][] = [
  [0, '#5F7F5C'],
  [0.6, '#7C9E76'],
  [1, '#9DBA92'],
]

type PetalSpec = {
  length: number
  width: number
  radial: number
  lift: number
  tilt: number
  curl: number
  cupOpen: number
  wave: number
  phase: number
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
const bump = (t: number, start: number, end: number) => (t <= start || t >= end ? 0 : Math.sin(((t - start) / (end - start)) * Math.PI))

function gradient(stops: [number, string][], u: number) {
  const target = new Color()
  for (let i = 1; i < stops.length; i++) {
    const [end, endColor] = stops[i]
    if (u <= end || i === stops.length - 1) {
      const [begin, beginColor] = stops[i - 1]
      return target.set(beginColor).lerp(new Color(endColor), MathUtils.clamp((u - begin) / (end - begin), 0, 1))
    }
  }
  return target.set(stops[stops.length - 1][1])
}

/** A U×V grid whose vertices are positioned by `shapePetal`; colors are baked once per vertex. */
function petalGeometry(stops: [number, string][], midrib: Color) {
  const geometry = new BufferGeometry()
  const count = (U + 1) * (V + 1)
  const colors = new Float32Array(count * 3)
  const index: number[] = []
  const white = new Color('#FFFFFF')
  for (let i = 0; i <= U; i++) {
    for (let j = 0; j <= V; j++) {
      const u = i / U
      const v = Math.abs(-1 + (2 * j) / V)
      const color = gradient(stops, u)
        .lerp(midrib, (1 - v) ** 6 * 0.35 * MathUtils.smoothstep(u, 0.2, 0.5))
        .lerp(white, v ** 4 * 0.12)
      colors.set([color.r, color.g, color.b], (i * (V + 1) + j) * 3)
      if (i < U && j < V) {
        const a = i * (V + 1) + j
        const b = a + V + 1
        index.push(a, b, a + 1, b, b + 1, a + 1)
      }
    }
  }
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
  geometry.setIndex(index)
  return geometry
}

/**
 * Sweeps the petal along a spine in the local x/y plane (x = away from the flower's axis, y = along it).
 * `open` blends from a tight upright bud (0) to a recurved, cupped lily tepal (1).
 */
function shapePetal(geometry: BufferGeometry, spec: PetalSpec, open: number) {
  const position = geometry.attributes.position as BufferAttribute
  const tilt = MathUtils.lerp(0.08, spec.tilt, open)
  const curl = MathUtils.lerp(0.05, spec.curl, open)
  const cup = MathUtils.lerp(0.6, spec.cupOpen, open)
  const ds = spec.length / U
  const angleAt = (u: number) => tilt + curl * u ** 1.8
  let x = spec.radial
  let y = spec.lift
  for (let i = 0; i <= U; i++) {
    const u = i / U
    if (i > 0) {
      const mid = angleAt(u - 0.5 / U)
      x += Math.sin(mid) * ds
      y += Math.cos(mid) * ds
    }
    const theta = angleAt(u)
    const nx = -Math.cos(theta)
    const ny = Math.sin(theta)
    const width = 0.012 * (1 - u) + spec.width * Math.max(0, Math.sin(Math.PI * u ** 0.72)) ** 0.9
    for (let j = 0; j <= V; j++) {
      const v = -1 + (2 * j) / V
      const ripple = spec.wave * Math.abs(v) ** 3 * Math.sin(u * 15 + spec.phase) * open
      const offset = (cup * v * v + ripple) * width
      position.setXYZ(i * (V + 1) + j, x + nx * offset, y + ny * offset, v * width)
    }
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
}

export function createLily(still: boolean): Lily {
  const petalMaterial = new MeshPhysicalMaterial({
    vertexColors: true,
    side: DoubleSide,
    roughness: 0.42,
    sheen: 0.8,
    sheenRoughness: 0.4,
    sheenColor: new Color('#F1E9FB'),
    clearcoat: 0.2,
    clearcoatRoughness: 0.5,
  })
  const leafMaterial = new MeshPhysicalMaterial({
    vertexColors: true,
    side: DoubleSide,
    roughness: 0.55,
    sheen: 0.3,
    sheenColor: new Color('#E4EEDD'),
    clearcoat: 0.08,
    clearcoatRoughness: 0.6,
  })
  const stemMaterial = new MeshPhysicalMaterial({ color: '#6E8F6A', roughness: 0.5, sheen: 0.3, sheenColor: new Color('#E4EEDD') })
  const filamentMaterial = new MeshStandardMaterial({ color: '#E6DDF0', roughness: 0.5 })
  const antherMaterial = new MeshPhysicalMaterial({ color: '#6B3F5E', roughness: 0.6, sheen: 0.4 })
  const stigmaMaterial = new MeshPhysicalMaterial({ color: '#9E86C9', roughness: 0.35, clearcoat: 0.4 })

  const shade = (mesh: Mesh) => {
    mesh.castShadow = true
    return mesh
  }

  const root = new Group()

  const stemCurve = new CatmullRomCurve3([
    new Vector3(0, 0, 0),
    new Vector3(0.04, 0.5, 0),
    new Vector3(0.02, 1.0, 0.02),
    new Vector3(-0.06, 1.38, 0.06),
    new Vector3(-0.14, 1.52, 0.14),
  ])
  root.add(shade(new Mesh(new TubeGeometry(stemCurve, 40, 0.022, 8), stemMaterial)))

  const leaves: { at: number; angle: number; length: number }[] = [
    { at: 0.14, angle: -1.3, length: 0.46 },
    { at: 0.27, angle: 1.7, length: 0.44 },
    { at: 0.4, angle: 0.35, length: 0.4 },
    { at: 0.53, angle: -0.7, length: 0.34 },
    { at: 0.65, angle: 2.4, length: 0.28 },
  ]
  const leafColor = new Color('#557352')
  bake(
    leaves.map((leaf) => {
      const geometry = petalGeometry(LEAF_STOPS, leafColor)
      shapePetal(geometry, { length: leaf.length, width: 0.06, radial: 0, lift: 0, tilt: 0.9, curl: 1.1, cupOpen: 0.35, wave: 0, phase: 0 }, 1)
      const mesh = new Mesh(geometry, leafMaterial)
      mesh.position.copy(stemCurve.getPointAt(leaf.at))
      mesh.rotation.y = leaf.angle
      return mesh
    }),
    root,
    { cast: true },
  )

  const headMount = new Group()
  headMount.position.copy(stemCurve.getPoint(1))
  headMount.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(-0.38, 0.62, 0.68).normalize())
  headMount.scale.setScalar(1.18)
  root.add(headMount)
  const head = new Group()
  headMount.add(head)

  const receptacle = new Mesh(new SphereGeometry(1, 16, 12), stemMaterial)
  receptacle.scale.set(0.04, 0.05, 0.04)
  head.add(receptacle)

  const petals = Array.from({ length: 6 }, (_, k) => {
    const outer = k % 2 === 0
    const spec: PetalSpec = outer
      ? { length: 0.5, width: 0.12, radial: 0.025, lift: 0.0, tilt: 0.66, curl: 1.95, cupOpen: 0.28, wave: 0.18, phase: k }
      : { length: 0.47, width: 0.155, radial: 0.02, lift: 0.015, tilt: 0.56, curl: 1.75, cupOpen: 0.34, wave: 0.24, phase: k * 1.7 }
    const geometry = petalGeometry(PETAL_STOPS, new Color('#3A1F6A'))
    const open = still ? 1 : 0
    shapePetal(geometry, spec, open)
    const mesh = shade(new Mesh(geometry, petalMaterial))
    mesh.rotation.y = (k * Math.PI) / 3
    head.add(mesh)
    const start = outer ? BLOOM.outer + (k / 2) * BLOOM.stagger : BLOOM.inner + ((k - 1) / 2) * BLOOM.stagger
    return { geometry, spec, start, open }
  })

  const stamens = new Group()
  const filamentCurve = new CatmullRomCurve3([new Vector3(0, 0.02, 0), new Vector3(0.05, 0.22, 0), new Vector3(0.13, 0.36, 0)])
  const filament = new TubeGeometry(filamentCurve, 12, 0.0055, 5)
  const anther = new CapsuleGeometry(0.014, 0.045, 4, 8)
  const filaments: Mesh[] = []
  const anthers: Mesh[] = []
  for (let k = 0; k < 6; k++) {
    const stamen = new Group()
    stamen.rotation.y = -((k + 0.5) * Math.PI) / 3
    const strand = new Mesh(filament, filamentMaterial)
    const tip = new Mesh(anther, antherMaterial)
    tip.position.set(0.13, 0.375, 0)
    tip.rotation.x = Math.PI / 2
    stamen.add(strand, tip)
    filaments.push(strand)
    anthers.push(tip)
  }
  const pistilCurve = new CatmullRomCurve3([new Vector3(0, 0.02, 0), new Vector3(0.01, 0.25, 0), new Vector3(0.04, 0.44, 0)])
  filaments.push(new Mesh(new TubeGeometry(pistilCurve, 12, 0.007, 6), filamentMaterial))
  bake(filaments, stamens)
  bake(anthers, stamens)
  filament.dispose()
  anther.dispose()
  const stigma = new Mesh(new SphereGeometry(0.02, 12, 8), stigmaMaterial)
  stigma.position.set(0.04, 0.45, 0)
  stamens.add(stigma)
  head.add(stamens)

  const update = (t: number, wobble: number) => {
    const grow = still ? 1 : easeOutCubic(MathUtils.clamp((t - 0.05) / BLOOM.grow, 0, 1))
    root.scale.setScalar(Math.max(grow, 0.001))

    let total = 0
    for (const petal of petals) {
      const open = still ? 1 : easeInOutCubic(MathUtils.clamp((t - petal.start) / BLOOM.duration, 0, 1))
      if (Math.abs(open - petal.open) > 1e-4) {
        shapePetal(petal.geometry, petal.spec, open)
        petal.open = open
      }
      total += open
    }
    stamens.scale.setScalar(MathUtils.lerp(0.35, 1, total / petals.length))

    const sway = still ? 0 : MathUtils.smoothstep(t, 3.2, 4.4) * (0.016 + 0.02 * bump(t, 3.4, 6.6))
    root.rotation.z = sway * Math.sin(t * 0.8) + wobble
    root.rotation.x = sway * 0.6 * Math.sin(t * 0.57 + 1.3)
    head.rotation.x = sway * 1.4 * Math.sin(t * 1.1 + 0.4)
    head.rotation.z = sway * Math.sin(t * 0.9 + 2.1)
  }
  update(still ? 10 : 0, 0)

  return { root, update }
}
