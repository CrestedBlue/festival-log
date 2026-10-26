import L from 'leaflet'
import { useEffect } from 'react'
import { placeAnnotations, type Annotation } from './annotations'

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
  const badge = label.badge ? `<span class="map-label__badge" style="background:${label.badge.colour}">${esc(label.badge.text)}</span>` : ''
  const colour = label.colour ? `;--label-colour:${label.colour}` : ''
  return `<span class="map-label map-label--${label.kind}" style="font-size:${font}px${colour}">${icon}${badge}<span>${esc(label.text)}</span></span>`
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
      if (!shown.has(item.key)) continue
      const { left, top, width, height } = item.box
      const pin = item.view.type === 'pin' ? item.view.pin : null
      const marker = L.marker([item.lat, item.lng], {
        icon: L.divIcon({ className: 'map-annotation', html: html(item), iconSize: [width, height], iconAnchor: [-left, -top] }),
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
