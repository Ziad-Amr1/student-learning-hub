// Pure, framework-agnostic rule evaluator used by the domain models as their
// single validation authority. This file MUST stay free of any HTTP/Express
// dependency so models can enforce domain validity in any code path.
//
// A rule: { field, required?, type?, oneOf?, max?, min? }
// - `partial = true` validates only the fields actually provided (used for
//   partial updates); `required` is enforced only when not partial.
// Returns an array of human-readable error strings (empty when valid).

const TYPE_CHECKS = {
  string: (value) => typeof value === 'string',
  number: (value) => typeof value === 'number' && !Number.isNaN(value),
  boolean: (value) => typeof value === 'boolean',
}

const isPresent = (value) => value !== undefined && value !== null && value !== ''

export function validateAgainst(rules, input, { partial = false } = {}) {
  const errors = []
  for (const rule of rules) {
    const { field } = rule
    const value = input[field]
    const present = isPresent(value)

    if (!partial && rule.required && !present) {
      errors.push(rule.message || `'${field}' is required.`)
      continue
    }
    if (!present) continue

    if (rule.type && TYPE_CHECKS[rule.type] && !TYPE_CHECKS[rule.type](value)) {
      errors.push(rule.message || `'${field}' must be a ${rule.type}.`)
      continue
    }
    if (rule.oneOf && !rule.oneOf.includes(value)) {
      errors.push(rule.message || `'${field}' must be one of: ${rule.oneOf.join(', ')}.`)
      continue
    }
    if (rule.max != null && typeof value === 'string' && value.length > rule.max) {
      errors.push(rule.message || `'${field}' must be ${rule.max} characters or fewer.`)
    }
    if (rule.min != null && typeof value === 'number' && value < rule.min) {
      errors.push(rule.message || `'${field}' must be at least ${rule.min}.`)
    }
  }
  return errors
}
