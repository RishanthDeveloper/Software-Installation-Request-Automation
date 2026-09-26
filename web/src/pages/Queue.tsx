import { useState } from 'react';
import { useStore } from '../lib/requestsStore';
import { StatusStamp } from '../components/StatusStamp';

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
    <div className="max-w-5xl mx-auto flex flex-col p-4 md:p-6 lg:p-8">
      <div className="mb-8 border-b border-line pb-4">
        <h1 className="mb-2">Fulfillment Manifest</h1>
        <p className="text-muted text-[15px]">Active software installation tasks in transit.</p>
      </div>

      <div className="flat-panel p-0 overflow-hidden w-full">
        <table className="ledger-table">
          <thead>
            <tr>
              <th className="w-1"></th>
              <th>Manifest ID</th>
              <th>Destination</th>
              <th>Software</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {inProgress.map(req => (
              <tr key={req.id}>
                <td className="p-0 w-1 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand"></div>
                </td>
                <td>
                  <div className="font-mono text-ink mb-2">{req.id}</div>
                  <StatusStamp status={req.status} />
                </td>
                <td>
                  <div className="font-medium text-ink">{req.requester}</div>
                  <div className="text-[13px] text-muted">Required: <span className="font-mono">{req.requiredBy}</span></div>
                  <div className="text-[13px] text-muted mt-1 uppercase tracking-widest">{req.urgency}</div>
                </td>
                <td>
                  <div className="font-medium text-ink">{req.softwareName}</div>
                  <div className="text-[13px] text-muted">v{req.version} - {req.installType}</div>
                </td>
                <td className="text-right align-middle">
                  {installingId === req.id ? (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setInstallingId(null)} className="btn-secondary">Cancel</button>
                      <button onClick={() => handleInstall(req.id)} className="bg-cleared text-surface rounded-sm px-4 py-2 font-sans text-[15px] hover:brightness-110 transition-colors border border-cleared">
                        Confirm Install
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setInstallingId(req.id)} className="btn-primary">
                      Mark Installed
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {inProgress.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-muted">
                  Queue is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Queue;
