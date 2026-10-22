import { Mesh, type Object3D } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Merge static meshes that share one material into a single draw call.
 * The meshes must not be in the scene graph: their own transforms (and any temporary parent groups) are baked
 * into the merged geometry, which is then added to `parent`.
 */
export function bake(meshes: Mesh[], parent: Object3D, shadows: { cast?: boolean; receive?: boolean } = {}) {
  const geometries = meshes.map((mesh) => {
    mesh.updateWorldMatrix(true, false)
    return mesh.geometry.clone().applyMatrix4(mesh.matrixWorld)
  })
  const merged = new Mesh(mergeGeometries(geometries), meshes[0].material)
  geometries.forEach((geometry) => geometry.dispose())
  merged.castShadow = Boolean(shadows.cast)
  merged.receiveShadow = Boolean(shadows.receive)
  parent.add(merged)
  return merged
}
