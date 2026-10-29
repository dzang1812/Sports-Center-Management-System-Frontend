const KEY = 'sc_auth'

export const getAuth = () => {
  try {
    const a = JSON.parse(localStorage.getItem(KEY))
    return a && new Date(a.expiresAt) > new Date() ? a : null
  } catch {
    return null
  }
}

export const setAuth = (a) => (a ? localStorage.setItem(KEY, JSON.stringify(a)) : localStorage.removeItem(KEY))

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.status = status
    this.errorCode = body?.errorCode
    this.details = body?.details
    this.errors = body?.errors
  }
}

// Error shapes vary by feature area: Auth/Me/Users/AuditLogs use { error }; the scheduling/catalog/PT/attendance
// area uses { errorCode, message } (business rule) or { errorCode, message, errors: { Field: [msg] } } (validation,
// where message is just a generic "invalid input" string — the specific field message is more useful when present).
const errorMessage = (data, status) =>
  data?.error ?? Object.values(data?.errors ?? {})[0]?.[0] ?? data?.message ?? (status === 403 ? 'Bạn không có quyền thực hiện thao tác này' : 'Có lỗi xảy ra, vui lòng thử lại')

export async function api(path, { method = 'GET', body, signal, idempotencyKey } = {}) {
  const auth = getAuth()
  const res = await fetch(`/api${path}`, {
    method,
    signal,
    headers: { ...(idempotencyKey && { 'Idempotency-Key': idempotencyKey }), ...(body && { 'Content-Type': 'application/json' }), ...(auth && { Authorization: `Bearer ${auth.token}` }) },
    body: body && JSON.stringify(body),
  })

  if (res.status === 401 && auth && getAuth()?.token === auth.token) {
    setAuth(null)
    window.location.assign('/login')
  }
  const notifyMutation = () => {
    if (method !== 'GET' && auth && getAuth()?.token === auth.token)
      window.dispatchEvent(new CustomEvent('sc:api-mutated', { detail: { path, method } }))
  }
  if (res.status === 204) { notifyMutation(); return null }

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status, data)
  notifyMutation()
  return data
}

// Uploads a File/Blob to the backend, which forwards it to Cloudinary and returns { url }.
export async function apiUpload(file) {
  const auth = getAuth()
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/media/upload', {
    method: 'POST',
    headers: { ...(auth && { Authorization: `Bearer ${auth.token}` }) },
    body: form,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status, data)
  return data
}

export const query = (params) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  return q.size ? `?${q}` : ''
}
