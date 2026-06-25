import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NavMain } from "@/components/nav-main"

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode
    to: string
    className?: string
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}))

vi.mock("@/components/ui/collapsible", () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/components/ui/sidebar", () => ({
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  SidebarGroupLabel: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  SidebarMenu: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <ul className={className}>{children}</ul>
  ),
  SidebarMenuButton: ({
    children,
    className,
    isActive,
  }: {
    children: React.ReactNode
    className?: string
    isActive?: boolean
  }) => (
    <button className={className} data-active={String(Boolean(isActive))}>
      {children}
    </button>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuSub: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuSubButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  SidebarMenuSubItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
}))

describe("NavMain", () => {
  it("applies a clear selected style to the active route", () => {
    render(
      <NavMain
        items={[
          { title: "Overview", url: "/", isActive: false },
          { title: "Log Parsing", url: "/log-parsing", isActive: true },
        ]}
      />,
    )

    const overviewButton = screen.getByRole("button", { name: /Overview/i })
    const logParsingButton = screen.getByRole("button", { name: /Log Parsing/i })

    expect(overviewButton.getAttribute("data-active")).toBe("false")
    expect(logParsingButton.getAttribute("data-active")).toBe("true")
    expect(logParsingButton.className).toMatch(/bg-primary\/10/)
    expect(logParsingButton.className).toMatch(/text-primary/)
  })
})
