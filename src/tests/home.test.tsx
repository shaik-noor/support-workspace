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
  it("shows the Support Workspace title and services list", () => {
    render(<HomePage />)

    expect(screen.getAllByText(/Support Workspace/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Log Parsing & Inspection/i)).toBeTruthy()
    expect(screen.getByText(/Log Metrics & Performance/i)).toBeTruthy()
    expect(screen.getByText(/Alerting Rules & Incidents/i)).toBeTruthy()
  })
})

