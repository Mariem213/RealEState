export const ALL_LOCATIONS = [
  'All Locations',
  'Marina',
  'Garden District',
  'Downtown',
  'Business Bay',
  'Palm Islands',
]

export const PROPERTY_TYPES = ['Any', 'Apartment', 'Villa', 'Studio', 'Penthouse']

function normalizeProperty(p) {
  const sqft = p.sqft
  const area =
    p.area ??
    (sqft != null ? Math.round(sqft * 0.092903) : undefined)
  return {
    ...p,
    image: p.image ?? p.images?.[0] ?? '',
    area,
  }
}

export async function fetchProperties() {
  const response = await fetch('/properties.json', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to load properties')
  }
  const data = await response.json()
  const raw = Array.isArray(data) ? data : (data.properties ?? [])
  return raw.map(normalizeProperty)
}


