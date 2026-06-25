import * as React from "react"
import { ChevronRight } from "lucide-react"

import { formatTimestampForDisplay } from "@/lib/log-time"
import type { LogEntry } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type LogAnalysisTableProps = {
  entries: LogEntry[]
  onSelectEntry: (entry: LogEntry) => void
}

type ColumnKey = "timestamp" | "severity" | "source" | "file" | "message" | "action"

const DEFAULT_COLUMN_WIDTHS: Record<ColumnKey, number> = {
  timestamp: 230,
  severity: 120,
  source: 220,
  file: 280,
  message: 720,
  action: 44,
}

const MIN_COLUMN_WIDTHS: Record<ColumnKey, number> = {
  timestamp: 210,
  severity: 100,
  source: 160,
  file: 200,
  message: 320,
  action: 44,
}

const RESIZABLE_COLUMNS: ColumnKey[] = ["timestamp", "severity", "source", "file", "message"]

const COMPACT_COLUMN_WIDTHS: Record<ColumnKey, number> = {
  timestamp: 210,
  severity: 100,
  source: 180,
  file: 226,
  message: 420,
  action: 44,
}

const MAX_TABLE_LAYOUT_WIDTH = 1232

export function LogAnalysisTable({ entries, onSelectEntry }: LogAnalysisTableProps) {
  const hasManualResizeRef = React.useRef(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [availableWidth, setAvailableWidth] = React.useState(() => getInitialAvailableWidth())
  const [columnWidths, setColumnWidths] = React.useState(() =>
    getResponsiveColumnWidths(getInitialAvailableWidth()),
  )
  const dragStateRef = React.useRef<{
    column: ColumnKey
    startX: number
    startWidth: number
  } | null>(null)

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const dragState = dragStateRef.current
      if (!dragState) return

      const nextWidth = Math.max(
        MIN_COLUMN_WIDTHS[dragState.column],
        dragState.startWidth + event.clientX - dragState.startX,
      )

      setColumnWidths((current) => ({
        ...current,
        [dragState.column]: nextWidth,
      }))
    }

    const handleMouseUp = () => {
      if (!dragStateRef.current) return
      dragStateRef.current = null
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  React.useEffect(() => {
    const syncResponsiveWidths = (nextWidth: number) => {
      setAvailableWidth(nextWidth)

      if (hasManualResizeRef.current) return
      setColumnWidths(getResponsiveColumnWidths(nextWidth))
    }

    const measureWidth = () => {
      const measuredWidth = containerRef.current?.clientWidth ?? 0
      syncResponsiveWidths(
        measuredWidth > 0 ? getAvailableTableWidth(measuredWidth) : getInitialAvailableWidth(),
      )
    }

    measureWidth()

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measureWidth)
      return () => window.removeEventListener("resize", measureWidth)
    }

    const observer = new ResizeObserver(() => {
      measureWidth()
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const tableWidth = React.useMemo(
    () => Math.max(getTotalColumnWidth(columnWidths), availableWidth),
    [availableWidth, columnWidths],
  )

  const startResize = (column: ColumnKey, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    hasManualResizeRef.current = true

    dragStateRef.current = {
      column,
      startX: event.clientX,
      startWidth: columnWidths[column],
    }

    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  return (
    <div ref={containerRef} className="min-w-0 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border/80 bg-muted/20 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span>Drag Column Edges To Expand Values</span>
        <span>Horizontal scroll remains available for wide layouts</span>
      </div>

      <div className="max-h-[600px] min-w-0 overflow-auto">
        <Table
          className="min-w-full table-fixed"
          style={{ width: `${tableWidth}px` }}
        >
          <colgroup>
            <col data-column-key="timestamp" style={{ width: `${columnWidths.timestamp}px` }} />
            <col data-column-key="severity" style={{ width: `${columnWidths.severity}px` }} />
            <col data-column-key="source" style={{ width: `${columnWidths.source}px` }} />
            <col data-column-key="file" style={{ width: `${columnWidths.file}px` }} />
            <col data-column-key="message" style={{ width: `${columnWidths.message}px` }} />
            <col data-column-key="action" style={{ width: `${columnWidths.action}px` }} />
          </colgroup>

          <TableHeader className="sticky top-0 z-10 bg-muted/30 backdrop-blur-xs">
            <TableRow>
              <ResizableHead
                label="Timestamp"
                columnKey="timestamp"
                onResizeStart={startResize}
              />
              <ResizableHead
                label="Severity"
                columnKey="severity"
                onResizeStart={startResize}
              />
              <ResizableHead
                label="Source"
                columnKey="source"
                onResizeStart={startResize}
              />
              <ResizableHead
                label="File"
                columnKey="file"
                onResizeStart={startResize}
              />
              <ResizableHead
                label="Message"
                columnKey="message"
                onResizeStart={startResize}
              />
              <TableHead className="w-[44px] py-2" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {entries.length ? (
              entries.map((entry, index) => {
                const upperLvl = entry.level.toUpperCase()
                const isErr = ["ERROR", "FATAL", "CRITICAL"].includes(upperLvl)
                const isWarn = ["WARN", "WARNING"].includes(upperLvl)
                const messagePreview = entry.message ? entry.message.replace(/\s+/g, " ") : ""

                return (
                  <TableRow
                    key={`${entry.filename}-${index}-${entry.timestamp ?? "na"}`}
                    onClick={() => onSelectEntry(entry)}
                    className={cn(
                      "cursor-pointer border-l-4 transition-colors group",
                      isErr
                        ? "border-l-destructive/80 hover:border-l-destructive bg-destructive/1"
                        : isWarn
                        ? "border-l-amber-500/80 hover:border-l-amber-500 bg-amber-500/1"
                        : "border-l-transparent hover:border-l-primary/60",
                    )}
                  >
                    <TableCell className="h-9 py-2 font-mono text-[11px] text-muted-foreground">
                      <div className="truncate" title={formatTimestampForDisplay(entry.timestamp)}>
                        {formatTimestampForDisplay(entry.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell className="h-9 py-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 text-[10px] font-semibold py-0 tracking-wide rounded-sm uppercase border",
                          isErr
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : isWarn
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-primary/10 text-primary border-primary/20",
                        )}
                      >
                        {entry.level.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="h-9 py-2 text-xs font-medium">
                      <div className="truncate" title={entry.source}>
                        {entry.source}
                      </div>
                    </TableCell>
                    <TableCell className="h-9 py-2 text-xs text-muted-foreground">
                      <div className="truncate" title={entry.filename}>
                        {entry.filename}
                      </div>
                    </TableCell>
                    <TableCell className="h-9 py-2 font-mono text-[11px] text-foreground/90">
                      <div className="truncate" title={messagePreview}>
                        {messagePreview}
                      </div>
                    </TableCell>
                    <TableCell className="h-9 py-2 pr-2 text-right text-muted-foreground/0 transition-colors group-hover:text-muted-foreground">
                      <ChevronRight className="size-3.5" />
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  No matching log items. Try modifying your filter rules above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function ResizableHead({
  label,
  columnKey,
  onResizeStart,
}: {
  label: string
  columnKey: ColumnKey
  onResizeStart: (column: ColumnKey, event: React.MouseEvent<HTMLDivElement>) => void
}) {
  return (
    <TableHead className="relative py-2 pr-3 text-xs">
      <div className="flex items-center">{label}</div>
      {RESIZABLE_COLUMNS.includes(columnKey) ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={`Resize ${label} column`}
          onMouseDown={(event) => onResizeStart(columnKey, event)}
          onDoubleClick={() => {
            /* reserved for future reset affordance */
          }}
          className="absolute inset-y-0 right-0 z-20 w-3 cursor-col-resize touch-none select-none"
        >
          <span className="absolute right-1 top-1/2 h-5 w-px -translate-y-1/2 bg-border transition-colors group-hover:bg-primary" />
        </div>
      ) : null}
    </TableHead>
  )
}

function getViewportWidth() {
  if (typeof window === "undefined") {
    return MAX_TABLE_LAYOUT_WIDTH
  }

  return window.innerWidth
}

function getInitialAvailableWidth() {
  return getAvailableTableWidth(getViewportWidth())
}

function getAvailableTableWidth(containerWidth: number) {
  return Math.min(Math.max(containerWidth, MIN_TABLE_WIDTH), MAX_TABLE_LAYOUT_WIDTH)
}

function getTotalColumnWidth(columnWidths: Record<ColumnKey, number>) {
  return Object.values(columnWidths).reduce((total, width) => total + width, 0)
}

const MIN_TABLE_WIDTH = getTotalColumnWidth(MIN_COLUMN_WIDTHS)

function getResponsiveColumnWidths(availableWidth: number): Record<ColumnKey, number> {
  if (availableWidth >= getTotalColumnWidth(DEFAULT_COLUMN_WIDTHS)) {
    return DEFAULT_COLUMN_WIDTHS
  }

  const compactBase = { ...COMPACT_COLUMN_WIDTHS }
  const reservedWidth =
    compactBase.timestamp +
    compactBase.severity +
    compactBase.source +
    compactBase.file +
    compactBase.action

  return {
    ...compactBase,
    message: Math.min(
      DEFAULT_COLUMN_WIDTHS.message,
      Math.max(MIN_COLUMN_WIDTHS.message, availableWidth - reservedWidth),
    ),
  }
}
