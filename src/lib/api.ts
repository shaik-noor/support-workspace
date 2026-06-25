import type { LogEntry, UploadResponse } from "@/lib/types"
import { parseLogFile } from "./log-parser"

export async function uploadLogs(files: File[]): Promise<UploadResponse> {
  const allEntries: LogEntry[] = []

  for (const file of files) {
    const content = await file.text()
    const parsed = parseLogFile(content, file.name)
    allEntries.push(...parsed)
  }

  // Sort all entries by timestamp ascending (safely handling null timestamps)
  allEntries.sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
    return timeA - timeB
  })

  return {
    entries: allEntries,
    count: allEntries.length,
  }
}

export async function exportLogs(entries: LogEntry[], range: {
  startTime: string
  endTime: string
}) {
  const lines: string[] = []
  lines.push("=".repeat(80))
  lines.push("SUPPORT WORKSPACE EXPORT")
  lines.push(`Generated: ${new Date().toISOString()}`)
  if (range.startTime) {
    lines.push(`Start Time: ${range.startTime}`)
  }
  if (range.endTime) {
    lines.push(`End Time: ${range.endTime}`)
  }
  lines.push("=".repeat(80) + "\n")

  for (const entry of entries) {
    lines.push(
      `[${entry.timestamp ?? "N/A"}] ` +
      `[${entry.level}] ` +
      `[${entry.source}] ` +
      `[${entry.filename}]`
    )
    lines.push(`  ${entry.message}\n`)
  }

  const exportText = lines.join("\n")
  const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" })
  
  // Format filename safely
  const timestampStr = new Date().toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 15)
  const filename = `logs_export_${timestampStr}.txt`

  return {
    blob,
    filename,
  }
}

