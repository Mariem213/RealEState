/** Format an auth validation result with `t` from useLanguage. */
export function formatValidationError(err, t) {
  if (!err) return ''
  return t(err.key, err.vars)
}
