"use client"

import { useState } from "react"
import { Check, X, ChevronDown, ChevronUp, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

// Stubbed data: sysapproval_approver joined with u_software_install_request
const MOCK_APPROVALS = [
  {
    sys_id: "appr_101",
    request_id: "REQ1045",
    requester: "Alex Johnson",
    department: "Marketing",
    software: "Adobe Photoshop CC",
    urgency: "High",
    justification: "Need Photoshop for the upcoming Q3 campaign assets. The current software doesn't support the required file formats from the agency. Need Photoshop for the upcoming Q3 campaign assets. The current software doesn't support the required file formats from the agency.",
    requiredBy: "2024-03-20",
    created: "2024-03-14T09:00:00Z",
  },
  {
    sys_id: "appr_102",
    request_id: "REQ1048",
    requester: "Sam Smith",
    department: "Engineering",
    software: "Docker Desktop Enterprise",
    urgency: "Medium",
    justification: "Required for running local containerized microservices for the new payment gateway integration.",
    requiredBy: "2024-03-25",
    created: "2024-03-15T14:30:00Z",
  }
]

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState(MOCK_APPROVALS)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rejectDialog, setRejectDialog] = useState<{ isOpen: boolean, sysId: string | null }>({ isOpen: false, sysId: null })
  const [rejectReason, setRejectReason] = useState("")

  const handleApprove = (sysId: string) => {
    // Optimistic update
    setApprovals(prev => prev.filter(a => a.sys_id !== sysId))
    // TODO: Wire to ServiceNow API: PATCH /api/now/table/sysapproval_approver/{sysId} { state: "approved" }
  }

  const handleReject = () => {
    if (!rejectDialog.sysId) return;
    // Optimistic update
    setApprovals(prev => prev.filter(a => a.sys_id !== rejectDialog.sysId))
    setRejectDialog({ isOpen: false, sysId: null })
    setRejectReason("")
    // TODO: Wire to ServiceNow API with rejectReason
  }

  // Stat calculations
  const pendingCount = approvals.length
  const oldestDate = approvals.length > 0 ? new Date(Math.min(...approvals.map(a => new Date(a.created).getTime()))) : null
  const daysOldest = oldestDate ? Math.floor((new Date().getTime() - oldestDate.getTime()) / (1000 * 3600 * 24)) : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Approvals Inbox</h1>
        <p className="text-muted-foreground">Review and action software requests assigned to you.</p>
      </div>

      {/* Stat Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-lg shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-warning/20 text-warning flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold">{pendingCount}</p>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Pending Approvals</p>
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-lg shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-primary/10 text-primary flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold">1.4h</p>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Avg Time-to-Decision</p>
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-lg shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-destructive/10 text-destructive flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold">{daysOldest} {daysOldest === 1 ? 'day' : 'days'}</p>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Oldest Request</p>
          </div>
        </div>
      </div>

      {/* Queue */}
      <div className="space-y-4">
        {approvals.length === 0 ? (
          <div className="text-center p-12 bg-card border border-border rounded-lg shadow-sm">
            <Check className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Inbox Zero</h3>
            <p className="text-muted-foreground">You have no pending approvals. Great job!</p>
          </div>
        ) : (
          approvals.map((req) => {
            const isExpanded = expandedId === req.sys_id
            return (
              <div key={req.sys_id} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden animate-in fade-in">
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left block */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="mono-label text-muted-foreground">{req.request_id}</span>
                      <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-semibold uppercase">{req.urgency} Urgency</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{req.software}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Requested by <span className="font-medium text-foreground">{req.requester}</span> ({req.department})
                    </p>
                  </div>

                  {/* Middle block: Dates */}
                  <div className="text-sm text-muted-foreground md:border-l md:border-border md:pl-6">
                    <p>Required by: <span className="font-medium text-foreground">{req.requiredBy}</span></p>
                    <p>Submitted: {new Date(req.created).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 md:border-l md:border-border md:pl-6">
                    <button 
                      onClick={() => handleApprove(req.sys_id)}
                      className="flex items-center gap-2 bg-success text-success-foreground px-4 py-2 rounded font-medium hover:bg-success/90 transition-colors"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button 
                      onClick={() => setRejectDialog({ isOpen: true, sysId: req.sys_id })}
                      className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded font-medium hover:bg-destructive/20 transition-colors"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>

                {/* Justification toggle */}
                <div className="border-t border-border bg-muted/30">
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : req.sys_id)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isExpanded ? <><ChevronUp className="w-4 h-4"/> Hide Justification</> : <><ChevronDown className="w-4 h-4"/> View Justification</>}
                  </button>
                  {isExpanded && (
                    <div className="p-5 pt-0 text-sm text-foreground">
                      <strong className="block mb-1 text-muted-foreground">Business Justification:</strong>
                      <p className="leading-relaxed bg-background p-4 rounded border border-border">{req.justification}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Reject Dialog */}
      {rejectDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setRejectDialog({ isOpen: false, sysId: null })} />
          <div className="relative bg-card border border-border p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-2">Reject Request</h3>
            <p className="text-sm text-muted-foreground mb-4">Please provide a reason for rejecting this software request. This will be visible to the employee.</p>
            
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 border border-input rounded bg-background text-sm min-h-[100px] mb-4"
              placeholder="e.g., No available licenses, or alternative software exists."
            />
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setRejectDialog({ isOpen: false, sysId: null })}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-destructive text-destructive-foreground text-sm font-medium rounded hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
