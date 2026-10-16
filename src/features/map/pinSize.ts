// Zoom thresholds for illustrated maps: at the opening zoom (~16.5) pins are dots so the zone labels
// stay readable; zooming in turns them into icons.
const ICON_FROM_ZOOM = 16.9
const LARGE_FROM_ZOOM = 17.75

export function pinSizeForZoom(zoom: number): { size: number; showIcon: boolean } {
  if (zoom < ICON_FROM_ZOOM) return { size: 12, showIcon: false }
  if (zoom < LARGE_FROM_ZOOM) return { size: 24, showIcon: true }
  return { size: 30, showIcon: true }
}
