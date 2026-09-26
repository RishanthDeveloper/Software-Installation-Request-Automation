import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useStore } from '../lib/requestsStore'; import type { Request } from '../lib/requestsStore';
import { ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyRequests = () => {
  const { user } = useAuth();
  const { requests } = useStore();
  const [selected, setSelected] = useState<Request | null>(null);

  const myRequests = requests.filter(r => r.requester === user?.name);

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 relative h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">My Requests</h1>
            <p className="text-muted-foreground">Track your software requests.</p>
          </div>
          <Link to="/requests/new" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors">
            New Request
          </Link>
        </div>

        {myRequests.length === 0 ? (
          <div className="flat-panel p-12 text-center text-muted-foreground">
            You haven't made any requests yet.
          </div>
        ) : (
          <div className="flat-panel overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Software</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Required By</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map(req => (
                  <tr key={req.id} onClick={() => setSelected(req)} className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors group">
                    <td className="px-4 py-3 font-mono text-muted-foreground">{req.id}</td>
                    <td className="px-4 py-3 font-medium">{req.softwareName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium
                        ${req.status === 'Closed' || req.status === 'Installed' ? 'bg-success/10 text-success' : 
                          req.status === 'Rejected' ? 'bg-destructive/10 text-destructive' : 
                          req.status === 'In Progress' ? 'bg-primary/10 text-primary' : 
                          'bg-warning/10 text-warning'}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{req.requiredBy}</td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="w-full md:w-80 bg-card border border-border shadow-lg rounded-lg p-5 absolute right-0 top-0 bottom-0 md:static flex flex-col z-20">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
            <div>
              <div className="text-xs font-mono text-muted-foreground">{selected.id}</div>
              <h3 className="font-bold text-lg leading-tight">{selected.softwareName}</h3>
            </div>
            <button onClick={() => setSelected(null)} className="p-1 hover:bg-muted rounded-md"><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <h4 className="font-medium text-sm mb-4 text-muted-foreground uppercase tracking-wider">History</h4>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
              {selected.history.map((h, i) => {
                const isError = h.status === 'Rejected';
                const isSuccess = h.status === 'Closed' || h.status === 'Installed';
                const color = isError ? 'bg-destructive' : isSuccess ? 'bg-success' : 'bg-primary';
                return (
                  <div key={i} className="relative flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full border-4 border-card flex-shrink-0 z-10 ${color}`}></div>
                    <div className="pt-0.5">
                      <p className={`text-sm font-medium ${isError ? 'text-destructive' : 'text-foreground'}`}>{h.status}</p>
                      <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleString()}</p>
                      {h.note && (
                        <p className="text-xs mt-1 bg-muted p-2 rounded border border-border text-foreground">{h.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
