export type LogLevel =
  | "TRACE"
  | "DEBUG"
  | "INFO"
  | "WARN"
  | "WARNING"
  | "ERROR"
  | "FATAL"
  | "CRITICAL"

export interface LogEntry {
  timestamp: string | null
  level: LogLevel | string
  source: string
  message: string
  filename: string
}

export interface UploadResponse {
  entries: LogEntry[]
  count: number
}
