"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

// Stubbed catalog data
const MOCK_CATALOG = [
  { id: "soft_1", name: "Visual Studio Code", isRestricted: false, licenses: 999 },
  { id: "soft_2", name: "IntelliJ IDEA Ultimate", isRestricted: true, licenses: 5 },
  { id: "soft_3", name: "Adobe Photoshop", isRestricted: true, licenses: 2 },
  { id: "soft_4", name: "Docker Desktop", isRestricted: false, licenses: 999 },
]

const requestSchema = z.object({
  softwareId: z.string().min(1, "Please select a software"),
  installType: z.enum(["new", "upgrade", "reinstall"]),
  version: z.string().min(1, "Version is required"),
  justification: z.string().min(20, "Business justification must be at least 20 characters"),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  requiredBy: z.string().refine((dateStr) => {
    if (!dateStr) return false;
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, { message: "Required date cannot be in the past" }),
  comments: z.string().optional()
})

type RequestFormValues = z.infer<typeof requestSchema>

export default function NewRequestPage() {
  const [step, setStep] = useState(1)
  const [submittedReqId, setSubmittedReqId] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    mode: "onChange",
    defaultValues: {
      installType: "new",
      urgency: "medium",
      version: "Latest",
      justification: "",
    }
  })

  const formValues = watch()
  const charCount = formValues.justification?.length || 0
  const selectedSoftware = MOCK_CATALOG.find(s => s.id === formValues.softwareId)

  const handleNext = async () => {
    let isValid = false
    if (step === 1) {
      isValid = await trigger(["softwareId", "installType", "version"])
    } else if (step === 2) {
      isValid = await trigger(["justification", "urgency", "requiredBy"])
    }
    if (isValid) setStep(s => s + 1)
  }

  const onSubmit = async (data: RequestFormValues) => {
    // API mock - will wire to ServiceNow in Prompt 8
    console.log("Submitting:", data)
    setTimeout(() => {
      setSubmittedReqId(`REQ-${Math.floor(Math.random() * 10000)}`)
      setStep(4)
    }, 800)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Request Software Installation</h1>
        <p className="text-muted-foreground">Follow the steps to submit a new IT request.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        {[
          { num: 1, label: "Software" },
          { num: 2, label: "Details" },
          { num: 3, label: "Review" },
          { num: 4, label: "Confirmation" }
        ].map((s, idx) => {
          const isActive = step === s.num
          const isPast = step > s.num
          return (
            <div key={s.num} className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors",
                isActive ? "bg-primary text-primary-foreground" : 
                isPast ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
              )}>
                {isPast ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span className={cn(
                "text-xs font-medium uppercase tracking-wider",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>{s.label}</span>
            </div>
          )
        })}
      </div>

      {/* Form Area */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-6 sm:p-8">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <label className="block text-sm font-medium mb-2">Software Catalog</label>
              <select {...register("softwareId")} className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">-- Select Software --</option>
                {MOCK_CATALOG.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {errors.softwareId && <p className="text-destructive text-sm mt-1">{errors.softwareId.message}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Installation Type</label>
                <select {...register("installType")} className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="new">New Installation</option>
                  <option value="upgrade">Upgrade</option>
                  <option value="reinstall">Reinstall / Repair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Version</label>
                <input type="text" {...register("version")} className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="e.g. Latest, 2024.1" />
                {errors.version && <p className="text-destructive text-sm mt-1">{errors.version.message}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <label className="block text-sm font-medium mb-2 flex justify-between">
                Business Justification
                <span className={cn("text-xs", charCount < 20 ? "text-warning" : "text-success")}>
                  {charCount}/20 min
                </span>
              </label>
              <textarea 
                {...register("justification")} 
                className="w-full p-3 border border-input rounded-md bg-background text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Why do you need this software? Be specific."
              />
              {errors.justification && <p className="text-destructive text-sm mt-1">{errors.justification.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Urgency</label>
                <select {...register("urgency")} className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="low">Low (2 Business Days)</option>
                  <option value="medium">Medium (1 Business Day)</option>
                  <option value="high">High (8 Hours)</option>
                  <option value="critical">Critical (4 Hours)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Required By Date</label>
                <input type="date" {...register("requiredBy")} className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                {errors.requiredBy && <p className="text-destructive text-sm mt-1">{errors.requiredBy.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Comments (Optional)</label>
              <textarea {...register("comments")} className="w-full p-3 border border-input rounded-md bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-lg font-medium border-b border-border pb-2">Review Request</h3>
            
            {selectedSoftware?.isRestricted && (
              <div className="bg-warning/10 border border-warning/30 p-4 rounded-md flex gap-3 text-warning-foreground">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">Restricted Software Selected</p>
                  <p>This software requires both Manager and IT Asset Manager approval. There are currently <strong>{selectedSoftware.licenses} licenses</strong> remaining in the enterprise pool.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-muted-foreground">Software</div>
              <div className="font-medium">{selectedSoftware?.name} (v: {formValues.version})</div>
              
              <div className="text-muted-foreground">Install Type</div>
              <div className="font-medium capitalize">{formValues.installType}</div>
              
              <div className="text-muted-foreground">Urgency</div>
              <div className="font-medium capitalize">{formValues.urgency}</div>
              
              <div className="text-muted-foreground">Required By</div>
              <div className="font-medium">{formValues.requiredBy}</div>
              
              <div className="text-muted-foreground">Justification</div>
              <div className="font-medium">{formValues.justification}</div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-2 py-8">
            <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Request Submitted</h2>
              <p className="text-muted-foreground">Your request has been routed for approval.</p>
            </div>
            
            <div className="inline-block bg-muted px-4 py-2 rounded-md">
              <span className="text-sm text-muted-foreground uppercase tracking-widest mr-2">Request ID</span>
              <span className="mono-label text-lg font-bold">{submittedReqId}</span>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">Current Status:</p>
              <div className="flex justify-center items-center gap-2">
                <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded">Requested</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Manager Approval</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground disabled:opacity-50 hover:bg-muted rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit(onSubmit)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Submit Request <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
