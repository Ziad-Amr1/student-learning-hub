import { ApiError } from '../utils/ApiError.js'

const TYPE_CHECKS = {
  string: (value) => typeof value === 'string',
  number: (value) => typeof value === 'number' && !Number.isNaN(value),
  boolean: (value) => typeof value === 'boolean',
}

const isPresent = (value) => value !== undefined && value !== null && value !== ''

// Generic validation-rule factory. Each rule:
//   { field, required?, type?, oneOf?, max?, min? }
// - On POST, a `required` rule fails when the field is absent.
// - On PUT (partial update), only provided fields are validated.
// Collects all errors, then hands a single 400 ApiError to the error handler.
export function validate(rules) {
  return (req, res, next) => {
    const isCreate = req.method === 'POST'
    const errors = []

    for (const rule of rules) {
      const { field } = rule
      const value = req.body[field]
      const present = isPresent(value)

      if (isCreate && rule.required && !present) {
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

    if (errors.length > 0) {
      return next(new ApiError(400, errors.join(' ')))
    }
    next()
  }
}
