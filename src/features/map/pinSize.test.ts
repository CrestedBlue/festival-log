import { describe, expect, test } from 'vitest'
import { pinSizeForZoom } from './pinSize'

describe('pinSizeForZoom', () => {
  test('shows small dots at the opening zoom so zone labels stay readable', () => {
    expect(pinSizeForZoom(16.5)).toEqual({ size: 12, showIcon: false })
  })

  test('grows into icons as the map zooms in', () => {
    expect(pinSizeForZoom(17.25)).toEqual({ size: 24, showIcon: true })
    expect(pinSizeForZoom(18.5)).toEqual({ size: 30, showIcon: true })
  })
})
