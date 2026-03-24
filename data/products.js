export async function fetchProducts() {
  const response = await fetch('/products.json', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to load products')
  }
  const data = await response.json()
  return data.products ?? []
}

