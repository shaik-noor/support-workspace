import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { LogParsingPage } from "@/pages/log-parsing"
import type { LogEntry } from "@/lib/types"

const navigateMock = vi.fn()

const searchState = {
  searchTerm: undefined,
  levelFilter: undefined,
  startTime: undefined,
  endTime: undefined,
  activeTab: "logs",
  currentPage: 1,
  pageSize: 100,
  selectedEntryIndex: 0,
}

const sessionEntry: LogEntry = {
  timestamp: "2026-04-08T02:38:45.375Z",
  level: "ERROR",
  source: "org.apache.catalina.startup.HostConfig",
  filename: "admin-symphony.log",
  message:
    "Traceback\nValueError: log analysis drawer content should remain scrollable on small screens",
}

const loadSessionMock = vi.fn(async () => ({
  entries: [sessionEntry],
  notice: "Parsed 1 row.",
  files: [],
}))

vi.mock("@tanstack/react-router", () => ({
  getRouteApi: () => ({
    useSearch: () => searchState,
  }),
  useNavigate: () => navigateMock,
}))

vi.mock("@/lib/api", () => ({
  exportLogs: vi.fn(),
  uploadLogs: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  loadSession: () => loadSessionMock(),
  saveSession: vi.fn(async () => undefined),
  clearSession: vi.fn(async () => undefined),
}))

vi.mock("recharts", () => ({
  BarChart: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
}))

vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
  ChartLegend: () => null,
  ChartLegendContent: () => null,
}))

describe("LogParsingPage drawer", () => {
  afterEach(() => {
    cleanup()
    navigateMock.mockReset()
    loadSessionMock.mockClear()
  })

  it("keeps the inspector drawer vertically scrollable on smaller screens", async () => {
    render(<LogParsingPage />)

    await waitFor(() => {
      expect(screen.getByText(/Log Entry Inspector/i)).toBeTruthy()
    })

    const sheetTitle = screen.getByText(/Log Entry Inspector/i)
    const sheetContent = sheetTitle.closest('[data-slot="sheet-content"]') as HTMLElement | null
    const scrollArea = sheetContent?.querySelector('[data-slot="scroll-area"]') as HTMLElement | null

    expect(sheetContent).not.toBeNull()
    expect(scrollArea).not.toBeNull()
    expect(sheetContent?.className).toContain("max-h-[100svh]")
    expect(sheetContent?.className).toContain("min-h-0")
    expect(sheetContent?.className).toContain("overscroll-contain")
    expect(scrollArea?.className).toContain("min-h-0")
  })
})
