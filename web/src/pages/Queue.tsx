import { useState } from 'react';
import { useStore } from '../lib/requestsStore';
import { CheckCircle } from 'lucide-react';

const Queue = () => {
  const { requests, updateRequestStatus } = useStore();
  const [installingId, setInstallingId] = useState<string | null>(null);

  const inProgress = requests.filter(r => r.status === 'In Progress');

  const handleInstall = (id: string) => {
    updateRequestStatus(id, 'Installed', 'Completed via IT fulfillment queue');
    setTimeout(() => {
      updateRequestStatus(id, 'Closed', 'Automatically closed post-install');
    }, 1000);
    setInstallingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Fulfillment Queue</h1>
        <p className="text-muted-foreground">Active software installation tasks.</p>
      </div>

      <div className="flex-1 bg-muted/50 rounded-lg p-4 border border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold uppercase tracking-wider text-sm text-muted-foreground">In Progress</h2>
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">{inProgress.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inProgress.map(req => (
            <div key={req.id} className="flat-panel p-5 border-l-4 border-primary">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-muted-foreground">{req.id}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${req.urgency === 'Critical' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                  {req.urgency}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-1">{req.softwareName}</h3>
              <p className="text-sm text-muted-foreground mb-4">For: <strong className="text-foreground">{req.requester}</strong></p>
              
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded mb-4">
                Target Date: {req.requiredBy}
              </div>

              {installingId === req.id ? (
                <div className="flex gap-2">
                  <button onClick={() => setInstallingId(null)} className="flex-1 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">Cancel</button>
                  <button onClick={() => handleInstall(req.id)} className="flex-1 bg-success text-success-foreground py-2 rounded-md text-sm font-medium hover:bg-success/90 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Confirm
                  </button>
                </div>
              ) : (
                <button onClick={() => setInstallingId(req.id)} className="w-full border border-primary text-primary py-2 rounded-md text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                  Mark Installed
                </button>
              )}
            </div>
          ))}
          {inProgress.length === 0 && (
            <div className="col-span-full p-8 text-center text-muted-foreground bg-card border border-border border-dashed rounded-lg">
              Queue is empty.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Queue;
