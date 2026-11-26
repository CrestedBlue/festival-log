import { describe, expect, test } from 'vitest'
import { resolveFestival } from '../resolve'
import { makeUserData } from '../testFixtures'
import { CATALOG } from './index'
import { NOTICE_ART, NOTICE_TOPIC_ORDER, noticeBlock, orderNoticeBlocks } from './noticeArt'

describe('notice blocks', () => {
  test('every topic has a picture and its own color, and a place in the order', () => {
    const topics = Object.keys(NOTICE_ART)
    expect([...NOTICE_TOPIC_ORDER].sort()).toEqual([...topics].sort())
    const tones = Object.values(NOTICE_ART).map((a) => a.tone)
    expect(new Set(tones).size).toBe(tones.length)
  })

  test('puts entry first and what is not allowed, the medical booth and barrier-free last, in that order', () => {
    // Arrange
    const shuffled = [
      noticeBlock('access', '배리어프리', ['**배리어프리** x']),
      noticeBlock('rules', '금지', ['**금지** x']),
      noticeBlock('food', '음식', ['**음식** x']),
      noticeBlock('medical', '의료부스', ['**의료부스** x']),
      noticeBlock('entry', '입장', ['**입장** x']),
    ]

    // Act
    const ordered = orderNoticeBlocks(shuffled)

    // Assert
    expect(ordered.map((b) => b.id)).toEqual(['entry', 'food', 'rules', 'medical', 'access'])
    expect(shuffled[0]?.id).toBe('access')
  })

  test('every festival with notices has them as blocks, in the format', () => {
    for (const entry of CATALOG) {
      const blocks = resolveFestival(makeUserData(), entry.id)?.noticeBlocks ?? []
      if (blocks.length === 0) {
        // an edition with nothing yet has neither; only the next ones (2027) keep plain lines alone
        if (entry.notices.length > 0) expect(entry.key, 'plain notices with no blocks').toMatch(/2027$/)
        continue
      }
      expect(blocks[0]?.id, entry.key).toBe('entry')
      const ids = blocks.map((b) => b.id)
      // the topic is the block's key on screen, so one topic a festival
      expect(new Set(ids).size, `${entry.key} repeats a topic`).toBe(ids.length)
      const tail = ids.filter((id) => ['rules', 'medical', 'access'].includes(id))
      expect(ids.slice(ids.length - tail.length), entry.key).toEqual(tail)
      for (const block of blocks) {
        expect(block.lines[0]?.startsWith(`**${block.title}**`), `${entry.key} ${block.id}`).toBe(true)
        expect(block.lines.length, `${entry.key} ${block.id}`).toBeLessThanOrEqual(12)
        for (const line of block.lines) {
          expect(line.replaceAll('**', '').length, line).toBeLessThanOrEqual(60)
          // short noun endings ("일행 동반입장 불가"), not "~요" sentences (the user, 2026-11-26)
          expect(line, 'ends like a sentence').not.toMatch(/((?<!필|중|주)요|니다)[)\s*]*$/)
        }
      }
    }
  })
})
