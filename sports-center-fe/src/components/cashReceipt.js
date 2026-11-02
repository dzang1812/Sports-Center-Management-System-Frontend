// A cash collection keeps its replay key across closing/reopening the dialog or reloading.
// The backend's InvoiceNumber is the public receipt; this reference prevents a second credit.
export function readCashReceipt(storageKey, memberId) {
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey))
    return value?.memberId === Number(memberId) && Number.isInteger(value.amount) && value.amount > 0
      && typeof value.receiptReference === 'string' && value.receiptReference.startsWith('AUTO-')
      && typeof value.idempotencyKey === 'string' && value.idempotencyKey.length > 0 ? value : null
  } catch { return null }
}

export function createCashReceipt(memberId, amount) {
  return { memberId: Number(memberId), amount: Number(amount), receiptReference: `AUTO-${crypto.randomUUID()}`,
    idempotencyKey: crypto.randomUUID(), attempted: false }
}

export function saveCashReceipt(storageKey, value) {
  if (value) sessionStorage.setItem(storageKey, JSON.stringify(value))
  else sessionStorage.removeItem(storageKey)
}
