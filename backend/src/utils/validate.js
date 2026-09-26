// Pure, framework-agnostic rule evaluator used by the domain models as their
// single validation authority. This file MUST stay free of any HTTP/Express
// dependency so models can enforce domain validity in any code path.
//
// A rule: { field, required?, type?, oneOf?, format?, arrayOf?, max?, min?, nullable? }
// - `partial = true` validates only the fields actually provided (used for
//   partial updates); `required` is enforced only when not partial.
// - `type` may be 'string' | 'number' | 'boolean'.
// - `format: 'url'` additionally checks a string parses as http(s) URL.
// - `arrayOf: 'string'` checks a value is a flat array of strings.
// - `nullable = true` marks a field whose column/domain allows a literal null
//   (used to clear an optional value). A literal `null` for ANY other field is
//   rejected as an invalid value — it is NOT treated as absent, so a partial
//   update can never silently leave a non-nullable field null, and a null
//   `title` can never be String()-coerced into the literal string "null".
// Returns an array of human-readable error strings (empty when valid).

const TYPE_CHECKS = {
  string: (value) => typeof value === 'string',
  number: (value) => typeof value === 'number' && !Number.isNaN(value),
  boolean: (value) => typeof value === 'boolean',
}

const FORMAT_CHECKS = {
  url: (value) => {
    if (typeof value !== 'string') return false
    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  },
}

// Absent means the client did not provide a value at all (`undefined`) or
// explicitly sent an empty string — both are left to the model's normalization.
// A literal `null` is NOT absent: it is an invalid value for any field whose
// rule does not declare `nullable: true`, and it must fail validation instead
// of reaching a NOT NULL column (which would surface as a 500) or being
// String()-coerced into the string "null".
const isAbsent = (value) => value === undefined || value === ''

export function validateAgainst(rules, input, { partial = false } = {}) {
  const errors = []
  for (const rule of rules) {
    const { field } = rule
    const value = input[field]
    const absent = isAbsent(value)

    if (!partial && rule.required && absent) {
      errors.push(rule.message || `'${field}' is required.`)
      continue
    }
    if (absent) continue

    if (value === null) {
      if (rule.nullable) continue
      errors.push(`'${field}' must not be null.`)
      continue
    }

    if (rule.type && TYPE_CHECKS[rule.type] && !TYPE_CHECKS[rule.type](value)) {
      errors.push(rule.message || `'${field}' must be a ${rule.type}.`)
      continue
    }
    if (rule.arrayOf && (!Array.isArray(value) || !value.every((item) => typeof item === rule.arrayOf))) {
      errors.push(rule.message || `'${field}' must be an array of ${rule.arrayOf}s.`)
      continue
    }
    if (rule.oneOf && !rule.oneOf.includes(value)) {
      errors.push(rule.message || `'${field}' must be one of: ${rule.oneOf.join(', ')}.`)
      continue
    }
    if (rule.format && FORMAT_CHECKS[rule.format] && !FORMAT_CHECKS[rule.format](value)) {
      errors.push(rule.message || `'${field}' must be a valid http(s) URL.`)
      continue
    }
    if (rule.max != null) {
      if (typeof value === 'string' && value.length > rule.max) {
        errors.push(rule.message || `'${field}' must be ${rule.max} characters or fewer.`)
      } else if (typeof value === 'number' && value > rule.max) {
        errors.push(rule.message || `'${field}' must be at most ${rule.max}.`)
      }
    }
    if (rule.min != null && typeof value === 'number' && value < rule.min) {
      errors.push(rule.message || `'${field}' must be at least ${rule.min}.`)
    }
  }
  return errors
}
