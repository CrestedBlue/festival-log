// Faces: the frame split into areas bounded by barrier ways (paths, …), labelled by flood fill. A zone is then given
// per face, so zone edges always run along real paths.
/** frame: lib/frame.mjs; isBarrier(tags): which OSM ways bound the faces. */
export function makeFaces({ sharp, OSM, W, H, toPx, llToPx, pathD }, isBarrier) {
  function barrierSvg(extra = '') {
    let s = ''
    for (const w of OSM.ways) {
      if (!isBarrier(w.tags || {})) continue
      s += `<path d="${pathD(w.pts.map(llToPx))}" fill="none" stroke="#000" stroke-width="4"/>`
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${s}${extra}</svg>`
  }
  /** The barriers as a greyscale raster (dark = barrier), for running split lines on to them. */
  const barriers = async (extra = '') => (await sharp(Buffer.from(barrierSvg(extra))).greyscale().raw().toBuffer({ resolveWithObject: true })).data
  /**
   * runOn(line, cross, reach): a split line (local metres) whose two ends run on until they reach a barrier of
   * `plain` (from barriers(); later changes to it count). `cross` lets the last end go over the first line it meets
   * (a ring's edge) and stop at the next (the road around it).
   */
  const makeRunOn = (plain) => {
    const isBarrierAt = ([e, n]) => { const [x, y] = toPx([e, n]); const xi = Math.round(x), yi = Math.round(y); return xi >= 0 && yi >= 0 && xi < W && yi < H && plain[yi * W + xi] < 128 }
    return function runOn(line, cross = false, reach = 25) {
      const ext = (a, b, through) => { const len = Math.hypot(b[0] - a[0], b[1] - a[1]); const d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
        let crossed = !through, inside = false
        for (let t = 0; t <= reach; t += 0.2) { const p = [b[0] + d[0] * t, b[1] + d[1] * t]; const hit = isBarrierAt(p)
          if (!crossed) { if (hit) inside = true; else if (inside) crossed = true; continue }
          if (hit) return [b[0] + d[0] * (t + 0.6), b[1] + d[1] * (t + 0.6)] }
        throw new Error(`split line end ${b} meets no barrier within ${reach} m`) }
      return [ext(line[1], line[0], false), ...line, ext(line[line.length - 2], line[line.length - 1], cross)]
    }
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
  return { barrierSvg, barriers, makeRunOn, labelFaces }
}
