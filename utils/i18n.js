/**
 * Read a nested string from a messages object using dot paths, e.g. "nav.home".
 */
export function resolveMessage(messages, path) {
  if (!path || !messages || typeof messages !== 'object') return undefined
  const keys = path.split('.')
  let cur = messages
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object' || !(k in cur)) return undefined
    cur = cur[k]
  }
  return typeof cur === 'string' ? cur : undefined
}

/** Resolve a message using explicit path segments (for keys that contain spaces or dots). */
export function resolveMessageSegments(messages, segments) {
  if (!messages || !segments?.length) return undefined
  let cur = messages
  for (const k of segments) {
    if (cur == null || typeof cur !== 'object' || !(k in cur)) return undefined
    cur = cur[k]
  }
  return typeof cur === 'string' ? cur : undefined
}

/**
 * Replace {placeholders} in a template string.
 */
export function formatTemplate(str, vars) {
  if (!str || !vars) return str
  return str.replace(/\{(\w+)\}/g, (_, name) =>
    vars[name] !== undefined && vars[name] !== null ? String(vars[name]) : `{${name}}`,
  )
}
