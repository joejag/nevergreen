function buildUrl(value: string): URL | null {
  try {
    return new URL(value)
  } catch (_) {
    return null
  }
}

export function removeScheme(value: string): string {
  const url = buildUrl(value)
  if (url) {
    return url.href.replace(url.protocol, '')
  }
  return value
}

export function ensureHasScheme(value: string): string {
  if (buildUrl(value)) {
    return value
  } else if (value.startsWith('//')) {
    return `http:${value}`
  } else {
    return `http://${value}`
  }
}

export function isValidHttpUrl(value: string): boolean {
  const url = buildUrl(value)
  return url?.protocol === 'http:' || url?.protocol === 'https:'
}
