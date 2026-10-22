/** Horizontal position (0–1 across the path) of each level node, top to bottom. */
export const PATH_POSITIONS = [0.12, 0.5, 0.86, 0.55, 0.14, 0.48, 0.88, 0.52, 0.18]
export const PATH_ROW_HEIGHT = 92
export const PATH_HEIGHT = PATH_POSITIONS.length * PATH_ROW_HEIGHT

/** Node centres in the trail's SVG space (x 0–100, y in px). */
export const PATH_POINTS = PATH_POSITIONS.map((x, index) => ({
  x: x * 100,
  y: index * PATH_ROW_HEIGHT + PATH_ROW_HEIGHT / 2,
}))

/** A smooth winding trail through the points, curving vertically between rows. */
export function buildPath(points: { x: number; y: number }[]) {
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    const previous = points[index - 1]
    const midY = (previous.y + point.y) / 2
    return `${path} C ${previous.x} ${midY}, ${point.x} ${midY}, ${point.x} ${point.y}`
  }, '')
}
