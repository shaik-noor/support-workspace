import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}))

function SidebarStateProbe() {
  const { state, toggleSidebar } = useSidebar()

  return (
    <div>
      <span data-testid="sidebar-state">{state}</span>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
    </div>
  )
}

describe("SidebarProvider", () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.cookie = "sidebar_state=; path=/; max-age=0"
  })

  afterEach(() => {
    cleanup()
    window.localStorage.clear()
    document.cookie = "sidebar_state=; path=/; max-age=0"
  })

  it("restores the last desktop sidebar state from storage on refresh", () => {
    window.localStorage.setItem("sidebar_state", "false")

    render(
      <SidebarProvider defaultOpen>
        <SidebarStateProbe />
      </SidebarProvider>,
    )

    expect(screen.getByTestId("sidebar-state").textContent).toBe("collapsed")
  })

  it("persists sidebar changes when toggled", () => {
    render(
      <SidebarProvider defaultOpen>
        <SidebarStateProbe />
      </SidebarProvider>,
    )

    fireEvent.click(screen.getByRole("button", { name: /toggle sidebar/i }))

    expect(screen.getByTestId("sidebar-state").textContent).toBe("collapsed")
    expect(window.localStorage.getItem("sidebar_state")).toBe("false")
    expect(document.cookie).toContain("sidebar_state=false")
  })
})
