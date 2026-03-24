/**
 * Pick display text from a catalog product. English fields stay canonical for filters (location, type).
 * When locale is "ar", use *Ar fields when present.
 */
export function productField(product, field, locale) {
  if (!product) return ''
  if (locale !== 'ar') {
    return product[field] ?? ''
  }
  const arKey = `${field}Ar`
  const ar = product[arKey]
  if (ar != null && String(ar).trim() !== '') return String(ar)
  return product[field] ?? ''
}

export function productDisplayName(product, locale) {
  return productField(product, 'name', locale) || productField(product, 'title', locale)
}

export function productShortDescription(product, locale) {
  return (
    productField(product, 'shortDescription', locale) ||
    productField(product, 'description', locale)
  )
}

export function productLocationDisplay(product, locale) {
  return productField(product, 'location', locale)
}

export function productStatusDisplay(product, locale) {
  return productField(product, 'status', locale)
}
