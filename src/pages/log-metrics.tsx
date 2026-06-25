import * as React from "react"
import { BarChart3, Activity, PieChart, ShieldAlert, Cpu, Database, CloudLightning, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function LogMetricsPage() {
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 800)
  }

  // Simulated metrics
  const severityMetrics = [
    { level: "INFO", count: 38240, percent: 83.4, color: "bg-sky-500" },
    { level: "DEBUG", count: 4890, percent: 10.7, color: "bg-zinc-400" },
    { level: "WARNING", count: 2130, percent: 4.6, color: "bg-amber-500" },
    { level: "ERROR", count: 520, percent: 1.1, color: "bg-red-500" },
    { level: "FATAL/CRITICAL", count: 40, percent: 0.1, color: "bg-purple-600" },
  ]

  // Key system performance metrics
  const sysStats = [
    { title: "Avg Ingestion Speed", value: "87.5k lines/s", desc: "Using WebAssembly parser", icon: CloudLightning, color: "text-amber-500" },
    { title: "CPU Utilization", value: "24.2%", desc: "8 core processor optimized", icon: Cpu, color: "text-blue-500" },
    { title: "Memory footprint", value: "1.4 GB / 8.0 GB", desc: "V8 memory allocation", icon: Database, color: "text-purple-500" },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Log Metrics & Analytics</h1>
          <p className="text-muted-foreground text-sm">
            High-fidelity analysis of ingested event streams, distribution weight, and system load.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Stats
        </Button>
      </div>

      {/* Main stats layout */}
      <div className="grid gap-4 md:grid-cols-3">
        {sysStats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* SVG Line Chart: Request load over time */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Request Stream Activity (RPM)
                </CardTitle>
                <CardDescription className="text-xs">
                  Event volume parsed per minute over the last 12-hour cycle.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                Live Feed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="relative h-60 w-full bg-slate-950/5 rounded-lg p-2 border border-border">
              {/* Sleek SVG Chart */}
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Grid lines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(128,128,128,0.1)" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(128,128,128,0.1)" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(128,128,128,0.1)" strokeWidth="1" strokeDasharray="4" />

                {/* Line Path Area */}
                <path
                  d="M 0 160 Q 40 120 80 150 T 160 100 T 240 130 T 320 80 T 400 40 T 480 90 L 500 90 L 500 200 L 0 200 Z"
                  fill="url(#chartGradient)"
                />

                {/* Line Path Stroke */}
                <path
                  d="M 0 160 Q 40 120 80 150 T 160 100 T 240 130 T 320 80 T 400 40 T 480 90 L 500 90"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="80" cy="150" r="4.5" fill="var(--primary)" stroke="white" strokeWidth="1.5" />
                <circle cx="160" cy="100" r="4.5" fill="var(--primary)" stroke="white" strokeWidth="1.5" />
                <circle cx="240" cy="130" r="4.5" fill="var(--primary)" stroke="white" strokeWidth="1.5" />
                <circle cx="320" cy="80" r="4.5" fill="var(--primary)" stroke="white" strokeWidth="1.5" />
                <circle cx="400" cy="40" r="4.5" fill="var(--primary)" stroke="white" strokeWidth="1.5" />
                <circle cx="480" cy="90" r="4.5" fill="var(--primary)" stroke="white" strokeWidth="1.5" />
              </svg>

              {/* Chart labels */}
              <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[10px] font-mono text-muted-foreground select-none">
                <span>12h ago</span>
                <span>8h ago</span>
                <span>4h ago</span>
                <span>Current</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <div className="space-y-1">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" /> Severity Weight Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Log level percentage ratios of analyzed data.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {severityMetrics.map((metric, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-semibold text-foreground">{metric.level}</span>
                  <span className="text-muted-foreground">
                    {metric.count.toLocaleString()} ({metric.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${metric.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${metric.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* SVG Bar Chart: Log Events by Component */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Log Output by Module Component
          </CardTitle>
          <CardDescription className="text-xs">
            Identification of which services generate the highest volume of warning and error logs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full flex items-end justify-between px-4 pb-2 pt-6 border-b border-border relative">
            {/* Grid markings */}
            <div className="absolute left-0 top-0 text-[10px] font-mono text-muted-foreground">20k lines</div>
            <div className="absolute left-0 top-[33%] text-[10px] font-mono text-muted-foreground">13k lines</div>
            <div className="absolute left-0 top-[66%] text-[10px] font-mono text-muted-foreground">6k lines</div>

            {/* Custom SVG bars */}
            <div className="flex flex-col items-center gap-2 w-1/5 group">
              <div className="w-12 bg-primary/20 hover:bg-primary/30 transition-all rounded-t-sm relative h-36 flex items-end">
                <div className="w-full bg-primary rounded-t-sm h-[75%] transition-all group-hover:opacity-90" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">API Gateway</span>
            </div>

            <div className="flex flex-col items-center gap-2 w-1/5 group">
              <div className="w-12 bg-sky-500/20 hover:bg-sky-500/30 transition-all rounded-t-sm relative h-36 flex items-end">
                <div className="w-full bg-sky-500 rounded-t-sm h-[90%] transition-all group-hover:opacity-90" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">Auth Service</span>
            </div>

            <div className="flex flex-col items-center gap-2 w-1/5 group">
              <div className="w-12 bg-amber-500/20 hover:bg-amber-500/30 transition-all rounded-t-sm relative h-36 flex items-end">
                <div className="w-full bg-amber-500 rounded-t-sm h-[35%] transition-all group-hover:opacity-90" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">Database Core</span>
            </div>

            <div className="flex flex-col items-center gap-2 w-1/5 group">
              <div className="w-12 bg-indigo-500/20 hover:bg-indigo-500/30 transition-all rounded-t-sm relative h-36 flex items-end">
                <div className="w-full bg-indigo-500 rounded-t-sm h-[50%] transition-all group-hover:opacity-90" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">Log Ingester</span>
            </div>

            <div className="flex flex-col items-center gap-2 w-1/5 group">
              <div className="w-12 bg-red-500/20 hover:bg-red-500/30 transition-all rounded-t-sm relative h-36 flex items-end">
                <div className="w-full bg-red-500 rounded-t-sm h-[15%] transition-all group-hover:opacity-90" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">Task Queue</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
