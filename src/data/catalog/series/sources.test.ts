import { describe, expect, test } from 'vitest'
import { sourceHref, sourceLabel } from './sources'

describe('collection source links', () => {
  test('turns an Instagram handle into its profile address', () => {
    const source = { method: '인스타' as const, value: '@pentaportrf', lastScrapedPostDate: null }
    expect(sourceHref(source)).toBe('https://www.instagram.com/pentaportrf/')
    expect(sourceLabel(source)).toBe('@pentaportrf')
  })

  test('shows an official site without the scheme and www', () => {
    const source = { method: '공홈' as const, value: 'https://www.pentaport.co.kr/Notice', lastScrapedPostDate: '2026-08-06' }
    expect(sourceHref(source)).toBe('https://www.pentaport.co.kr/Notice')
    expect(sourceLabel(source)).toBe('pentaport.co.kr/Notice')
  })
})
