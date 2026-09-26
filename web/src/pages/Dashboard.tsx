

const Dashboard = () => {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Analytics Dashboard</h1>
        <p className="text-muted-foreground">High-level metrics on software requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Requests", val: "142", color: "text-foreground" },
          { label: "Pending Approvals", val: "12", color: "text-warning" },
          { label: "In Progress", val: "8", color: "text-primary" },
          { label: "Completed", val: "110", color: "text-success" },
        ].map((stat, i) => (
          <div key={i} className="flat-panel p-4 left-border-accent">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
            <div className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flat-panel p-6 col-span-2">
          <h3 className="font-semibold mb-4 text-lg">Requests by Software</h3>
          <div className="h-64 flex items-end gap-4">
            {/* Simple SVG Bar Chart */}
            <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
              <rect x="20" y="50" width="40" height="150" fill="var(--primary)" rx="4" />
              <rect x="90" y="80" width="40" height="120" fill="var(--primary)" rx="4" />
              <rect x="160" y="30" width="40" height="170" fill="var(--primary)" rx="4" />
              <rect x="230" y="120" width="40" height="80" fill="var(--primary)" rx="4" />
              
              <text x="40" y="40" textAnchor="middle" fontSize="12" fill="var(--muted-foreground)">45</text>
              <text x="110" y="70" textAnchor="middle" fontSize="12" fill="var(--muted-foreground)">32</text>
              <text x="180" y="20" textAnchor="middle" fontSize="12" fill="var(--muted-foreground)">58</text>
              <text x="250" y="110" textAnchor="middle" fontSize="12" fill="var(--muted-foreground)">15</text>
              
              <text x="40" y="215" textAnchor="middle" fontSize="10" fill="currentColor">VS Code</text>
              <text x="110" y="215" textAnchor="middle" fontSize="10" fill="currentColor">IntelliJ</text>
              <text x="180" y="215" textAnchor="middle" fontSize="10" fill="currentColor">Docker</text>
              <text x="250" y="215" textAnchor="middle" fontSize="10" fill="currentColor">Photoshop</text>
            </svg>
          </div>
        </div>

        <div className="flat-panel p-6">
          <h3 className="font-semibold mb-4 text-lg">SLA Compliance</h3>
          <div className="h-64 flex flex-col items-center justify-center">
            {/* Simple SVG Donut */}
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="60" fill="none" stroke="var(--destructive)" strokeWidth="20" />
              <circle cx="80" cy="80" r="60" fill="none" stroke="var(--success)" strokeWidth="20" strokeDasharray="377" strokeDashoffset="37" transform="rotate(-90 80 80)" />
              <text x="80" y="85" textAnchor="middle" fontSize="24" fontWeight="bold" fill="currentColor">90%</text>
            </svg>
            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success"></div><span className="text-sm">Met</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive"></div><span className="text-sm">Breached</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
