// Faces: the frame split into areas bounded by barrier ways (paths, …), labelled by flood fill. A zone is then given
// per face, so zone edges always run along real paths.
/** frame: lib/frame.mjs; isBarrier(tags): which OSM ways bound the faces. */
export function makeFaces({ sharp, OSM, W, H, llToPx, pathD }, isBarrier) {
  function barrierSvg(extra = '') {
    let s = ''
    for (const w of OSM.ways) {
      if (!isBarrier(w.tags || {})) continue
      s += `<path d="${pathD(w.pts.map(llToPx))}" fill="none" stroke="#000" stroke-width="4"/>`
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${s}${extra}</svg>`
  }
  /** Face number per pixel (0 = on a barrier) and the face count; `extra` is SVG with more barrier lines. */
  async function labelFaces(extra = '') {
    const { data } = await sharp(Buffer.from(barrierSvg(extra))).greyscale().raw().toBuffer({ resolveWithObject: true })
    const lab = new Int32Array(W * H).fill(-1)
    for (let i = 0; i < W * H; i++) if (data[i] < 128) lab[i] = 0 // barrier
    let next = 1; const stack = []
    for (let i = 0; i < W * H; i++) {
      if (lab[i] !== -1) continue
      lab[i] = next; stack.push(i)
      while (stack.length) { const p = stack.pop(); const x = p % W, y = (p - x) / W
        for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) if (q >= 0 && lab[q] === -1) { lab[q] = next; stack.push(q) } }
      next++
    }
    return { lab, count: next }
  }
  return { barrierSvg, labelFaces }
}
