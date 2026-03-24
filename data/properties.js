export const ALL_LOCATIONS = [
  'All Locations',
  'Marina',
  'Garden District',
  'Downtown',
  'Business Bay',
  'Palm Islands',
]

export const PROPERTY_TYPES = ['Any', 'Apartment', 'Villa', 'Studio', 'Penthouse']

export async function fetchProperties() {
  const response = await fetch('/properties.json', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to load properties')
  }
  const data = await response.json()
  return data.properties ?? []
}


