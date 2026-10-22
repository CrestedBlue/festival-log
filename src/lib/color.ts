type Triple = readonly [number, number, number]

const HEX = /^#([0-9a-f]{6})$/i

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const toByte = (c: number) => Math.round(Math.min(1, Math.max(0, fromLinear(c))) * 255)

function parseHex(hex: string): Triple {
  const digits = HEX.exec(hex)?.[1]
  if (!digits) throw new Error(`#rrggbb 색이 아니에요: ${hex}`)
  const n = Number.parseInt(digits, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const toHex = (rgb: Triple) => `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`

// Björn Ottosson's OKLab, the space CSS color-mix(in oklab) works in.
function toOklab(rgb: Triple): Triple {
  const [r, g, b] = [toLinear(rgb[0] / 255), toLinear(rgb[1] / 255), toLinear(rgb[2] / 255)]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function fromOklab([lightness, a, b]: Triple): Triple {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    toByte(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toByte(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toByte(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

/** CSS `color-mix(in oklab, a <weightA * 100>%, b)` for places CSS can't reach, such as a canvas. */
export function mixOklab(a: string, b: string, weightA: number): string {
  if (weightA >= 1) return toHex(parseHex(a))
  if (weightA <= 0) return toHex(parseHex(b))
  const labA = toOklab(parseHex(a))
  const labB = toOklab(parseHex(b))
  const lerp = (i: 0 | 1 | 2) => labA[i] * weightA + labB[i] * (1 - weightA)
  return toHex(fromOklab([lerp(0), lerp(1), lerp(2)]))
}
