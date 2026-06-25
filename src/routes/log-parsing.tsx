import { createFileRoute } from "@tanstack/react-router"
import { LogParsingPage } from "@/pages/log-parsing"

export interface LogParsingSearchParams {
  searchTerm?: string
  levelFilter?: string
  startTime?: string
  endTime?: string
  activeTab?: string
  selectedEntryIndex?: number
  currentPage?: number
  pageSize?: number
}

export const Route = createFileRoute("/log-parsing")({
  validateSearch: (search: Record<string, unknown>): LogParsingSearchParams => {
    return {
      searchTerm: typeof search.searchTerm === "string" ? search.searchTerm : undefined,
      levelFilter: typeof search.levelFilter === "string" ? search.levelFilter : undefined,
      startTime: typeof search.startTime === "string" ? search.startTime : undefined,
      endTime: typeof search.endTime === "string" ? search.endTime : undefined,
      activeTab: typeof search.activeTab === "string" ? search.activeTab : undefined,
      selectedEntryIndex: typeof search.selectedEntryIndex === "number" 
        ? search.selectedEntryIndex 
        : typeof search.selectedEntryIndex === "string"
        ? parseInt(search.selectedEntryIndex, 10)
        : undefined,
      currentPage: typeof search.currentPage === "number" 
        ? search.currentPage 
        : typeof search.currentPage === "string"
        ? parseInt(search.currentPage, 10)
        : undefined,
      pageSize: typeof search.pageSize === "number" 
        ? search.pageSize 
        : typeof search.pageSize === "string"
        ? parseInt(search.pageSize, 10)
        : undefined,
    }
  },
  component: LogParsingPage,
})
