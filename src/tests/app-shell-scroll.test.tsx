import { fireEvent, render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AppShell } from "@/components/app-shell"

const locationState = {
  pathname: "/",
  search: "",
}

vi.mock("@tanstack/react-router", () => ({
  useLocation: () => locationState,
}))

vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarInset: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarTrigger: () => <button type="button">Toggle Sidebar</button>,
}))

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <aside>Sidebar</aside>,
}))

describe("AppShell scroll persistence", () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    locationState.pathname = "/"
    locationState.search = ""
  })

  afterEach(() => {
    window.sessionStorage.clear()
  })

  it("restores the saved scroll position for the current page on refresh", async () => {
    window.sessionStorage.setItem("app-shell-scroll:/log-parsing", "180")
    locationState.pathname = "/log-parsing"

    const { container } = render(
      <AppShell>
        <div style={{ height: "2000px" }}>Page Content</div>
      </AppShell>,
    )

    const main = container.querySelector("main") as HTMLElement | null
    expect(main).not.toBeNull()

    await waitFor(() => {
      expect(main?.scrollTop).toBe(180)
    })
  })

  it("stores scroll position changes and restores the matching value after route changes", async () => {
    const { container, rerender } = render(
      <AppShell>
        <div style={{ height: "2000px" }}>Page Content</div>
      </AppShell>,
    )

    const main = container.querySelector("main") as HTMLElement | null
    expect(main).not.toBeNull()

    Object.defineProperty(main, "scrollTop", {
      configurable: true,
      writable: true,
      value: 260,
    })
    fireEvent.scroll(main!)

    expect(window.sessionStorage.getItem("app-shell-scroll:/")).toBe("260")

    window.sessionStorage.setItem("app-shell-scroll:/log-parsing", "90")
    locationState.pathname = "/log-parsing"

    rerender(
      <AppShell>
        <div style={{ height: "2000px" }}>Page Content</div>
      </AppShell>,
    )

    await waitFor(() => {
      expect(main?.scrollTop).toBe(90)
    })
  })
})
