import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

const SELL_REQUESTS_LOCAL_KEY = 'sellRequestsLocal'

function parsePrice(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const numeric = Number.parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(numeric) ? numeric : 0
}

function firstImageUrl(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return (
      value.url ||
      value.downloadURL ||
      value.downloadUrl ||
      value.src ||
      ''
    )
  }
  return ''
}

function normalizeSellRequest(doc) {
  const item = doc.data() ?? {}
  const imageFromArray =
    (Array.isArray(item.imageUrls) && firstImageUrl(item.imageUrls[0])) ||
    (Array.isArray(item.images) && firstImageUrl(item.images[0])) ||
    ''
  const productType = item.propertyType || item['Property Type'] || 'Apartment'
  const location = item.location || item.Location || 'Unknown'
  const locationAr = item.locationAr || item.LocationAr || ''
  const title = item.propertyTitle || item['Property Title'] || 'Property Listing'
  const titleAr = item.propertyTitleAr || item['Property Title Ar'] || ''
  const description = item.description || 'Submitted by property owner.'
  const descriptionAr = item.descriptionAr || item['Description Ar'] || ''
  const price = parsePrice(item.askingPrice ?? item['Asking Price'])
  const area =
    typeof item.area === 'number'
      ? item.area
      : Number.parseInt(String(item.area ?? ''), 10) || 0

  return {
    id: `sell-${doc.id}`,
    name: title,
    nameAr: titleAr,
    category: 'Residential',
    price,
    status: item.propertyStatus || 'For Sale',
    thumbnail:
      firstImageUrl(item.thumbnail) ||
      firstImageUrl(item.imageUrl) ||
      firstImageUrl(item.image) ||
      imageFromArray ||
      'https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=1200',
    shortDescription: description,
    shortDescriptionAr: descriptionAr,
    propertyId: `sell-${doc.id}`,
    location,
    locationAr,
    type: productType,
    area,
    postedBy: item.fullName || item['Full Name'] || item.userEmail || '',
    ownerPhone: item.phone || item.Phone || '',
    ownerEmail: item.email || item.Email || '',
    fullAddress: item.fullAddress || '',
    raw: item,
    localId: item.localId || '',
    source: 'sellRequests',
    createdAt: item.createdAt ?? null,
  }
}

function normalizeLocalSellRequest(item, index) {
  const imageFromArray =
    (Array.isArray(item.imageUrls) && firstImageUrl(item.imageUrls[0])) ||
    (Array.isArray(item.images) && firstImageUrl(item.images[0])) ||
    ''
  const productType = item.propertyType || item['Property Type'] || 'Apartment'
  const location = item.location || item.Location || 'Unknown'
  const locationAr = item.locationAr || item.LocationAr || ''
  const title = item.propertyTitle || item['Property Title'] || 'Property Listing'
  const titleAr = item.propertyTitleAr || item['Property Title Ar'] || ''
  const description = item.description || 'Submitted by property owner.'
  const descriptionAr = item.descriptionAr || item['Description Ar'] || ''
  const price = parsePrice(item.askingPrice ?? item['Asking Price'])
  const area =
    typeof item.area === 'number'
      ? item.area
      : Number.parseInt(String(item.area ?? ''), 10) || 0
  const rawId = item.id || `local-${index}`

  return {
    id: `sell-local-${rawId}`,
    name: title,
    nameAr: titleAr,
    category: 'Residential',
    price,
    status: item.propertyStatus || 'For Sale',
    thumbnail:
      firstImageUrl(item.thumbnail) ||
      firstImageUrl(item.imageUrl) ||
      firstImageUrl(item.image) ||
      imageFromArray ||
      'https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=1200',
    shortDescription: description,
    shortDescriptionAr: descriptionAr,
    propertyId: `sell-local-${rawId}`,
    location,
    locationAr,
    type: productType,
    area,
    postedBy: item.fullName || item['Full Name'] || item.userEmail || '',
    ownerPhone: item.phone || item.Phone || '',
    ownerEmail: item.email || item.Email || '',
    fullAddress: item.fullAddress || '',
    raw: item,
    localId: item.id || '',
    source: 'sellRequests',
    createdAt: item.createdAt ?? null,
  }
}

function fetchLocalSellRequestProducts() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SELL_REQUESTS_LOCAL_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeLocalSellRequest)
  } catch {
    return []
  }
}

function requestFingerprint(item) {
  const createdMs = item?.createdAt?.toDate
    ? item.createdAt.toDate().getTime()
    : new Date(item?.createdAt || 0).getTime()
  const createdSlot = Number.isFinite(createdMs) ? Math.floor(createdMs / 60000) : 0
  return [
    String(item?.name || '').trim().toLowerCase(),
    String(item?.postedBy || '').trim().toLowerCase(),
    String(item?.ownerPhone || '').trim().toLowerCase(),
    String(item?.price ?? ''),
    String(item?.location || '').trim().toLowerCase(),
    String(createdSlot),
  ].join('|')
}

async function fetchSellRequestProducts() {
  const collections = ['sellRequests', 'sell']
  const merged = []
  for (const name of collections) {
    try {
      const snapshot = await getDocs(query(collection(db, name), orderBy('createdAt', 'desc')))
      merged.push(...snapshot.docs.map(normalizeSellRequest))
      continue
    } catch {
      try {
        const fallbackSnapshot = await getDocs(collection(db, name))
        merged.push(...fallbackSnapshot.docs.map(normalizeSellRequest))
      } catch {
        // Try the next collection name for backward compatibility.
      }
    }
  }
  return merged
}

export async function fetchProducts() {
  const response = await fetch('/products.json', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to load products')
  }
  const data = await response.json()
  const staticProducts = data.products ?? []
  const submittedSellProducts = await fetchSellRequestProducts()
  const localSellProducts = fetchLocalSellRequestProducts()
  const byKey = new Map()

  for (const localItem of localSellProducts) {
    const key = localItem.localId || requestFingerprint(localItem)
    byKey.set(key, localItem)
  }

  for (const remoteItem of submittedSellProducts) {
    const key = remoteItem.localId || requestFingerprint(remoteItem)
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, remoteItem)
      continue
    }

    const merged = {
      ...remoteItem,
      thumbnail:
        remoteItem.thumbnail && !remoteItem.thumbnail.includes('pexels-photo-439391')
          ? remoteItem.thumbnail
          : existing.thumbnail || remoteItem.thumbnail,
      shortDescription:
        remoteItem.shortDescription && remoteItem.shortDescription !== 'Submitted by property owner.'
          ? remoteItem.shortDescription
          : existing.shortDescription || remoteItem.shortDescription,
      area: remoteItem.area || existing.area,
      fullAddress: remoteItem.fullAddress || existing.fullAddress,
    }
    byKey.set(key, merged)
  }

  const mergedSellProducts = Array.from(byKey.values())
  return [...mergedSellProducts, ...staticProducts]
}

