import { useState } from 'react';
import { useStore } from '../lib/requestsStore';
import { StatusStamp } from '../components/StatusStamp';

const Approvals = () => {
  const { requests, updateRequestStatus } = useStore();
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const pendingApprovals = requests.filter(r => r.status === 'Manager Approval' || r.status === 'IT Approval');

  const handleApprove = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Manager Approval' ? 'IT Approval' : 'In Progress';
    updateRequestStatus(id, nextStatus, 'Approved via clearance portal');
  };

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) return;
    updateRequestStatus(id, 'Rejected', rejectReason);
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8 border-b border-line pb-4">
        <h1 className="mb-2">Approvals Ledger</h1>
        <p className="text-muted text-[15px]">Manifests pending your review and clearance.</p>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="flat-panel p-12 text-center text-muted">
          No pending approvals at this time.
        </div>
      ) : (
        <div className="flat-panel overflow-hidden w-full">
          <table className="ledger-table">
            <thead>
              <tr>
                <th className="w-1"></th>
                <th>Manifest ID</th>
                <th>Details</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map(req => (
                <tr key={req.id}>
                  <td className="p-0 w-1 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-held"></div>
                  </td>
                  <td>
                    <div className="font-mono text-ink mb-2">{req.id}</div>
                    <StatusStamp status={req.status} />
                  </td>
                  <td>
                    <div className="mb-1 font-medium text-ink">{req.softwareName} <span className="text-muted font-normal text-[13px]">v{req.version}</span></div>
                    <div className="text-[13px] text-muted mb-3">
                      Origin: <span className="font-medium text-ink">{req.requester}</span> ({req.department})<br/>
                      Required: <span className="font-mono">{req.requiredBy}</span>
                    </div>
                    <div className="leader-row max-w-sm">
                      <span className="leader-label">Justification</span>
                      <span className="leader-dots"></span>
                      <span className="leader-value text-[13px]">{req.justification}</span>
                    </div>
                  </td>
                  <td className="text-right align-middle">
                    {rejectingId === req.id ? (
                      <div className="text-left bg-background p-4 border border-line w-64 float-right">
                        <label className="block text-[13px] font-medium text-denied mb-2">Reason for denial:</label>
                        <textarea 
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          className="w-full px-2 py-1 border border-line rounded-none bg-surface focus:ring-1 focus:ring-brand focus:border-brand outline-none mb-3 text-[13px]"
                          rows={2}
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setRejectingId(null)} className="btn-secondary text-[13px] px-2 py-1">Cancel</button>
                          <button onClick={() => handleReject(req.id)} className="btn-destructive text-[13px] px-2 py-1">Confirm Denial</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 items-end">
                        <button onClick={() => handleApprove(req.id, req.status)} className="btn-primary w-24 text-center">
                          Clear
                        </button>
                        <button onClick={() => setRejectingId(req.id)} className="btn-destructive w-24 text-center">
                          Deny
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Approvals;
