import api from '@/services/api'

export async function downloadAuthenticatedFile(path: string, fallbackName: string) {
  const res = await api.get(path, { responseType: 'blob' })
  const disposition = res.headers['content-disposition'] as string | undefined
  const match = disposition?.match(/filename="?([^";]+)"?/)
  const fileName = match?.[1] ?? fallbackName
  const blob = new Blob([res.data], {
    type: (res.headers['content-type'] as string) || 'application/octet-stream',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
