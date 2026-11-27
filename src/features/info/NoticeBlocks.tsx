import type { CSSProperties } from 'react'
import type { NoticeBlock } from '../../data/catalog/noticeBlock'
import { splitEmphasis } from '../../lib/emphasis'

/** The info tab's notices by topic: a picture beside a speech-bubble box, the pictures zigzagging left and right. */
export function NoticeBlocks({ blocks }: { blocks: readonly NoticeBlock[] }) {
  if (blocks.length === 0) return null
  return (
    <ul className="notice-blocks">
      {blocks.map((block, index) => (
        <li key={block.id} className="notice-block" style={{ '--tone': block.tone } as CSSProperties}>
          <img
            className="notice-block__art"
            src={block.art}
            alt=""
            width={block.width}
            height={block.height}
            // the first picture is in view when the tab opens: fetch it right away
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
          <div className="notice-block__bubble">
            <h3 className="visually-hidden">{block.title}</h3>
            <ul className="notice-block__lines">
              {block.lines.map((line, row) => (
                <li key={line}>
                  {splitEmphasis(line).map((part, i) =>
                    part.strong ? (
                      // the block's name opens its first line: marked in the block's own color
                      <strong key={i} className={row === 0 && i === 0 ? 'notice-block__name' : undefined}>
                        {part.text}
                      </strong>
                    ) : (
                      part.text
                    ),
                  )}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  )
}
