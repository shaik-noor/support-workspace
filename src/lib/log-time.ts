const ONE_DAY_MS = 24 * 60 * 60 * 1000

export function formatTimestampForDisplay(value: string | null) {
  if (!value) return "—"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"

  const parts = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  }).formatToParts(parsed)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""

  const year = get("year")
  const month = get("month")
  const day = get("day")
  const hour = get("hour")
  const minute = get("minute")
  const second = get("second")
  const fractionalSecond = get("fractionalSecond")
  const dayPeriod = get("dayPeriod")

  const base = `${month}/${day}/${year}, ${hour}:${minute}:${second}.${fractionalSecond}`
  return dayPeriod ? `${base} ${dayPeriod}` : base
}

export function formatTimelineBucketLabel(value: string, windowSize: number) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"

  if (windowSize >= ONE_DAY_MS) {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(parsed)
  }

  return formatTimestampForDisplay(value)
}

export { ONE_DAY_MS }
