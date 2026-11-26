import type { CSSProperties } from 'react'
import type { NoticeBlock } from '../../data/catalog/noticeBlock'
import { splitEmphasis } from '../../lib/emphasis'

/** The info tab's notices by topic: a picture beside a speech-bubble box, the pictures zigzagging left and right. */
export function NoticeBlocks({ blocks }: { blocks: readonly NoticeBlock[] }) {
  if (blocks.length === 0) return null
  return (
    <ul className="notice-blocks">
      {blocks.map((block) => (
        <li key={block.id} className="notice-block" style={{ '--tone': block.tone } as CSSProperties}>
          <img className="notice-block__art" src={block.art} alt="" loading="lazy" decoding="async" />
          <div className="notice-block__bubble">
            <h3 className="visually-hidden">{block.title}</h3>
            <ul className="notice-block__lines">
              {block.lines.map((line) => (
                <li key={line}>
                  {splitEmphasis(line).map((part, i) => (part.strong ? <strong key={i}>{part.text}</strong> : part.text))}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  )
}
