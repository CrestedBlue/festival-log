/**
 * Thin-plate spline: a smooth 2D → 2D warp that passes exactly through its control points and bends the
 * rest of the plane as little as possible. Used to lay an official (schematic) festival map onto real
 * coordinates while keeping the drawing as it is.
 */

const kernel = (r2) => (r2 === 0 ? 0 : r2 * Math.log(r2))

function solve(matrix, rhs) {
  const n = rhs.length
  const m = matrix.map((row, i) => [...row, rhs[i]])
  for (let i = 0; i < n; i++) {
    let pivot = i
    for (let r = i + 1; r < n; r++) if (Math.abs(m[r][i]) > Math.abs(m[pivot][i])) pivot = r
    ;[m[i], m[pivot]] = [m[pivot], m[i]]
    if (Math.abs(m[i][i]) < 1e-12) throw new Error('thin-plate spline: control points are degenerate (collinear or repeated)')
    for (let r = 0; r < n; r++) {
      if (r === i) continue
      const f = m[r][i] / m[i][i]
      for (let c = i; c <= n; c++) m[r][c] -= f * m[i][c]
    }
  }
  return m.map((row, i) => row[n] / row[i])
}

/** pairs: [[fromX, fromY], [toX, toY]][] (at least 3, not all on one line) → ([x, y]) => [x', y'] */
export function fitThinPlateSpline(pairs) {
  const from = pairs.map(([p]) => p)
  const n = from.length
  const size = n + 3
  const matrix = Array.from({ length: size }, () => new Array(size).fill(0))
  from.forEach(([xi, yi], i) => {
    from.forEach(([xj, yj], j) => {
      matrix[i][j] = kernel((xi - xj) ** 2 + (yi - yj) ** 2)
    })
    matrix[i][n] = matrix[n][i] = 1
    matrix[i][n + 1] = matrix[n + 1][i] = xi
    matrix[i][n + 2] = matrix[n + 2][i] = yi
  })
  const coefficients = [0, 1].map((axis) => solve(matrix, [...pairs.map(([, to]) => to[axis]), 0, 0, 0]))
  return ([x, y]) =>
    coefficients.map((c) => {
      let value = c[n] + c[n + 1] * x + c[n + 2] * y
      for (let i = 0; i < n; i++) value += c[i] * kernel((x - from[i][0]) ** 2 + (y - from[i][1]) ** 2)
      return value
    })
}
