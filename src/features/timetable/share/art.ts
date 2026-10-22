// An @media (prefers-color-scheme: dark) { … } block holding plain rules (no deeper nesting).
const NIGHT_BLOCK = /@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g

/** SVG art minus its night-theme colors. */
export const withoutNightStyles = (svg: string) => svg.replace(NIGHT_BLOCK, '')

/** The SVG's text, from an inlined data URL (how Vite ships small SVGs) or the file; null when it is not an SVG. */
async function svgTextOf(src: string): Promise<string | null> {
  const comma = src.indexOf(',')
  if (src.startsWith('data:image/svg+xml') && comma > 0) {
    const meta = src.slice(0, comma)
    const payload = src.slice(comma + 1)
    if (!meta.endsWith(';base64')) return decodeURIComponent(payload)
    return new TextDecoder().decode(Uint8Array.from(atob(payload), (c) => c.charCodeAt(0)))
  }
  if (/\.svg($|\?)/.test(src)) return (await fetch(src)).text()
  return null
}

/**
 * The title picture as the shared image should show it. SVG art follows the phone's night theme even
 * inside an image, but the shared picture is always in day colors, so the night styles are taken out.
 */
export async function dayArtSource(src: string): Promise<string> {
  const svg = await svgTextOf(src)
  return svg === null ? src : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(withoutNightStyles(svg))}`
}
