import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { MOCK_USERS } from '../lib/mockUsers';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email)) {
      redirectUser(email);
    } else {
      setError('Invalid identity manifest. Please use one of the cleared accounts below.');
    }
  };

  const redirectUser = (userEmail: string) => {
    const u = MOCK_USERS.find(u => u.email === userEmail);
    if (u?.role === 'employee') {
      navigate('/requests');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mono-label border border-line bg-surface text-ink px-4 py-2 mb-8 inline-flex items-center gap-2">
        <span className="w-2 h-2 bg-held inline-block"></span>
        Demo Mode: Local Storage Manifest
      </div>
      
      <div className="flat-panel w-full max-w-md p-8">
        <div className="text-center mb-8 border-b border-line pb-6">
          <div className="w-12 h-12 bg-ink text-surface mx-auto flex items-center justify-center mb-4 text-xl font-display">SR</div>
          <h1>Clearance Portal</h1>
          <p className="text-muted mt-2 text-[15px]">Software Installation Manifest System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mb-8">
          <div>
            <label className="block text-[13px] text-muted mb-1">Identity Manifest (Email)</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border border-line rounded-sm bg-surface focus:ring-1 focus:ring-brand focus:border-brand outline-none" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[13px] text-muted mb-1">Passcode</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border border-line rounded-sm bg-surface focus:ring-1 focus:ring-brand focus:border-brand outline-none" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-denied text-[13px]">{error}</p>}
          <button type="submit" className="btn-primary w-full mt-2">
            Authenticate
          </button>
        </form>

        <div className="border-t border-line pt-6">
          <p className="mono-label text-center mb-4 text-muted">Cleared Test Identities</p>
          <div className="space-y-2">
            {MOCK_USERS.map(u => (
              <button 
                key={u.id}
                onClick={() => { loginAs(u); redirectUser(u.email); }}
                className="w-full text-left p-3 border border-line hover:bg-black/5 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-medium text-[14px] text-ink">{u.name}</div>
                  <div className="text-[12px] text-muted font-mono">{u.email}</div>
                </div>
                <span className="mono-label text-muted group-hover:text-ink transition-colors">
                  {u.role.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
