import { api, query } from './api'

const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLocaleLowerCase('vi-VN')
const phoneKey = value => {
  const compact = String(value ?? '').replace(/[\s().-]/g, '')
  const digits = compact.replace(/\D/g, '')
  if (digits.startsWith('0084')) return `0${digits.slice(4)}`
  if (compact.startsWith('+84') || (digits.startsWith('84') && digits.length >= 11)) return `0${digits.slice(2)}`
  return digits
}

export async function loadTeachingCoachProfiles(signal) {
  const profiles = new Map()
  let page = 1, total = 0, more = false
  do {
    signal.throwIfAborted()
    const result = await api(`/users${query({ role: 'Coach', page, pageSize: 50 })}`, { signal })
    if (!Array.isArray(result.items) || !Number.isSafeInteger(result.total) || result.total < 0 || !Number.isSafeInteger(result.pageSize) || result.pageSize <= 0)
      throw new Error('Danh sách HLV chưa hợp lệ.')
    total = result.total
    for (const item of result.items) if (item.role === 'Coach') profiles.set(item.id, { phone: item.phone ?? null, specialties: item.specialties ?? [] })
    more = page * result.pageSize < total
    if (more && !result.items.length) throw new Error('Chưa tải đủ hồ sơ HLV.')
    page++
  } while (more)
  if (profiles.size < total) throw new Error('Chưa tải đủ hồ sơ HLV.')
  return profiles
}

export function withTeachingCoachProfiles(coaches, profiles) {
  return coaches.map(coach => {
    const profile = profiles.get(coach.coachId)
    return { ...coach, phone: profile?.phone ?? null, specialties: profile?.specialties ?? [] }
  })
}

export function filterTeachingCoaches(coaches, search, sport) {
  const term = normalize(search.trim())
  const phoneTerm = /^[+\d\s().-]+$/.test(search.trim()) ? phoneKey(search) : ''
  return coaches.filter(coach => (sport === 'all' || coach.specialties.includes(sport)) && (!term
    || normalize(`${coach.fullName} ${coach.coachId}`).includes(term)
    || (phoneTerm && phoneKey(coach.phone).includes(phoneTerm))))
}
