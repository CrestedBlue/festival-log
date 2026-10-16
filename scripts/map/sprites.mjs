import sharp from 'sharp'

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))

/** Background colors of the official map: beige paper, park green, walkway gray. */
export const DEFAULT_KEY_COLORS = ['#e0e0c8', '#e1dfc6', '#d8d6bc', '#adcf85', '#ebe6e2']
const DEFAULT_KEY_TOLERANCE = 24

const keyMatcher = (colors, tolerance) => {
  const rgb = colors.map(hex)
  return (r, g, b) => rgb.some(([kr, kg, kb]) => Math.hypot(r - kr, g - kg, b - kb) < tolerance)
}

const insideShape = (x, y, shape) => {
  if (shape.ellipse) {
    const [cx, cy, rx, ry] = shape.ellipse
    return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1
  }
  const [x0, y0, x1, y1] = shape.rect
  return x >= x0 && x <= x1 && y >= y0 && y <= y1
}

/**
 * Cuts one zone out of the official map: pixels outside `shapes` and background-colored
 * pixels inside them become transparent, so only the illustrated zone itself remains.
 */
export async function cutSprite(
  sourcePath,
  { crop, shapes, anchor, scale = 1, keyColors = DEFAULT_KEY_COLORS, keyTolerance = DEFAULT_KEY_TOLERANCE },
) {
  const isKeyColor = keyMatcher(keyColors, keyTolerance)
  const [x0, y0, x1, y1] = crop
  const width = x1 - x0
  const height = y1 - y0
  const { data } = await sharp(sourcePath)
    .extract({ left: x0, top: y0, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const i = (py * width + px) * 4
      const inside = shapes.some((shape) => insideShape(px + x0, py + y0, shape))
      if (!inside || isKeyColor(data[i], data[i + 1], data[i + 2])) data[i + 3] = 0
    }
  }

  const outWidth = Math.round(width * scale)
  const outHeight = Math.round(height * scale)
  const buffer = await sharp(data, { raw: { width, height, channels: 4 } })
    .resize(outWidth, outHeight)
    .png()
    .toBuffer()
  // Where the sprite's anchor (a point in official-map coordinates) lands inside the scaled sprite.
  return { buffer, width: outWidth, height: outHeight, anchorX: (anchor[0] - x0) * scale, anchorY: (anchor[1] - y0) * scale }
}
