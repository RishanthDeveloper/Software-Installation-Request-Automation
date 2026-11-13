import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { homePath, useAuth } from '../auth.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import { Field, fieldErrorsFrom, useFocusFirstError } from '../components/Field.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  useFocusFirstError(errors);

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (!form.email.trim()) found.email = 'Enter your work email.';
    if (!form.password) found.password = 'Enter your password.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setStatus('');
    try {
      const user = await login(form.email, form.password);
      navigate(location.state?.from || homePath(user), { replace: true });
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
      setStatus(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      lines={['Request software', 'and see who', 'approves it next.']}
      lead="Your manager approves first. IT then checks the license count, installs it and closes the request with notes. High-priority requests have a 24-hour target."
      foot="Staff accounts only. If you can’t sign in, ask IT support."
    >
      <form className="form" onSubmit={submit} noValidate>
        <Field id="email" label="Work email" error={errors.email}>
          <input className="input" type="email" autoComplete="username" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field id="password" label="Password" error={errors.password}>
          <input className="input" type="password" autoComplete="current-password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <div className="btn-row">
          <button type="submit" className="btn btn--primary btn--go" disabled={busy}>
            {busy ? 'Signing in' : 'Sign in'}
          </button>
          <Link to="/register" className="btn btn--secondary">Create an account</Link>
        </div>
        <p className={`form__status${status ? ' is-error' : ''}`} role="status">{status}</p>
      </form>
    </AuthLayout>
  );
}
