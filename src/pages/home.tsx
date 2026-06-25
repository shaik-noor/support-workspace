import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  FileSearch,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function HomePage() {
  const services = [
    {
      title: "Log Parsing & Inspection",
      description: "Upload raw log files (.log, .txt, etc.), automatically parse structured entries, filter by level and timestamps, and view a visual timeline.",
      to: "/log-parsing",
      icon: FileSearch,
      status: "Active",
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 -z-10 h-48 w-48 rounded-full bg-violet-500/5 blur-3xl" />

        <div className="space-y-4 max-w-3xl">
          <div className="space-y-2 max-w-2xl">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Log Analysis
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-muted-foreground">
              Support Workspace
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Upload raw logs, parse structured entries, filter by severity or time range, and inspect the results in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="text-xs font-medium cursor-pointer">
              <Link to="/log-parsing" className="flex items-center gap-1.5">
                Open Log Parsing <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="text-xs font-medium cursor-pointer">
              <Link to="/log-parsing?activeTab=timeline">View Timeline</Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="grid gap-6 md:grid-cols-1">
          {services.map((service, idx) => {
            const Icon = service.icon
            return (
              <Card key={idx} className="flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className={service.badgeColor}>
                      {service.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed pt-1.5 min-h-[64px]">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild className="w-full text-xs font-medium cursor-pointer" variant="outline">
                    <Link to={service.to} className="flex items-center justify-center gap-1.5 w-full">
                      Access Service <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
