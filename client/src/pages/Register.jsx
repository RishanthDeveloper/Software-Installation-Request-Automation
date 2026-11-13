import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { homePath, useAuth } from '../auth.jsx';
import { useApi } from '../useApi.js';
import AuthLayout from '../components/AuthLayout.jsx';
import { Field, fieldErrorsFrom, useFocusFirstError } from '../components/Field.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const departments = useApi('/departments');
  const [form, setForm] = useState({ name: '', email: '', departmentId: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  useFocusFirstError(errors);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (form.name.trim().length < 2) found.name = 'Enter your full name.';
    if (!form.email.includes('@')) found.email = 'Write an email address with an @.';
    if (!form.departmentId) found.departmentId = 'Choose your department.';
    if (form.password.length < 8) found.password = 'Use at least 8 characters, with a letter and a number.';
    if (form.confirm !== form.password) found.confirm = 'This doesn’t match the password above.';
    setErrors(found);
    setStatus(Object.keys(found).length ? `${Object.keys(found).length} fields need a fix.` : '');
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const user = await register({
        name: form.name, email: form.email, password: form.password, departmentId: Number(form.departmentId),
      });
      navigate(homePath(user), { replace: true });
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
      setStatus(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      lines={['Create your', 'account.']}
      lead="New accounts start as employees, so you can request software straight away. An admin can give you a manager or IT role."
      foot="Use your work email. Your manager sees requests from your department."
    >
      <form className="form" onSubmit={submit} noValidate>
        <Field id="name" label="Full name" error={errors.name}>
          <input className="input" autoComplete="name" value={form.name} onChange={update('name')} />
        </Field>
        <Field id="email" label="Work email" error={errors.email}>
          <input className="input" type="email" autoComplete="email" value={form.email} onChange={update('email')} />
        </Field>
        <Field id="departmentId" label="Department" error={errors.departmentId}>
          <select className="select" value={form.departmentId} onChange={update('departmentId')}>
            <option value="">Choose</option>
            {departments.data?.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <div className="form-row">
          <Field id="password" label="Password" hint="8 or more characters, a letter and a number." error={errors.password}>
            <input className="input" type="password" autoComplete="new-password" value={form.password} onChange={update('password')} />
          </Field>
          <Field id="confirm" label="Password again" error={errors.confirm}>
            <input className="input" type="password" autoComplete="new-password" value={form.confirm} onChange={update('confirm')} />
          </Field>
        </div>
        <div className="btn-row">
          <button type="submit" className="btn btn--primary btn--go" disabled={busy}>
            {busy ? 'Creating account' : 'Create account'}
          </button>
          <Link to="/login" className="btn btn--secondary">I have an account</Link>
        </div>
        <p className={`form__status${status ? ' is-error' : ''}`} role="status">{status}</p>
      </form>
    </AuthLayout>
  );
}
