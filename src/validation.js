const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export function badRequest(message) {
  const error = new Error(message)
  error.statusCode = 400
  return error
}

export function parseRequiredText(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw badRequest(`${fieldName} is required`)
  }

  return value.trim()
}

export function parsePositiveInteger(value, fieldName) {
  const normalizedValue = typeof value === 'number' ? String(value) : value

  if (typeof normalizedValue !== 'string' || normalizedValue.trim() === '') {
    throw badRequest(`${fieldName} is required`)
  }

  if (!/^\d+$/.test(normalizedValue.trim())) {
    throw badRequest(`${fieldName} must be an integer`)
  }

  const number = Number(normalizedValue)

  if (!Number.isSafeInteger(number) || number <= 0) {
    throw badRequest(`${fieldName} must be a positive integer`)
  }

  return number
}

export function parseLimitParam(value) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) {
    throw badRequest('limit must be an integer')
  }

  const limit = Number(value)

  if (!Number.isSafeInteger(limit)) {
    throw badRequest('limit must be a safe integer')
  }

  return limit
}

export function parseDateParam(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (typeof value !== 'string') {
    throw badRequest(`${fieldName} must be in YYYY-MM-DD format`)
  }

  const trimmedValue = value.trim()

  if (trimmedValue === '') {
    return null
  }

  const match = DATE_PATTERN.exec(trimmedValue)

  if (!match) {
    throw badRequest(`${fieldName} must be in YYYY-MM-DD format`)
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  return formatExerciseDateParts(year, month, day, fieldName)
}

export function formatExerciseDate(date) {
  return formatExerciseDateParts(date.getFullYear(), date.getMonth() + 1, date.getDate(), 'date')
}

function formatExerciseDateParts(year, month, day, fieldName) {
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw badRequest(`${fieldName} must be a valid date`)
  }

  return {
    key: [
      String(year).padStart(4, '0'),
      String(month).padStart(2, '0'),
      String(day).padStart(2, '0'),
    ].join('-'),
    value: date.toDateString(),
  }
}
