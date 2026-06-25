import { describe, expect, it } from "vitest"

import { formatTimelineBucketLabel, formatTimestampForDisplay } from "@/lib/log-time"

describe("log time formatting", () => {
  it("formats detailed timestamps with seconds and milliseconds", () => {
    expect(formatTimestampForDisplay("2026-04-08T02:38:45.375Z")).toContain("45.375")
  })

  it("formats day-sized timeline buckets as dates instead of shifted local midnight times", () => {
    const oneDayMs = 24 * 60 * 60 * 1000

    expect(formatTimelineBucketLabel("2026-04-08T00:00:00.000Z", oneDayMs)).not.toContain("5:30")
    expect(formatTimelineBucketLabel("2026-04-08T00:00:00.000Z", oneDayMs)).not.toContain("00:00")
  })
})
