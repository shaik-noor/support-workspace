import * as React from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/app-sidebar"
import { useLocation } from "@tanstack/react-router"

const APP_SHELL_SCROLL_AREA_ID = "app-shell-scroll-area"
const APP_SHELL_SCROLL_STORAGE_PREFIX = "app-shell-scroll:"

function getScrollStorageKey(pathname: string) {
  return `${APP_SHELL_SCROLL_STORAGE_PREFIX}${pathname}`
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const mainRef = React.useRef<HTMLElement>(null)
  const scrollStorageKey = React.useMemo(
    () => getScrollStorageKey(location.pathname),
    [location.pathname],
  )

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

  React.useEffect(() => {
    const mainElement = mainRef.current
    if (!mainElement || typeof window === "undefined") {
      return
    }

    const savedScrollTop = window.sessionStorage.getItem(scrollStorageKey)
    const nextScrollTop = savedScrollTop ? Number(savedScrollTop) : 0

    mainElement.scrollTop = Number.isFinite(nextScrollTop) ? nextScrollTop : 0
  }, [scrollStorageKey])

  const handleMainScroll = React.useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      if (typeof window === "undefined") {
        return
      }

      window.sessionStorage.setItem(
        scrollStorageKey,
        String(event.currentTarget.scrollTop),
      )
    },
    [scrollStorageKey],
  )

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset className="h-svh overflow-hidden">
          <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
            <SidebarTrigger />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Support Workspace</div>
              <div className="truncate text-xs text-muted-foreground">
                {getSubTitle()}
              </div>
            </div>
          </header>
          <main
            id={APP_SHELL_SCROLL_AREA_ID}
            ref={mainRef}
            onScroll={handleMainScroll}
            className="min-h-0 flex-1 overflow-y-auto bg-muted/30 p-4"
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
