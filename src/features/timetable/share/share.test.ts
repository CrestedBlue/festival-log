import { afterEach, describe, expect, test, vi } from 'vitest'
import { canShareImage, shareImage } from './share'

const image = () => new File(['png'], 'timetable.png', { type: 'image/png' })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('canShareImage', () => {
  test('is false where the browser has no file sharing', () => {
    vi.stubGlobal('navigator', {})
    expect(canShareImage(image())).toBe(false)
  })

  test('asks the browser whether it can share this file', () => {
    vi.stubGlobal('navigator', { canShare: () => true, share: vi.fn() })
    expect(canShareImage(image())).toBe(true)
  })
})

describe('shareImage', () => {
  test('hands only the file to the share sheet', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { canShare: () => true, share })
    const file = image()
    await expect(shareImage(file)).resolves.toBe('shared')
    expect(share).toHaveBeenCalledWith({ files: [file] })
  })

  test('treats closing the share sheet as cancelled, not as an error', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('closed', 'AbortError'))
    vi.stubGlobal('navigator', { canShare: () => true, share })
    await expect(shareImage(image())).resolves.toBe('cancelled')
  })

  test('reports any other failure', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('no gesture', 'NotAllowedError'))
    vi.stubGlobal('navigator', { canShare: () => true, share })
    await expect(shareImage(image())).resolves.toBe('failed')
  })
})
