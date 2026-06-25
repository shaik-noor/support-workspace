import * as React from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/app-sidebar"
import { useLocation } from "@tanstack/react-router"

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const getSubTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Workspace Overview"
      case "/log-parsing":
        return "Log Parsing service"
      default:
        return "Support Workspace"
    }
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
            <SidebarTrigger />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Support Workspace</div>
              <div className="truncate text-xs text-muted-foreground">
                {getSubTitle()}
              </div>
            </div>
          </header>
          <main className="min-h-[calc(100svh-3.5rem)] bg-muted/30 p-4">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
