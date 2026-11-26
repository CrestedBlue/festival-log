export interface EmphasisPart {
  text: string
  strong: boolean
}

/** Splits "a **b** c" into plain and strong parts; a marker without its pair stays as plain text. */
export function splitEmphasis(line: string): EmphasisPart[] {
  const pieces = line.split('**')
  // an odd number of pieces means the markers pair up; otherwise the last marker has no partner
  const paired = pieces.length % 2 === 1
  const parts: EmphasisPart[] = []
  pieces.forEach((text, i) => {
    if (text === '') return
    const strong = paired && i % 2 === 1
    const last = parts[parts.length - 1]
    if (!paired && last) {
      parts[parts.length - 1] = { text: `${last.text}**${text}`, strong: false }
    } else {
      parts.push({ text, strong })
    }
  })
  return parts
}
