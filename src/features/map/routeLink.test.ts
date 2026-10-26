import { describe, expect, test } from 'vitest'
import { routeUrl } from './routeLink'

describe('routeUrl', () => {
  test('links to Kakao Map directions to the place, without "(대략)" in its name', () => {
    expect(routeUrl({ name: '제1 티켓부스 (대략)', lat: 37.406334, lng: 126.627492 })).toBe(
      `https://map.kakao.com/link/to/${encodeURIComponent('제1 티켓부스')},37.406334,126.627492`,
    )
  })

  test('encodes names that would break the link', () => {
    expect(routeUrl({ name: 'A,B/C', lat: 1, lng: 2 })).toBe('https://map.kakao.com/link/to/A%2CB%2FC,1,2')
  })
})
