import type { LogEntry } from "./types"

const LOG_LEVELS = [
  "DEBUG",
  "INFO",
  "WARNING",
  "WARN",
  "ERROR",
  "FATAL",
  "CRITICAL",
  "TRACE",
]

function normalizeLevel(level: string): string {
  const upper = level.toUpperCase()
  if (upper === "WARN") return "WARNING"
  return upper
}

function parseTimestampToISO(tsStr: string, isMissingYear: boolean): string | null {
  try {
    let cleanStr = tsStr.trim()
    // Replace comma with dot for milliseconds so standard Date constructor can parse it
    cleanStr = cleanStr.replace(/,(\d+)/, '.$1')
    // Replace slashes with dashes
    cleanStr = cleanStr.replace(/\//g, '-')
    if (isMissingYear) {
      const currentYear = new Date().getFullYear()
      const parts = cleanStr.split(/\s+/)
      if (parts.length === 3) {
        cleanStr = `${parts[0]} ${parts[1]} ${currentYear} ${parts[2]}`
      }
    }
    
    const parsedDate = new Date(cleanStr)
    if (Number.isNaN(parsedDate.getTime())) {
      return null
    }
    return parsedDate.toISOString()
  } catch {
    return null
  }
}

function extractTimestampFromFilename(filename: string): string | null {
  // Try YYYYMMDD_HHMMSS (e.g. 20260625_041951)
  const match1 = filename.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/)
  if (match1) {
    const [_, y, m, d, hh, mm, ss] = match1
    const date = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss))
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString()
    }
  }

  // Try YYYY-MM-DD-HH-MM-SS or YYYY_MM_DD_HH_MM_SS
  const match2 = filename.match(/(\d{4})[-_](\d{2})[-_](\d{2})[-_](\d{2})[-_](\d{2})[-_](\d{2})/)
  if (match2) {
    const [_, y, m, d, hh, mm, ss] = match2
    const date = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss))
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString()
    }
  }

  // Try YYYY-MM-DD or YYYYMMDD
  const match3 = filename.match(/(\d{4})[-_]?(\d{2})[-_]?(\d{2})/)
  if (match3) {
    const [_, y, m, d] = match3
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString()
    }
  }

  return null
}

export function parseLine(line: string, filename: string): LogEntry {
  let message = line
  let timestamp: string | null = null

  // Define patterns and check them. Match the 4-digit year formats first, then the 2-digit/syslog formats.
  const patterns = [
    { regex: /(\d{4}[-/]\d{2}[-/]\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/i, missingYear: false },
    { regex: /([A-Za-z]{3}\s+\d{1,2}\s+\d{4}\s+\d{2}:\d{2}:\d{2})/i, missingYear: false },
    { regex: /([A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})/i, missingYear: true }
  ]

  for (const { regex, missingYear } of patterns) {
    const match = message.match(regex)
    if (match) {
      const matchedStr = match[0]
      const iso = parseTimestampToISO(matchedStr, missingYear)
      if (iso) {
        timestamp = iso
        message = message.replace(matchedStr, "")
        break
      }
    }
  }

  message = message.trim()

  // 2. Extract Log Level
  let level = "INFO"
  
  // Look for explicit bracketed level first, e.g. [ERROR]
  const bracketedLevelRegex = new RegExp(`\\[(${LOG_LEVELS.join("|")})\\]`, "i")
  const bracketedMatch = message.match(bracketedLevelRegex)
  if (bracketedMatch) {
    level = normalizeLevel(bracketedMatch[1])
    const matchedStr = bracketedMatch[0]
    const idx = message.indexOf(matchedStr)
    if (idx >= 0 && idx < 5) {
      message = (message.slice(0, idx) + message.slice(idx + matchedStr.length)).trim()
    }
  } else {
    // Look for unbracketed level at word boundaries, e.g. ERROR
    const wordLevelRegex = new RegExp(`\\b(${LOG_LEVELS.join("|")})\\b`, "i")
    const wordMatch = message.match(wordLevelRegex)
    if (wordMatch) {
      level = normalizeLevel(wordMatch[1])
      const matchedStr = wordMatch[0]
      const idx = message.indexOf(matchedStr)
      if (idx >= 0 && idx < 5) {
        message = (message.slice(0, idx) + message.slice(idx + matchedStr.length)).trim()
      }
    }
  }

  // Clean up any remaining leading punctuation/whitespace
  message = message.replace(/^[:\s-]+/, "").trim()

  // 3. Extract Source
  let source = filename
  const sourceRegex = /\[([a-zA-Z_][a-zA-Z0-9_]*)\]|\(([a-zA-Z_][a-zA-Z0-9_]*)\)/
  const sourceMatch = message.match(sourceRegex)
  if (sourceMatch) {
    source = sourceMatch[1] || sourceMatch[2]
    const matchedStr = sourceMatch[0]
    const idx = message.indexOf(matchedStr)
    if (idx >= 0 && idx < 5) {
      message = (message.slice(0, idx) + message.slice(idx + matchedStr.length)).trim()
      message = message.replace(/^[:\s-]+/, "").trim()
    }
  }

  return {
    timestamp,
    level,
    source,
    message: message || line,
    filename,
  }
}

export function parseLogFile(content: string, filename: string): LogEntry[] {
  const lines = content.split(/\r?\n/)
  const entries: LogEntry[] = []
  let lastTimestamp: string | null = null
  const filenameTimestamp = extractTimestampFromFilename(filename)

  for (const line of lines) {
    if (!line.trim()) continue
    const entry = parseLine(line, filename)
    if (entry.timestamp) {
      lastTimestamp = entry.timestamp
    } else {
      entry.timestamp = lastTimestamp || filenameTimestamp
    }
    entries.push(entry)
  }

  return entries
}
