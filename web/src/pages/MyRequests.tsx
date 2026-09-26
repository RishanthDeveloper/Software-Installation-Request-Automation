import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useStore } from '../lib/requestsStore'; import type { Request } from '../lib/requestsStore';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusStamp } from '../components/StatusStamp';
import { CheckpointStepper } from '../components/CheckpointStepper';

const MyRequests = () => {
  const { user } = useAuth();
  const { requests } = useStore();
  const [selected, setSelected] = useState<Request | null>(null);

  const myRequests = requests.filter(r => r.requester === user?.name);

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 relative h-[calc(100vh-8rem)] items-start p-4 md:p-6 lg:p-8">
      <div className="flex-1 overflow-y-auto w-full">
        <div className="flex justify-between items-end mb-6 pb-4 border-b border-line">
          <div>
            <h1 className="mb-2">My Requests</h1>
            <p className="text-muted text-[15px]">Track your software requests and manifest ledgers.</p>
          </div>
          <Link to="/requests/new" className="btn-primary">
            New Request
          </Link>
        </div>

        {myRequests.length === 0 ? (
          <div className="flat-panel p-12 text-center text-muted">
            You haven't made any requests yet.
          </div>
        ) : (
          <div className="flat-panel overflow-hidden w-full">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th className="w-1"></th>
                  <th>Manifest ID</th>
                  <th>Software</th>
                  <th>Required By</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map(req => {
                  let edgeColor = 'bg-held';
                  if (req.status === 'Closed' || req.status === 'Installed') edgeColor = 'bg-cleared';
                  if (req.status === 'Rejected') edgeColor = 'bg-denied';
                  if (req.status === 'In Progress') edgeColor = 'bg-brand';

                  return (
                    <tr key={req.id} onClick={() => setSelected(req)} className="hover:bg-black/5 cursor-pointer transition-colors group">
                      <td className="p-0 w-1 relative">
                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${edgeColor}`}></div>
                      </td>
                      <td className="font-mono text-muted">{req.id}</td>
                      <td className="font-medium text-ink">{req.softwareName}</td>
                      <td className="font-mono text-muted">{req.requiredBy}</td>
                      <td className="text-right">
                        <StatusStamp status={req.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="w-full md:w-96 bg-surface border border-line p-6 absolute right-4 top-4 bottom-4 md:static flex flex-col z-20">
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-line">
            <div>
              <div className="mono-label text-muted mb-1">{selected.id}</div>
              <h2 className="leading-tight">{selected.softwareName}</h2>
              <div className="mt-3">
                <StatusStamp status={selected.status} />
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="p-1 hover:bg-black/5 rounded-sm"><X className="w-5 h-5 text-muted" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <CheckpointStepper currentStatus={selected.status} isRestricted={selected.isRestricted} />
            
            <div className="mt-8 space-y-2">
              <div className="mono-label text-muted mb-4 border-b border-line pb-2">Manifest Details</div>
              
              <div className="leader-row">
                <span className="leader-label">Department</span>
                <span className="leader-dots"></span>
                <span className="leader-value">{selected.department}</span>
              </div>
              <div className="leader-row">
                <span className="leader-label">Version</span>
                <span className="leader-dots"></span>
                <span className="leader-value">{selected.version}</span>
              </div>
              <div className="leader-row">
                <span className="leader-label">Install Type</span>
                <span className="leader-dots"></span>
                <span className="leader-value">{selected.installType}</span>
              </div>
              <div className="leader-row">
                <span className="leader-label">Urgency</span>
                <span className="leader-dots"></span>
                <span className="leader-value">{selected.urgency}</span>
              </div>
              
              <div className="mt-6">
                <span className="leader-label block mb-2">Business Justification</span>
                <p className="text-[14px] leading-[20px] text-ink bg-background p-3 border border-line rounded-none">
                  {selected.justification}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
