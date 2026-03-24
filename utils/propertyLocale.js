/** Display strings from properties.json; English stays canonical for any future filters. */
export function propertyField(property, field, locale) {
  if (!property) return ''
  if (locale !== 'ar') {
    const v = property[field]
    return v == null ? '' : String(v)
  }
  const arKey = `${field}Ar`
  const ar = property[arKey]
  if (ar != null && String(ar).trim() !== '') return String(ar)
  const v = property[field]
  return v == null ? '' : String(v)
}

export function propertyTitle(property, locale) {
  return propertyField(property, 'title', locale)
}

export function propertyLocationDisplay(property, locale) {
  return propertyField(property, 'location', locale)
}

export function propertyDescription(property, locale) {
  return propertyField(property, 'description', locale)
}

export function propertyTag(property, locale) {
  return propertyField(property, 'tag', locale)
}

export function propertyHighlights(property, locale) {
  if (
    locale === 'ar' &&
    Array.isArray(property.highlightsAr) &&
    property.highlightsAr.length > 0
  ) {
    return property.highlightsAr
  }
  return Array.isArray(property.highlights) ? property.highlights : []
}
