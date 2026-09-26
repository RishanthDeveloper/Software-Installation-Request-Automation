import { useState } from 'react';
import { useStore } from '../lib/requestsStore';

const Approvals = () => {
  const { requests, updateRequestStatus } = useStore();
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const pendingApprovals = requests.filter(r => r.status === 'Manager Approval' || r.status === 'IT Approval');

  const handleApprove = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Manager Approval' ? 'IT Approval' : 'In Progress';
    updateRequestStatus(id, nextStatus, 'Approved via demo portal');
  };

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) return;
    updateRequestStatus(id, 'Rejected', rejectReason);
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Approvals</h1>
        <p className="text-muted-foreground">Requests pending your review.</p>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="flat-panel p-8 text-center text-muted-foreground">
          No pending approvals at this time.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map(req => (
            <div key={req.id} className="flat-panel p-6 border-l-4 border-warning">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm font-mono text-muted-foreground mb-1">{req.id}</div>
                  <h3 className="font-bold text-lg">{req.softwareName} <span className="text-muted-foreground font-normal text-sm">v{req.version}</span></h3>
                  <div className="text-sm text-muted-foreground mt-1">
                    Requested by <strong>{req.requester}</strong> ({req.department})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium bg-warning/10 text-warning px-2 py-1 rounded">{req.status}</div>
                  <div className="text-xs text-muted-foreground mt-2">Required by: {req.requiredBy}</div>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md text-sm mb-4">
                <span className="font-medium">Justification:</span> {req.justification}
              </div>

              {rejectingId === req.id ? (
                <div className="bg-destructive/5 p-4 rounded-md border border-destructive/20">
                  <label className="block text-sm font-medium text-destructive mb-2">Reason for rejection:</label>
                  <textarea 
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-destructive focus:outline-none mb-3"
                    rows={2}
                  />
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setRejectingId(null)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">Cancel</button>
                    <button onClick={() => handleReject(req.id)} className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors">Confirm Rejection</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => handleApprove(req.id, req.status)} className="bg-success text-success-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-success/90 transition-colors">
                    Approve
                  </button>
                  <button onClick={() => setRejectingId(req.id)} className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm font-medium hover:bg-destructive/20 transition-colors">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Approvals;
