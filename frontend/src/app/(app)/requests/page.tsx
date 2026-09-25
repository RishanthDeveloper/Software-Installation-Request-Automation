"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { RequestState } from "@/lib/types"
import { ChevronRight, ArrowUpDown, X, CheckCircle2, Clock, XCircle, TerminalSquare } from "lucide-react"
import { cn } from "@/lib/utils"

// Stubbed Request Data
const MOCK_REQUESTS = [
  {
    id: "REQ1042",
    software: "IntelliJ IDEA Ultimate",
    version: "2024.1",
    urgency: "Medium",
    state: "In Progress" as RequestState,
    date: "2024-03-12T09:00:00Z",
    history: [
      { state: "Requested", time: "2024-03-12T09:00:00Z" },
      { state: "Manager Approval", time: "2024-03-12T09:15:00Z" },
      { state: "IT Approval", time: "2024-03-12T10:30:00Z" },
      { state: "In Progress", time: "2024-03-12T10:45:00Z", note: "Task SCTASK-5002 assigned to Hardware Ops." },
    ]
  },
  {
    id: "REQ1038",
    software: "Adobe Photoshop",
    version: "CC",
    urgency: "High",
    state: "Rejected" as RequestState,
    date: "2024-03-10T14:20:00Z",
    history: [
      { state: "Requested", time: "2024-03-10T14:20:00Z" },
      { state: "Manager Approval", time: "2024-03-10T14:25:00Z" },
      { state: "Rejected", time: "2024-03-10T15:10:00Z", note: "IT Asset Manager rejected: No available licenses in the Enterprise pool." },
    ]
  },
  {
    id: "REQ1015",
    software: "Visual Studio Code",
    version: "Latest",
    urgency: "Low",
    state: "Installed" as RequestState,
    date: "2024-03-01T08:15:00Z",
    history: [
      { state: "Requested", time: "2024-03-01T08:15:00Z" },
      { state: "Manager Approval", time: "2024-03-01T08:45:00Z" },
      { state: "In Progress", time: "2024-03-01T08:46:00Z" },
      { state: "Installed", time: "2024-03-01T11:20:00Z" },
      { state: "Closed", time: "2024-03-01T11:20:00Z" },
    ]
  },
]

function getBadgeVariant(state: RequestState) {
  switch (state) {
    case "Requested":
    case "Manager Approval":
    case "IT Approval":
      return "warning"
    case "In Progress":
      return "default" // primary
    case "Installed":
    case "Closed":
      return "success"
    case "Rejected":
      return "destructive"
    default:
      return "muted"
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export default function MyRequestsPage() {
  const [selectedReq, setSelectedReq] = useState<typeof MOCK_REQUESTS[0] | null>(null)
  // Simple state for demo sorting
  const [sortOrder, setSortOrder] = useState<"asc"|"desc">("desc")

  const sortedRequests = [...MOCK_REQUESTS].sort((a, b) => {
    return sortOrder === "desc" 
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">My Requests</h1>
          <p className="text-muted-foreground">Track the status of your software installation requests.</p>
        </div>
        <Link href="/requests/new" className="inline-flex items-center justify-center bg-primary text-primary-foreground font-medium h-10 px-4 rounded-md shadow-sm hover:bg-primary/90 transition-colors">
          Request software
        </Link>
      </div>

      {sortedRequests.length === 0 ? (
        <div className="border border-border rounded-lg bg-card p-12 text-center flex flex-col items-center">
          <TerminalSquare className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No requests yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">You haven't requested any software yet. Need a new tool? Start a request to get it routed for approval.</p>
          <Link href="/requests/new" className="inline-flex items-center justify-center bg-primary text-primary-foreground font-medium h-10 px-4 rounded-md shadow-sm hover:bg-primary/90 transition-colors">
            Request software
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Request</th>
                  <th className="px-6 py-4 font-semibold">Software</th>
                  <th className="px-6 py-4 font-semibold">Urgency</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground transition-colors" onClick={() => setSortOrder(s => s === "asc" ? "desc" : "asc")}>
                    <div className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {sortedRequests.map((req) => (
                  <tr 
                    key={req.id} 
                    onClick={() => setSelectedReq(req)}
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-medium mono-label text-foreground">{req.id}</td>
                    <td className="px-6 py-4">{req.software}</td>
                    <td className="px-6 py-4">{req.urgency}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getBadgeVariant(req.state)}>{req.state}</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(req.date)}</td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-5 h-5 text-muted-foreground inline-block group-hover:text-foreground transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer Overlay */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedReq(null)} />
          <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <p className="mono-label text-muted-foreground mb-1">{selectedReq.id}</p>
                <h3 className="text-xl font-semibold">{selectedReq.software}</h3>
              </div>
              <button onClick={() => setSelectedReq(null)} className="p-2 hover:bg-muted rounded-full text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Current Status</span>
                <Badge variant={getBadgeVariant(selectedReq.state)}>{selectedReq.state}</Badge>
              </div>

              <h4 className="font-medium mb-6">Activity Timeline</h4>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent">
                {selectedReq.history.map((hist, i) => {
                  const isLast = i === selectedReq.history.length - 1;
                  const isError = hist.state === "Rejected"
                  
                  return (
                    <div key={i} className="relative flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full border-4 border-card flex flex-shrink-0 items-center justify-center z-10",
                        isError ? "bg-destructive text-destructive-foreground" : 
                        isLast && selectedReq.state !== "Closed" ? "bg-primary text-primary-foreground animate-pulse" : "bg-success text-success-foreground"
                      )}>
                        {isError ? <XCircle className="w-5 h-5" /> : 
                         isLast && selectedReq.state !== "Closed" ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <div className="pt-2 flex-1">
                        <p className={cn("text-sm font-semibold", isError && "text-destructive")}>{hist.state}</p>
                        <p className="text-xs text-muted-foreground mb-1">{formatDate(hist.time)} at {formatTime(hist.time)}</p>
                        {hist.note && (
                          <div className={cn("text-sm p-3 rounded-md mt-2 border", isError ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-muted border-border")}>
                            {hist.note}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
