const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MIN_PASSWORD_LENGTH = 8

/** @returns {{ key: string, vars?: Record<string, string | number> } | null} */
export function validateEmail(value) {
  const v = (value ?? '').trim()
  if (!v) return { key: 'auth.validation.emailRequired' }
  if (!EMAIL_RE.test(v)) return { key: 'auth.validation.emailInvalid' }
  return null
}

/** @returns {{ key: string, vars?: Record<string, string | number> } | null} */
export function validatePassword(value, minLen = MIN_PASSWORD_LENGTH) {
  const v = value ?? ''
  if (!v) return { key: 'auth.validation.passwordRequired' }
  if (v.length < minLen) return { key: 'auth.validation.passwordMin', vars: { min: minLen } }
  return null
}

/** @returns {{ key: string, vars?: Record<string, string | number> } | null} */
export function validatePasswordMatch(password, repeat) {
  const r = repeat ?? ''
  if (!r) return { key: 'auth.validation.confirmRequired' }
  if (password !== r) return { key: 'auth.validation.passwordMismatch' }
  return null
}

/** @returns {{ key: string, vars?: Record<string, string | number> } | null} */
export function validateUsername(value) {
  const v = (value ?? '').trim()
  if (!v) return { key: 'auth.validation.usernameRequired' }
  if (v.length < 2) return { key: 'auth.validation.usernameMin' }
  if (v.length > 40) return { key: 'auth.validation.usernameMax' }
  return null
}
