/** Reverse geocode lat/lng to address fields (client-side, no API key). */
export async function reverseGeocode(lat, lng) {
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lng))
  url.searchParams.set('localityLanguage', 'en')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Could not resolve address from GPS')

  const data = await res.json()
  const city = data.city || data.locality || ''
  const state = data.principalSubdivision || ''
  const pincode = data.postcode || ''
  const area = data.locality || data.city || city
  const line1 =
    data.street ||
    data.locality ||
    (area && state ? `${area}, ${state}` : area) ||
    `Near ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`

  return { line1, city, state, pincode }
}

export function formatDeliveryAddress({ line1, city, state, pincode }) {
  const parts = [line1, city, state].filter(Boolean)
  return pincode ? `${parts.join(', ')} - ${pincode}` : parts.join(', ')
}
