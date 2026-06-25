import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  FileSearch,
  BarChart3,
  Bell,
  ArrowRight,
  Activity,
  ShieldCheck,
  Server,
  Terminal,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function HomePage() {
  const [currentTime, setCurrentTime] = React.useState("")

  React.useEffect(() => {
    setCurrentTime(new Date().toISOString())
    const interval = setInterval(() => {
      setCurrentTime(new Date().toISOString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const services = [
    {
      title: "Log Parsing & Inspection",
      description: "Upload raw log files (.log, .txt, etc.), automatically parse structured entries, filter by level and timestamps, and view a visual timeline.",
      to: "/log-parsing",
      icon: FileSearch,
      status: "Active",
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    {
      title: "Log Metrics & Performance",
      description: "Analyze system trends, query distributions, and error rates using high-fidelity visualization dashboards and custom SVG charts.",
      to: "/log-metrics",
      icon: BarChart3,
      status: "Ready",
      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
      title: "Alerting Rules & Incidents",
      description: "Define automated rules for tracking anomalies or high-severity errors, and dispatch real-time notifications to your engineering channels.",
      to: "/alerts",
      icon: Bell,
      status: "Configured",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
  ]

  const metrics = [
    {
      title: "System Status",
      value: "Operational",
      sub: "All services healthy",
      icon: ShieldCheck,
      color: "text-emerald-500",
    },
    {
      title: "Total Analyzed",
      value: "45,820",
      sub: "+12.4% vs last week",
      icon: Activity,
      color: "text-blue-500",
    },
    {
      title: "Diagnostics Agents",
      value: "3 Active",
      sub: "Ready for ingestion",
      icon: Server,
      color: "text-purple-500",
    },
  ]

  const consoleLogs = [
    { time: "16:00:00Z", level: "INFO", source: "system", msg: "Support Workspace initialized." },
    { time: "16:00:05Z", level: "INFO", source: "services", msg: "Log Parsing, Metrics, Alerts adapters registered." },
    { time: "16:01:23Z", level: "SUCCESS", source: "healthcheck", msg: "All background diagnostics running (0 incidents)." },
    { time: "16:05:10Z", level: "INFO", source: "ingestion", msg: "Awaiting local file upload in Log Parsing dashboard..." },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Welcome banner */}
      <Card className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 -z-10 h-48 w-48 rounded-full bg-violet-500/5 blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge variant="outline" className="animate-pulse bg-primary/10 text-primary border-primary/20">
              Support Center
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-muted-foreground">
              Support Workspace
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Welcome to the diagnostics dashboard for <span className="font-semibold text-foreground">Support Workspace</span>. 
              Upload and analyze logs, monitor system health, and configure anomaly detection alerts from a unified control deck.
            </p>
          </div>
          <div className="text-left md:text-right border-t md:border-t-0 md:border-l pl-0 md:pl-6 pt-4 md:pt-0 border-border">
            <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold">Workspace UTC Time</span>
            <span className="font-mono text-sm font-bold text-foreground tabular-nums tracking-wide">{currentTime || "Loading..."}</span>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon
          return (
            <Card key={idx} className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{metric.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" /> Available Services
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
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

      {/* Console Feed */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-bold">Live System Log Stream</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-black/95 text-zinc-300 font-mono text-xs p-4 overflow-x-auto min-h-[140px] flex flex-col justify-end space-y-1.5">
            {consoleLogs.map((log, idx) => (
              <div key={idx} className="flex flex-wrap items-start gap-2 leading-relaxed">
                <span className="text-zinc-500 select-none">[{log.time}]</span>
                <span className={
                  log.level === "SUCCESS" ? "text-emerald-400 font-bold" : "text-sky-400 font-bold"
                }>
                  [{log.level}]
                </span>
                <span className="text-purple-400 font-medium">[{log.source}]</span>
                <span className="text-zinc-200">{log.msg}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
