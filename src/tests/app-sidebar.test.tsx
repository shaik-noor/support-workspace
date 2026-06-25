import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AppSidebar } from "@/components/app-sidebar"

vi.mock("@tanstack/react-router", () => ({
  useLocation: () => ({ pathname: "/" }),
}))

vi.mock("@/components/nav-main", () => ({
  NavMain: ({ items }: { items: Array<{ title: string }> }) => (
    <nav>
      {items.map((item) => (
        <span key={item.title}>{item.title}</span>
      ))}
    </nav>
  ),
}))

vi.mock("@/components/team-switcher", () => ({
  TeamSwitcher: ({ teams }: { teams: Array<{ name: string }> }) => (
    <div>{teams[0]?.name}</div>
  ),
}))

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => <aside>{children}</aside>,
  SidebarContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarFooter: ({ children }: { children: React.ReactNode }) => (
    <footer data-testid="sidebar-footer">{children}</footer>
  ),
  SidebarHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarRail: () => <div />,
}))

describe("AppSidebar", () => {
  it("renders only the workspace header and real navigation", () => {
    render(<AppSidebar />)

    expect(screen.getByText(/Support Workspace/i)).toBeTruthy()
    expect(screen.getByText(/Overview/i)).toBeTruthy()
    expect(screen.getByText(/Log Parsing/i)).toBeTruthy()
    expect(screen.queryByTestId("sidebar-footer")).toBeNull()
  })
})
