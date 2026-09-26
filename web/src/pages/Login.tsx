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
      setError('Invalid demo email. Please use one of the mock accounts below.');
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
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
      <div className="text-sm text-muted-foreground bg-warning/10 text-warning px-4 py-2 rounded-md mb-8 font-medium">
        Demo Mode: Authentication is mocked via localStorage (No backend required)
      </div>
      
      <div className="flat-panel w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-md mx-auto flex items-center justify-center mb-4 text-xl font-bold">SR</div>
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-muted-foreground mt-2">Software Installation Request Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Sign In
          </button>
        </form>

        <div className="border-t border-border pt-6">
          <p className="text-sm font-medium text-center mb-4">Or try a role instantly:</p>
          <div className="space-y-2">
            {MOCK_USERS.map(u => (
              <button 
                key={u.id}
                onClick={() => { loginAs(u); redirectUser(u.email); }}
                className="w-full text-left px-4 py-3 rounded-md border border-border hover:bg-muted transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-sm text-foreground">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
                <span className="text-xs font-mono uppercase bg-muted-foreground/10 text-muted-foreground px-2 py-1 rounded">
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
