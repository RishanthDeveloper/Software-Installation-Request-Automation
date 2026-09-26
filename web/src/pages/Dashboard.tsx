const Dashboard = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div className="border-b border-line pb-4">
        <h1 className="mb-2">Analytics Manifest</h1>
        <p className="text-muted text-[15px]">High-level metrics on software requests and processing volume.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Handled", val: "142", color: "border-l-ink text-ink" },
          { label: "On Hold", val: "12", color: "border-l-held text-held" },
          { label: "In Transit", val: "8", color: "border-l-brand text-brand" },
          { label: "Cleared", val: "110", color: "border-l-cleared text-cleared" },
        ].map((stat, i) => (
          <div key={i} className={`flat-panel p-5 border-l-[3px] ${stat.color.split(' ')[0]}`}>
            <span className="mono-label text-muted">{stat.label}</span>
            <div className={`text-[32px] font-display mt-2 leading-none ${stat.color.split(' ')[1]}`}>{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flat-panel p-6 col-span-2">
          <h2 className="mb-6">Volume by Origin</h2>
          <div className="h-64 flex items-end gap-4 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-[40px]">
              <div className="border-t border-line border-dashed w-full opacity-50"></div>
              <div className="border-t border-line border-dashed w-full opacity-50"></div>
              <div className="border-t border-line border-dashed w-full opacity-50"></div>
              <div className="border-t border-line border-dashed w-full opacity-50"></div>
            </div>
            
            <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none" className="z-10 relative">
              <rect x="20" y="50" width="40" height="150" fill="var(--brand)" rx="0" />
              <rect x="90" y="80" width="40" height="120" fill="var(--brand)" rx="0" />
              <rect x="160" y="30" width="40" height="170" fill="var(--brand)" rx="0" />
              <rect x="230" y="120" width="40" height="80" fill="var(--brand)" rx="0" />
              
              <text x="40" y="40" textAnchor="middle" className="mono-label" fill="var(--muted)">45</text>
              <text x="110" y="70" textAnchor="middle" className="mono-label" fill="var(--muted)">32</text>
              <text x="180" y="20" textAnchor="middle" className="mono-label" fill="var(--muted)">58</text>
              <text x="250" y="110" textAnchor="middle" className="mono-label" fill="var(--muted)">15</text>
              
              <text x="40" y="215" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--ink)">VS Code</text>
              <text x="110" y="215" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--ink)">IntelliJ</text>
              <text x="180" y="215" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--ink)">Docker</text>
              <text x="250" y="215" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--ink)">Photoshop</text>
            </svg>
          </div>
        </div>

        <div className="flat-panel p-6 flex flex-col">
          <h2 className="mb-6">SLA Status</h2>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="60" fill="none" stroke="var(--denied)" strokeWidth="20" />
              <circle cx="80" cy="80" r="60" fill="none" stroke="var(--cleared)" strokeWidth="20" strokeDasharray="377" strokeDashoffset="37" transform="rotate(-90 80 80)" />
              <text x="80" y="88" textAnchor="middle" className="font-display" fontSize="28" fill="var(--ink)">90%</text>
            </svg>
            <div className="flex gap-6 mt-8">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-cleared"></div><span className="mono-label text-ink">CLEARED</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-denied"></div><span className="mono-label text-ink">BREACHED</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
