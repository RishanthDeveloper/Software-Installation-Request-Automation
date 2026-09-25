"use client"

import { useState } from "react"
import { Clock, AlertTriangle, CheckCircle2, GripVertical, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type TaskStatus = "Assigned" | "In Progress" | "Installed"

type ITTask = {
  sys_id: string
  request_id: string
  task_number: string
  employee: string
  software: string
  priority: "Critical" | "High" | "Medium" | "Low"
  status: TaskStatus
  sla_due: string // ISO string
}

// Stubbed data for sc_task
const MOCK_TASKS: ITTask[] = [
  {
    sys_id: "task_1",
    request_id: "REQ1050",
    task_number: "SCTASK00101",
    employee: "Jane Doe",
    software: "Visual Studio Code",
    priority: "Medium",
    status: "Assigned",
    sla_due: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day future (Safe)
  },
  {
    sys_id: "task_2",
    request_id: "REQ1051",
    task_number: "SCTASK00102",
    employee: "Mark Smith",
    software: "Node.js LTS",
    priority: "High",
    status: "In Progress",
    sla_due: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours future (Warning)
  },
  {
    sys_id: "task_3",
    request_id: "REQ1052",
    task_number: "SCTASK00103",
    employee: "Sarah Connor",
    software: "Docker Desktop",
    priority: "Critical",
    status: "Assigned",
    sla_due: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour past (Breached/Danger)
  }
]

export default function QueuePage() {
  const [tasks, setTasks] = useState<ITTask[]>(MOCK_TASKS)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, taskId: string | null }>({ isOpen: false, taskId: null })

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault()
    if (!draggedTaskId) return

    const task = tasks.find(t => t.sys_id === draggedTaskId)
    if (!task || task.status === targetStatus) return

    if (targetStatus === "Installed") {
      // Require confirmation for moving to Installed
      setConfirmDialog({ isOpen: true, taskId: draggedTaskId })
    } else {
      // Optimistic update
      updateTaskStatus(draggedTaskId, targetStatus)
    }
    setDraggedTaskId(null)
  }

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.sys_id === taskId ? { ...t, status } : t))
    // TODO: Wire to ServiceNow API: PATCH /api/now/table/sc_task/{taskId} { state: ... }
  }

  const confirmInstall = () => {
    if (confirmDialog.taskId) {
      updateTaskStatus(confirmDialog.taskId, "Installed")
    }
    setConfirmDialog({ isOpen: false, taskId: null })
  }

  const COLUMNS: TaskStatus[] = ["Assigned", "In Progress", "Installed"]

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">IT Fulfillment Queue</h1>
        <p className="text-muted-foreground">Manage active software installation catalog tasks (SCTASK).</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col)
          return (
            <div 
              key={col}
              className="flex flex-col bg-muted/30 border border-border rounded-lg overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-border bg-card flex justify-between items-center">
                <h3 className="font-semibold uppercase tracking-wider text-sm">{col}</h3>
                <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              
              {/* Column Body */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                {colTasks.map(task => (
                  <TaskCard key={task.sys_id} task={task} onDragStart={handleDragStart} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Confirmation Dialog for "Installed" */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setConfirmDialog({ isOpen: false, taskId: null })} />
          <div className="relative bg-card border border-border p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center gap-3 text-warning mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-xl font-semibold text-foreground">Confirm Installation</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Are you sure you want to mark this software as Installed? This will automatically 
              close the SLA timer and consume a license from the enterprise pool.
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmDialog({ isOpen: false, taskId: null })}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmInstall}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm Install
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, onDragStart }: { task: ITTask, onDragStart: (e: React.DragEvent, id: string) => void }) {
  // Calculate SLA status
  const due = new Date(task.sla_due)
  const now = new Date()
  const hoursRemaining = (due.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  let slaState: "safe" | "warning" | "breached" = "safe"
  let slaText = ""

  if (hoursRemaining < 0) {
    slaState = "breached"
    slaText = `Breached by ${Math.abs(Math.round(hoursRemaining))}h`
  } else if (hoursRemaining <= 4) {
    slaState = "warning"
    slaText = `${Math.round(hoursRemaining)}h remaining`
  } else {
    slaState = "safe"
    slaText = `Due ${due.toLocaleDateString()}`
  }

  // Priority styling
  const prioColors = {
    Critical: "bg-destructive/10 text-destructive",
    High: "bg-warning/20 text-warning-foreground",
    Medium: "bg-primary/10 text-primary",
    Low: "bg-muted text-muted-foreground",
  }

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, task.sys_id)}
      className="bg-card border border-border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1">
          <GripVertical className="w-4 h-4 text-muted/50 -ml-1 group-hover:text-muted-foreground transition-colors" />
          <span className="mono-label text-muted-foreground">{task.task_number}</span>
        </div>
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded", prioColors[task.priority])}>
          {task.priority}
        </span>
      </div>

      <h4 className="font-semibold text-lg leading-tight mb-1">{task.software}</h4>
      <p className="text-sm text-muted-foreground mb-4">For: <span className="font-medium text-foreground">{task.employee}</span> ({task.request_id})</p>

      {/* SLA Footer */}
      <div className={cn(
        "flex items-center gap-1.5 text-xs font-semibold px-2 py-1.5 rounded-sm border",
        slaState === "breached" ? "bg-destructive/10 text-destructive border-destructive/20" :
        slaState === "warning" ? "bg-warning/10 text-warning border-warning/30" :
        "bg-secondary text-secondary-foreground border-transparent"
      )}>
        {slaState === "breached" ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
        <span>SLA: {slaText}</span>
      </div>
    </div>
  )
}
