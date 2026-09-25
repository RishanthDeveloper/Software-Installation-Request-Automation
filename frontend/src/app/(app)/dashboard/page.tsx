"use client"

import { useQuery } from "@tanstack/react-query"
import { ServiceNowAPI } from "@/lib/api/servicenow"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Loader2, Activity, CheckCircle2, Clock, XCircle, LayoutDashboard } from "lucide-react"

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: ServiceNowAPI.getDashboardStats
  })

  if (isLoading || !stats) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Analytics Dashboard</h1>
        <p className="text-muted-foreground">High-level metrics on software requests and SLA compliance.</p>
      </div>

      {/* Main KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Requests", val: stats.totals.total, color: "text-foreground", icon: LayoutDashboard },
          { label: "Pending", val: stats.totals.pending, color: "text-warning", icon: Clock },
          { label: "In Progress", val: stats.totals.inProgress, color: "text-primary", icon: Activity },
          { label: "Completed", val: stats.totals.completed, color: "text-success", icon: CheckCircle2 },
          { label: "Rejected", val: stats.totals.rejected, color: "text-destructive", icon: XCircle },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-4 rounded-lg shadow-sm flex flex-col justify-between h-24">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <span className="text-3xl font-bold">{stat.val}</span>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Requests by Software */}
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm col-span-2">
          <h3 className="font-semibold mb-6">Requests by Software</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.softwareSplit}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm flex flex-col">
          <h3 className="font-semibold mb-2">SLA Compliance</h3>
          <p className="text-sm text-muted-foreground mb-6">Met vs breached targets</p>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.slaStatus}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.slaStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success"></div><span className="text-sm">Met (92%)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive"></div><span className="text-sm">Breach (8%)</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
