import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { LogAnalysisTable } from "@/components/log-analysis-table"
import type { LogEntry } from "@/lib/types"

const entries: LogEntry[] = [
  {
    timestamp: "2026-04-08T02:38:45.375Z",
    level: "INFO",
    source: "org.apache.catalina.startup.HostConfig",
    filename: "coreservices-super-long-file-name.log",
    message:
      "Deployment of web application archive [/home/apps/Informatica/10.5.1/isp/webapps/coreservices.war] has finished in [6,384] ms",
  },
]

describe("LogAnalysisTable", () => {
  const originalInnerWidth = window.innerWidth

  afterEach(() => {
    cleanup()
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: originalInnerWidth,
    })
  })

  it("supports horizontally resizing columns so more values can be revealed", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1600,
    })

    const { container } = render(<LogAnalysisTable entries={entries} onSelectEntry={() => {}} />)

    const table = container.querySelector('[data-slot="table"]') as HTMLTableElement | null
    const messageCol = container.querySelector('[data-column-key="message"]') as HTMLElement | null
    expect(table).not.toBeNull()
    expect(messageCol).not.toBeNull()
    expect(table?.style.width).toBe("1232px")
    expect(messageCol?.style.width).toBe("472px")

    const resizeHandle = screen.getByRole("separator", { name: /Resize Message column/i })
    fireEvent.mouseDown(resizeHandle, { clientX: 0 })
    fireEvent.mouseMove(window, { clientX: 160 })
    fireEvent.mouseUp(window)

    expect(table?.style.width).toBe("1392px")
    expect(messageCol?.style.width).toBe("632px")
  })

  it("uses a smaller default message width on laptop-sized screens", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1180,
    })

    const { container } = render(<LogAnalysisTable entries={entries} onSelectEntry={() => {}} />)

    const messageCol = container.querySelector('[data-column-key="message"]') as HTMLElement | null
    expect(messageCol).not.toBeNull()
    expect(messageCol?.style.width).toBe("420px")
  })
})
