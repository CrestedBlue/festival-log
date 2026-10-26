import L from 'leaflet'
import { useEffect } from 'react'
import { placeAnnotations, type Annotation } from './annotations'

/** A tappable icon gets at least this much room under a finger, however small it is drawn. */
const TOUCH_PX = 44

/** A colour dark enough to want white text on it (a zone flag's tag). */
const isDark = (hex: string) => {
  const v = parseInt(hex.slice(1), 16)
  return 0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255) < 140
}

const esc = (text: string) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c)

/** Markup of one annotation. Icon URLs are the app's own bundled files; texts are escaped. */
function html({ view }: Annotation): string {
  if (view.type === 'pin') {
    const caption = view.caption ? `<span class="map-icon-pin__caption">${esc(view.caption)}</span>` : ''
    const state = view.selected ? ' is-selected' : view.active ? ' is-active' : ''
    return `<span class="map-icon-pin${state}"><img src="${view.iconUrl}" width="${view.size}" height="${view.size}" alt="">${caption}</span>`
  }
  const { label, iconUrl, font } = view
  const icon = iconUrl ? `<img src="${iconUrl}" width="18" height="18" alt="">` : ''
  const badges = (label.badges ?? []).map((b) => `<span class="map-label__badge" style="background:${b.colour}">${esc(b.text)}</span>`).join('')
  const colour = label.colour ? `;--label-colour:${label.colour}` : ''
  const dark = label.kind === 'zone' && label.colour && isDark(label.colour) ? ' is-dark' : ''
  return `<span class="map-label map-label--${label.kind}${dark}" style="font-size:${font}px${colour}">${icon}${badges}<span>${esc(label.text)}</span></span>`
}

/**
 * Draws the map's annotations (names, the map's own pin icons) at a fixed screen size, leaving out the ones that would
 * overlap something more important at the current zoom. Pins are tappable and select themselves (not while
 * `interactive` is off, e.g. while a new pin's place is being picked).
 */
export function useAnnotationLayer(map: L.Map | null, items: readonly Annotation[], onSelect: (pinId: string) => void, interactive: boolean) {
  useEffect(() => {
    if (!map) return
    const zoom = map.getZoom()
    const shown = placeAnnotations(items, (item) => map.project([item.lat, item.lng], zoom))
    const layer = L.layerGroup()
    for (const item of items) {
      const offset = shown.get(item.key)
      if (!offset) continue
      const { width, height } = item.box
      const left = item.box.left + offset.dx, top = item.box.top + offset.dy
      const pin = item.view.type === 'pin' ? item.view.pin : null
      // pins get a bigger, invisible touch area around what is drawn (overlaps between them are fine: the top one wins)
      const [padX, padY] = pin ? [Math.max(0, (TOUCH_PX - width) / 2), Math.max(0, (TOUCH_PX - height) / 2)] : [0, 0]
      const body = padX || padY ? `<span class="map-annotation__touch" style="padding:${padY}px ${padX}px">${html(item)}</span>` : html(item)
      const marker = L.marker([item.lat, item.lng], {
        icon: L.divIcon({ className: 'map-annotation', html: body, iconSize: [width + 2 * padX, height + 2 * padY], iconAnchor: [padX - left, padY - top] }),
        interactive: pin !== null && interactive,
        keyboard: false,
        title: pin?.name ?? '',
        zIndexOffset: item.priority,
      })
      if (pin) marker.on('click', () => onSelect(pin.id))
      marker.addTo(layer)
    }
    layer.addTo(map)
    return () => {
      layer.remove()
    }
  }, [map, items, onSelect, interactive])
}
