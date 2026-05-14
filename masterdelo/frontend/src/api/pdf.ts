import apiClient from './client'

async function downloadBlob(url: string, filename: string) {
  const response = await apiClient.get(url, { responseType: 'blob' })
  const blobUrl = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}

export const pdfApi = {
  downloadInvoice: (orderId: string) =>
    downloadBlob(`/api/pdf/invoice/${orderId}`, `invoice_${orderId.slice(0, 8).toUpperCase()}.pdf`),
  downloadAct: (orderId: string) =>
    downloadBlob(`/api/pdf/act/${orderId}`, `act_${orderId.slice(0, 8).toUpperCase()}.pdf`),
}
