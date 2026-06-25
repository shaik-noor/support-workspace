import * as React from "react"
import {
  Download,
  FileSearch,
  Upload,
  X,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  Search,
  Copy,
  Check,
  Filter,
  FileText,
  Trash2,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { exportLogs, uploadLogs } from "@/lib/api"
import { getVisibleEntries } from "@/lib/log-display"
import { formatTimelineBucketLabel, formatTimestampForDisplay } from "@/lib/log-time"
import type { LogEntry } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { saveSession, loadSession, clearSession } from "@/lib/db"

const routeApi = getRouteApi("/log-parsing")
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { LogAnalysisTable } from "@/components/log-analysis-table"

const ACCEPTED_EXTENSIONS = [".log", ".out", ".xml", ".txt"]

const LEVEL_OPTIONS = [
  "ALL",
  "TRACE",
  "DEBUG",
  "INFO",
  "WARN",
  "WARNING",
  "ERROR",
  "FATAL",
  "CRITICAL",
]

const chartConfig = {
  errors: {
    label: "Errors",
    color: "var(--destructive)",
  },
  warnings: {
    label: "Warnings",
    color: "oklch(0.79 0.15 85)", // Amber color
  },
  info: {
    label: "Info/Other",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function LogParsingPage() {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [logEntries, setLogEntries] = React.useState<LogEntry[]>([])
  const [isUploading, setIsUploading] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)
  const [dragActive, setDragActive] = React.useState(false)
  const [notice, setNotice] = React.useState<string>("Upload logs to begin.")

  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: "/log-parsing" })

  const searchTerm = search.searchTerm ?? ""
  const [localSearchTerm, setLocalSearchTerm] = React.useState(searchTerm)
  const levelFilter = search.levelFilter ?? "ALL"
  const startTime = search.startTime ?? ""
  const endTime = search.endTime ?? ""
  const activeTab = search.activeTab ?? "logs"
  const currentPage = search.currentPage ?? 1
  const pageSize = search.pageSize ?? 100

  // Sync local search term with URL search term (in case URL changes from outside, e.g. quick filters)
  React.useEffect(() => {
    setLocalSearchTerm(searchTerm)
  }, [searchTerm])

  // Debounce local search term update to URL
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearchTerm !== (search.searchTerm ?? "")) {
        navigate({
          search: (prev) => ({ ...prev, searchTerm: localSearchTerm || undefined, currentPage: 1 }),
          replace: true,
        })
      }
    }, 250)
    return () => clearTimeout(handler)
  }, [localSearchTerm, navigate, search.searchTerm])

  const setLevelFilter = React.useCallback((level: string) => {
    navigate({
      search: (prev) => ({ ...prev, levelFilter: level !== "ALL" ? level : undefined, currentPage: 1 }),
    })
  }, [navigate])

  const setStartTime = React.useCallback((time: string) => {
    navigate({
      search: (prev) => ({ ...prev, startTime: time || undefined, currentPage: 1 }),
    })
  }, [navigate])

  const setEndTime = React.useCallback((time: string) => {
    navigate({
      search: (prev) => ({ ...prev, endTime: time || undefined, currentPage: 1 }),
    })
  }, [navigate])

  const setActiveTab = React.useCallback((tab: string) => {
    navigate({
      search: (prev) => ({ ...prev, activeTab: tab !== "logs" ? tab : undefined }),
    })
  }, [navigate])

  const setCurrentPage = React.useCallback((page: number) => {
    navigate({
      search: (prev) => ({ ...prev, currentPage: page !== 1 ? page : undefined }),
    })
  }, [navigate])

  const setPageSize = React.useCallback((size: number) => {
    navigate({
      search: (prev) => ({ ...prev, pageSize: size !== 100 ? size : undefined, currentPage: 1 }),
    })
  }, [navigate])

  const selectedEntry = React.useMemo(() => {
    if (search.selectedEntryIndex === undefined || search.selectedEntryIndex < 0 || search.selectedEntryIndex >= logEntries.length) {
      return null
    }
    return logEntries[search.selectedEntryIndex]
  }, [search.selectedEntryIndex, logEntries])

  const setSelectedEntry = React.useCallback((entry: LogEntry | null) => {
    navigate({
      search: (prev) => ({
        ...prev,
        selectedEntryIndex: entry ? logEntries.indexOf(entry) : undefined,
      }),
    })
  }, [navigate, logEntries])

  const [copied, setCopied] = React.useState(false)
  const [showChart, setShowChart] = React.useState(true)

  // Load session from IndexedDB on mount
  React.useEffect(() => {
    let active = true
    loadSession().then((session) => {
      if (!active || !session) return
      if (session.entries && session.entries.length > 0) {
        setLogEntries(session.entries)
      }
      if (session.notice) {
        setNotice(session.notice)
      }
      if (session.files && session.files.length > 0) {
        const dummyFiles = session.files.map(
          (f) => new File([""], f.name, { lastModified: f.lastModified })
        )
        dummyFiles.forEach((file, index) => {
          Object.defineProperty(file, "size", { value: session.files[index].size })
        })
        setSelectedFiles(dummyFiles)
      }
    }).catch((err) => {
      console.error("Failed to load session:", err)
    })
    return () => {
      active = false
    }
  }, [])

  // Save session when logEntries, selectedFiles, or notice changes
  React.useEffect(() => {
    if (logEntries.length === 0 && selectedFiles.length === 0) {
      clearSession()
      return
    }
    const filesMeta = selectedFiles.map((file) => ({
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
    }))
    saveSession({
      entries: logEntries,
      files: filesMeta,
      notice,
    }).catch((err) => {
      console.error("Failed to save session:", err)
    })
  }, [logEntries, selectedFiles, notice])

  const filteredEntries = React.useMemo(() => {
    return logEntries.filter((entry) => {
      const query = searchTerm.trim().toLowerCase()
      const level = entry.level.toUpperCase()
      const entryDate = entry.timestamp ? new Date(entry.timestamp) : null

      if (
        query &&
        !`${entry.message} ${entry.source} ${entry.filename}`.toLowerCase().includes(query)
      ) {
        return false
      }

      const normEntryLevel = level === "WARN" ? "WARNING" : level
      const normFilter = levelFilter === "WARN" ? "WARNING" : levelFilter.toUpperCase()
      if (normFilter !== "ALL" && normEntryLevel !== normFilter) return false
      if (startTime && entryDate && entryDate < new Date(startTime)) return false
      if (endTime && entryDate && entryDate > new Date(endTime)) return false
      return true
    })
  }, [endTime, levelFilter, logEntries, searchTerm, startTime])

  const visibleEntries = getVisibleEntries(filteredEntries)

  const paginatedEntries = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return visibleEntries.slice(startIndex, startIndex + pageSize)
  }, [visibleEntries, currentPage, pageSize])

  // Statistics calculation for the overall parsed files
  const stats = React.useMemo(() => {
    const total = logEntries.length
    if (total === 0) {
      return { total: 0, errors: 0, errorRate: 0, warnings: 0, warningRate: 0, sources: 0, files: 0 }
    }

    const errors = logEntries.filter((e) =>
      ["ERROR", "FATAL", "CRITICAL"].includes(e.level.toUpperCase())
    ).length
    const warnings = logEntries.filter((e) =>
      ["WARN", "WARNING"].includes(e.level.toUpperCase())
    ).length

    const uniqueSources = new Set(logEntries.map((e) => e.source)).size
    const uniqueFiles = new Set(logEntries.map((e) => e.filename)).size

    return {
      total,
      errors,
      errorRate: Number(((errors / total) * 100).toFixed(1)),
      warnings,
      warningRate: Number(((warnings / total) * 100).toFixed(1)),
      sources: uniqueSources,
      files: uniqueFiles,
    }
  }, [logEntries])

  // Timeline aggregation (with Recharts adaptation)
  const timeline = React.useMemo(() => {
    if (filteredEntries.length === 0) return []

    let minTime = Infinity
    let maxTime = -Infinity
    filteredEntries.forEach((entry) => {
      if (!entry.timestamp) return
      const time = new Date(entry.timestamp).getTime()
      if (!Number.isNaN(time)) {
        if (time < minTime) minTime = time
        if (time > maxTime) maxTime = time
      }
    })

    let windowSize = 5 * 60 * 1000 // default 5 minutes
    if (minTime !== Infinity && maxTime !== -Infinity) {
      const span = maxTime - minTime
      if (span < 60 * 60 * 1000) {
        windowSize = 60 * 1000 // 1 minute
      } else if (span < 12 * 60 * 60 * 1000) {
        windowSize = 5 * 60 * 1000 // 5 minutes
      } else if (span < 48 * 60 * 60 * 1000) {
        windowSize = 30 * 60 * 1000 // 30 minutes
      } else if (span < 7 * 24 * 60 * 60 * 1000) {
        windowSize = 2 * 60 * 60 * 1000 // 2 hours
      } else {
        windowSize = 24 * 60 * 60 * 1000 // 1 day
      }
    }

    const buckets = new Map<number, LogEntry[]>()

    filteredEntries.forEach((entry) => {
      if (!entry.timestamp) return
      const time = new Date(entry.timestamp).getTime()
      if (Number.isNaN(time)) return
      const bucket = Math.floor(time / windowSize) * windowSize
      const existing = buckets.get(bucket) ?? []
      existing.push(entry)
      buckets.set(bucket, existing)
    })

    return [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([key, entries]) => {
        const errors = entries.filter((entry) =>
          ["ERROR", "FATAL", "CRITICAL"].includes(entry.level.toUpperCase())
        ).length
        const warnings = entries.filter((entry) =>
          ["WARN", "WARNING"].includes(entry.level.toUpperCase())
        ).length
        const info = entries.length - errors - warnings

        return {
          key,
          label: formatTimelineBucketLabel(new Date(key).toISOString(), windowSize),
          count: entries.length,
          errors,
          warnings,
          info,
          sample: entries[0]?.message ?? "—",
        }
      })
  }, [filteredEntries])

  function queueFiles(nextFiles: File[]) {
    const validFiles = nextFiles.filter((file) => isAcceptedFile(file.name))
    if (!validFiles.length) {
      setNotice("Supported formats: .log, .out, .xml, .txt")
      return
    }

    setSelectedFiles((current) => {
      const merged = [...current]
      validFiles.forEach((file) => {
        if (!merged.some((existing) => existing.name === file.name && existing.size === file.size)) {
          merged.push(file)
        }
      })
      return merged
    })
    setNotice(`${validFiles.length} file(s) queued.`)
  }

  async function analyze() {
    if (!selectedFiles.length) {
      setNotice("Add at least one file.")
      return
    }

    setIsUploading(true)
    setNotice("Analyzing…")
    try {
      const payload = await uploadLogs(selectedFiles)
      setLogEntries(payload.entries)
      setNotice(`Parsed ${payload.count.toLocaleString()} rows.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Upload failed.")
    } finally {
      setIsUploading(false)
    }
  }

  async function handleExport() {
    if (!filteredEntries.length) {
      setNotice("No rows to export.")
      return
    }

    setIsExporting(true)
    try {
      const result = await exportLogs(filteredEntries, {
        startTime,
        endTime,
      })
      const url = window.URL.createObjectURL(result.blob)
      const link = window.document.createElement("a")
      link.href = url
      link.download = result.filename
      window.document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setNotice(`Exported ${filteredEntries.length.toLocaleString()} rows.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Export failed.")
    } finally {
      setIsExporting(false)
    }
  }

  function clearFilters() {
    setLocalSearchTerm("")
    navigate({
      search: (prev) => ({
        ...prev,
        searchTerm: undefined,
        levelFilter: undefined,
        startTime: undefined,
        endTime: undefined,
        currentPage: 1,
      }),
    })
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Parse a message to check if it represents JSON or a python/js stacktrace
  const renderSmartAnalysis = (msg: string) => {
    // 1. JSON analysis
    try {
      if (msg.trim().startsWith("{") && msg.trim().endsWith("}")) {
        const parsed = JSON.parse(msg.trim())
        return (
          <div className="space-y-2 mt-2">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              Structured JSON Object
            </Badge>
            <pre className="rounded-lg border bg-slate-950 p-3 text-[11px] font-mono text-slate-100 overflow-x-auto max-h-48">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </div>
        )
      }
    } catch {}

    // 2. Stacktrace analysis
    if (msg.includes("Traceback") || msg.includes("Error:") || msg.includes("exception")) {
      const lines = msg.split("\n").filter((l) => l.trim())
      const lastLine = lines[lines.length - 1] || ""
      return (
        <div className="space-y-2 mt-2">
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            Stack Trace Detected
          </Badge>
          <div className="rounded-lg border bg-muted/50 p-3 text-xs space-y-1">
            <div className="font-semibold text-destructive">Primary Exception:</div>
            <div className="font-mono bg-destructive/5 text-destructive-foreground p-1.5 rounded select-all break-words">
              {lastLine}
            </div>
            {lines.length > 2 && (
              <div className="text-[10px] text-muted-foreground pt-1.5">
                Contains {lines.length} stack frames. Toggle full code view below if needed.
              </div>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6">
      {/* Redesigned Uploader Section */}
      <Card className="border border-border bg-gradient-to-br from-card to-muted/20 shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
            <FileSearch className="size-5 text-primary" />
            Log Parsing & Redesign
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Upload raw log records, filter instantly by time/severity, and export a clean filtered bundle.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div
            className={cn(
              "rounded-xl border-2 border-dashed p-8 transition-all flex flex-col justify-center items-center text-center cursor-pointer",
              dragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-border bg-background hover:bg-muted/10",
            )}
            onDragEnter={(event) => {
              event.preventDefault()
              setDragActive(true)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              setDragActive(false)
            }}
            onDrop={(event) => {
              event.preventDefault()
              setDragActive(false)
              queueFiles(Array.from(event.dataTransfer.files))
            }}
          >
            <div className="flex flex-col items-center gap-2 max-w-md">
              <div className="p-3 bg-primary/5 rounded-full text-primary mb-2">
                <Upload className="size-6 animate-pulse" />
              </div>
              <div className="text-sm font-semibold text-foreground">Drag & drop your log files here</div>
              <div className="text-xs text-muted-foreground leading-normal">
                Supported file formats: <span className="font-mono">{ACCEPTED_EXTENSIONS.join(", ")}</span>. Max file count is unlimited.
              </div>
              <label className="mt-4 cursor-pointer">
                <input
                  className="sr-only"
                  type="file"
                  multiple
                  accept={ACCEPTED_EXTENSIONS.join(",")}
                  onChange={(event) => queueFiles(Array.from(event.target.files ?? []))}
                />
                <Button asChild size="sm">
                  <span>Browse files</span>
                </Button>
              </label>
            </div>

            <div className="mt-6 pt-4 border-t border-border/80 w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-left">
              <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Info className="size-3.5 text-primary" />
                {notice}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Reset filters
                </Button>
                <Button size="sm" onClick={analyze} disabled={isUploading || !selectedFiles.length}>
                  {isUploading ? "Analyzing…" : "Analyze Log Queue"}
                </Button>
              </div>
            </div>
          </div>

          {selectedFiles.length ? (
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {selectedFiles.map((file) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center justify-between rounded-lg border bg-background/50 px-3 py-2 text-xs shadow-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="truncate font-medium text-foreground">{file.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() =>
                      setSelectedFiles((current) =>
                        current.filter(
                          (queued) =>
                            !(
                              queued.name === file.name &&
                              queued.size === file.size &&
                              queued.lastModified === file.lastModified
                            ),
                        ),
                      )
                    }
                    aria-label="Remove file"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Analysis & Dashboard Area */}
      {logEntries.length > 0 && (
        <div className="grid gap-6">
          {/* KPI Stats Summary Bar */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-xs bg-background/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Events
                  </div>
                  <div className="text-2xl font-bold tracking-tight">{stats.total.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {filteredEntries.length.toLocaleString()} matches current filter
                  </div>
                </div>
                <div className="p-2 bg-primary/5 rounded-full text-primary">
                  <Activity className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs bg-background/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Errors / Failures
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-destructive">
                    {stats.errors.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-destructive flex items-center gap-1">
                    <span className="font-semibold">{stats.errorRate}%</span> of total records
                  </div>
                </div>
                <div className="p-2 bg-destructive/5 rounded-full text-destructive">
                  <AlertTriangle className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs bg-background/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Warnings
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-amber-500">
                    {stats.warnings.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-amber-500 flex items-center gap-1">
                    <span className="font-semibold">{stats.warningRate}%</span> of total records
                  </div>
                </div>
                <div className="p-2 bg-amber-500/5 rounded-full text-amber-500">
                  <Info className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs bg-background/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Scope
                  </div>
                  <div className="text-2xl font-bold tracking-tight">
                    {stats.sources} / {stats.files}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Unique sources / unique files
                  </div>
                </div>
                <div className="p-2 bg-zinc-500/5 rounded-full text-muted-foreground">
                  <FileText className="size-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Recharts Log Volume Chart */}
          {timeline.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Activity className="size-4 text-primary" />
                    Log Event Density
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Log severity volume distribution over dynamic timestamps.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowChart(!showChart)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showChart ? "Hide Trend Chart" : "Show Trend Chart"}
                </Button>
              </CardHeader>
              {showChart && (
                <CardContent className="h-[220px] pt-0">
                  <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
                    <BarChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => {
                          try {
                            const parts = value.split(", ")
                            return parts[1] || value
                          } catch {
                            return value
                          }
                        }}
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="errors" stackId="a" fill="var(--destructive)" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="warnings" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="info" stackId="a" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              )}
            </Card>
          )}

          {/* Interactive Log Table & Filters */}
          <Card className="shadow-sm border-border">
            <CardHeader className="flex flex-col gap-4 border-b border-border/80 pb-4 sm:flex-row sm:items-center sm:justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold">Analysis Log Feed</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Found {filteredEntries.length.toLocaleString()} matching events out of {logEntries.length.toLocaleString()} total
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  disabled={searchTerm === "" && levelFilter === "ALL" && startTime === "" && endTime === ""}
                >
                  Clear filter rules
                </Button>
                <Button
                  size="sm"
                  onClick={handleExport}
                  disabled={isExporting || !filteredEntries.length}
                >
                  <Download />
                  {isExporting ? "Exporting…" : "Export Logs"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4">
              {/* Toolbar filters */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Search className="size-3" />
                    Text search
                  </div>
                  <Input
                    value={localSearchTerm}
                    onChange={(event) => setLocalSearchTerm(event.target.value)}
                    placeholder="Search logs, source, context..."
                    className="h-8"
                  />
                </div>

                <div className="grid gap-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Filter className="size-3" />
                    Severity Filter
                  </div>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-full h-8">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVEL_OPTIONS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level === "ALL" ? "All levels" : level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />
                    Time From
                  </div>
                  <Input
                    type="datetime-local"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid gap-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />
                    Time To
                  </div>
                  <Input
                    type="datetime-local"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Main Log table with tab panel options */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex w-[240px] h-8">
                  <TabsTrigger value="logs" className="text-xs py-1 h-full">Logs Feed</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs py-1 h-full">Time Buckets</TabsTrigger>
                </TabsList>

                {/* Table View Tab */}
                <TabsContent value="logs" className="mt-4 focus-visible:outline-none">
                  <LogAnalysisTable entries={paginatedEntries} onSelectEntry={setSelectedEntry} />

                  {/* Pagination Controls */}
                  {visibleEntries.length > 0 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-muted-foreground">
                      <div>
                        Showing{" "}
                        <span className="font-medium text-foreground">
                          {Math.min(visibleEntries.length, (currentPage - 1) * pageSize + 1)}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-foreground">
                          {Math.min(visibleEntries.length, currentPage * pageSize)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                          {visibleEntries.length.toLocaleString()}
                        </span>{" "}
                        entries
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <span>Rows per page</span>
                          <Select
                            value={String(pageSize)}
                            onValueChange={(val) => {
                              setPageSize(Number(val))
                              setCurrentPage(1)
                            }}
                          >
                            <SelectTrigger className="h-7 w-[65px] text-[11px]">
                              <SelectValue placeholder={String(pageSize)} />
                            </SelectTrigger>
                            <SelectContent>
                              {[50, 100, 200, 500, 1000].map((size) => (
                                <SelectItem key={size} value={String(size)} className="text-xs">
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                          >
                            First
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            Prev
                          </Button>
                          <span className="px-2 text-[10px] font-mono">
                            Page {currentPage} / {Math.ceil(visibleEntries.length / pageSize) || 1}
                          </span>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() =>
                              setCurrentPage((p) =>
                                Math.min(Math.ceil(visibleEntries.length / pageSize), p + 1)
                              )
                            }
                            disabled={currentPage >= Math.ceil(visibleEntries.length / pageSize)}
                          >
                            Next
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setCurrentPage(Math.ceil(visibleEntries.length / pageSize))}
                            disabled={currentPage >= Math.ceil(visibleEntries.length / pageSize)}
                          >
                            Last
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Timeline Grouped Tab */}
                <TabsContent value="timeline" className="mt-4 focus-visible:outline-none">
                  <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-1">
                    {timeline.length ? (
                      timeline.map((group) => (
                        <Card key={group.key} className="shadow-xs border border-border bg-card">
                          <CardHeader className="space-y-2 p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <CardTitle className="text-sm font-semibold">{group.label}</CardTitle>
                              <div className="flex flex-wrap gap-1.5">
                                <Badge variant="secondary" className="h-5 text-[10px]">
                                  {group.count} events
                                </Badge>
                                {group.warnings > 0 && (
                                  <Badge variant="outline" className="h-5 text-[10px] bg-amber-500/5 text-amber-500 border-amber-500/20">
                                    {group.warnings} warnings
                                  </Badge>
                                )}
                                {group.errors > 0 && (
                                  <Badge variant="outline" className="h-5 text-[10px] bg-red-500/5 text-red-500 border-red-500/20">
                                    {group.errors} errors
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <CardDescription className="font-mono text-xs text-foreground/80 truncate select-all">
                              {group.sample}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Timeline</CardTitle>
                          <CardDescription>
                            Timeline buckets appear when parsed entries contain timestamps.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Side Slide Inspector (Sheet Details Drawer) */}
      <Sheet open={selectedEntry !== null} onOpenChange={(open) => { if (!open) setSelectedEntry(null) }}>
        <SheetContent className="sm:max-w-xl flex min-h-0 flex-col overflow-hidden border-l border-border bg-popover text-foreground p-0 shadow-2xl">
          {selectedEntry && (
            <>
              {/* Header */}
              <SheetHeader className="shrink-0 border-b border-border bg-muted/20 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold py-0.5 tracking-wide rounded-sm uppercase border",
                      ["ERROR", "FATAL", "CRITICAL"].includes(selectedEntry.level.toUpperCase())
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : ["WARN", "WARNING"].includes(selectedEntry.level.toUpperCase())
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-primary/10 text-primary border-primary/20"
                    )}
                  >
                    {selectedEntry.level.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3" />
                    {formatTimestampForDisplay(selectedEntry.timestamp)}
                  </span>
                </div>
                <SheetTitle className="text-lg font-bold tracking-tight">
                  Log Entry Inspector
                </SheetTitle>
                <SheetDescription asChild>
                  <div className="text-xs text-muted-foreground flex flex-col gap-1.5 pt-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground/80 w-16">Source:</span>
                      <span className="font-mono bg-muted text-foreground px-1.5 py-0.5 rounded text-[10px]">
                        {selectedEntry.source}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground/80 w-16">Filename:</span>
                      <span className="font-mono bg-muted text-foreground px-1.5 py-0.5 rounded text-[10px] truncate max-w-[280px]">
                        {selectedEntry.filename}
                      </span>
                    </div>
                  </div>
                </SheetDescription>
              </SheetHeader>

              {/* Scrollable details wrapper */}
              <ScrollArea className="min-h-0 flex-1 overscroll-contain">
                <div className="space-y-6 p-6">
                  {/* Copy & Raw block */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Raw Log Message
                      </span>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleCopy(selectedEntry.message)}
                        className="h-7 text-xs border border-border cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="size-3.5 mr-1 text-emerald-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5 mr-1" />
                            Copy message
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="font-mono text-xs text-slate-100 bg-slate-950 p-4 rounded-xl border border-border overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-all">
                      {selectedEntry.message}
                    </pre>
                  </div>

                  {/* Smart parsing if long */}
                  {selectedEntry.message && selectedEntry.message.length > 100 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Smart Log Analytics
                      </span>
                      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                        <div className="text-[11px] text-muted-foreground flex justify-between items-center pb-2 border-b border-border/50">
                          <span>Characters: {selectedEntry.message.length.toLocaleString()}</span>
                          <span>Lines: {selectedEntry.message.split("\n").length}</span>
                        </div>
                        {renderSmartAnalysis(selectedEntry.message)}
                        {!renderSmartAnalysis(selectedEntry.message) && (
                          <p className="text-xs text-foreground/80 leading-relaxed pt-1.5 font-mono">
                            {selectedEntry.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Filters */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Filter className="size-3.5" />
                      Quick Filtering Rules
                    </span>
                    <div className="flex flex-col gap-2 pt-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs text-left"
                        onClick={() => {
                          navigate({
                            search: (prev) => ({
                              ...prev,
                              levelFilter: selectedEntry.level.toUpperCase(),
                              selectedEntryIndex: undefined,
                              currentPage: 1,
                            }),
                          })
                        }}
                      >
                        <span className="font-semibold text-muted-foreground mr-1.5">Severity:</span>
                        Filter strictly for level <Badge variant="secondary" className="ml-1 uppercase text-[9px] h-4 px-1 rounded-sm">{selectedEntry.level}</Badge>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs text-left"
                        onClick={() => {
                          navigate({
                            search: (prev) => ({
                              ...prev,
                              searchTerm: selectedEntry.source,
                              selectedEntryIndex: undefined,
                              currentPage: 1,
                            }),
                          })
                        }}
                      >
                        <span className="font-semibold text-muted-foreground mr-1.5">Source:</span>
                        Search specifically for source: <span className="font-mono ml-1 text-foreground">{selectedEntry.source}</span>
                      </Button>
                      {selectedEntry.timestamp && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs text-left"
                          onClick={() => {
                            const time = new Date(selectedEntry.timestamp!)
                            // ± 5 minutes
                            const start = new Date(time.getTime() - 5 * 60 * 1000).toISOString().slice(0, 16)
                            const end = new Date(time.getTime() + 5 * 60 * 1000).toISOString().slice(0, 16)
                            navigate({
                              search: (prev) => ({
                                ...prev,
                                startTime: start,
                                endTime: end,
                                selectedEntryIndex: undefined,
                                currentPage: 1,
                              }),
                            })
                          }}
                        >
                          <span className="font-semibold text-muted-foreground mr-1.5">Time Window:</span>
                          Filter ±5 minutes around this event timestamp
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function isAcceptedFile(filename: string) {
  return ACCEPTED_EXTENSIONS.some((extension) =>
    filename.toLowerCase().endsWith(extension),
  )
}
