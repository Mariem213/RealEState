const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MIN_PASSWORD_LENGTH = 8

export function validateEmail(value) {
  const v = (value ?? '').trim()
  if (!v) return 'Email is required.'
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address.'
  return ''
}

export function validatePassword(value, minLen = MIN_PASSWORD_LENGTH) {
  const v = value ?? ''
  if (!v) return 'Password is required.'
  if (v.length < minLen) {
    return `Password must be at least ${minLen} characters.`
  }
  return ''
}

export function validatePasswordMatch(password, repeat) {
  const r = repeat ?? ''
  if (!r) return 'Please confirm your password.'
  if (password !== r) return 'Passwords do not match.'
  return ''
}

export function validateUsername(value) {
  const v = (value ?? '').trim()
  if (!v) return 'Username is required.'
  if (v.length < 2) return 'Username must be at least 2 characters.'
  if (v.length > 40) return 'Username must be 40 characters or fewer.'
  return ''
}
