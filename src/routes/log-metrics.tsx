import { createFileRoute } from "@tanstack/react-router"
import { LogMetricsPage } from "@/pages/log-metrics"

export const Route = createFileRoute("/log-metrics")({ component: LogMetricsPage })
