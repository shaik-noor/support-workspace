import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { HomePage } from "@/pages/home"

// Mock the TanStack Router exports used by the component
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

describe("Home route", () => {
  it("shows only the real log parsing landing content", () => {
    render(<HomePage />)

    expect(screen.getAllByText(/Support Workspace/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Log Parsing & Inspection/i)).toBeTruthy()
    expect(screen.getByText(/Upload raw log files/i)).toBeTruthy()
    expect(screen.queryByText(/Log Metrics & Performance/i)).toBeNull()
    expect(screen.queryByText(/Alerting Rules & Incidents/i)).toBeNull()
    expect(screen.queryByText(/Support Center/i)).toBeNull()
    expect(screen.queryByText(/Workspace UTC Time/i)).toBeNull()
    expect(screen.queryByText(/System Status/i)).toBeNull()
    expect(screen.queryByText(/Total Analyzed/i)).toBeNull()
    expect(screen.queryByText(/Diagnostics Agents/i)).toBeNull()
    expect(screen.queryByText(/Live System Log Stream/i)).toBeNull()
  })
})
