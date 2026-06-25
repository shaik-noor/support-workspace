"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { useLocation } from "@tanstack/react-router"
import { FileSearch, LayoutDashboard, Terminal } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "@/components/team-switcher"

export function AppSidebar() {
  const location = useLocation()

  const isCurrentRoute = React.useCallback(
    (url: string) => {
      if (url === "/") {
        return location.pathname === "/"
      }

      return location.pathname === url || location.pathname.startsWith(`${url}/`)
    },
    [location.pathname],
  )

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
      isActive: isCurrentRoute("/"),
    },
    {
      title: "Log Parsing",
      url: "/log-parsing",
      icon: FileSearch,
      isActive: isCurrentRoute("/log-parsing"),
    },
  ]

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

      <SidebarRail />
    </Sidebar>
  )
}
