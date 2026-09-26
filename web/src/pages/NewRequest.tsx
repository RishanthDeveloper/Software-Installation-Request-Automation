import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { AlertTriangle } from 'lucide-react';
import { useStore } from '../lib/requestsStore'; import type { Request } from '../lib/requestsStore';
import { CheckpointStepper } from '../components/CheckpointStepper';

const CATALOG = [
  { id: 'c1', name: 'Visual Studio Code', restricted: false },
  { id: 'c2', name: 'IntelliJ IDEA', restricted: false },
  { id: 'c3', name: 'Eclipse', restricted: false },
  { id: 'c4', name: 'Python', restricted: false },
  { id: 'c5', name: 'Java JDK', restricted: false },
  { id: 'c6', name: 'Node.js', restricted: false },
  { id: 'c7', name: 'Git', restricted: false },
  { id: 'c8', name: 'Docker', restricted: false },
  { id: 'c9', name: 'Postman', restricted: false },
  { id: 'c10', name: 'Adobe Photoshop', restricted: true },
  { id: 'c11', name: 'Adobe Acrobat Pro', restricted: true },
  { id: 'c12', name: 'Microsoft Office', restricted: false },
  { id: 'other', name: 'Other (Please specify)', restricted: true },
];

export const NewRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addRequest } = useStore();
  const [step, setStep] = useState(1);
  const [submittedReqId, setSubmittedReqId] = useState('');
  
  const [formData, setFormData] = useState({
    department: 'Engineering',
    software: '',
    version: 'Latest',
    installType: 'New Install',
    justification: '',
    urgency: 'Medium',
    requiredBy: '',
    comments: '',
  });

  const selectedSoftware = CATALOG.find(s => s.id === formData.software);
  const isRestricted = selectedSoftware?.restricted;
  
  const handleNext = () => {
    if (step === 1 && formData.software) setStep(2);
    if (step === 2 && formData.justification.length >= 20 && formData.requiredBy) setStep(3);
  };

  const handleSubmit = () => {
    const year = new Date().getFullYear();
    const rand5 = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
    const reqId = `SWR-${year}-${rand5}`;
    setSubmittedReqId(reqId);
    
    const newReq: Request = {
      id: reqId,
      ...formData,
      softwareName: selectedSoftware?.name || 'Unknown',
      requester: user?.name || 'Unknown',
      status: 'Requested',
      isRestricted,
      history: [{ status: 'Requested', date: new Date().toISOString() }]
    };
    
    addRequest(newReq);
    setStep(4);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-6 lg:p-8">
      <div className="border-b border-line pb-4">
        <h1 className="mb-2">New Request Manifest</h1>
        <p className="text-muted text-[15px]">Submit a new software installation request to IT.</p>
      </div>

      <div className="flex items-center justify-between mb-8 pb-4">
        {['Software Details', 'Justification', 'Review', 'Confirmation'].map((label, idx) => {
          const num = idx + 1;
          const isActive = step === num;
          const isPast = step > num;
          return (
            <div key={num} className="flex flex-col items-center gap-2">
              <div className={`w-6 h-6 border-[1.5px] flex items-center justify-center mono-label rounded-none transition-colors duration-400 ease-out
                ${isActive ? 'border-held text-ink ring-2 ring-held' : isPast ? 'border-brand bg-brand text-surface' : 'border-line text-muted'}`}>
                {num}
              </div>
              <span className={`text-[10px] font-mono uppercase tracking-wider hidden sm:block ${isActive || isPast ? 'text-ink' : 'text-muted'}`}>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="flat-panel p-6 sm:p-8">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] text-muted mb-1">Requester</label>
                <input type="text" disabled value={user?.name} className="w-full px-3 py-2 border border-line bg-background text-muted cursor-not-allowed rounded-sm outline-none" />
              </div>
              <div>
                <label className="block text-[13px] text-muted mb-1">Department</label>
                <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border border-line bg-surface focus:ring-1 focus:ring-brand focus:border-brand rounded-sm outline-none">
                  <option>Engineering</option><option>Marketing</option><option>Sales</option><option>HR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] text-muted mb-1">Software</label>
              <select value={formData.software} onChange={e => setFormData({...formData, software: e.target.value})} className="w-full px-3 py-2 border border-line bg-surface focus:ring-1 focus:ring-brand focus:border-brand rounded-sm outline-none">
                <option value="" disabled>Select from catalog...</option>
                {CATALOG.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] text-muted mb-1">Version</label>
                <input type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} className="w-full px-3 py-2 border border-line bg-surface focus:ring-1 focus:ring-brand focus:border-brand rounded-sm outline-none" />
              </div>
              <div>
                <label className="block text-[13px] text-muted mb-1">Installation Type</label>
                <select value={formData.installType} onChange={e => setFormData({...formData, installType: e.target.value})} className="w-full px-3 py-2 border border-line bg-surface focus:ring-1 focus:ring-brand focus:border-brand rounded-sm outline-none">
                  <option>New Install</option><option>Upgrade</option><option>Reinstall</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={handleNext} disabled={!formData.software} className="btn-primary disabled:opacity-50">
                Proceed
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-[13px] text-muted">Business Justification</label>
                <span className={`text-[11px] font-mono ${formData.justification.length < 20 ? 'text-held' : 'text-cleared'}`}>{formData.justification.length}/20 min</span>
              </div>
              <textarea 
                rows={4}
                value={formData.justification} 
                onChange={e => setFormData({...formData, justification: e.target.value})} 
                className="w-full px-3 py-2 border border-line bg-surface focus:ring-1 focus:ring-brand focus:border-brand rounded-sm outline-none"
                placeholder="Why is this software required? Please provide detailed business context."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] text-muted mb-1">Urgency</label>
                <select value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})} className="w-full px-3 py-2 border border-line bg-surface focus:ring-1 focus:ring-brand focus:border-brand rounded-sm outline-none">
                  <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] text-muted mb-1">Required By Date</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.requiredBy} 
                  onChange={e => setFormData({...formData, requiredBy: e.target.value})} 
                  className="w-full px-3 py-2 border border-line bg-surface focus:ring-1 focus:ring-brand focus:border-brand rounded-sm outline-none font-mono" 
                />
              </div>
            </div>

            {formData.urgency === 'Critical' && formData.requiredBy && new Date(formData.requiredBy) > new Date(Date.now() + 86400000) && (
              <div className="bg-background border border-line p-3 flex gap-3 rounded-none">
                <AlertTriangle className="w-5 h-5 shrink-0 text-held" />
                <span className="text-[13px] text-ink">You selected Critical urgency, but the date is more than 1 day out. IT will deprioritize accordingly.</span>
              </div>
            )}

            <div>
              <label className="block text-[13px] text-muted mb-1">Additional Comments <span className="font-normal">(Optional)</span></label>
              <textarea rows={2} value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} className="w-full px-3 py-2 border border-line bg-surface focus:ring-1 focus:ring-brand focus:border-brand rounded-sm outline-none" />
            </div>

            <div className="pt-4 flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
              <button onClick={handleNext} disabled={formData.justification.length < 20 || !formData.requiredBy} className="btn-primary disabled:opacity-50">
                Review Manifest
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            {isRestricted && (
              <div className="bg-background border border-line p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-held" />
                <div>
                  <div className="mono-label text-held mb-1">RESTRICTED SOFTWARE</div>
                  <div className="text-[13px] text-ink">This software requires additional IT Manager approval and depends on available license pool limits.</div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="leader-row">
                <span className="leader-label">Software</span>
                <span className="leader-dots"></span>
                <span className="leader-value">
                  {selectedSoftware?.name} (v: {formData.version})
                  <button onClick={() => setStep(1)} className="ml-3 text-brand hover:underline text-[11px] font-mono uppercase">Edit</button>
                </span>
              </div>
              <div className="leader-row">
                <span className="leader-label">Installation</span>
                <span className="leader-dots"></span>
                <span className="leader-value">{formData.installType}</span>
              </div>
              <div className="leader-row">
                <span className="leader-label">Urgency & Date</span>
                <span className="leader-dots"></span>
                <span className="leader-value">
                  {formData.urgency} — <span className="font-mono">{formData.requiredBy}</span>
                  <button onClick={() => setStep(2)} className="ml-3 text-brand hover:underline text-[11px] font-mono uppercase">Edit</button>
                </span>
              </div>
              <div className="mt-6">
                <span className="leader-label block mb-2">Business Justification</span>
                <p className="text-[14px] leading-[20px] text-ink bg-background p-3 border border-line rounded-none">
                  {formData.justification}
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
              <button onClick={handleSubmit} className="btn-primary">
                Submit Manifest
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-10 space-y-8 animate-fade-in">
            <h2 className="mb-2">Manifest Submitted</h2>
            <div className="inline-block border border-line p-4">
              <div className="mono-label text-muted mb-1">MANIFEST ID</div>
              <div className="font-mono text-2xl text-ink tracking-tight">{submittedReqId}</div>
            </div>
            
            <div className="pt-6 max-w-md mx-auto">
              <CheckpointStepper currentStatus="Requested" isRestricted={isRestricted} />
            </div>

            <div className="pt-8">
              <button onClick={() => navigate('/requests')} className="text-brand text-[15px] hover:underline font-medium">
                View Manifest Ledger
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewRequest;
