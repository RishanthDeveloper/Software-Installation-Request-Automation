import { useState } from 'react';

export interface Request {
  id: string;
  softwareName: string;
  requester: string;
  department: string;
  version: string;
  installType: string;
  justification: string;
  urgency: string;
  requiredBy: string;
  status: 'Requested' | 'Manager Approval' | 'IT Approval' | 'In Progress' | 'Installed' | 'Closed' | 'Rejected';
  history: { status: string; date: string; note?: string }[];
  isRestricted?: boolean;
}

const INITIAL_REQUESTS: Request[] = [
  {
    id: 'SWR0010042',
    softwareName: 'Visual Studio Code',
    requester: 'Ananya Rao',
    department: 'Engineering',
    version: 'Latest',
    installType: 'New Install',
    justification: 'Need for local development.',
    urgency: 'Medium',
    requiredBy: '2024-12-01',
    status: 'In Progress',
    history: [
      { status: 'Requested', date: '2024-01-01T10:00:00Z' },
      { status: 'Manager Approval', date: '2024-01-01T10:30:00Z' },
      { status: 'In Progress', date: '2024-01-01T11:00:00Z' }
    ]
  },
  {
    id: 'SWR0010043',
    softwareName: 'Adobe Photoshop',
    requester: 'Ananya Rao',
    department: 'Marketing',
    version: 'CC',
    installType: 'New Install',
    justification: 'Required for Q4 campaign assets.',
    urgency: 'High',
    requiredBy: '2024-11-15',
    status: 'Manager Approval',
    isRestricted: true,
    history: [
      { status: 'Requested', date: '2024-01-02T09:00:00Z' }
    ]
  }
];

export const useStore = () => {
  const [requests, setRequests] = useState<Request[]>(() => {
    const saved = localStorage.getItem('demo_requests');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('demo_requests', JSON.stringify(INITIAL_REQUESTS));
    return INITIAL_REQUESTS;
  });

  const addRequest = (req: Request) => {
    const next = [req, ...requests];
    setRequests(next);
    localStorage.setItem('demo_requests', JSON.stringify(next));
  };

  const updateRequestStatus = (id: string, status: Request['status'], note?: string) => {
    const next = requests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          history: [...r.history, { status, date: new Date().toISOString(), note }]
        };
      }
      return r;
    });
    setRequests(next);
    localStorage.setItem('demo_requests', JSON.stringify(next));
  };

  return { requests, addRequest, updateRequestStatus };
};
