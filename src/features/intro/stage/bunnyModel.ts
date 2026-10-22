import {
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CatmullRomCurve3,
  Color,
  ExtrudeGeometry,
  Group,
  IcosahedronGeometry,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Object3D,
  PlaneGeometry,
  Quaternion,
  RepeatWrapping,
  Shape,
  SphereGeometry,
  SplineCurve,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three'
import { bake } from './bake'

export type BunnyRig = {
  root: Group
  body: Group
  head: Group
  ears: [Group, Group]
  eyes: [Group, Group]
  tail: Mesh
  blush: MeshStandardMaterial
  hitTargets: Object3D[]
  earBase: { x: number; z: number }[]
}

const PALETTE = {
  fur: '#FFF8F0',
  muzzle: '#FFFDF9',
  innerEar: '#F7C6D2',
  nose: '#EE9AB0',
  blush: '#F5A3BB',
  eye: '#1E1428',
  iris: '#6A4C9C',
  lash: '#2A1B3D',
  mouth: '#7A5266',
  ribbon: '#B9A2E6',
  ribbonKnot: '#A68BDB',
}

/** Head is an ellipsoid; facial features are projected onto it (and onto the muzzle) so they sit flush. */
const HEAD = { a: 0.68, b: 0.58, c: 0.6, y: 1.42 }
const MUZZLE = { x: 0.085, y: -0.16, z: 0.51, r: 0.12 }

function headZ(x: number, y: number) {
  const k = 1 - (x / HEAD.a) ** 2 - (y / HEAD.b) ** 2
  return k > 0 ? HEAD.c * Math.sqrt(k) : 0
}

function muzzleZ(x: number, y: number) {
  let best = 0
  for (const side of [-1, 1]) {
    const d2 = (x - side * MUZZLE.x) ** 2 + (y - MUZZLE.y) ** 2
    if (d2 < MUZZLE.r ** 2) best = Math.max(best, MUZZLE.z + Math.sqrt(MUZZLE.r ** 2 - d2))
  }
  return best
}

function faceZ(x: number, y: number) {
  return Math.max(headZ(x, y), muzzleZ(x, y))
}

function headNormal(x: number, y: number) {
  const z = headZ(x, y)
  return new Vector3(x / HEAD.a ** 2, y / HEAD.b ** 2, z / HEAD.c ** 2).normalize()
}

const FORWARD = new Vector3(0, 0, 1)

function onHead(object: Object3D, x: number, y: number, lift = 0) {
  const normal = headNormal(x, y)
  object.position.set(x, y, headZ(x, y)).addScaledVector(normal, lift)
  object.quaternion.copy(new Quaternion().setFromUnitVectors(FORWARD, normal))
}

function smoothLathe(profile: [number, number][], segments: number, divisions: number) {
  const points = new SplineCurve(profile.map(([x, y]) => new Vector2(x, y))).getPoints(divisions)
  return new LatheGeometry(points, segments)
}

function furBumpTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, size, size)
  let seed = 7
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 2600; i++) {
    const x = random() * size
    const y = random() * size
    const length = 3 + random() * 6
    const angle = Math.PI / 2 + (random() - 0.5) * 0.9
    const shade = Math.round(96 + random() * 64)
    ctx.strokeStyle = `rgb(${shade},${shade},${shade})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
    ctx.stroke()
  }
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(5, 5)
  return texture
}

function shadowBlobTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.45)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

function curveOnFace(points2d: [number, number][], lift: number) {
  const flat = new SplineCurve(points2d.map(([x, y]) => new Vector2(x, y))).getPoints(24)
  return new CatmullRomCurve3(flat.map((p) => new Vector3(p.x, p.y, faceZ(p.x, p.y) + lift)))
}

/** Bend the upper part of an ear backwards around the x axis for a softer, organic silhouette. */
function bendEar(geometry: BufferGeometry, start: number, strength: number) {
  const position = geometry.attributes.position
  const v = new Vector3()
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i)
    if (v.y > start) {
      const t = (v.y - start) / (1.1 - start)
      const angle = -strength * t * t
      const dy = v.y - start
      const y = start + dy * Math.cos(angle) - v.z * Math.sin(angle)
      const z = dy * Math.sin(angle) + v.z * Math.cos(angle)
      position.setXYZ(i, v.x, y, z)
    }
  }
  geometry.computeVertexNormals()
}

function fluff(geometry: BufferGeometry, amount: number) {
  const position = geometry.attributes.position
  const v = new Vector3()
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i)
    const hash = Math.sin(Math.round(v.x * 400) * 12.9898 + Math.round(v.y * 400) * 78.233 + Math.round(v.z * 400) * 37.719) * 43758.5453
    const noise = hash - Math.floor(hash)
    v.multiplyScalar(1 + (noise - 0.5) * amount)
    position.setXYZ(i, v.x, v.y, v.z)
  }
  geometry.computeVertexNormals()
}

export function createBunny(): BunnyRig {
  const bump = furBumpTexture()
  const fur = new MeshPhysicalMaterial({
    color: PALETTE.fur,
    roughness: 0.86,
    sheen: 1,
    sheenRoughness: 0.5,
    sheenColor: new Color('#FFFFFF'),
    bumpMap: bump,
    bumpScale: 0.35,
  })
  const muzzle = fur.clone()
  muzzle.color = new Color(PALETTE.muzzle)
  const innerEar = new MeshPhysicalMaterial({ color: PALETTE.innerEar, roughness: 0.7, sheen: 0.6, sheenColor: new Color('#FFE6EE') })
  const nose = new MeshPhysicalMaterial({ color: PALETTE.nose, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.3 })
  const eye = new MeshPhysicalMaterial({ color: PALETTE.eye, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 })
  const iris = new MeshPhysicalMaterial({ color: PALETTE.iris, roughness: 0.2, clearcoat: 1 })
  const sparkle = new MeshBasicMaterial({ color: '#FFFFFF' })
  const ink = new MeshStandardMaterial({ color: PALETTE.lash, roughness: 0.6 })
  const mouth = new MeshStandardMaterial({ color: PALETTE.mouth, roughness: 0.6 })
  const blush = new MeshStandardMaterial({ color: PALETTE.blush, roughness: 0.9, transparent: true, opacity: 0.5, depthWrite: false })
  const ribbon = new MeshPhysicalMaterial({
    color: PALETTE.ribbon,
    roughness: 0.38,
    sheen: 0.8,
    sheenColor: new Color('#FFFFFF'),
    clearcoat: 0.35,
  })
  const ribbonKnot = ribbon.clone()
  ribbonKnot.color = new Color(PALETTE.ribbonKnot)

  const headSphere = new SphereGeometry(1, 48, 32)
  const eyeSphere = new SphereGeometry(1, 32, 20)
  const smallSphere = new SphereGeometry(1, 20, 14)
  const make = (geometry: BufferGeometry, material: MeshStandardMaterial | MeshBasicMaterial, scale?: [number, number, number]) => {
    const mesh = new Mesh(geometry, material)
    if (scale) mesh.scale.set(...scale)
    return mesh
  }
  const place = (mesh: Mesh, x: number, y: number, z: number) => {
    mesh.position.set(x, y, z)
    return mesh
  }

  const root = new Group()
  const body = new Group()
  root.add(body)

  const torso = make(
    smoothLathe(
      [
        [0.001, 0],
        [0.34, 0.02],
        [0.53, 0.11],
        [0.6, 0.29],
        [0.6, 0.47],
        [0.53, 0.66],
        [0.42, 0.82],
        [0.3, 0.96],
        [0.15, 1.06],
        [0.001, 1.09],
      ],
      64,
      40,
    ),
    fur,
  )
  const limbs = [-1, 1].flatMap((side) => {
    const paw = place(make(smallSphere, fur, [0.115, 0.14, 0.12]), side * 0.2, 0.62, 0.5)
    paw.rotation.z = side * -0.25
    const foot = place(make(smallSphere, fur, [0.15, 0.1, 0.24]), side * 0.27, 0.075, 0.38)
    foot.rotation.y = side * -0.18
    return [paw, foot]
  })
  bake([torso, ...limbs], body, { cast: true, receive: true })

  const collar = place(make(new TorusGeometry(0.4, 0.034, 12, 64), ribbon), 0, 0.86, 0)
  collar.rotation.x = Math.PI / 2
  body.add(collar)

  const heartShape = new Shape()
  heartShape.moveTo(0, -0.5)
  heartShape.bezierCurveTo(-0.15, -0.35, -0.55, -0.1, -0.5, 0.2)
  heartShape.bezierCurveTo(-0.45, 0.5, -0.1, 0.55, 0, 0.3)
  heartShape.bezierCurveTo(0.1, 0.55, 0.45, 0.5, 0.5, 0.2)
  heartShape.bezierCurveTo(0.55, -0.1, 0.15, -0.35, 0, -0.5)
  const heartGeometry = new ExtrudeGeometry(heartShape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.1,
    bevelSegments: 4,
    curveSegments: 16,
  })
  heartGeometry.center()
  const charm = place(make(heartGeometry, ribbonKnot, [0.14, 0.14, 0.12]), 0, 0.765, 0.43)
  charm.rotation.x = -0.2
  body.add(charm)

  const tailGeometry = new IcosahedronGeometry(0.17, 4)
  fluff(tailGeometry, 0.14)
  const tail = place(make(tailGeometry, fur), 0, 0.32, -0.6)
  tail.castShadow = true
  body.add(tail)

  const head = new Group()
  head.position.y = HEAD.y
  body.add(head)
  const skull = make(headSphere, fur, [HEAD.a, HEAD.b, HEAD.c])
  skull.castShadow = true
  skull.receiveShadow = true
  head.add(skull)

  bake(
    [-1, 1].map((side) => place(make(smallSphere, muzzle, [MUZZLE.r, MUZZLE.r, MUZZLE.r]), side * MUZZLE.x, MUZZLE.y, MUZZLE.z)),
    head,
    { receive: true },
  )

  head.add(place(make(smallSphere, nose, [0.052, 0.036, 0.036]), 0, -0.078, headZ(0, -0.078) - 0.006))

  const mouthPaths: [number, number][][] = [
    [
      [0, -0.11],
      [0, -0.175],
    ],
    [
      [-0.06, -0.178],
      [-0.03, -0.206],
      [0, -0.18],
      [0.03, -0.206],
      [0.06, -0.178],
    ],
  ]
  bake(
    mouthPaths.map((path) => make(new TubeGeometry(curveOnFace(path, 0.004), 24, 0.0075, 6), mouth)),
    head,
  )

  bake(
    [-1, 1].map((side) => {
      const cheek = make(smallSphere, blush, [0.095, 0.058, 0.02])
      onHead(cheek, side * 0.38, -0.13, 0.004)
      return cheek
    }),
    head,
  )

  const eyes: Group[] = []
  for (const side of [-1, 1]) {
    const pivot = new Group()
    onHead(pivot, side * 0.245, -0.03, -0.012)
    const eyeGroup = new Group()
    pivot.add(eyeGroup)
    eyeGroup.add(make(eyeSphere, eye, [0.108, 0.132, 0.055]))
    eyeGroup.add(place(make(smallSphere, iris, [0.07, 0.06, 0.014]), 0, -0.05, 0.045))
    bake(
      [
        place(make(smallSphere, sparkle, [0.03, 0.034, 0.012]), -0.034, 0.048, 0.047),
        place(make(smallSphere, sparkle, [0.014, 0.014, 0.008]), 0.032, -0.03, 0.05),
      ],
      eyeGroup,
    )

    const lashes: [number, number][] = [
      [0.18, 0.075],
      [0.48, 0.068],
      [0.82, 0.056],
    ]
    bake(
      lashes.map(([angle, length]) => {
        const dir = new Vector3(side * Math.cos(angle), Math.sin(angle), 0)
        const curl = new Vector3(side * Math.cos(angle + 0.45), Math.sin(angle + 0.45), 0)
        const base = new Vector3(dir.x * 0.1, dir.y * 0.124, 0.018)
        const mid = base.clone().addScaledVector(dir, length * 0.55).add(new Vector3(0, 0, 0.012))
        const tip = base.clone().addScaledVector(dir, length * 0.6).addScaledVector(curl, length * 0.45).add(new Vector3(0, 0, 0.01))
        return make(new TubeGeometry(new CatmullRomCurve3([base, mid, tip]), 10, 0.0085, 6), ink)
      }),
      eyeGroup,
    )
    head.add(pivot)
    eyes.push(eyeGroup)
  }

  const outerEar = smoothLathe(
    [
      [0.001, 0],
      [0.09, 0.04],
      [0.14, 0.22],
      [0.155, 0.5],
      [0.135, 0.8],
      [0.085, 1.0],
      [0.001, 1.08],
    ],
    40,
    32,
  )
  outerEar.scale(1, 1, 0.42)
  const innerEarGeometry = smoothLathe(
    [
      [0.001, 0],
      [0.06, 0.05],
      [0.09, 0.22],
      [0.096, 0.45],
      [0.08, 0.68],
      [0.045, 0.84],
      [0.001, 0.88],
    ],
    32,
    28,
  )
  innerEarGeometry.scale(1, 1, 0.28)
  innerEarGeometry.translate(0, 0.13, 0.046)

  const earBase = [
    { x: -0.24, z: 0.2 },
    { x: 0.24, z: -0.2 },
  ]
  const ears: Group[] = []
  earBase.forEach(({ x, z }, index) => {
    const bend = index === 0 ? 0.55 : 0.32
    const outer = outerEar.clone()
    const inner = innerEarGeometry.clone()
    bendEar(outer, 0.45, bend)
    bendEar(inner, 0.45, bend)
    const ear = new Group()
    ear.position.set(x, 0.43, -0.06)
    ear.rotation.set(-0.12, 0, z)
    const outerMesh = make(outer, fur)
    outerMesh.castShadow = true
    ear.add(outerMesh, make(inner, innerEar))
    head.add(ear)
    ears.push(ear)
  })
  outerEar.dispose()
  innerEarGeometry.dispose()

  const bow = new Group()
  onHead(bow, -0.3, 0.37, 0.02)
  bow.rotateZ(0.35)
  const ribbonTail = new CapsuleGeometry(0.026, 0.09, 6, 12)
  bake(
    [-1, 1].flatMap((side) => {
      const loop = place(make(smallSphere, ribbon, [0.12, 0.08, 0.05]), side * 0.1, 0.01, 0)
      loop.rotation.z = side * 0.3
      const tailPiece = place(make(ribbonTail, ribbon), side * 0.04, -0.075, -0.005)
      tailPiece.rotation.z = side * 0.45
      return [loop, tailPiece]
    }),
    bow,
  )
  ribbonTail.dispose()
  bow.add(make(smallSphere, ribbonKnot, [0.045, 0.042, 0.04]))
  head.add(bow)

  const blob = new Mesh(
    new PlaneGeometry(1.9, 1.9),
    new MeshBasicMaterial({ map: shadowBlobTexture(), color: '#2A1B3D', transparent: true, opacity: 0.16, depthWrite: false }),
  )
  blob.rotation.x = -Math.PI / 2
  blob.position.y = 0.003
  root.add(blob)

  const hitTargets: Object3D[] = []
  body.traverse((child) => {
    if (child instanceof Mesh) hitTargets.push(child)
  })

  return {
    root,
    body,
    head,
    ears: [ears[0], ears[1]],
    eyes: [eyes[0], eyes[1]],
    tail,
    blush,
    hitTargets,
    earBase,
  }
}
