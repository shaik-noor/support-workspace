import { describe, expect, it, vi, afterEach } from "vitest"

import { uploadLogs } from "@/lib/api"
import { getVisibleEntries } from "@/lib/log-display"

describe("Client-side log parser", () => {
  it("parses logs correctly client-side", async () => {
    const logFile = new File(
      ["2026-06-25T10:05:00Z ERROR connection failed"],
      "sample.log",
      { type: "text/plain" }
    )

    const result = await uploadLogs([logFile])

    expect(result.count).toBe(1)
    expect(result.entries[0]).toEqual({
      timestamp: "2026-06-25T10:05:00.000Z",
      level: "ERROR",
      source: "sample.log",
      message: "connection failed",
      filename: "sample.log",
    })
  })

  it("handles slashes and comma milliseconds in log timestamps", async () => {
    const logFile = new File(
      ["2026/06/25 10:05:00,123 ERROR slash connection failed"],
      "sample.log",
      { type: "text/plain" }
    )

    const result = await uploadLogs([logFile])

    expect(result.count).toBe(1)
    // Date constructor interprets local date/time string, we check that it parsed to a valid ISO string
    expect(result.entries[0].timestamp).not.toBeNull()
    expect(result.entries[0].level).toBe("ERROR")
    expect(result.entries[0].message).toBe("slash connection failed")
  })

  it("falls back to filename timestamp and propagates to multiline exceptions", async () => {
    const logFile = new File(
      [
        [
          "INFO first line with no timestamp",
          "ERROR second line with no timestamp",
          "2026-06-25 12:00:00 INFO third line with timestamp",
          "  at stackFrameInfo(File.java:45)"
        ].join("\n")
      ],
      "log_report_20260625_041951.txt",
      { type: "text/plain" }
    )

    const result = await uploadLogs([logFile])

    expect(result.count).toBe(4)
    
    // First two lines fallback to filename timestamp (log_report_20260625_041951.txt)
    expect(result.entries[0].timestamp).toBe(new Date(2026, 5, 25, 4, 19, 51).toISOString())
    expect(result.entries[1].timestamp).toBe(new Date(2026, 5, 25, 4, 19, 51).toISOString())
    
    // Third line uses its own timestamp
    const thirdTime = new Date("2026-06-25 12:00:00").toISOString()
    expect(result.entries[2].timestamp).toBe(thirdTime)
    
    // Fourth line (stack frame) carries forward the last seen timestamp (thirdTime)
    expect(result.entries[3].timestamp).toBe(thirdTime)
  })
})

describe("log display", () => {
  it("returns all rows instead of capping them to 1000", () => {
    const entries = Array.from({ length: 1200 }, (_, index) => ({
      timestamp: `2026-06-25T10:${String(index % 60).padStart(2, "0")}:00Z`,
      level: "INFO",
      source: "test",
      message: `row-${index}`,
      filename: "sample.log",
    }))

    expect(getVisibleEntries(entries)).toHaveLength(1200)
  })
})
