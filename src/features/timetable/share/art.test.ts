import { describe, expect, test } from 'vitest'
import { dayArtSource, withoutNightStyles } from './art'

const SVG = `<svg xmlns="http://www.w3.org/2000/svg"><style>
    .ink { fill: #1d4a3c; }
    @media (prefers-color-scheme: dark) {
      .ink { fill: #a9d3bf; }
      .stem { stroke: #a9d3bf; }
    }
    .sun { fill: #f5d48a; }
  </style><circle class="ink" r="1"/></svg>`

const base64 = (text: string) => btoa(String.fromCharCode(...new TextEncoder().encode(text)))

describe('withoutNightStyles', () => {
  test('drops the night-theme block and keeps everything else', () => {
    const day = withoutNightStyles(SVG)
    expect(day).not.toContain('prefers-color-scheme')
    expect(day).not.toContain('#a9d3bf')
    expect(day).toContain('.ink { fill: #1d4a3c; }')
    expect(day).toContain('.sun { fill: #f5d48a; }')
  })
})

describe('dayArtSource', () => {
  test('rewrites an inlined (base64) SVG with its day colors only', async () => {
    const source = await dayArtSource(`data:image/svg+xml;base64,${base64(SVG)}`)
    expect(source.startsWith('data:image/svg+xml')).toBe(true)
    expect(decodeURIComponent(source)).toContain('#1d4a3c')
    expect(decodeURIComponent(source)).not.toContain('#a9d3bf')
  })

  test('leaves pictures that are not SVG alone', async () => {
    await expect(dayArtSource('/assets/jumf-D9B17n6k.webp')).resolves.toBe('/assets/jumf-D9B17n6k.webp')
  })
})
