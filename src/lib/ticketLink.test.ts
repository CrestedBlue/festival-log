import { describe, expect, test } from 'vitest'
import { linkLabel, parseTicketLink } from './ticketLink'

describe('parseTicketLink', () => {
  test('accepts http(s) links and trims spaces', () => {
    expect(parseTicketLink('  https://nol.yanolja.com/ticket/products/1 ')).toBe('https://nol.yanolja.com/ticket/products/1')
  })

  test('adds https:// when the scheme is missing', () => {
    expect(parseTicketLink('nol.yanolja.com/ticket')).toBe('https://nol.yanolja.com/ticket')
  })

  test('rejects other schemes, blanks and overlong input', () => {
    expect(parseTicketLink('javascript:alert(1)')).toBeNull()
    expect(parseTicketLink('ftp://example.com')).toBeNull()
    expect(parseTicketLink('   ')).toBeNull()
    expect(parseTicketLink(`https://example.com/${'a'.repeat(600)}`)).toBeNull()
  })
})

describe('linkLabel', () => {
  test('shows the host and path without the scheme', () => {
    expect(linkLabel('https://nol.yanolja.com/ticket/products/1')).toBe('nol.yanolja.com/ticket/products/1')
  })
})
