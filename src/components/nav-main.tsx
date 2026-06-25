import { Link } from "@tanstack/react-router"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ComponentType<any>
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75 mb-2">
        Diagnostics & Control
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1.5 px-1.5 group-data-[state=collapsed]:px-0">
        {items.map((item) => {
          const Icon = item.icon
          const hasSubItems = item.items && item.items.length > 0

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  tooltip={item.title}
                  className={`w-full rounded-lg border border-transparent transition-all duration-200 hover:border-sidebar-border/80 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground ${
                    item.isActive 
                      ? "border-primary/20 bg-primary/10 font-semibold text-primary shadow-sm"
                      : "text-muted-foreground/90"
                  }`}
                >
                  <Link
                    to={item.url}
                    aria-current={item.isActive ? "page" : undefined}
                    className={`relative flex w-full items-center gap-3 group-data-[state=collapsed]:justify-center ${
                      item.isActive ? "pl-2.5" : ""
                    }`}
                  >
                    {item.isActive ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary group-data-[state=collapsed]:hidden"
                      />
                    ) : null}
                    {Icon && (
                      <Icon className={`transition-transform duration-200 group-hover:scale-105 ${
                        item.isActive ? "text-primary" : "text-muted-foreground"
                      }`} />
                    )}
                    <span className={`text-xs group-data-[state=collapsed]:hidden ${
                      item.isActive ? "text-primary" : ""
                    }`}>
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                    {Icon && <Icon />}
                    <span className="text-xs group-data-[state=collapsed]:hidden">{item.title}</span>
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[state=collapsed]:hidden" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={subItem.url}>
                            <span className="text-xs">{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
