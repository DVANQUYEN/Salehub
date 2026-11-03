// Translates an enum-like value (e.g. "LEAD", "ADMIN") using `${namespace}.${value}`.
// Falls back to the raw value when no translation exists, and to '' when empty.
export function enumLabel(t, namespace, value) {
  if (!value) return ''
  return t(`${namespace}.${value}`, { defaultValue: String(value) })
}
