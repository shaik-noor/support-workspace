"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useLocation, Link } from "@tanstack/react-router"
import { FileSearch, Settings2, LayoutDashboard, BarChart3, Bell, Terminal } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "@/components/team-switcher"

export function AppSidebar() {
  const location = useLocation()

  const teams = [
    {
      name: "Support Workspace",
      logo: Terminal,
      plan: "Workspace v1.0.0",
    },
  ]

  const menuItems = [
    {
      title: "Overview",
      url: "/",
      icon: LayoutDashboard,
      isActive: location.pathname === "/",
    },
    {
      title: "Log Parsing",
      url: "/log-parsing",
      icon: FileSearch,
      isActive: location.pathname === "/log-parsing",
    },
    {
      title: "Log Metrics",
      url: "/log-metrics",
      icon: BarChart3,
      isActive: location.pathname === "/log-metrics",
    },
    {
      title: "Alert Rules",
      url: "/alerts",
      icon: Bell,
      isActive: location.pathname === "/alerts",
    },
  ]

  const user = {
    name: "Ops Admin",
    email: "admin@support.workspace",
    avatar: "",
  }

  return (
    <Sidebar collapsible="icon">
      {/* Header using our single-item TeamSwitcher */}
      <SidebarHeader className="border-b border-sidebar-border py-2.5">
        <TeamSwitcher teams={teams} />
      </SidebarHeader>

      {/* Main Navigation using modular NavMain */}
      <SidebarContent>
        <NavMain items={menuItems} />
      </SidebarContent>

      {/* Footer using NavUser and dynamic settings */}
      <SidebarFooter className="border-t border-sidebar-border py-3.5 gap-3.5">
        <SidebarMenu className="px-1.5 group-data-[state=collapsed]:px-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
            >
              <Link to="/alerts" className="flex items-center gap-3 w-full group-data-[state=collapsed]:justify-center">
                <Settings2 className="transition-transform duration-200 group-hover:scale-105 text-muted-foreground" />
                <span className="text-xs group-data-[state=collapsed]:hidden">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
