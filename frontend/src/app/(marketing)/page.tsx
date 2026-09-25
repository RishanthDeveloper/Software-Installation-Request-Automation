"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  ArrowRight, Activity, Clock, ShieldCheck, MailX, Check, 
  Lock, Zap, Server, ChevronRight 
} from "lucide-react"
import { cn } from "@/lib/utils"

function TrackerMock() {
  const states = [
    { label: "Requested", time: "09:00 AM" },
    { label: "Manager Approval", time: "09:15 AM" },
    { label: "IT Approval", time: "09:42 AM" },
    { label: "In Progress", time: "10:10 AM" },
    { label: "Installed", time: "10:25 AM" },
  ]
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setActiveStep(states.length - 1)
      return
    }

    // Deliberate motion: animate through states on load
    const timer = setInterval(() => {
      setActiveStep(prev => (prev < states.length - 1 ? prev + 1 : prev))
    }, 800)
    return () => clearInterval(timer)
  }, [states.length])

  return (
    <div className="bg-card border-border border rounded-lg shadow-sm p-6 w-full max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${((activeStep + 1) / states.length) * 100}%` }}
        />
      </div>
      <div className="flex justify-between items-center mb-6 mt-2">
        <div>
          <p className="mono-label text-muted-foreground">REQ-1042</p>
          <h3 className="font-semibold text-lg">IntelliJ IDEA Ultimate</h3>
        </div>
        <span className="bg-success/10 text-success font-semibold px-2 py-1 rounded text-xs uppercase tracking-wider">
          {states[activeStep].label}
        </span>
      </div>
      
      <div className="space-y-4">
        {states.map((step, idx) => {
          const isPast = idx < activeStep
          const isActive = idx === activeStep
          const isFuture = idx > activeStep
          
          return (
            <div key={step.label} className={cn("flex items-start gap-3 transition-opacity duration-500", isFuture && "opacity-40 grayscale")}>
              <div className="mt-0.5">
                {isPast || isActive ? (
                  <CheckCircle2 className={cn("w-5 h-5", isActive ? "text-primary animate-pulse" : "text-success")} />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted" />
                )}
              </div>
              <div className="flex-1">
                <p className={cn("text-sm font-medium", (isPast || isActive) ? "text-foreground" : "text-muted-foreground")}>
                  {step.label}
                </p>
                {(isPast || isActive) && <p className="text-xs text-muted-foreground mt-0.5">{step.time}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CheckCircle2(props: any) {
  return <Check className={props.className} />
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/20">
      {/* 1. Hero */}
      <section className="flex-1 w-full flex flex-col justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 max-w-xl">
            <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight text-balance text-foreground leading-tight">
              Stop chasing <br className="hidden lg:block"/> software installs.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed text-balance">
              Drop the email chains and Slack pings. Request tools, get automatic multi-tier approvals, and track SLAs instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/requests/new" className="inline-flex items-center justify-center bg-primary text-primary-foreground font-medium h-12 px-6 rounded-md shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                Request software
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link href="#how-it-works" className="inline-flex items-center justify-center bg-transparent border border-input text-foreground font-medium h-12 px-6 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                See how it works
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <TrackerMock />
          </div>
        </div>
      </section>

      {/* 2. Problem / Solution */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card panel-divider">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-3xl font-semibold">The old way is broken.</h2>
          <div className="grid sm:grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-md">
              <div className="flex items-center gap-3 mb-4 text-destructive">
                <MailX className="w-6 h-6" />
                <h3 className="font-semibold text-lg text-foreground">Email Chaos</h3>
              </div>
              <p className="text-muted-foreground">
                "Hey IT, did my manager approve that Adobe license?" Requests get buried in inboxes. Managers forget to reply. IT has no context. You wait a week for a 5-minute install.
              </p>
            </div>
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-md">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <Zap className="w-6 h-6" />
                <h3 className="font-semibold text-lg text-foreground">Governed Flow</h3>
              </div>
              <p className="text-muted-foreground">
                Submit a structured request. The system routes it to your manager, checks license availability, and tasks IT automatically. Everyone sees the exact same status, instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-semibold mb-4">The State Machine</h2>
            <p className="text-muted-foreground">A strict, predictable lifecycle for every single request.</p>
          </div>
          
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { step: "1", title: "Requested", desc: "Catalog form submitted" },
                { step: "2", title: "Manager Approval", desc: "Line manager signs off" },
                { step: "3", title: "IT Approval", desc: "If software is restricted" },
                { step: "4", title: "In Progress", desc: "IT fulfillment task active" },
                { step: "5", title: "Closed", desc: "Installed or rejected" },
              ].map((s, i) => (
                <div key={i} className="relative z-10 bg-card border border-border p-5 rounded-md shadow-sm">
                  <div className="w-8 h-8 bg-primary/10 text-primary font-bold rounded flex items-center justify-center mb-4">
                    {s.step}
                  </div>
                  <h4 className="font-semibold mb-1">{s.title}</h4>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Feature Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card panel-divider">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-semibold mb-12 text-center">Built for Speed and Compliance</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Feature 
              icon={<Server />}
              title="Service Catalog"
              desc="A curated, searchable list of approved software with pre-defined versions and license types."
            />
            <Feature 
              icon={<Activity />}
              title="Dynamic Routing"
              desc="Standard software goes straight to IT. Expensive licenses require an extra IT Asset Manager approval automatically."
            />
            <Feature 
              icon={<Clock />}
              title="SLA Tracking"
              desc="Urgent requests trigger 4-hour timers. Normal requests get 2 business days. Everyone is accountable."
            />
            <Feature 
              icon={<ShieldCheck />}
              title="License Compliance"
              desc="Checks the enterprise license pool before routing. Prevents unauthorized spending on restricted software."
            />
            <Feature 
              icon={<Check />}
              title="Duplicate Prevention"
              desc="Blocks concurrent duplicate requests for the same user and software so IT doesn't do double work."
            />
            <Feature 
              icon={<Lock />}
              title="Role-Based Dashboards"
              desc="Employees track status. Managers view pending approvals. IT works their fulfillment kanban board."
            />
          </div>
        </div>
      </section>

      {/* 5. Stats Strip (Sample Data) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-foreground text-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-around gap-8 text-center">
          {/* TODO: Wire these to real GET /api/now/stats endpoint later */}
          <div>
            <p className="text-4xl font-bold mb-2">18m</p>
            <p className="text-sm font-medium opacity-80 uppercase tracking-widest mono-label">Avg Resolution</p>
          </div>
          <div className="hidden md:block w-px bg-background/20" />
          <div>
            <p className="text-4xl font-bold mb-2">99.4%</p>
            <p className="text-sm font-medium opacity-80 uppercase tracking-widest mono-label">SLA Compliance</p>
          </div>
          <div className="hidden md:block w-px bg-background/20" />
          <div>
            <p className="text-4xl font-bold mb-2">12,402</p>
            <p className="text-sm font-medium opacity-80 uppercase tracking-widest mono-label">Requests Automated</p>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border bg-background text-center">
        <p className="text-sm text-muted-foreground">
          Software Installation Request Automation • Internal Open Source Project
        </p>
      </footer>
    </div>
  )
}

function Feature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 border border-border rounded-md bg-background flex flex-col">
      <div className="w-10 h-10 bg-secondary text-secondary-foreground rounded flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}
