import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Check, ChevronRight, AlertTriangle } from 'lucide-react';
import { useStore } from '../lib/requestsStore'; import type { Request } from '../lib/requestsStore';

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
    const reqId = `SWR00100${Math.floor(Math.random() * 99)}`;
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Request Software</h1>
        <p className="text-muted-foreground">Submit a new software installation request to IT.</p>
      </div>

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        {['Software Details', 'Justification', 'Review', 'Confirmation'].map((label, idx) => {
          const num = idx + 1;
          const isActive = step === num;
          const isPast = step > num;
          return (
            <div key={num} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isActive ? 'bg-primary text-primary-foreground' : isPast ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                {isPast ? <Check className="w-5 h-5" /> : num}
              </div>
              <span className={`text-xs font-medium uppercase tracking-wider hidden sm:block ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="flat-panel p-6 sm:p-8">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Requester</label>
                <input type="text" disabled value={user?.name} className="w-full px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none">
                  <option>Engineering</option><option>Marketing</option><option>Sales</option><option>HR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Software</label>
              <select value={formData.software} onChange={e => setFormData({...formData, software: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none">
                <option value="" disabled>Select from catalog...</option>
                {CATALOG.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Version</label>
                <input type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Installation Type</label>
                <select value={formData.installType} onChange={e => setFormData({...formData, installType: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none">
                  <option>New Install</option><option>Upgrade</option><option>Reinstall</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={handleNext} disabled={!formData.software} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium">Business Justification</label>
                <span className={`text-xs font-mono ${formData.justification.length < 20 ? 'text-warning' : 'text-success'}`}>{formData.justification.length}/20 min</span>
              </div>
              <textarea 
                rows={4}
                value={formData.justification} 
                onChange={e => setFormData({...formData, justification: e.target.value})} 
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Why is this software required? Please provide detailed business context."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Urgency</label>
                <select value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none">
                  <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Required By Date</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.requiredBy} 
                  onChange={e => setFormData({...formData, requiredBy: e.target.value})} 
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none" 
                />
              </div>
            </div>

            {formData.urgency === 'Critical' && formData.requiredBy && new Date(formData.requiredBy) > new Date(Date.now() + 86400000) && (
              <div className="bg-warning/10 border-l-4 border-warning p-3 text-warning-foreground text-sm flex gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>You selected Critical urgency, but the date is more than 1 day out. IT will deprioritize accordingly.</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Additional Comments <span className="text-muted-foreground font-normal">(Optional)</span></label>
              <textarea rows={2} value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>

            <div className="pt-4 flex justify-between">
              <button onClick={() => setStep(1)} className="px-4 py-2 text-foreground font-medium hover:bg-muted rounded-md transition-colors">Back</button>
              <button onClick={handleNext} disabled={formData.justification.length < 20 || !formData.requiredBy} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                Review Request
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            {isRestricted && (
              <div className="bg-warning/10 border-l-4 border-warning p-4 text-warning-foreground flex gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-bold text-sm">Restricted Software</div>
                  <div className="text-sm">This software requires additional IT Manager approval and depends on available license pool limits.</div>
                </div>
              </div>
            )}

            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Software</span>
                <div className="text-right">
                  <span className="font-medium text-foreground">{selectedSoftware?.name} (v: {formData.version})</span>
                  <button onClick={() => setStep(1)} className="ml-3 text-primary hover:underline text-xs">Edit</button>
                </div>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Installation</span>
                <span className="font-medium text-foreground">{formData.installType}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Urgency & Date</span>
                <div className="text-right">
                  <span className="font-medium text-foreground">{formData.urgency} — {formData.requiredBy}</span>
                  <button onClick={() => setStep(2)} className="ml-3 text-primary hover:underline text-xs">Edit</button>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Business Justification</span>
                <p className="font-medium text-foreground bg-muted p-3 rounded-md">{formData.justification}</p>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button onClick={() => setStep(2)} className="px-4 py-2 text-foreground font-medium hover:bg-muted rounded-md transition-colors">Back</button>
              <button onClick={handleSubmit} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
                Submit Request
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-10 space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Request Submitted</h2>
            <div className="inline-block bg-muted px-4 py-2 rounded-md">
              <span className="text-sm text-muted-foreground uppercase tracking-widest mr-2">Request ID</span>
              <span className="mono-label text-lg font-bold">{submittedReqId}</span>
            </div>
            
            <div className="pt-6">
              <p className="text-sm font-medium text-muted-foreground mb-4">Current Status</p>
              <div className="flex items-center justify-center text-xs font-mono uppercase tracking-wider">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded">Requested</span>
                <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
                <span className="text-muted-foreground">Manager Approval</span>
                {isRestricted && (
                  <>
                    <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
                    <span className="text-muted-foreground">IT Approval</span>
                  </>
                )}
                <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
                <span className="text-muted-foreground">In Progress</span>
              </div>
            </div>

            <div className="pt-8">
              <button onClick={() => navigate('/requests')} className="text-primary font-medium hover:underline">
                View My Requests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewRequest;
